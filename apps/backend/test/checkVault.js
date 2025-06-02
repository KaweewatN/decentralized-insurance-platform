import Web3 from 'web3';

async function checkVaultBalance() {
  const rpcUrl = 'https://sepolia.infura.io/v3/b990ecd492354e228a156f91f0f86fde';
  const web3 = new Web3(rpcUrl);

  const vaultAddress = '0x2f68F6A56CB37d00BF090A18Be4679e8A80984D9';

  try {
    const balanceWei = await web3.eth.getBalance(vaultAddress);
    const balanceEth = web3.utils.fromWei(balanceWei, 'ether');
    console.log(`💰 Vault Balance: ${balanceEth} ETH`);
  } catch (err) {
    console.error('❌ Error fetching vault balance:', err);
  }
}

checkVaultBalance();
