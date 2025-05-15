"use client";

import { ethers } from "ethers";
import InsuranceManagerABI from "../abis/InsuranceManager.json";

export function getInsuranceManager(
  signerOrProvider: ethers.Signer | ethers.Provider,
  address: string
) {
  return new ethers.Contract(
    address,
    InsuranceManagerABI.abi,
    signerOrProvider
  );
}
