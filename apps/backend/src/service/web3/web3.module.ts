import { Module, Scope } from '@nestjs/common';
import Web3 from 'web3';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { REQUEST } from '@nestjs/core';
import { Request } from 'express';
import { Web3Service } from './web3.service';

@Module({
  imports: [ConfigModule],
  providers: [
    {
      provide: 'Web3',
      scope: Scope.REQUEST, // Make this provider request-scoped
      useFactory: (configService: ConfigService, request: Request) => {
        const userInfuraUrl = request.headers['infura-url'] as string; // Example: Retrieve from request headers
        return new Web3(userInfuraUrl || configService.get('INFURA_URL'));
      },
      inject: [ConfigService, REQUEST],
    },
    {
      provide: 'Config',
      scope: Scope.REQUEST, // Make this provider request-scoped
      useFactory: (configService: ConfigService, request: Request) => {
        const userWallet = request.headers['wallet-address'] as string; // Example: Retrieve from request headers
        const userPrivateKey = request.headers['private-key'] as string; // Example: Retrieve from request headers
        return {
          wallet: userWallet || configService.get('WALLET_ADDRESS'),
          privateKey: userPrivateKey || configService.get('PRIVATE_KEY'),
        };
      },
      inject: [ConfigService, REQUEST],
    },
    Web3Service,
  ],
  exports: ['Web3', 'Config', Web3Service], // Export the providers
})
export class Web3Module {}
