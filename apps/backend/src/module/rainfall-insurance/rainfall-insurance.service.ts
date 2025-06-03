import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { AxiosResponse } from 'axios';
import { ethers } from 'ethers';
import {
  Wallet,
  AbiCoder,
  solidityPackedKeccak256,
  getBytes,
  parseEther,
} from 'ethers';

@Injectable()
export class RainfallService {
  private readonly NASA_API_URL =
    'https://power.larc.nasa.gov/api/temporal/daily/point';
  private readonly YEARS_TO_ANALYZE = 10;
  private readonly MARGIN = 0.1; // 10%
  private readonly PLATFORM_FEE = 0.05; // 5%
  private readonly signer = new ethers.Wallet(process.env.SIGNER_PRIVATE_KEY!);
  private readonly provider = new ethers.JsonRpcProvider(
    process.env.SEPOLIA_RPC_URL!,
  );

  // Simulated application queue
  private readonly pendingApplications: any[] = [];
  private readonly approvedPolicies: any[] = [];

  constructor(private readonly httpService: HttpService) {}

  getPendingApplications() {
    return this.pendingApplications;
  }

  async submitApplication(application: any) {
    const premiumResult = await this.assessRiskAndCalculatePremium(
      application.lat,
      application.lon,
      application.startDate,
      application.endDate,
      application.threshold,
      application.coverageAmount,
      application.conditionType,
    );

    if (premiumResult.error) {
      return { error: premiumResult.error };
    }

    const enrichedApplication = {
      ...application,
      status: 'pending',
      triggerProbability: premiumResult.triggerProbability,
      expectedPayout: premiumResult.expectedPayout,
      finalPremium: premiumResult.finalPremium,
      scaledLat: Math.round(application.lat * 1e4), // e.g., 13.7563 → 137563
      scaledLon: Math.round(application.lon * 1e4), // e.g., 100.5018 → 1005018
    };

    this.pendingApplications.push(enrichedApplication);

    return {
      message: 'Application submitted for admin review.',
      applicationId: this.pendingApplications.length - 1,
      policy: enrichedApplication,
    };
  }

  reviewApplication(applicationId: number, approved: boolean) {
    const application = this.pendingApplications[applicationId];
    if (!application) return { error: 'Application not found' };

    application.status = approved ? 'approved' : 'rejected';

    if (approved) {
      this.approvedPolicies.push(application);
      return {
        message: 'Application approved and ready for signing',
        policy: application,
      };
    } else {
      return { message: 'Application rejected', policy: application };
    }
  }

  async fetchRainfall(
    lat: number,
    lon: number,
    startDate: string,
    endDate: string,
    year: number,
  ): Promise<number | null> {
    const toMMDD = (date: string) => {
      const [, mm, dd] = date.split('-');
      return `${mm}${dd}`;
    };

    const start = `${year}${toMMDD(startDate)}`;
    const end = `${year}${toMMDD(endDate)}`;

    const params = {
      start,
      end,
      latitude: lat,
      longitude: lon,
      parameters: 'PRECTOTCORR',
      community: 'RE',
      format: 'JSON',
    };

    try {
      const response: AxiosResponse<any> = await this.httpService.axiosRef.get(
        this.NASA_API_URL,
        { params },
      );

      const parameterData = response.data?.properties?.parameter;
      const dailyValues = parameterData?.PRECTOTCORR || parameterData?.PRECTOT;

      if (!dailyValues || Object.keys(dailyValues).length === 0) {
        console.warn(
          `⚠️ No rainfall data for ${start} to ${end} at (${lat}, ${lon})`,
        );
        return null;
      }

      const total: number = (Object.values(dailyValues) as number[]).reduce(
        (acc: number, val: number) => acc + val,
        0,
      );
      console.log(`✅ Year ${year}: Total rainfall = ${total.toFixed(2)} mm`);
      return total;
    } catch (error) {
      console.error(`❌ Failed to fetch data for year ${year}:`, error.message);
      return null;
    }
  }

