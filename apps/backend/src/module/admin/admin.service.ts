import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../service/prisma/prisma.service';

@Injectable()
export class AdminService {
  constructor(private readonly prisma: PrismaService) {}

  async getAllPolicySummary() {
    try {
      // Get counts grouped by planTypeId
      const counts = await this.prisma.policy.groupBy({
        by: ['planTypeId'],
        _count: { id: true },
      });

      // Map planTypeId to plan names
      const planTypeMap: Record<number, string> = {
        1: 'Health Insurance',
        2: 'Parametric Flight',
        3: 'Parametric Rainfall',
        4: 'Life Insurance',
      };

      // Format plan type summary
      const policyPlanType = counts.map((item: any) => ({
        planTypeId: item.planTypeId,
        planType: planTypeMap[item.planTypeId] || 'Unknown',
        count: item._count.id,
      }));

      // Count all policies
      const totalPolicies = await this.prisma.policy.count();

      // Count policies by status
      const policyStatusCounts = await this.prisma.policy.groupBy({
        by: ['status'],
        _count: { id: true },
      });

      // Count all claims
      const totalClaims = await this.prisma.claim.count();

      // Count claims by status
      const claimStatusCounts = await this.prisma.claim.groupBy({
        by: ['status'],
        _count: { id: true },
      });

      // Count parametric policies (planTypeId 2 or 3)
      const parametricPolicyCount = await this.prisma.policy.count({
        where: {
          planTypeId: { in: [2, 3] },
        },
      });

      // Count active policies (status = 'Active')
      const activePolicyCount = await this.prisma.policy.count({
        where: {
          status: 'Active',
        },
      });

      return {
        summary: {
          totalPolicies,
          policyStatusCounts: policyStatusCounts.map((item: any) => ({
            status: item.status,
            count: item._count.id,
          })),
          policyPlanType,
          totalClaims,
          claimStatusCounts: claimStatusCounts.map((item: any) => ({
            status: item.status,
            count: item._count.id,
          })),
          parametricPolicyCount,
          activePolicyCount,
        },
      };
    } catch (error) {
      console.error('[AdminService][getAllPolicySummary] Error:', error);
      throw new Error(
        `Failed to fetch policy summary: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }

  async getAllPolicies() {
    try {
      const policies = await this.prisma.policy.findMany({
        include: {
          user: {
            select: {
              walletAddress: true,
              fullName: true,
              username: true,
              age: true,
              gender: true,
              occupation: true,
              contactInfo: true,
            },
          },
        },
      });
      const counts = await this.prisma.policy.groupBy({
        by: ['planTypeId'],
        _count: { id: true },
      });

      const planTypeMap: Record<number, string> = {
        1: 'Health Insurance',
        2: 'Parametric Flight',
        3: 'Parametric Rainfall',
        4: 'Life Insurance',
      };

      const summary = counts.map((item: any) => ({
        planTypeId: item.planTypeId,
        planType: planTypeMap[item.planTypeId] || 'Unknown',
        count: item._count.id,
      }));

      return {
        summary,
        policies,
      };
    } catch (error) {
      console.error('[AdminService][getAllPolicySummary] Error:', error);
      throw new Error(
        `Failed to fetch policies: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }

  async getPolicyByIdAndPlanType(policyId: string) {
    try {
      // First get the base policy to determine the plan type
      const policy = await this.prisma.policy.findFirst({
        where: {
          id: policyId,
        },
        include: {
          user: {
            select: {
              walletAddress: true,
              fullName: true,
              username: true,
              age: true,
              gender: true,
              occupation: true,
              contactInfo: true,
            },
          },
        },
      });

      if (!policy) {
        throw new Error('Policy not found');
      }

      // Fetch specific policy details based on plan type
      let specificPolicyDetails = null;

      switch (policy.planTypeId) {
        case 1: // Health Insurance
          specificPolicyDetails = await this.prisma.healthPolicy.findFirst({
            where: { policyId: policyId },
          });
          break;
        case 2: // Parametric Flight
          specificPolicyDetails = await this.prisma.flightPolicy.findFirst({
            where: { policyId: policyId },
          });
          break;
        case 3: // Parametric Rainfall
          specificPolicyDetails = await this.prisma.rainfallPolicy.findFirst({
            where: { policyId: policyId },
          });
          break;
        case 4: // Life Insurance
          specificPolicyDetails = await this.prisma.lifePolicy.findFirst({
            where: { policyId: policyId },
          });
          break;
        default:
          throw new Error(`Unknown plan type: ${policy.planTypeId}`);
      }

      return {
        ...policy,
        specificDetails: specificPolicyDetails,
      };
    } catch (error) {
      console.error('[AdminService][getPolicyByIdAndPlanType] Error:', error);
      throw new Error(
        `Failed to fetch policy: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }

  async rejectPolicy(policyId: string) {
    try {
      const updatedPolicy = await this.prisma.policy.update({
        where: { id: policyId },
        data: { status: 'Rejected' },
      });
      return updatedPolicy;
    } catch (error) {
      console.error('[AdminService][rejectPolicy] Error:', error);
      throw new Error(
        `Failed to reject policy: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }
}
