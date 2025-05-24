import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/service/prisma/prisma.service';

@Injectable()
export class UserService {
  constructor(private readonly prisma: PrismaService) {}

  async getPoliciesByWallet(walletAddress: string, policyId?: string) {
    return this.prisma.policy.findMany({
      where: {
        walletAddress,
        ...(policyId && { id: Number(policyId) }),
      },
      orderBy: { createdAt: 'desc' },
      include: {
        user: true,
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
}
