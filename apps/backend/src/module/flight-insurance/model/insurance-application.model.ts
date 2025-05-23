export type ApplicationStatus =
    | 'PendingApproval'
    | 'Approved'
    | 'Rejected'
    | 'Paid'
    | 'Expired';


export interface InsuranceApplication {
    id: string;
    userAddress: string;
    airline: string;
    flightNumber: string;
    depAirport: string;
    arrAirport: string;
    depTime: string;
    flightDate: string;
    depCountry: string;
    arrCountry: string;
    coverageAmount: number;
    premium: number;
    status: ApplicationStatus;
    ticketUrl?: string;
    policyIdOnChain?: number;
    transactionHash?: string;
    policyCreatedAt?: string;  
}
