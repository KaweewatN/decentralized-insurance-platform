import { Injectable } from '@nestjs/common';
import { Web3Service } from 'src/service/web3/web3.service';

@Injectable()
export class WalletService {
  constructor(private readonly web3Service: Web3Service) {}
  async getAccount() {
    return this.web3Service.getAccount();
  }
  async getBalance() {
    return this.web3Service.balance();
  }
  async setTransfer(toWallet: string, value: number) {
    return this.web3Service.transfer(toWallet, value);
  }
}
