"use client";

import apiService from "@/utils/apiService";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import {
  Wallet,
  ArrowLeft,
  Clock,
  AlertCircle,
  CheckCircle,
} from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { FlightQuoteDetails } from "@/views/dashboard/insurance/flight/components/flight-quote-details";

// Add ethers for MetaMask interaction
import { ethers } from "ethers";

export default function FlightInsuranceQuotePage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [transactionStatus, setTransactionStatus] = useState<
    "idle" | "pending" | "success" | "error"
  >("idle");
  const [transactionHash, setTransactionHash] = useState<string | null>(null);

  const [flightDetails, setFlightDetails] = useState<any>(null);
  const [premiumDetails, setPremiumDetails] = useState<any>(null);

  // Store draft for API payload
  const [draft, setDraft] = useState<any>(null);

  // MetaMask wallet state
  const [account, setAccount] = useState<string | null>(null);
  const [error, setError] = useState<string>("");
  const [txHash, setTxHash] = useState<string>("");

  // For ETH transfer
  const [amount, setAmount] = useState<string>("0.0001"); // default premium
  const [to, setTo] = useState<string>(""); // will be set from draft

  // Auto connect from localStorage user_address
  useEffect(() => {
    try {
      const stored = localStorage.getItem("flightPolicyDraft");
      if (stored) {
        const data = JSON.parse(stored);
        setDraft(data);
        setFlightDetails({
          airline: data.airline,
          flightNumber: data.flightNumber,
          departureAirport: data.depAirport,
          arrivalAirport: data.arrAirport,
          departureDate: new Date(`${data.flightDate}T${data.depTime}`),
          coverageTier: data.coverageTier,
          numPersons: data.numPersons,
        });
        setPremiumDetails({
          premium: data.totalPremium,
          premiumPerPerson: data.premiumPerPerson,
          coverageAmount: data.coverageAmount,
          delayThreshold: "3 hours",
          policyTerms:
            "Automatic payout if flight arrival is delayed by more than 3 hours",
          riskFactor:
            data.probability > 0.25
              ? "High"
              : data.probability > 0.15
                ? "Medium"
                : "Low",
          validUntil: new Date(Date.now() + 24 * 60 * 60 * 1000),
        });
        setTo(
          process.env.FLIGHT_DELAY_CONTRACT_ADDRESS ||
            "0xdd5c9030612CF05e4a5638068Ba1f69e9D9C1100"
        ); // Flight insurance pool address

        if (data.totalPremium) {
          setAmount(String(data.totalPremium));
        }

        // Auto set account from user_address in draft
        if (data.user_address) {
          setAccount(data.user_address);
        }
      }
    } catch (e) {
      setFlightDetails(null);
      setPremiumDetails(null);
    }
  }, []);

  // Metamask auto-connect logics
  // Connect to MetaMask (manual, not used for auto-connect)
  const connectWallet = async () => {
    setError("");
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

  // Send Ether using user_address (not MetaMask signer)
  const sendEther = async () => {
    setError("");
    setTxHash("");
    if (!to) {
      setError("Recipient address is not set. Please try again later.");
      throw new Error("Recipient address is not set.");
    }
    if (!account) {
      setError("User address is not set.");
      throw new Error("User address is not set.");
    }
    try {
      if ((window as any).ethereum) {
        const provider = new ethers.BrowserProvider((window as any).ethereum);

        const signer = await provider.getSigner(account);
        const tx = await signer.sendTransaction({
          to,
          // value: ethers.parseEther(amount),
          value: ethers.parseEther("0.0001"), // for testing
        });
        setTxHash(tx.hash);
        setTransactionHash(tx.hash);
        return tx.hash;
      } else {
        setError("MetaMask not detected");
        throw new Error("MetaMask not detected");
      }
    } catch (err: any) {
      setError(err.message || "Transaction failed");
      throw err;
    }
  };

  const handlePurchasePolicy = async () => {
    if (!termsAccepted) {
      alert("Please accept the terms and conditions to proceed.");
      return;
    }
    if (!account) {
      setError("User address not found.");
      return;
    }
    setIsSubmitting(true);
    setTransactionStatus("pending");

    try {
      // Send ETH via MetaMask, must be from user_address
      const txHash = await sendEther();

      // Prepare payload
      const payload = {
        walletAdress: draft.user_address,
        totalPremium: draft.totalPremium,
        premiumPerPerson: draft.premiumPerPerson,
        coverageAmount: draft.coverageAmount,
        flightDate: draft.flightDate,
        airline: draft.airline,
        flightNumber: draft.flightNumber,
        depAirport: draft.depAirport,
        arrAirport: draft.arrAirport,
        depTime: draft.depTime,
        depCountry: draft.depCountry,
        arrCountry: draft.arrCountry,
        numPersons: draft.numPersons,
        fileUpload: draft.fileUpload,
        transactionHash: txHash,
        walletAccount: account,
      };

      console.log("Payload:", payload);

      // Call backend API
      const result = await apiService.post<any>(
        "/flight-insurance/submit-application",
        payload
      );

      setTransactionHash(
        txHash || result.transfer?.data?.transactionHash || ""
      );
      setTransactionStatus("success");

      setTimeout(() => {
        router.push(
          `/dashboard/insurance/flight/apply/success?txHash=${txHash || result.transfer?.data?.transactionHash || ""}`
        );
      }, 2000);
    } catch (error) {
      console.error("Transaction failed:", error);
      setTransactionStatus("error");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!flightDetails || !premiumDetails) {
    return (
      <main className="container px-4 py-8 mx-auto bg-[#F4F6F8]">
        <div className="max-w-3xl mx-auto">
          <Alert
            className="mb-6 bg-[#FFEBEE] border-[#EF5350] text-[#C62828]"
            variant="destructive"
          >
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Missing Data</AlertTitle>
            <AlertDescription>
              Unable to load your quote details. Please return to the previous
              step and enter your flight information.
            </AlertDescription>
          </Alert>
          <Button variant="outline" asChild>
            <Link href="/dashboard/insurance/flight/apply">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Flight Details
            </Link>
          </Button>
        </div>
      </main>
    );
  }

  return (
    <>
      <main className="container px-4 py-8 mx-auto bg-[#F4F6F8]">
        <div className="max-w-3xl mx-auto">
          {/* <MetaMaskTransfer /> */}
          <div className="flex items-center gap-2 mb-6">
            <Link
              href="/dashboard/insurance/flight/apply"
              className="text-[#0D47A1] hover:underline flex items-center"
            >
              <ArrowLeft className="h-4 w-4 mr-1" />
              Back to Flight Details
            </Link>
          </div>

          <h1 className="mb-4 text-3xl font-bold text-[#212529]">
            Your Flight Delay Insurance Quote
          </h1>
          <p className="mb-8 text-gray-600">
            Review your personalized premium quote and policy terms for flight
            delay coverage.
          </p>

          {/* Flight and Quote Details */}
          <FlightQuoteDetails
            flightDetails={flightDetails}
            premiumDetails={premiumDetails}
          />

          {/* Transaction Status Alerts */}
          {transactionStatus === "pending" && (
            <Alert className="mb-6 bg-[#E3F2FD] border-[#64B5F6] text-[#0D47A1]">
              <Clock className="h-4 w-4 text-[#0D47A1]" />
              <AlertTitle className="text-[#0D47A1]">
                Transaction Pending
              </AlertTitle>
              <AlertDescription>
                Your transaction is being processed on the Sepolia testnet.
                Please confirm the transaction in your MetaMask wallet and do
                not close this window.
              </AlertDescription>
            </Alert>
          )}

          {transactionStatus === "success" && (
            <Alert className="mb-6 bg-[#E8F5E9] border-[#66BB6A] text-[#2E7D32]">
              <CheckCircle className="h-4 w-4 text-[#2E7D32]" />
              <AlertTitle className="text-[#2E7D32]">
                Transaction Successful!
              </AlertTitle>
              <AlertDescription>
                Your flight delay insurance policy has been created on the
                blockchain. Transaction hash:{" "}
                <span className="font-mono text-xs break-all">
                  {transactionHash}
                </span>
              </AlertDescription>
            </Alert>
          )}

          {transactionStatus === "error" && (
            <Alert
              className="mb-6 bg-[#FFEBEE] border-[#EF5350] text-[#C62828]"
              variant="destructive"
            >
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Transaction Failed</AlertTitle>
              <AlertDescription>
                There was an error processing your transaction. Please try again
                or contact support if the issue persists.
              </AlertDescription>
            </Alert>
          )}

          {/* Wallet Connection and Purchase Section */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Connect Wallet & Purchase Policy</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="space-y-2">
                  <h3 className="text-md font-medium text-[#212529]">
                    1. Connect Your Wallet
                  </h3>
                  <p className="text-sm text-gray-600 mb-4">
                    Connect your MetaMask wallet to purchase the policy. Your
                    wallet address will be associated with this insurance
                    policy.
                  </p>
                  <div className="flex items-center gap-4">
                    <Button
                      variant="outline"
                      onClick={connectWallet}
                      disabled={true}
                    >
                      {account
                        ? `Connected: ${account.slice(0, 6)}...${account.slice(-4)}`
                        : "Connect MetaMask"}
                    </Button>
                    {error && (
                      <span className="text-red-600 text-sm">{error}</span>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <h3 className="text-md font-medium text-[#212529]">
                    2. Review Terms & Conditions
                  </h3>
                  <div className="bg-[#F4F6F8] p-4 rounded-md border border-gray-200 text-sm max-h-40 overflow-y-auto mb-4">
                    <p className="mb-2">
                      <strong>Flight Delay Insurance Terms:</strong>
                    </p>
                    <ul className="list-disc pl-5 space-y-1">
                      <li>
                        This policy provides coverage for flight delays
                        exceeding{" "}
                        <strong>{premiumDetails.delayThreshold}</strong> upon
                        arrival.
                      </li>
                      <li>
                        If your flight is delayed beyond this threshold, you
                        will automatically receive{" "}
                        <strong>{premiumDetails.coverageAmount} ETH</strong> to
                        your connected wallet address.
                      </li>
                      <li>
                        Flight delay status is determined by our oracle service
                        which monitors actual flight arrival times.
                      </li>
                      <li>
                        The policy is active only for the specific flight
                        number, date, and route specified in your application.
                      </li>
                      <li>
                        Premium payments are non-refundable once the policy is
                        activated on the blockchain.
                      </li>
                      <li>
                        Claims are processed automatically without requiring any
                        action from the policyholder.
                      </li>
                      <li>
                        This policy is governed by smart contract code deployed
                        on the Sepolia testnet.
                      </li>
                    </ul>
                  </div>

                  <div className="flex items-start space-x-2">
                    <Checkbox
                      id="terms"
                      checked={termsAccepted}
                      onCheckedChange={(checked) =>
                        setTermsAccepted(checked === true)
                      }
                    />
                    <Label
                      htmlFor="terms"
                      className="text-sm font-normal leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      I have read and agree to the Flight Delay Insurance Terms
                      & Conditions
                    </Label>
                  </div>
                </div>

                <div className="space-y-2">
                  <h3 className="text-md font-medium text-[#212529]">
                    3. Complete Purchase
                  </h3>
                  <p className="text-sm text-gray-600">
                    Click the button below to pay the premium and activate your
                    policy. This will initiate a transaction on the Sepolia
                    testnet.
                  </p>
                  <div className="flex items-center gap-2 mt-2">
                    <span className="text-sm">Premium:</span>
                    <span className="font-mono">{amount} ETH</span>
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between border-t pt-6">
              <Button variant="outline" asChild disabled={isSubmitting}>
                <Link href="/dashboard/insurance/flight/apply">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back
                </Link>
              </Button>
              <Button
                onClick={handlePurchasePolicy}
                disabled={
                  !termsAccepted ||
                  isSubmitting ||
                  transactionStatus === "success"
                }
                className="bg-[#28A745] hover:bg-[#218838] text-white"
              >
                {isSubmitting ? (
                  <>
                    <span className="mr-2">Processing...</span>
                    <svg
                      className="animate-spin h-4 w-4 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                  </>
                ) : (
                  <>
                    <Wallet className="mr-2 h-4 w-4" />
                    Pay Premium ({premiumDetails.premium} ETH)
                  </>
                )}
              </Button>
            </CardFooter>
          </Card>
        </div>
      </main>
    </>
  );
}
