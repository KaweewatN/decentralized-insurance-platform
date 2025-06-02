const Web3 = require('web3');
require('dotenv').config(); // ถ้ามีไฟล์ .env ใช้เก็บ private key

// === ตั้งค่า ===
const rpcUrl = 'https://sepolia.infura.io/v3/b990ecd492354e228a156f91f0f86fde';
const web3 = new Web3(rpcUrl);

// Owner/admin account
const privateKey = "daee72147f7914d7337682fc9c7fc305ebe92d6bae467d5f07de4765d830e8d6";
const account = web3.eth.accounts.privateKeyToAccount(privateKey);
web3.eth.accounts.wallet.add(account);
web3.eth.defaultAccount = account.address;

// InsuranceVault contract
const vaultAddress = '0x784F9D3a713Be5B2937fafbA8Be419273c613C74';
const vaultAbi = [
  {
    "inputs": [
      { "internalType": "address payable", "name": "to", "type": "address" },
      { "internalType": "uint256", "name": "amount", "type": "uint256" }
    ],
    "name": "withdrawFunds",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  }
];

const vaultContract = new web3.eth.Contract(vaultAbi, vaultAddress);

// === ฟังก์ชันถอนเงิน ===
async function withdrawToWallet() {
  const destination = '0x23eD7C8A0536Ab28A257e2258B009E3B64032D29'; // address ที่จะรับเงิน
  const amountEth = '0.005'; // จำนวนที่ต้องการถอน
  const amountWei = web3.utils.toWei(amountEth, 'ether');

  try {
    const tx = await vaultContract.methods
      .withdrawFunds(destination, amountWei)
      .send({ from: account.address, gas: 100000 });

    console.log('✅ Withdraw successful! TX hash:', tx.transactionHash);
  } catch (err) {
    console.error('❌ Withdraw failed:', err.message);
  }
}

withdrawToWallet();
