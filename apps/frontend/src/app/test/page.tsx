"use client";

import { useState } from "react";
import { ethers } from "ethers";
import axios from "axios";
import Cookies from "js-cookie";

export default function SignIn() {
  const [walletAddress, setWalletAddress] = useState("");
  const [response, setResponse] = useState("");

  const connectAndSignIn = async () => {
    if (!window.ethereum) {
      alert("MetaMask is not installed!");
      return;
    }
    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const accounts = await provider.send("eth_requestAccounts", []);
      const address = ethers.getAddress(accounts[0]);
      setWalletAddress(address);

      const res = await axios.post("http://localhost:3001/api/auth/signin", {
        walletAddress: address,
      });

      setResponse(JSON.stringify(res.data));

      if (res.data && res.data.accessToken) {
        Cookies.set("accessToken", res.data.accessToken, { path: "/" });
      }
    } catch (err) {
      alert("Failed to connect wallet or sign in");
    }
  };

  return (
    <div>
      <button onClick={connectAndSignIn}>Connect with MetaMask</button>
      <div>Wallet Address: {walletAddress}</div>
      <div>Response: {response}</div>
    </div>
  );
}
