import { Inject, Injectable } from '@nestjs/common';
import Web3 from 'web3';

@Injectable()
export class Web3Service {
  constructor(
    @Inject('Web3')
    private readonly web3: Web3,
    @Inject('Config')
    private readonly config: { wallet: string; privateKey: string },
  ) {}

  async getAccount() {
    const accounts = await this.web3.eth.getAccounts();
    return {
      status: 'success',
      data: {
        wallet: this.config.wallet,
      },
      timestamp: new Date().toISOString(),
    };
  }

  async balance() {
    const balance = await this.web3.eth.getBalance(this.config.wallet);
    const balanceInEther = this.web3.utils.fromWei(balance, 'ether');
    const balanceInWei = this.web3.utils.fromWei(balance, 'wei');

    return {
      status: 'success',
      data: {
        wallet: this.config.wallet,
        balance: {
          ether: {
            value: balanceInEther,
            unit: 'ether',
          },
          wei: {
            value: balanceInWei,
            unit: 'wei',
          },
        },
      },
      timestamp: new Date().toISOString(),
    };
  }

  async transfer(toWallet: string, value: number) {
    const nonce = await this.web3.eth.getTransactionCount(
      this.config.wallet,
      'latest',
    );

    const transaction = {
      to: toWallet,
      value,
      gas: 21000,
      nonce,
    };

    const signedTx = await this.web3.eth.accounts.signTransaction(
      transaction,
      this.config.privateKey,
    );

    const tx = await this.web3.eth.sendSignedTransaction(
      signedTx.rawTransaction,
    );

    return tx.transactionHash;
  }
}
