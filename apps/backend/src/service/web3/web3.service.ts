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

  // Retrieves the current account information
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

  // Retrieves the balance of a given wallet address
  async balance(walletAddress: string) {
    const balance = await this.web3.eth.getBalance(walletAddress);
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

  // Transfers ether from one wallet to another
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

  // Retrieves recent transactions for a wallet address
  async getRecentTransactions(
    walletAddress: string,
    specificToAddresses?: string[],
    limit: number = 3,
  ) {
    const currentBlock = await this.web3.eth.getBlockNumber();
    const transactions: any[] = [];

    // Iterate through recent blocks to find transactions related to the wallet
    for (let i = currentBlock; i >= 0 && transactions.length < limit; i--) {
      const block = await this.web3.eth.getBlock(i, true);

      if (block && block.transactions) {
        block.transactions.forEach((tx) => {
          if (
            typeof tx !== 'string' &&
            (tx.from === walletAddress || tx.to === walletAddress) &&
            (!specificToAddresses ||
              (typeof tx.to === 'string' &&
                specificToAddresses.includes(tx.to))) // Check if tx.to is in the list
          ) {
            transactions.push({
              hash: tx.hash,
              from: tx.from,
              to: tx.to,
              value: this.web3.utils.fromWei(
                tx.value !== undefined ? tx.value : '0',
                'ether',
              ),
              gasUsed: tx.gas,
              blockNumber: tx.blockNumber,
              timestamp: new Date(Number(block.timestamp) * 1000).toISOString(),
            });
          }
        });
      }

      // Stop if we already have enough transactions
      if (transactions.length >= limit) {
        break;
      }
    }

    return {
      status: 'success',
      data: transactions.slice(0, limit),
      timestamp: new Date().toISOString(),
    };
  }
}
