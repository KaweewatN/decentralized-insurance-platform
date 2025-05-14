import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { SupabaseService } from '../file-upload/supabase.service';
import { ethers } from 'ethers';
import { Wallet, AbiCoder, keccak256, getBytes } from 'ethers';
import { randomUUID } from 'crypto';

const mockApplications: Record<string, any> = {};

@Injectable()
export class FlightInsuranceService {
  constructor(private readonly supabaseService: SupabaseService,
    private readonly configService: ConfigService
  ) { }
  private airlineRisk: Record<string, number> = {
    TG: 0.3,  // Thai Airways
    EK: 0.25, // Emirates
    AA: 0.2,  // American Airlines
    JL: 0.22, // Japan Airlines
    QR: 0.18, // Qatar Airways
    SQ: 0.15, // Singapore Airlines
    MH: 0.28, // Malaysia Airlines
  };

  private airportRisk: Record<string, number> = {
    BKK: 0.25, // Suvarnabhumi
    JFK: 0.2,  // New York
    NRT: 0.18, // Narita
    LAX: 0.15, // Los Angeles
    HND: 0.1,  // Tokyo Haneda
    SIN: 0.12, // Singapore Changi
    DXB: 0.16, // Dubai
    LHR: 0.22, // London Heathrow
  };

  private holidayMap: Record<string, { start: string; end: string }[]> = {
    JP: [
      { start: '2025-04-27', end: '2025-05-06' }, // Golden Week
      { start: '2025-12-28', end: '2026-01-03' }, // New Year
    ],
    TH: [
      { start: '2025-04-12', end: '2025-04-16' }, // Songkran
    ],
    KR: [
      { start: '2025-09-07', end: '2025-09-11' }, // Chuseok
    ],
    US: [
      { start: '2025-11-27', end: '2025-11-28' }, // Thanksgiving
      { start: '2025-12-24', end: '2025-12-26' }, // Christmas
    ],
  };

  private weatherRiskMap: Record<string, { monthRange: [number, number]; risk: number }[]> = {
    JP: [
      { monthRange: [1, 2], risk: 0.3 },   // Snow season
      { monthRange: [7, 9], risk: 0.25 },  // Typhoon season
    ],
    TH: [
      { monthRange: [6, 10], risk: 0.2 },  // Rainy season
    ],
    US: [
      { monthRange: [12, 2], risk: 0.25 }, // Winter season
    ],
  };

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

  private calculatePremium(coverageAmount: number, probability: number, riskLoading = 1.2): number {
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
    numPersons: number
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

  // ✅ Mocked: submit application
  async submitApplication(body: any) {
    const id = randomUUID();
    const newApplication = {
      ...body,
      id,
      status: 'PendingApproval',
      created_at: new Date().toISOString()
    };
    mockApplications[id] = newApplication;

    return {
      message: 'Application submitted successfully',
      applicationId: id,
      status: newApplication.status
    };
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
  async verifyAndPay(applicationId: string): Promise<{ eligible: boolean; reason?: string }> {
    const isApproved = await this.isApplicationApproved(applicationId);
    return isApproved ? { eligible: true } : { eligible: false, reason: 'Application not approved' };
  }

  // ✅ Mocked: confirm payment
  async confirmPayment(applicationId: string, policyIdOnChain: number, transactionHash: string) {
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
    scaledPremium: number
  ): Promise<string> {
    const privateKey = this.configService.get<string>('BACKEND_SIGNER_PRIVATE_KEY');
    if (!privateKey) throw new Error('Private key not found');

    const signer = new Wallet(privateKey);
    const abiCoder = new AbiCoder();

    const encoded = abiCoder.encode(
      ['string', 'uint256', 'uint256', 'uint256'],
      [flightNumber, coveragePerPerson, numPersons, scaledPremium]
    );

    const messageHash = keccak256(encoded);
    const signature = await signer.signMessage(getBytes(messageHash));
    return signature;
  }

  // 🚀 Public API: sign the premium after rounding
  async generateSignature(
    flightNumber: string,
    coveragePerPerson: number,
    numPersons: number,
    totalPremium: number // 💰 e.g., 54.12
  ): Promise<{ signature: string; scaledPremium: number }> {
    const scaledPremium = Math.round(totalPremium); // Convert float to integer for Solidity compatibility

    const signature = await this.signPremium(
      flightNumber,
      coveragePerPerson,
      numPersons,
      scaledPremium
    );

    return {
      signature,
      scaledPremium, // Return integer value used in signature
    };
  }

}




