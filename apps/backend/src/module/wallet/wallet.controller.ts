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

  @Post()
  @UseGuards(JwtGuard)
  setTransfer(
    @Body('toWallet') toWallet: string,
    @Body('value') value: number,
  ) {
    return this.walletService.setTransfer(toWallet, value);
  }
}
