import { Injectable } from '@nestjs/common';
import { ClaimType } from '@prisma/client';
import { PrismaService } from '../../service/prisma/prisma.service';
import { SupabaseClaimService } from '../file-upload/supabase.claim.service';

@Injectable()
export class UserService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly supabaseClaimService: SupabaseClaimService,
  ) {}

  async getPoliciesByWallet(walletAddress: string, policyId?: string) {
    return this.prisma.policy.findMany({
      where: {
        walletAddress,
        ...(policyId && { id: String(policyId) }),
      },
      orderBy: { createdAt: 'desc' },
      include: {
        user: true,
        claims: true,
      },
    });
  }

  async getPolicySummary(walletAddress: string) {
    return this.prisma.policy.groupBy({
      by: ['status'],
      where: {
        walletAddress,
      },
      _count: {
        status: true,
      },
    });
  }

  async getUserProfile(walletAddress: string) {
    return this.prisma.user.findUnique({
      where: {
        walletAddress,
      },
      select: {
        walletAddress: true,
        username: true,
        fullName: true,
        age: true,
        gender: true,
        occupation: true,
        contactInfo: true,
      },
    });
  }

  async createClaim(claimData: {
    policyId: string;
    planType: string;
    walletAddress: string;
    subject: string;
    incidentDate: string;
    incidentDescription: string;
    document: {
      name: string;
      base64: string;
      type: string;
      size: number;
    };
  }) {
    // Validate claim data
    const documentUrl = await this.supabaseClaimService.uploadDocumentBase64(
      claimData.document.base64,
      claimData.document.name,
      claimData.walletAddress,
    );

    let contractAddress;

    switch (claimData.planType.toLowerCase()) {
      case 'health':
        contractAddress = process.env.HEALTHCARE_LITE_ADDRESS;
        break;
      case 'flight':
        contractAddress = process.env.FLIGHT_CONTRACT_ADDRESS;
        break;
      case 'rainfall':
        contractAddress = process.env.RAINFALL_INSURANCE_CONTRACT_ADDRESS;
        break;
      case 'life':
        contractAddress = process.env.LIFECARE_LITE_ADDRESS;
        break;
      default:
        throw new Error(`Unknown plan type: ${claimData.planType}`);
    }

    // Create claim in database
    return this.prisma.claim.create({
      data: {
        walletAddress: claimData.walletAddress,
        contractAddress,
        policyId: claimData.policyId,
        subject: claimData.subject,
        description: claimData.incidentDescription,
        dateOfIncident: new Date(claimData.incidentDate),
        amount: 0, // Set default or calculate based on policy
        documentUrl,
        type: claimData.planType.toUpperCase() as ClaimType,
      },
    });
  }

  async getClaimsByWallet(walletAddress: string) {
    return this.prisma.claim.findMany({
      where: {
        walletAddress,
      },
      orderBy: { createdAt: 'desc' },
      include: {
        policy: {
          select: {
            id: true,
            planType: true,
            premium: true,
            coverageAmount: true,
          },
        },
      },
    });
  }

  async getClaimByClaimIdAndWallet(walletAddress: string, claimId: string) {
    return this.prisma.claim.findFirst({
      where: {
        walletAddress,
        id: claimId,
      },
      include: {
        policy: {
          select: {
            id: true,
            planType: true,
            premium: true,
            coverageAmount: true,
          },
        },
      },
    });
  }
}
