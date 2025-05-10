import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { SupabaseService } from '../file-upload/supabase.service';

@Injectable()
export class FlightInsuranceService {
  constructor(private readonly supabaseService: SupabaseService) {}
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

    const premium = this.calculatePremium(coverageAmount, probability);

    return {
      probability: +probability.toFixed(3),
      estimatedPremium: +premium.toFixed(2),
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
  async submitApplication(body: any) {
    const {
      user_address,
      airline,
      flight_number,
      dep_airport,
      arr_airport,
      dep_time,
      flight_date,
      dep_country,
      arr_country,
      coverage_amount,
      premium,
      ticket_url,
    } = body;
  
    const { data, error } = await this.supabaseService.client
    .from('flight_applications')
    .insert([
      {
        user_address,
        airline,
        flight_number,
        dep_airport,
        arr_airport,
        dep_time,
        flight_date,
        dep_country,
        arr_country,
        coverage_amount,
        premium,
        ticket_url,
        status: 'PendingApproval',
        created_at: new Date().toISOString(),
      },
    ])
    .select('id'); // Tell Supabase to return the id
  
  if (error) {
    throw new Error(`Database insert failed: ${error.message}`);
  }
  
  return {
    message: 'Application submitted successfully',
    applicationId: data?.[0]?.id, 
  };
  
  }
  
  async approveApplication(applicationId: string) {
    const { data, error } = await this.supabaseService.client
      .from('flight_applications')
      .update({ status: 'Approved' })
      .eq('id', applicationId);
  
    if (error) throw new Error(error.message);
    return { message: 'Application approved', data };
  }
  
  async verifyAndPayEligibility(applicationId: string) {
    const { data, error } = await this.supabaseService.client
      .from('flight_applications')
      .select('status')
      .eq('id', applicationId)
      .single();
  
    if (error) {
      throw new Error(`Database fetch failed: ${error.message}`);
    }
  
    if (data.status === 'Approved') {
      return { eligible: true };
    } else {
      return { eligible: false, reason: 'Application is not approved yet.' };
    }
  }  

}




