"use client";

import React, { useState } from "react";
import { ethers } from "ethers";
import axios from "axios";
import { useSession } from "next-auth/react";

const BACKEND_URL = "http://localhost:3001/api";

async function getContract(signer: ethers.Signer) {
  const res = await fetch(`${BACKEND_URL}/flight-insurance/abi`);
  const { abi, address } = await res.json();
  return new ethers.Contract(address, abi, signer);
}

function App() {
  const [status, setStatus] = useState<string>("");
  const [txHash, setTxHash] = useState<string>("");
  const [policyId, setPolicyId] = useState<string>("");
  const { data: session } = useSession(); // <-- Use useSession

  async function runFlow() {
    try {
      setStatus("Connecting wallet...");
      if (!window.ethereum) throw new Error("MetaMask not found");
      await window.ethereum.request({ method: "eth_requestAccounts" });
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();

      // Use wallet address from session
      const userAddress = session?.user?.id;
      if (!userAddress) throw new Error("No wallet address in session");

      setStatus("Preparing flight data...");
      ("Preparing flight data...");
      const flightNumber = "TG635";
      const bufferMinutes = 30;
      const flightTime = Math.floor(Date.now() / 1000) + bufferMinutes * 60;
      const coveragePerPerson = 100;
      const numPersons = 2;

      setStatus("Estimating premium...");
      ("Estimating premium...");
      const estimateRes = await axios.get(
        `${BACKEND_URL}/flight-insurance/estimate-premium`,
        {
          params: {
            airline: "TG",
            depAirport: "BKK",
            arrAirport: "NRT",
            depTime: "10:00",
            flightDate: "2024-12-25",
            depCountry: "TH",
            arrCountry: "JP",
            coverageAmount: coveragePerPerson,
            numPersons: numPersons,
          },
        }
      );
      const totalPremium = estimateRes.data.totalPremium;
      const scaledPremium = Math.round(totalPremium);

      setStatus("Submitting application...");
      ("Submitting application...");
      const submitRes = await axios.post(
        `${BACKEND_URL}/flight-insurance/submit-application`,
        {
          user_address: userAddress,
          airline: "Thai Airways",
          flightNumber,
          depAirport: "BKK",
          arrAirport: "NRT",
          depTime: "10:00",
          flightDate: "2024-12-25",
          depCountry: "TH",
          arrCountry: "JP",
          coverageAmount: coveragePerPerson,
          numPersons,
        }
      );
      const appId = submitRes.data.applicationId;

      setStatus("Approving application...");
      ("Approving application...");
      await axios.post(
        `${BACKEND_URL}/flight-insurance/approve-application?id=${appId}`
      );
      ("Application approved");

      setStatus("Generating signature...");
      ("Generating signature...");
      const sigRes = await axios.post(
        `${BACKEND_URL}/flight-insurance/generate-signature`,
        {
          flightNumber,
          coveragePerPerson,
          numPersons,
          totalPremium: scaledPremium,
        }
      );
      const signature = sigRes.data.signature;

      setStatus("Creating policy on-chain...");
      ("Creating policy on-chain...");
      const contract = await getContract(signer);
      const tx = await contract.createPolicy(
        flightNumber,
        flightTime,
        coveragePerPerson,
        numPersons,
        scaledPremium,
        signature,
        { value: scaledPremium }
      );
      await tx.wait();
      setTxHash(tx.hash);

      const counter = await contract.policyCounter();
      setPolicyId((counter - BigInt(1)).toString());

      setStatus("✅ Policy created successfully!");
    } catch (err: any) {
      setStatus("❌ Error: " + (err.response?.data || err.message || err));
      console.error("Error in flow:", err);
    }
  }

  return (
    <div
      style={{ maxWidth: 600, margin: "2rem auto", fontFamily: "sans-serif" }}
    >
      <h2>Decentralized Flight Insurance Demo</h2>
      <button onClick={runFlow}>Run Full Flow</button>
      <div style={{ marginTop: 20 }}>
        <b>Status:</b> {status}
        {txHash && (
          <div>
            <b>Tx Hash:</b>{" "}
            <a
              href={`https://sepolia.etherscan.io/tx/${txHash}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              {txHash}
            </a>
          </div>
        )}
        {policyId && (
          <div>
            <b>Policy ID:</b> {policyId}
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
