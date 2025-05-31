import { Injectable } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';

export interface Policy {
  id: string;
  userId: string;
  type: 'health' | 'life';
  premium: number; // THB
  sumAssured: number; // THB
  premiumEth: number; // ETH
  sumAssuredEth: number; // ETH
  exchangeRate: number; // ETH to THB rate used
  expiry: number;
  isActive: boolean;
  isClaimed?: boolean; // ADD THIS PROPERTY - Optional for backward compatibility
  txHash?: string;
  createdAt: number;
}

export interface Claim {
  id: string;
  policyId: string;
  amount: number; // THB
  amountEth: number; // ETH
  exchangeRate: number; // ETH to THB rate used
  status: 'pending' | 'approved' | 'rejected';
  createdAt: number;
  txHash?: string;
}

@Injectable()
export class DataService {
  private dataDir = path.join(process.cwd(), 'data');

  constructor() {
    this.ensureDataDirectory();
  }

  private ensureDataDirectory() {
    if (!fs.existsSync(this.dataDir)) {
      fs.mkdirSync(this.dataDir, { recursive: true });
    }

    const files = ['policies.json', 'claims.json'];
    files.forEach((file) => {
      const filePath = path.join(this.dataDir, file);
      if (!fs.existsSync(filePath)) {
        fs.writeFileSync(filePath, JSON.stringify([], null, 2));
      }
    });
  }

  // Policies
  getPolicies(): Policy[] {
    try {
      const data = fs.readFileSync(
        path.join(this.dataDir, 'policies.json'),
        'utf-8',
      );
      return JSON.parse(data);
    } catch (error) {
      return [];
    }
  }

  savePolicy(policy: Policy) {
    const policies = this.getPolicies();
    policies.push(policy);
    fs.writeFileSync(
      path.join(this.dataDir, 'policies.json'),
      JSON.stringify(policies, null, 2),
    );
  }

  getPolicyById(id: string): Policy | undefined {
    return this.getPolicies().find((p) => p.id === id);
  }

  updatePolicy(id: string, updates: Partial<Policy>) {
    const policies = this.getPolicies();
    const index = policies.findIndex((p) => p.id === id);
    if (index >= 0) {
      policies[index] = { ...policies[index], ...updates };
      fs.writeFileSync(
        path.join(this.dataDir, 'policies.json'),
        JSON.stringify(policies, null, 2),
      );
    }
  }

  // Claims
  getClaims(): Claim[] {
    try {
      const data = fs.readFileSync(
        path.join(this.dataDir, 'claims.json'),
        'utf-8',
      );
      return JSON.parse(data);
    } catch (error) {
      return [];
    }
  }

  saveClaim(claim: Claim) {
    const claims = this.getClaims();
    claims.push(claim);
    fs.writeFileSync(
      path.join(this.dataDir, 'claims.json'),
      JSON.stringify(claims, null, 2),
    );
  }

  updateClaim(policyId: string, updates: Partial<Claim>) {
    const claims = this.getClaims();
    const index = claims.findIndex(
      (c) => c.policyId === policyId && c.status === 'pending',
    );
    if (index >= 0) {
      claims[index] = { ...claims[index], ...updates };
      fs.writeFileSync(
        path.join(this.dataDir, 'claims.json'),
        JSON.stringify(claims, null, 2),
      );
    }
  }

  // VALIDATION METHODS

  // Check if user already has active policy of specific type
  hasActivePolicyByType(
    userId: string,
    policyType: 'health' | 'life',
  ): boolean {
    const policies = this.getPolicies();
    return policies.some(
      (p) =>
        p.userId.toLowerCase() === userId.toLowerCase() &&
        p.type === policyType &&
        p.isActive,
    );
  }

  // Get active policies for user
  getActivePoliciesForUser(userId: string): Policy[] {
    return this.getPolicies().filter(
      (p) => p.userId.toLowerCase() === userId.toLowerCase() && p.isActive,
    );
  }

  // Check for policy limits with business rules
  validatePolicyLimits(
    userId: string,
    policyType: 'health' | 'life',
  ): { canPurchase: boolean; reason?: string } {
    const activePolicies = this.getActivePoliciesForUser(userId);
    const existingTypePolicy = activePolicies.find(
      (p) => p.type === policyType,
    );

    // Rule 1: Max total coverage limit (10M THB)
    const totalCoverage = activePolicies.reduce(
      (sum, p) => sum + p.sumAssured,
      0,
    );
    const maxTotalCoverage = 10000000; // 10M THB limit
    if (totalCoverage >= maxTotalCoverage) {
      return {
        canPurchase: false,
        reason: `Exceeds maximum total coverage limit of ${maxTotalCoverage.toLocaleString()} THB. Current total: ${totalCoverage.toLocaleString()} THB`,
      };
    }

    return { canPurchase: true };
  }

  // Get user policy summary
  getUserPolicySummary(userId: string): {
    totalActivePolicies: number;
    totalCoverage: number;
    healthPolicy?: Policy;
    lifePolicy?: Policy;
    lastPolicyDate?: number;
  } {
    const activePolicies = this.getActivePoliciesForUser(userId);
    const healthPolicy = activePolicies.find((p) => p.type === 'health');
    const lifePolicy = activePolicies.find((p) => p.type === 'life');
    const totalCoverage = activePolicies.reduce(
      (sum, p) => sum + p.sumAssured,
      0,
    );
    const lastPolicyDate =
      activePolicies.length > 0
        ? Math.max(...activePolicies.map((p) => p.createdAt))
        : undefined;

    return {
      totalActivePolicies: activePolicies.length,
      totalCoverage,
      healthPolicy,
      lifePolicy,
      lastPolicyDate,
    };
  }

  // Statistics
  getStats() {
    const policies = this.getPolicies();
    const claims = this.getClaims();

    return {
      totalPolicies: policies.length,
      activePolicies: policies.filter((p) => p.isActive).length,
      healthPolicies: policies.filter((p) => p.type === 'health').length,
      lifePolicies: policies.filter((p) => p.type === 'life').length,
      totalClaims: claims.length,
      pendingClaims: claims.filter((c) => c.status === 'pending').length,
      approvedClaims: claims.filter((c) => c.status === 'approved').length,
      totalPremiumsThb: policies.reduce((sum, p) => sum + p.premium, 0),
      totalSumAssuredThb: policies
        .filter((p) => p.isActive)
        .reduce((sum, p) => sum + p.sumAssured, 0),
      uniqueUsers: new Set(policies.map((p) => p.userId.toLowerCase())).size,
    };
  }
}
