// src/policies/policy.types.ts

export interface HealthCarePolicy {
  policyId: string;
  userId: string;
  premium: number;
  sumAssured: number;
  expiry: number;
  isActive: boolean;
  claimAmount: number;
  transactionHash?: string;
}

// src/policies/policy.types.ts

export interface LifeCarePolicy {
  policyId: string;
  userId: string;
  fullName: string;
  age: number;
  gender: string;
  occupation: string;
  contactInfo: string;
  premium: number;
  sumAssured: number;
  expiry: number;
  maturityDate: number;
  isActive: boolean;
  claimAmount: number;
}

export interface ClaimRequest {
  policyId: string;
  userId: string;
  amount: number;
  documentHash: string;
  isPending: boolean;
  timestamp?: number;
  approvedAt?: number;
}

export interface UserProfile {
  userId: string;
  fullName: string;
  age: number;
  gender: string;
  occupation: string;
  contactInfo: string;
}
