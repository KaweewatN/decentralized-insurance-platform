import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { WalletService } from './wallet.service';
import { JwtGuard } from 'src/module/auth/guards';

@Controller('wallet')
export class WalletController {
  constructor(private readonly walletService: WalletService) {}
  @Get('balance')
  @UseGuards(JwtGuard)
  getBalance() {
    return this.walletService.getBalance();
  }

  @Get('account')
  @UseGuards(JwtGuard)
  getAccount() {
    return this.walletService.getAccount();
  }

  @Post('transfer')
  // @UseGuards(JwtGuard)
  setTransfer(
    @Body('fromWallet') fromWallet: string,
    @Body('privateKey') privateKey: string,
    @Body('toWallet') toWallet: string,
    @Body('value') value: number,
  ) {
    if (!fromWallet || !privateKey || !toWallet || value === undefined) {
      throw new Error('Missing required transfer parameters');
    }
    return this.walletService.setTransfer(
      fromWallet,
      privateKey,
      toWallet,
      value,
    );
  }
}
