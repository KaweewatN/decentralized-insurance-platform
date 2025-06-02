import Web3 from 'web3';



const rpcUrl = "https://sepolia.infura.io/v3/b990ecd492354e228a156f91f0f86fde";
const privateKey = "c74b804be29b5ecb421bc8154a48d24666c2bfcfb6cfedbad61fe0793b852298";
const vaultAddress = "0x396380ad9Cce46518cDbf1369d8072b30a586218";



console.log('SEPOLIA_RPC:', rpcUrl);
console.log('ADMIN_PRIVATE_KEY:', privateKey ? '[set]' : '[missing]');
console.log('VAULT_ADDRESS:', vaultAddress);


if (!rpcUrl || !privateKey || !vaultAddress) {
  throw new Error('Missing RPC URL, private key, or vault address in .env');
}

const web3 = new Web3(rpcUrl);

async function sendEthToVault(amountEth) {
  const account = web3.eth.accounts.privateKeyToAccount(
    `0x${privateKey.replace('0x', '')}`,
  );
  web3.eth.accounts.wallet.add(account);

  const tx = {
    from: account.address,
    to: vaultAddress,
    value: web3.utils.toWei(amountEth, 'ether'),
    gas: 50000,
    gasPrice: await web3.eth.getGasPrice(),
  };

  const receipt = await web3.eth.sendTransaction(tx);
  console.log('✅ Sent', amountEth, 'ETH to vault:', vaultAddress);
  console.log('Tx hash:', receipt.transactionHash);
}

sendEthToVault('0.1').catch(console.error); // Change amount as needed