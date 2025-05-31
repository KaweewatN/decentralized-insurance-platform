import { Module } from '@nestjs/common';
import { ethers } from 'ethers';
import { FlightInsuranceController } from './flight-insurance.controller';
import { FlightInsuranceService } from './flight-insurance.service';
import { SupabaseService } from '../file-upload/supabase.service';
import { Web3Module } from '../../service/web3/web3.module';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Module({
  imports: [Web3Module, ConfigModule],
  controllers: [FlightInsuranceController],
  providers: [
    FlightInsuranceService,
    SupabaseService,
    {
      provide: 'Contract',
      useFactory: (configService: ConfigService) => {
        const provider = new ethers.JsonRpcProvider(
          configService.get<string>('SEPOLIA_RPC'),
        );
        const privateKey = configService.get<string>('PRIVATE_KEY');
        if (!privateKey) {
          throw new Error(
            'PRIVATE_KEY is not defined in environment variables',
          );
        }
        const wallet = new ethers.Wallet(privateKey, provider);
        const contractAddress = configService.get<string>(
          'FLIGHT_CONTRACT_ADDRESS',
        );
        if (!contractAddress) {
          throw new Error(
            'FLIGHT_CONTRACT_ADDRESS is not defined in environment variables',
          );
        }
        const abi = require('../../../abis/FlightInsurance.json').abi;
        return new ethers.Contract(contractAddress, abi, wallet);
      },
      inject: [ConfigService],
    },
  ],
  exports: [FlightInsuranceService],
})
export class FlightInsuranceModule {}
