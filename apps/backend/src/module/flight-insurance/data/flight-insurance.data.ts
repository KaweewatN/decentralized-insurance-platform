export const airlineRisk: Record<string, number> = {
  TG: 0.3, // Thai Airways
  EK: 0.25, // Emirates
  AA: 0.2, // American Airlines
  JL: 0.22, // Japan Airlines
  QR: 0.18, // Qatar Airways
  SQ: 0.15, // Singapore Airlines
  MH: 0.28, // Malaysia Airlines
};

export const airportRisk: Record<string, number> = {
  BKK: 0.25, // Suvarnabhumi
  JFK: 0.2, // New York
  NRT: 0.18, // Narita
  LAX: 0.15, // Los Angeles
  HND: 0.1, // Tokyo Haneda
  SIN: 0.12, // Singapore Changi
  DXB: 0.16, // Dubai
  LHR: 0.22, // London Heathrow
};

export const holidayMap: Record<string, { start: string; end: string }[]> = {
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

export const weatherRiskMap: Record<
  string,
  { monthRange: [number, number]; risk: number }[]
> = {
  JP: [
    { monthRange: [1, 2], risk: 0.3 }, // Snow season
    { monthRange: [7, 9], risk: 0.25 }, // Typhoon season
  ],
  TH: [
    { monthRange: [6, 10], risk: 0.2 }, // Rainy season
  ],
  US: [
    { monthRange: [12, 2], risk: 0.25 }, // Winter season
  ],
};
