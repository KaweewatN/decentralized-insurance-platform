"use client";

import { BrowserProvider } from "ethers";

declare global {
  interface Window {
    ethereum?: any;
  }
}

export async function connectWallet(): Promise<{
  provider: BrowserProvider;
  signer: Awaited<ReturnType<BrowserProvider["getSigner"]>>;
  address: string;
}> {
  if (typeof window === "undefined" || !window.ethereum) {
    throw new Error("MetaMask not found");
  }

  const provider = new BrowserProvider(window.ethereum);
  const signer = await provider.getSigner();
  const address = await signer.getAddress();

  return { provider, signer, address };
}
