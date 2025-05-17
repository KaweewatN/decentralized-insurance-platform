import { Module } from '@nestjs/common';
import { WalletController } from './wallet.controller';
import { WalletService } from './wallet.service';
import { Web3Module } from 'src/service/web3/web3.module';

@Module({
  imports: [Web3Module],
  controllers: [WalletController],
  providers: [WalletService],
})
export class WalletModule {}
