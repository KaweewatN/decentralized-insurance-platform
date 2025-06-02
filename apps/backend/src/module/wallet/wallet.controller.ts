import { Body, Controller, Get, Post, UseGuards, Query } from '@nestjs/common';
import { WalletService } from './wallet.service';
import { JwtGuard } from '../../module/auth/guards';

@Controller('wallet')
export class WalletController {
  constructor(private readonly walletService: WalletService) {}
  @Get('balance')
  @UseGuards(JwtGuard)
  getBalance(@Query('walletAddress') walletAddress: string) {
    if (!walletAddress) {
      throw new Error('walletAddress query parameter is required');
    }
    return this.walletService.getBalance(walletAddress);
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

  @Get('recent-transactions')
  @UseGuards(JwtGuard)
  getRecentTransactions(@Query('walletAddress') walletAddress: string) {
    if (!walletAddress) {
      throw new Error('walletAddress query parameter is required');
    }
    return this.walletService.getRecentTransactions(walletAddress);
  }
}
