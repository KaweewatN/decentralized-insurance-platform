import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { PrismaService } from '../../service/prisma/prisma.service';
import * as jwt from 'jsonwebtoken';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { SignUpType } from './types/auth.types';
import { sign } from 'crypto';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwt: JwtService,
    private config: ConfigService,
  ) {}

  async signin(walletAddress: string) {
    // Retrieve the user from the database
    const user = await this.prisma.user.findUnique({
      where: { walletAddress },
      select: {
        walletAddress: true,
        username: true,
        fullName: true,
        imageUrl: true,
        role: true,
      },
    });

    if (!user) {
      throw new HttpException(
        'Invalid wallet address',
        HttpStatus.UNAUTHORIZED,
      );
    }

    // Generate a token or session for the user
    return {
      message: 'Sign up successful',
      accessToken: await this.signToken(
        user.walletAddress,
        user.username || 'defaultUsername',
      ),
      user: {
        walletAddress: user.walletAddress,
        username: user.username,
        fullName: user.fullName,
        imageUrl: user.imageUrl,
        role: user.role,
      },
    };
  }

  // sign the JWT token
  async signToken(walletAddress: string, username: string): Promise<string> {
    const payload = {
      sub: walletAddress,
      username,
      iat: Math.floor(Date.now() / 1000),
      jti: crypto.randomUUID(),
    };
    const secret = this.config.get('JWT_SECRET');
    const token = await this.jwt.signAsync(payload, {
      expiresIn: '15m',
      secret: secret,
    });

    return token;
  }

  async signup(signUpData: SignUpType) {
    // Check if a user with the same walletAddress already exists
    const existingUser = await this.prisma.user.findUnique({
      where: { walletAddress: signUpData.walletAddress },
    });

    if (existingUser) {
      throw new HttpException(
        'A user with this wallet address already exists',
        HttpStatus.CONFLICT,
      );
    }

    // Create a new user
    return this.prisma.user.create({
      data: {
        walletAddress: signUpData.walletAddress,
        username: signUpData.username,
        fullName: signUpData.fullName,
        imageUrl: signUpData.imageUrl || '',
        role: 'USER',
        age: signUpData.age,
        gender: signUpData.gender,
        occupation: signUpData.occupation,
        contactInfo: signUpData.contactInfo,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    });
  }
}
