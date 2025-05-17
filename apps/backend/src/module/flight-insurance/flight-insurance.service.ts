import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SupabaseService } from '../file-upload/supabase.service';
import { Wallet, AbiCoder, keccak256, getBytes } from 'ethers';
import { randomUUID } from 'crypto';
import { PrismaService } from 'src/service/prisma/prisma.service';
import { solidityPackedKeccak256 } from 'ethers';
import { Web3Service } from 'src/service/web3/web3.service';

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
    private readonly web3Service: Web3Service,
    private readonly supabaseService: SupabaseService,
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
        sumAssured: application.totalPremium,
        coverageAmount: application.coverageAmount,
        status: 'PendingPayment',
        coverageStartDate,
        coverageEndDate,
        transactionHash: application.transactionHash,
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
}
