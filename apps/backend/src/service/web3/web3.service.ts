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
            value: Number(balanceInEther),
            unit: 'ether',
          },
          wei: {
            value: Number(balanceInWei),
            unit: 'wei',
          },
        },
      },
      timestamp: new Date().toISOString(),
    };
  }

  async transfer(
    fromWallet: string,
    privateKey: string,
    toWallet: string,
    value: number, // value in ether
  ) {
    const nonce = await this.web3.eth.getTransactionCount(fromWallet, 'latest');

    // Get current gas fees for EIP-1559
    const feeData = await this.web3.eth.getBlock('pending');
    const priorityFee = this.web3.utils.toWei('2', 'gwei');
    const baseFee = feeData.baseFeePerGas ?? '0';

    // Ensure maxFeePerGas >= maxPriorityFeePerGas
    let maxPriorityFeePerGas = BigInt(priorityFee);
    let maxFeePerGas = BigInt(baseFee) + maxPriorityFeePerGas;
    if (maxFeePerGas < maxPriorityFeePerGas) {
      maxFeePerGas = maxPriorityFeePerGas;
    }

    // Convert value from ether to wei
    const valueInWei = this.web3.utils.toWei(value.toString(), 'ether');

    const transaction = {
      from: fromWallet,
      to: toWallet,
      value: this.web3.utils.toHex(BigInt(valueInWei)), // value in wei
      gas: 50000,
      nonce,
      maxPriorityFeePerGas: this.web3.utils.toHex(maxPriorityFeePerGas),
      maxFeePerGas: this.web3.utils.toHex(maxFeePerGas),
      type: 2,
    };

    const signedTx = await this.web3.eth.accounts.signTransaction(
      transaction,
      privateKey,
    );

    const tx = await this.web3.eth.sendSignedTransaction(
      signedTx.rawTransaction as string,
    );

    return {
      status: 'success',
      data: {
        transactionHash: tx.transactionHash?.toString(),
        blockHash: tx.blockHash?.toString(),
        blockNumber: tx.blockNumber?.toString(),
        from: tx.from?.toString(),
        to: tx.to?.toString(),
        value: value, // value in ether
        unit: 'ether',
        gasUsed: tx.gasUsed?.toString() + 'Wei',
      },
      timestamp: new Date().toISOString(),
    };
  }
}