  async assessRiskAndCalculatePremium(
    lat: number,
    lon: number,
    startDate: string,
    endDate: string,
    threshold: number,
    coverageAmount: number,
    conditionType: 'below' | 'above',
  ): Promise<any> {
    const decodedLat = lat;
    const decodedLon = lon;
    const currentYear = new Date().getFullYear();
    let validYears = 0;
    let matchedYears = 0;

    for (let i = 1; i <= this.YEARS_TO_ANALYZE; i++) {
      const year = currentYear - i;
      const rainfall = await this.fetchRainfall(
        decodedLat,
        decodedLon,
        startDate,
        endDate,
        year,
      );

      if (rainfall !== null) {
        validYears++;
        console.log(
          `✅ Valid rainfall for year ${year}: ${rainfall.toFixed(2)} mm`,
        );

        if (
          (conditionType === 'below' && rainfall < threshold) ||
          (conditionType === 'above' && rainfall > threshold)
        ) {
          matchedYears++;
          console.log(`🔔 Trigger condition MET in ${year}`);
        } else {
          console.log(`🚫 Trigger condition NOT met in ${year}`);
        }
      } else {
        console.warn(`⚠️ No valid data for year ${year}`);
      }
    }

    if (validYears < 3) {
      return {
        error:
          'Insufficient rainfall data found for analysis. Try a longer period or different location.',
      };
    }

    const probability = matchedYears / validYears;

    if (probability === 0) {
      return {
        error:
          'No risk detected. Please adjust your threshold, dates, or location.',
      };
    }

    const expectedPayout = probability * coverageAmount;
    const rawPremium = expectedPayout * (1 + this.MARGIN + this.PLATFORM_FEE);
    const premium = Math.max(rawPremium, 0.01); // Minimum premium policy = 0.01 ETH

    return {
      location: { latitude: lat, longitude: lon },
      coveragePeriod: { startDate, endDate },
      threshold,
      conditionType,
      coverageAmount,
      triggerProbability: Number(probability.toFixed(4)),
      expectedPayout: Number(expectedPayout.toFixed(6)),
      finalPremium: Number(premium.toFixed(6)),
    };
  }

  async signApprovedPolicy(applicationId: number): Promise<any> {
    const policy = this.approvedPolicies[applicationId];
    if (!policy) return { error: 'Approved policy not found' };

    const policyId = applicationId;
    const userAddress = policy.userAddress;
    const coverageAmount = parseEther(policy.coverageAmount.toString()); //wei
    const premium = parseEther(policy.finalPremium.toString()); //wei
    const threshold = policy.threshold;
    const startDate = policy.startDate;
    const endDate = policy.endDate;
    const conditionType = policy.conditionType === 'below' ? 0 : 1;
    const lat = policy.scaledLat; // already scaled during application
    const lon = policy.scaledLon;

    const messageHash = solidityPackedKeccak256(
      [
        'uint256',
        'address',
        'uint256',
        'uint256',
        'uint256',
        'string',
        'string',
        'uint8',
        'int256',
        'int256',
      ],
      [
        policyId,
        userAddress,
        coverageAmount,
        premium,
        threshold,
        startDate,
        endDate,
        conditionType,
        lat,
        lon,
      ],
    );
    const signature = await this.signer.signMessage(getBytes(messageHash));

    return {
      policyId,
      userAddress,
      coverageAmount: coverageAmount.toString(),
      premium: premium.toString(),
      threshold,
      startDate,
      endDate,
      conditionType,
      latitude: lat,
      longitude: lon,
      messageHash,
      signature,
    };
  }
  isApplicationApproved(applicationId: number): { approved: boolean } {
    const application = this.approvedPolicies[applicationId];
    return { approved: !!application };
  }

  async confirmPayment(
    applicationId: number,
    policyIdOnChain: number,
    transactionHash: string,
  ): Promise<{
    message: string;
    status?: string;
    policyIdOnChain?: number;
    transactionHash?: string;
  }> {
    const application = this.approvedPolicies[applicationId];
    if (!application) {
      return { message: 'Application not found or not approved.' };
    }

    try {
      const tx = await this.provider.getTransaction(transactionHash);
      if (!tx) {
        return { message: 'Transaction not found on chain.' };
      }

      const expectedPremium = parseEther(application.finalPremium.toString());
      const expectedTo = process.env.RAINFALL_CONTRACT_ADDRESS!.toLowerCase();
      const expectedFrom = application.userAddress.toLowerCase();

      // Validate transaction details
      if (
        tx.to?.toLowerCase() !== expectedTo ||
        tx.from.toLowerCase() !== expectedFrom ||
        tx.value !== expectedPremium
      ) {
        return {
          message: 'Transaction does not match expected payment details.',
        };
      }

      application.status = 'Paid';
      application.policyIdOnChain = policyIdOnChain;
      application.transactionHash = transactionHash;

      return {
        message: '✅ Payment verified and policy recorded on-chain.',
        status: application.status,
        policyIdOnChain: application.policyIdOnChain,
        transactionHash: application.transactionHash,
      };
    } catch (err) {
      console.error('❌ Error verifying transaction:', err);
      return { message: 'Error verifying transaction.' };
    }
  }
}
