import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/service/prisma/prisma.service';

@Injectable()
export class PolicyService {
  constructor(private readonly prisma: PrismaService) {}
  async getPoliciesByWallet(walletAddress: string) {
    return this.prisma.policy.findMany({
      where: { walletAddress },
      orderBy: { createdAt: 'desc' },
      include: {
        user: {
          select: {
            username: true,
            fullName: true,
          },
        },
      },
    });
  }
}
