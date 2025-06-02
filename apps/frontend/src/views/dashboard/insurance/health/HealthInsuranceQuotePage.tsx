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
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Wallet,
  ArrowLeft,
  Clock,
  AlertCircle,
  CheckCircle,
  Shield,
  DollarSign,
  Users,
  Activity,
  Cigarette,
  Calculator,
  FileText,
  Heart,
  TrendingUp,
  Info,
  ExternalLink,
  Copy,
  CheckCircle2,
} from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { ethers } from "ethers";

export default function HealthInsuranceQuotePage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [transactionStatus, setTransactionStatus] = useState<
    "idle" | "pending" | "success" | "error"
  >("idle");
  const [transactionHash, setTransactionHash] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const [healthDetails, setHealthDetails] = useState<any>(null);
  const [premiumDetails, setPremiumDetails] = useState<any>(null);
  const [draft, setDraft] = useState<any>(null);

  // MetaMask wallet state
  const [account, setAccount] = useState<string | null>(null);
  const [error, setError] = useState<string>("");
  const [txHash, setTxHash] = useState<string>("");

  // For ETH transfer
  const [amount, setAmount] = useState<string>("0.001"); // default premium in ETH
  const [to, setTo] = useState<string>(
    "0xbCB8eDB312116a86F65b542a24FcaeF9Aa04F953"
  ); // Health insurance pool address

  // Load healthPolicyDraft from sessionStorage
  useEffect(() => {
    try {
      const stored = sessionStorage.getItem("healthPolicyDraft");
      if (stored) {
        const data = JSON.parse(stored);
        setDraft(data);
        setHealthDetails({
          preExistingConditions: data.preExistingConditions,
          bmi: data.bmi,
          smokingStatus: data.smokingStatus,
          exerciseFrequency: data.exerciseFrequency,
          expectedNumber: data.expectedNumber,
          sumAssured: data.sumAssured,
          sumAssuredEth: data.sumAssuredEth,
          coverageTier: data.coverageTier,
        });
        setPremiumDetails({
          premium: data.premium,
          premiumEth: data.premiumEth,
          sumAssured: data.sumAssured,
          sumAssuredEth: data.sumAssuredEth,
          coverageTier: data.coverageTier,
        });
        setAmount(data.premiumEth?.toString() || "0.001");
        if (data.user_address) {
          setAccount(data.user_address);
        }
      }
    } catch (e) {
      setHealthDetails(null);
      setPremiumDetails(null);
    }
  }, []);

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

  // Send Ether using MetaMask
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
          value: ethers.parseEther("0.0001"), // Default to 0.001 ETH if amount is not set
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
      // Send ETH via MetaMask
      const txHash = await sendEther();

      // Prepare payload for health insurance API
      const payload = {
        user_address: draft.user_address,
        sumAssured: Number(draft.sumAssuredEth),
        premium: Number(draft.premiumEth),
        coverageTier: Number(draft.coverageTier),
        preExistingConditions: draft.preExistingConditions,
        bmi: Number(draft.bmi),
        smokingStatus: draft.smokingStatus,
        exerciseFrequency: draft.exerciseFrequency,
        expectedNumber: Number(draft.expectedNumber),
        fileUpload: draft.fileUpload,
        purchaseTransactionHash: txHash,
        walletAccount: account,
      };

      console.log("Submitting health insurance purchase:", payload);

      // Call backend API
      await apiService.post<any>(
        "http://localhost:3001/api/health/user/purchase",
        payload
      );

      setTransactionHash(txHash);
      setTransactionStatus("success");

      setTimeout(() => {
        router.push(
          `/dashboard/insurance/health/apply/success?txHash=${txHash}`
        );
      }, 2000);
    } catch (error) {
      console.error("Transaction failed:", error);
      setTransactionStatus("error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getBMICategory = (bmi: number) => {
    if (bmi < 18.5)
      return { category: "Underweight", color: "bg-blue-100 text-blue-800" };
    if (bmi < 25)
      return { category: "Normal", color: "bg-green-100 text-green-800" };
    if (bmi < 30)
      return { category: "Overweight", color: "bg-yellow-100 text-yellow-800" };
    return { category: "Obese", color: "bg-red-100 text-red-800" };
  };

  const getCoverageTierInfo = (tier: number) => {
    const tiers = {
      1: { name: "Basic", color: "bg-gray-100 text-gray-800", icon: Shield },
      2: { name: "Standard", color: "bg-blue-100 text-blue-800", icon: Shield },
      3: {
        name: "Premium",
        color: "bg-purple-100 text-purple-800",
        icon: Shield,
      },
    };
    return tiers[tier as keyof typeof tiers] || tiers[1];
  };

  if (!healthDetails || !premiumDetails) {
    return (
      <main className="container px-4 py-8 mx-auto bg-gradient-to-br from-[#F8FAFC] to-[#E2E8F0]">
        <div className="max-w-3xl mx-auto">
          <Alert
            className="mb-6 bg-gradient-to-r from-[#FFEBEE] to-[#FFEAEA] border-[#EF5350] text-[#C62828] shadow-lg"
            variant="destructive"
          >
            <AlertCircle className="h-5 w-5" />
            <AlertTitle className="text-lg font-semibold">
              Missing Data
            </AlertTitle>
            <AlertDescription className="text-base">
              Unable to load your quote details. Please return to the previous
              step and enter your health information.
            </AlertDescription>
          </Alert>
          <Button
            variant="outline"
            asChild
            className="shadow-md hover:shadow-lg transition-shadow"
          >
            <Link href="/dashboard/insurance/health/apply">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Health Details
            </Link>
          </Button>
        </div>
      </main>
    );
  }

  const bmiInfo = getBMICategory(Number(healthDetails.bmi));
  const tierInfo = getCoverageTierInfo(Number(healthDetails.coverageTier));

  return (
    <>
      <main className="container px-4 py-8 mx-auto bg-gradient-to-br from-[#F8FAFC] to-[#E2E8F0] min-h-screen">
        <div className="max-w-4xl mx-auto">
          {/* Navigation */}
          <div className="flex items-center gap-2 mb-8">
            <Link
              href="/dashboard/insurance/health/apply"
              className="text-[#0D47A1] hover:text-[#1565C0] hover:underline flex items-center group transition-colors"
            >
              <ArrowLeft className="h-4 w-4 mr-1 group-hover:-translate-x-1 transition-transform" />
              Back to Health Details
            </Link>
          </div>

          {/* Header Section */}
          <div className="text-center mb-8">
            <div className="flex justify-center mb-4">
              <div className="bg-gradient-to-r from-[#0D47A1] to-[#1976D2] p-4 rounded-full shadow-lg">
                <Heart className="h-8 w-8 text-white" />
              </div>
            </div>
            <h1 className="mb-4 text-4xl font-bold text-[#212529] bg-gradient-to-r from-[#0D47A1] to-[#1976D2] bg-clip-text text-transparent">
              Your Health Insurance Quote
            </h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Review your personalized premium quote and policy terms for
              comprehensive health coverage
            </p>
          </div>

          {/* Quote Summary Card */}
          <Card className="mb-8 shadow-xl border-0 bg-gradient-to-r from-white to-gray-50">
            <CardHeader className="bg-gradient-to-r from-[#0D47A1] to-[#1976D2] text-white rounded-t-lg">
              <CardTitle className="flex items-center text-xl">
                <Calculator className="mr-3 h-6 w-6" />
                Quote Summary
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Premium Information */}
                <div className="space-y-4">
                  <div className="flex items-center mb-4">
                    <DollarSign className="h-5 w-5 text-green-600 mr-2" />
                    <h3 className="text-lg font-semibold text-gray-800">
                      Premium Details
                    </h3>
                  </div>

                  <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-4 rounded-lg border border-green-200">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium text-gray-700">
                        Monthly Premium:
                      </span>
                      <div className="text-right">
                        <div className="text-lg font-bold text-green-700">
                          {premiumDetails.premium} THB
                        </div>
                        <div className="text-sm text-gray-600 font-mono">
                          {premiumDetails.premiumEth} ETH
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-lg border border-blue-200">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium text-gray-700 flex items-center">
                        <Shield className="h-4 w-4 mr-1" />
                        Sum Assured:
                      </span>
                      <div className="text-right">
                        <div className="text-lg font-bold text-blue-700">
                          {healthDetails.sumAssured} THB
                        </div>
                        <div className="text-sm text-gray-600 font-mono">
                          {Number(healthDetails.sumAssuredEth).toFixed(6)} ETH
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <span className="font-medium text-gray-700">
                      Coverage Tier:
                    </span>
                    <Badge className={`${tierInfo.color} font-semibold`}>
                      <tierInfo.icon className="h-3 w-3 mr-1" />
                      {tierInfo.name}
                    </Badge>
                  </div>
                </div>

                {/* Health Information */}
                <div className="space-y-4">
                  <div className="flex items-center mb-4">
                    <Activity className="h-5 w-5 text-blue-600 mr-2" />
                    <h3 className="text-lg font-semibold text-gray-800">
                      Health Profile
                    </h3>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <span className="font-medium text-gray-700 flex items-center">
                        <TrendingUp className="h-4 w-4 mr-1" />
                        BMI:
                      </span>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-semibold">
                          {healthDetails.bmi}
                        </span>
                        <Badge className={`${bmiInfo.color} text-xs`}>
                          {bmiInfo.category}
                        </Badge>
                      </div>
                    </div>

                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <span className="font-medium text-gray-700 flex items-center">
                        <Cigarette className="h-4 w-4 mr-1" />
                        Smoking Status:
                      </span>
                      <Badge
                        className={
                          healthDetails.smokingStatus === "Non-smoker"
                            ? "bg-green-100 text-green-800"
                            : "bg-red-100 text-red-800"
                        }
                      >
                        {healthDetails.smokingStatus}
                      </Badge>
                    </div>

                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <span className="font-medium text-gray-700 flex items-center">
                        <Activity className="h-4 w-4 mr-1" />
                        Exercise Frequency:
                      </span>
                      <span className="font-mono font-semibold text-blue-600">
                        {healthDetails.exerciseFrequency}
                      </span>
                    </div>

                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <span className="font-medium text-gray-700 flex items-center">
                        <Users className="h-4 w-4 mr-1" />
                        Insured Persons:
                      </span>
                      <span className="font-mono font-semibold text-purple-600">
                        {healthDetails.expectedNumber}
                      </span>
                    </div>

                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <span className="font-medium text-gray-700 flex items-center">
                        <FileText className="h-4 w-4 mr-1" />
                        Pre-existing Conditions:
                      </span>
                      <Badge
                        className={
                          healthDetails.preExistingConditions === "None"
                            ? "bg-green-100 text-green-800"
                            : "bg-yellow-100 text-yellow-800"
                        }
                      >
                        {healthDetails.preExistingConditions}
                      </Badge>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Transaction Status Alerts */}
          {transactionStatus === "pending" && (
            <Alert className="mb-6 bg-gradient-to-r from-[#E3F2FD] to-[#BBDEFB] border-[#64B5F6] text-[#0D47A1] shadow-lg">
              <Clock className="h-5 w-5 text-[#0D47A1] animate-pulse" />
              <AlertTitle className="text-[#0D47A1] text-lg font-semibold">
                Transaction Pending
              </AlertTitle>
              <AlertDescription className="text-base">
                Your transaction is being processed on the Sepolia testnet.
                Please confirm the transaction in your MetaMask wallet and do
                not close this window.
              </AlertDescription>
            </Alert>
          )}

          {transactionStatus === "success" && (
            <Alert className="mb-6 bg-gradient-to-r from-[#E8F5E9] to-[#C8E6C9] border-[#66BB6A] text-[#2E7D32] shadow-lg">
              <CheckCircle className="h-5 w-5 text-[#2E7D32]" />
              <AlertTitle className="text-[#2E7D32] text-lg font-semibold">
                Transaction Successful!
              </AlertTitle>
              <AlertDescription className="text-base">
                Your health insurance policy has been created on the blockchain.
                <div className="mt-2 flex items-center gap-2">
                  <span>Transaction hash:</span>
                  <span className="font-mono text-xs bg-white px-2 py-1 rounded border break-all">
                    {transactionHash}
                  </span>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => copyToClipboard(transactionHash || "")}
                    className="h-6 w-6 p-0"
                  >
                    {copied ? (
                      <CheckCircle2 className="h-3 w-3" />
                    ) : (
                      <Copy className="h-3 w-3" />
                    )}
                  </Button>
                </div>
              </AlertDescription>
            </Alert>
          )}

          {transactionStatus === "error" && (
            <Alert
              className="mb-6 bg-gradient-to-r from-[#FFEBEE] to-[#FFCDD2] border-[#EF5350] text-[#C62828] shadow-lg"
              variant="destructive"
            >
              <AlertCircle className="h-5 w-5" />
              <AlertTitle className="text-lg font-semibold">
                Transaction Failed
              </AlertTitle>
              <AlertDescription className="text-base">
                There was an error processing your transaction. Please try again
                or contact support if the issue persists.
              </AlertDescription>
            </Alert>
          )}

          {/* Wallet Connection and Purchase Section */}
          <Card className="mb-6 shadow-xl border-0">
            <CardHeader className="bg-gradient-to-r from-[#28A745] to-[#20C997] text-white rounded-t-lg">
              <CardTitle className="flex items-center text-xl">
                <Wallet className="mr-3 h-6 w-6" />
                Connect Wallet & Purchase Policy
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-8">
                {/* Step 1: Connect Wallet */}
                <div className="space-y-4">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="bg-blue-100 text-blue-600 rounded-full w-8 h-8 flex items-center justify-center font-bold">
                      1
                    </div>
                    <h3 className="text-lg font-semibold text-[#212529]">
                      Connect Your Wallet
                    </h3>
                  </div>

                  <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                    <div className="flex items-start gap-3">
                      <Info className="h-5 w-5 text-blue-600 mt-0.5" />
                      <p className="text-sm text-blue-800">
                        Connect your MetaMask wallet to purchase the policy.
                        Your wallet address will be associated with this
                        insurance policy and used for all future transactions.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <Button
                      variant={account ? "default" : "outline"}
                      onClick={connectWallet}
                      disabled={!!account}
                      className={
                        account ? "bg-green-600 hover:bg-green-700" : ""
                      }
                    >
                      <Wallet className="mr-2 h-4 w-4" />
                      {account
                        ? `Connected: ${account.slice(0, 6)}...${account.slice(-4)}`
                        : "Connect MetaMask"}
                    </Button>
                    {account && (
                      <Badge className="bg-green-100 text-green-800">
                        <CheckCircle className="mr-1 h-3 w-3" />
                        Wallet Connected
                      </Badge>
                    )}
                    {error && (
                      <Badge
                        variant="destructive"
                        className="bg-red-100 text-red-800"
                      >
                        <AlertCircle className="mr-1 h-3 w-3" />
                        {error}
                      </Badge>
                    )}
                  </div>
                </div>

                <Separator />

                {/* Step 2: Terms & Conditions */}
                <div className="space-y-4">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="bg-purple-100 text-purple-600 rounded-full w-8 h-8 flex items-center justify-center font-bold">
                      2
                    </div>
                    <h3 className="text-lg font-semibold text-[#212529]">
                      Review Terms & Conditions
                    </h3>
                  </div>

                  <div className="bg-gradient-to-r from-gray-50 to-gray-100 p-6 rounded-lg border border-gray-200 max-h-48 overflow-y-auto">
                    <div className="flex items-center gap-2 mb-4">
                      <FileText className="h-5 w-5 text-gray-600" />
                      <p className="font-semibold text-gray-800">
                        Health Insurance Policy Terms:
                      </p>
                    </div>
                    <ul className="list-disc pl-6 space-y-2 text-sm text-gray-700">
                      <li className="flex items-start gap-2">
                        <Shield className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                        This policy provides comprehensive coverage for medical
                        expenses up to your selected sum assured amount.
                      </li>
                      <li className="flex items-start gap-2">
                        <AlertCircle className="h-4 w-4 text-yellow-600 mt-0.5 flex-shrink-0" />
                        Premium payments are non-refundable once the policy is
                        activated on the blockchain.
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                        Claims are processed automatically based on the terms of
                        the smart contract.
                      </li>
                      <li className="flex items-start gap-2">
                        <Users className="h-4 w-4 text-purple-600 mt-0.5 flex-shrink-0" />
                        The policy covers all insured persons and conditions
                        specified in your application.
                      </li>
                      <li className="flex items-start gap-2">
                        <ExternalLink className="h-4 w-4 text-indigo-600 mt-0.5 flex-shrink-0" />
                        This policy is governed by smart contract code deployed
                        on the Sepolia testnet.
                      </li>
                    </ul>
                  </div>

                  <div className="flex items-start space-x-3 bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                    <Checkbox
                      id="terms"
                      checked={termsAccepted}
                      onCheckedChange={(checked) =>
                        setTermsAccepted(checked === true)
                      }
                      className="mt-0.5"
                    />
                    <Label
                      htmlFor="terms"
                      className="text-sm font-medium leading-relaxed cursor-pointer text-gray-800"
                    >
                      I have carefully read and agree to the Health Insurance
                      Terms & Conditions. I understand that this is a
                      blockchain-based policy and premium payments are
                      non-refundable.
                    </Label>
                  </div>
                </div>

                <Separator />

                {/* Step 3: Complete Purchase */}
                <div className="space-y-4">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="bg-green-100 text-green-600 rounded-full w-8 h-8 flex items-center justify-center font-bold">
                      3
                    </div>
                    <h3 className="text-lg font-semibold text-[#212529]">
                      Complete Purchase
                    </h3>
                  </div>

                  <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                    <div className="flex items-start gap-3">
                      <Info className="h-5 w-5 text-green-600 mt-0.5" />
                      <div>
                        <p className="text-sm text-green-800 mb-2">
                          Click the button below to pay the premium and activate
                          your policy. This will initiate a secure transaction
                          on the Sepolia testnet.
                        </p>
                        <div className="flex items-center gap-3 text-sm">
                          <span className="font-medium">Premium Amount:</span>
                          <Badge className="bg-green-100 text-green-800 font-mono">
                            {premiumDetails.premiumEth} ETH
                          </Badge>
                          <span className="text-gray-600">
                            ({premiumDetails.premium} THB)
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between border-t pt-6 bg-gray-50 rounded-b-lg">
              <Button
                variant="outline"
                asChild
                disabled={isSubmitting}
                className="shadow-md"
              >
                <Link href="/dashboard/insurance/health/apply">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back to Application
                </Link>
              </Button>
              <Button
                onClick={handlePurchasePolicy}
                disabled={
                  !termsAccepted ||
                  !account ||
                  isSubmitting ||
                  transactionStatus === "success"
                }
                className="bg-gradient-to-r from-[#28A745] to-[#20C997] hover:from-[#218838] hover:to-[#1EA085] text-white shadow-lg  transition-all duration-200 transform"
                size="lg"
              >
                {isSubmitting ? (
                  <>
                    <span className="mr-2">Processing...</span>
                    <svg
                      className="animate-spin h-5 w-5 text-white"
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
                    <Wallet className="mr-2 h-5 w-5" />
                    Purchase Policy ({premiumDetails.premium} THB /{" "}
                    {premiumDetails.premiumEth} ETH)
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
