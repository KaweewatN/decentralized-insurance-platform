// MetaMaskTransfer.tsx
import React, { useState } from "react";
import { ethers } from "ethers";

const MetaMaskTransfer: React.FC = () => {
  const [account, setAccount] = useState<string>("");
  const [to, setTo] = useState<string>("");
  const [amount, setAmount] = useState<string>("");
  const [txHash, setTxHash] = useState<string>("");
  const [error, setError] = useState<string>("");

  // Connect to MetaMask
  const connectWallet = async () => {
    if ((window as any).ethereum) {
      try {
        const accounts = await (window as any).ethereum.request({
          method: "eth_requestAccounts",
        });
        setAccount(accounts[0]);
      } catch (err) {
        setError("User rejected connection");
      }
    } else {
      setError("MetaMask not detected");
    }
  };

  // Send Ether
  const sendEther = async () => {
    setError("");
    setTxHash("");
    if (!(window as any).ethereum) {
      setError("MetaMask not detected");
      return;
    }
    try {
      const provider = new ethers.BrowserProvider((window as any).ethereum);
      const signer = await provider.getSigner();
      const tx = await signer.sendTransaction({
        to,
        value: ethers.parseEther(amount),
      });
      setTxHash(tx.hash);
    } catch (err: any) {
      setError(err.message || "Transaction failed");
    }
  };

  return (
    <div
      style={{
        maxWidth: 400,
        margin: "2rem auto",
        padding: 20,
        border: "1px solid #ccc",
      }}
    >
      <h2>MetaMask Transfer</h2>
      {!account ? (
        <button onClick={connectWallet}>Connect MetaMask</button>
      ) : (
        <div>
          <div>Connected: {account}</div>
          <div>
            <input
              type="text"
              placeholder="Recipient Address"
              value={to}
              onChange={(e) => setTo(e.target.value)}
              style={{ width: "100%", margin: "8px 0" }}
            />
            <input
              type="number"
              placeholder="Amount in ETH"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              style={{ width: "100%", margin: "8px 0" }}
            />
            <button onClick={sendEther}>Send</button>
          </div>
        </div>
      )}
      {txHash && (
        <div>
          <strong>Transaction Hash:</strong>
          <div style={{ wordBreak: "break-all" }}>{txHash}</div>
        </div>
      )}
      {error && <div style={{ color: "red" }}>{error}</div>}
    </div>
  );
};

export default MetaMaskTransfer;
