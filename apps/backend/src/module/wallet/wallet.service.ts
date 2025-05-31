import { Injectable } from '@nestjs/common';
import { Web3Service } from '../../service/web3/web3.service';

@Injectable()
export class WalletService {
  constructor(private readonly web3Service: Web3Service) {}
  async getAccount() {
    return this.web3Service.getAccount();
  }
  async getBalance(walletAddress: string) {
    return this.web3Service.balance(walletAddress);
  }
  async setTransfer(
    fromWallet: string,
    privateKey: string,
    toWallet: string,
    value: number,
  ) {
    return this.web3Service.transfer(fromWallet, privateKey, toWallet, value);
  }

  async getRecentTransactions(walletAddress: string) {
    return this.web3Service.getRecentTransactions(walletAddress, [
      '0xc724B6892AAbC09e5f4e053717c4F37e32484a08',
    ]);
  }
}
