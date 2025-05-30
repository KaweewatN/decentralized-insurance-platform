import Web3 from 'web3';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const web3 = new Web3(process.env.SEPOLIA_RPC);
const admin = web3.eth.accounts.privateKeyToAccount(`0x${process.env.ADMIN_PRIVATE_KEY.replace('0x', '')}`);

const OLD_VAULT = "0x2f68F6A56CB37d00BF090A18Be4679e8A80984D9";
const NEW_VAULT = "0x396380ad9Cce46518cDbf1369d8072b30a586218";

async function transfer() {
  console.log('💰 Transfer from old to new vault...');
  
  const oldBalance = await web3.eth.getBalance(OLD_VAULT);
  console.log(`Old: ${web3.utils.fromWei(oldBalance, 'ether')} ETH`);
  
  if (oldBalance === '0') {
    console.log('Old vault empty - direct transfer instead');
    
    // Direct transfer 0.1 ETH from admin to new vault
    const amount = web3.utils.toWei('0.1', 'ether');
    const gasPrice = await web3.eth.getGasPrice();
    
    const tx = await web3.eth.accounts.signTransaction({
      from: admin.address,
      to: NEW_VAULT,
      value: amount,
      gas: 25000,
      gasPrice,
    }, admin.privateKey);
    
    const receipt = await web3.eth.sendSignedTransaction(tx.rawTransaction);
    console.log(`✅ Sent 0.1 ETH: ${receipt.transactionHash}`);
    return;
  }
  
  // Withdraw from old vault
  const vaultAbi = [{
    inputs: [{ name: 'to', type: 'address' }, { name: 'amount', type: 'uint256' }],
    name: 'withdrawFunds',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  }];
  
  const oldVault = new web3.eth.Contract(vaultAbi, OLD_VAULT);
  const gasPrice = await web3.eth.getGasPrice();
  
  // Withdraw to admin
  const withdrawTx = oldVault.methods.withdrawFunds(admin.address, oldBalance);
  const withdrawGas = await withdrawTx.estimateGas({ from: admin.address });
  
  const signed1 = await web3.eth.accounts.signTransaction({
    from: admin.address,
    to: OLD_VAULT,
    gas: withdrawGas,
    gasPrice,
    data: withdrawTx.encodeABI(),
  }, admin.privateKey);
  
  const receipt1 = await web3.eth.sendSignedTransaction(signed1.rawTransaction);
  console.log(`✅ Withdrawn: ${receipt1.transactionHash}`);
  
  // Send to new vault
  const transferAmount = BigInt(oldBalance) - BigInt(web3.utils.toWei('0.002', 'ether'));
  
  const signed2 = await web3.eth.accounts.signTransaction({
    from: admin.address,
    to: NEW_VAULT,
    value: transferAmount.toString(),
    gas: 25000,
    gasPrice,
  }, admin.privateKey);
  
  const receipt2 = await web3.eth.sendSignedTransaction(signed2.rawTransaction);
  console.log(`✅ Transferred: ${receipt2.transactionHash}`);
  
  const finalBalance = await web3.eth.getBalance(NEW_VAULT);
  console.log(`🏦 New vault final: ${web3.utils.fromWei(finalBalance, 'ether')} ETH`);
}

transfer().catch(console.error);