import { Injectable, Inject } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SupabaseService } from '../file-upload/supabase.service';
import { Wallet, getBytes } from 'ethers';
import { PrismaService } from '../../service/prisma/prisma.service';
import { solidityPackedKeccak256, ethers } from 'ethers';

import {
  airlineRisk,
  airportRisk,
  holidayMap,
  weatherRiskMap,
} from './data/flight-insurance.data';

const mockApplications: Record<string, any> = {};

@Injectable()
export class FlightInsuranceService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
    private readonly supabaseService: SupabaseService,
    @Inject('Contract') private contract: ethers.Contract,
  ) {}

  private airlineRisk = airlineRisk;
  private airportRisk = airportRisk;
  private holidayMap = holidayMap;
  private weatherRiskMap = weatherRiskMap;

  private getCalendarRisk(countryCode: string, date: string): number {
    const holidays = this.holidayMap[countryCode] || [];
    const flightDate = new Date(date);
    for (const holiday of holidays) {
      const start = new Date(holiday.start);
      const end = new Date(holiday.end);
      if (flightDate >= start && flightDate <= end) return 0.4;
    }
    return 0.1;
  }

  private getWeatherRisk(countryCode: string, date: string): number {
    const month = new Date(date).getMonth() + 1; // 1 to 12
    const patterns = this.weatherRiskMap[countryCode] || [];
    for (const entry of patterns) {
      const [start, end] = entry.monthRange;
      if (
        (start <= end && month >= start && month <= end) ||
        (start > end && (month >= start || month <= end)) // e.g. Dec–Feb
      ) {
        return entry.risk;
      }
    }
    return 0.1;
  }

  private getTimeRisk(depTime: string): number {
    const hour = new Date(`1970-01-01T${depTime}`).getUTCHours();
    if (hour >= 18 || hour < 6) return 0.25; // night time
    if (hour >= 12 && hour <= 17) return 0.15; // afternoon
    return 0.1; // morning
  }

  private calculatePremium(
    coverageAmount: number,
    probability: number,
    riskLoading = 1.2,
  ): number {
    return coverageAmount * probability * riskLoading;
  }

  async estimatePremium(
    airline: string,
    depAirport: string,
    arrAirport: string,
    depTime: string,
    flightDate: string,
    depCountry: string,
    arrCountry: string,
    coverageAmount: number,
    numPersons: number,
  ) {
    const airlineScore = this.airlineRisk[airline] ?? 0.2;
    const depAirportScore = this.airportRisk[depAirport] ?? 0.2;
    const arrAirportScore = this.airportRisk[arrAirport] ?? 0.15;
    const timeScore = this.getTimeRisk(depTime);
    const calendarScore = Math.max(
      this.getCalendarRisk(depCountry, flightDate),
      this.getCalendarRisk(arrCountry, flightDate),
    );
    const weatherScore = Math.max(
      this.getWeatherRisk(depCountry, flightDate),
      this.getWeatherRisk(arrCountry, flightDate),
    );

    const probability =
      0.25 * airlineScore +
      0.25 * depAirportScore +
      0.1 * arrAirportScore +
      0.15 * timeScore +
      0.1 * calendarScore +
      0.15 * weatherScore;

    const premiumPerPerson = this.calculatePremium(coverageAmount, probability);
    const totalPremium = premiumPerPerson * numPersons;

    return {
      probability: +probability.toFixed(3),
      premiumPerPerson: +premiumPerPerson.toFixed(2),
      totalPremium: +totalPremium.toFixed(2),
      breakdown: {
        airlineScore,
        depAirportScore,
        arrAirportScore,
        timeScore,
        calendarScore,
        weatherScore,
      },
    };
  }

  async submitApplication(application: any) {
    // Define the recipient wallet (e.g., insurance pool)
    const insurancePoolWallet = this.configService.get<string>(
      'FLIGHT_CONTRACT_ADDRESS',
    );
    if (!insurancePoolWallet)
      throw new Error('Insurance pool wallet not configured');

    //// Use Frontend to sign the transaction /////
    // const transferResult = await this.web3Service.transfer(
    //   application.walletAdress,
    //   userPrivateKey,
    //   insurancePoolWallet,
    //   application.totalPremium, // value in ether
    // );

    // const transactionHash = transferResult.data.transactionHash;

    // Calculate coverage dates (example: 1 day coverage)
    const coverageStartDate = new Date(application.flightDate);
    const coverageEndDate = new Date(coverageStartDate);
    coverageEndDate.setDate(coverageEndDate.getDate() + 1);

    // Mock planTypeId (should map to your PolicyType table)
    const planTypeId = 2;

    // Upload the document using Supabase service
    const documentUrl = await this.supabaseService.uploadDocumentBase64(
      application.fileUpload,
      `${application.depAirport}-${application.arrAirport}-${application.flightDate}`,
      application.walletAdress,
    );

    // Create Policy in DB
    const policy = await this.prisma.policy.create({
      data: {
        walletAddress: application.walletAdress,
        premium: application.premiumPerPerson,
        totalPremium: application.totalPremium,
        coverageAmount: application.coverageAmount,
        status: 'PendingPayment',
        coverageStartDate,
        coverageEndDate,
        purchaseTransactionHash: application.transactionHash,
        contractAddress: insurancePoolWallet,
        documentUrl, // Store the uploaded document URL
        planTypeId,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    });

    // Create FlightPolicy in DB, link to Policy
    const flightPolicy = await this.prisma.flightPolicy.create({
      data: {
        airline: application.airline,
        flightNumber: application.flightNumber,
        depAirport: application.depAirport,
        arrAirport: application.arrAirport,
        depTime: application.depTime,
        flightDate: new Date(application.flightDate),
        depCountry: application.depCountry,
        arrCountry: application.arrCountry,
        coverageAmount: application.coverageAmount,
        numPersons: application.numPersons,
        createdAt: new Date(),
        policyId: policy.id, // Link to Policy
      },
    });

    return { policy, flightPolicy };
  }

  // ✅ Mocked: approve application
  async approveApplication(applicationId: string) {
    const app = mockApplications[applicationId];
    if (!app) throw new Error('Application not found');
    app.status = 'Approved';
    return { message: 'Application approved', data: [app] };
  }

  // ✅ Mocked: check approval
  async isApplicationApproved(applicationId: string): Promise<boolean> {
    const app = mockApplications[applicationId];
    if (!app) throw new Error('Application not found');
    return app.status === 'Approved';
  }

  // ✅ Logic check only
  async verifyAndPay(
    applicationId: string,
  ): Promise<{ eligible: boolean; reason?: string }> {
    const isApproved = await this.isApplicationApproved(applicationId);
    return isApproved
      ? { eligible: true }
      : { eligible: false, reason: 'Application not approved' };
  }

  // ✅ Mocked: confirm payment
  async confirmPayment(
    applicationId: string,
    policyIdOnChain: number,
    transactionHash: string,
  ) {
    const app = mockApplications[applicationId];
    if (!app) throw new Error('Application not found');
    app.status = 'Paid';
    app.policy_id_on_chain = policyIdOnChain;
    app.transaction_hash = transactionHash;
    app.policy_created_at = new Date().toISOString();
    return { message: 'Payment confirmed and policy recorded on-chain.' };
  }

  // async approveApplication(applicationId: string) {
  //   const policy = await this.prisma.policy.findUnique({
  //     where: { id: applicationId },
  //   });
  //   if (!policy) throw new Error('Application not found');
  //   const updated = await this.prisma.policy.update({
  //     where: { id: applicationId },
  //     data: { status: 'Active' },
  //   });
  //   return { message: 'Application approved', data: [updated] };
  // }

  // // Check approval using real DB
  // async isApplicationApproved(applicationId: string): Promise<boolean> {
  //   const policy = await this.prisma.policy.findUnique({
  //     where: { id: applicationId },
  //   });
  //   if (!policy) throw new Error('Application not found');
  //   return policy.status === 'Active';
  // }

  // // Logic check only (no change needed)
  // async verifyAndPay(
  //   applicationId: string,
  // ): Promise<{ eligible: boolean; reason?: string }> {
  //   const isApproved = await this.isApplicationApproved(applicationId);
  //   return isApproved
  //     ? { eligible: true }
  //     : { eligible: false, reason: 'Application not approved' };
  // }

  // // Confirm payment using real DB
  // async confirmPayment(
  //   applicationId: string,
  //   policyIdOnChain: number,
  //   transactionHash: string,
  // ) {
  //   const policy = await this.prisma.policy.findUnique({
  //     where: { id: applicationId },
  //   });
  //   if (!policy) throw new Error('Application not found');

  //   // Fetch on-chain policy data
  //   const onChainPolicy = await this.contract.policies(policyIdOnChain);

  //   // Compare important fields (example: walletAddress)
  //   if (
  //     policy.walletAddress.toLowerCase() !== onChainPolicy.user.toLowerCase()
  //   ) {
  //     throw new Error('Wallet address mismatch between DB and on-chain');
  //   }
  //   // Add more field comparisons as needed

  //   // Update DB with on-chain info
  //   await this.prisma.policy.update({
  //     where: { id: applicationId },
  //     data: {
  //       status: 'Active',
  //       // policyIdOnChain: policyIdOnChain,
  //       transactionHash: transactionHash,
  //       // policyCreatedAt: new Date(),
  //     },
  //   });
  //   return { message: 'Payment confirmed and policy recorded on-chain.' };
  // }

  /// 🔐 Internal signer for hashed message (used by generateSignature)
  async signPremium(
    flightNumber: string,
    coveragePerPerson: number,
    numPersons: number,
    scaledPremium: number,
  ): Promise<string> {
    const privateKey = this.configService.get<string>(
      'BACKEND_SIGNER_PRIVATE_KEY',
    );
    if (!privateKey) throw new Error('Private key not found');

    const signer = new Wallet(privateKey);

    // Use solidityPackedKeccak256 for abi.encodePacked
    const messageHash = solidityPackedKeccak256(
      ['string', 'uint256', 'uint256', 'uint256'],
      [flightNumber, coveragePerPerson, numPersons, scaledPremium],
    );

    // signMessage applies the Ethereum Signed Message prefix
    const signature = await signer.signMessage(getBytes(messageHash));
    return signature;
  }

  // 🚀 Public API: sign the premium after rounding
  async generateSignature(
    flightNumber: string,
    coveragePerPerson: number,
    numPersons: number,
    totalPremium: number, // 💰 e.g., 54.12
  ): Promise<{ signature: string; scaledPremium: number }> {
    const scaledPremium = Math.round(totalPremium); // Convert float to integer for Solidity compatibility

    const signature = await this.signPremium(
      flightNumber,
      coveragePerPerson,
      numPersons,
      scaledPremium,
    );

    return {
      signature,
      scaledPremium, // Return integer value used in signature
    };
  }

  // getUserPolicyHistory
  async getUserPolicyHistory(userAddress: string) {
    const policyIds: bigint[] =
      await this.contract.getUserPolicies(userAddress);

    const policies = await Promise.all(
      policyIds.map(async (id) => {
        const policy = await this.contract.policies(id);

        return {
          policyId: id.toString(), // bigint to string
          user: policy.user,
          flightNumber: policy.flightNumber,
          flightTime: Number(policy.flightTime), // bigint to number
          coverageAmountPerPerson: Number(policy.coverageAmountPerPerson),
          premiumPaid: Number(policy.premiumPaid),
          numInsuredPersons: Number(policy.numInsuredPersons),
          status: Number(policy.status), // PolicyStatus enum as number
          eligibleForPayout: policy.eligibleForPayout,
        };
      }),
    );
    return policies;
  }

  async getContractCount(): Promise<number> {
    const count = await this.contract.count();
    return Number(count); // Convert bigint to number if needed
  }
}
