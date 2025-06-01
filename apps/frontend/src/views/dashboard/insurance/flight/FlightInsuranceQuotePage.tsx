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
  Shield,
  Plane,
  CreditCard,
  Lock,
  FileText,
  Globe,
  Users,
  Calendar,
  Timer,
  AlertTriangle,
  ExternalLink,
  Copy,
  CheckCheck,
  DollarSign,
  Eye,
  Info,
  TrendingUp,
  MapPin,
  ArrowRight,
} from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { FlightQuoteDetails } from "@/views/dashboard/insurance/flight/components/flight-quote-details";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";

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
  const [copied, setCopied] = useState(false);

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

  // Copy transaction hash to clipboard
  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      toast.success("Transaction hash copied to clipboard!");
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      toast.error("Failed to copy to clipboard");
    }
  };

  // Auto connect from sessionStorage user_address
  useEffect(() => {
    try {
      const stored = sessionStorage.getItem("flightPolicyDraft");
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

  // Connect to MetaMask (manual, not used for auto-connect)
  const connectWallet = async () => {
    setError("");
    if ((window as any).ethereum) {
      try {
        const accounts = await (window as any).ethereum.request({
          method: "eth_requestAccounts",
        });
        setAccount(accounts[0]);
        toast.success("Wallet connected successfully!");
      } catch (err) {
        setError("User rejected connection");
        toast.error("Failed to connect wallet");
      }
    } else {
      setError("MetaMask not detected");
      toast.error("MetaMask not detected. Please install MetaMask.");
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
      toast.error("Please accept the terms and conditions to proceed.");
      return;
    }
    if (!account) {
      setError("User address not found.");
      toast.error("User address not found.");
      return;
    }
    setIsSubmitting(true);
    setTransactionStatus("pending");
    toast.info("Processing your insurance purchase...");

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
      toast.success("Insurance policy purchased successfully!");

      setTimeout(() => {
        router.push(
          `/dashboard/insurance/flight/apply/success?txHash=${txHash || result.transfer?.data?.transactionHash || ""}`
        );
      }, 2000);
    } catch (error) {
      console.error("Transaction failed:", error);
      setTransactionStatus("error");
      toast.error("Transaction failed. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!flightDetails || !premiumDetails) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
        <div className="container px-4 py-8 mx-auto">
          <div className="max-w-3xl mx-auto">
            <Alert
              className="mb-8 bg-gradient-to-r from-red-50 to-red-100 border-red-200 shadow-lg"
              variant="destructive"
            >
              <AlertTriangle className="h-5 w-5 text-red-600" />
              <AlertTitle className="text-red-800 font-semibold">
                Missing Quote Data
              </AlertTitle>
              <AlertDescription className="text-red-700">
                We couldn't find your flight insurance quote. Please return to
                the previous step and re-enter your flight information to
                generate a new quote.
              </AlertDescription>
            </Alert>

            <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
              <CardContent className="p-8 text-center">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Plane className="h-8 w-8 text-blue-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  Ready to Get Your Quote?
                </h3>
                <p className="text-gray-600 mb-6">
                  Start by entering your flight details to receive a
                  personalized insurance quote.
                </p>
                <Button
                  className="bg-blue-600 hover:bg-blue-700 text-white shadow-lg"
                  asChild
                >
                  <Link href="/dashboard/insurance/flight/apply">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Enter Flight Details
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      <div className="container px-4 py-8 mx-auto">
        <div className="max-w-4xl mx-auto">
          {/* Header Navigation */}
          <div className="flex items-center gap-3 mb-8">
            <Link
              href="/dashboard/insurance/flight/apply"
              className="flex items-center text-blue-600 hover:text-blue-800 transition-colors group"
            >
              <ArrowLeft className="h-4 w-4 mr-1 group-hover:-translate-x-1 transition-transform" />
              <span className="font-medium">Back to Flight Details</span>
            </Link>
          </div>

          {/* Page Header */}
          <div className="text-center mb-10">
            <div className="flex justify-center mb-4">
              <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg">
                <Shield className="h-10 w-10 text-white" />
              </div>
            </div>
            <h1 className="text-4xl font-bold text-gray-900 mb-3">
              Your Flight Insurance Quote
            </h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed">
              Review your personalized premium quote and policy terms for
              comprehensive flight delay coverage
            </p>
          </div>

          {/* Progress Indicator */}
          <div className="flex items-center justify-center mb-8">
            <div className="flex items-center space-x-4">
              <div className="flex items-center">
                <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                  <CheckCheck className="h-4 w-4 text-white" />
                </div>
                <span className="ml-2 text-sm font-medium text-green-600">
                  Flight Details
                </span>
              </div>
              <ArrowRight className="h-4 w-4 text-gray-400" />
              <div className="flex items-center">
                <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                  <Eye className="h-4 w-4 text-white" />
                </div>
                <span className="ml-2 text-sm font-medium text-blue-600">
                  Review Quote
                </span>
              </div>
              <ArrowRight className="h-4 w-4 text-gray-400" />
              <div className="flex items-center">
                <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
                  <CreditCard className="h-4 w-4 text-gray-500" />
                </div>
                <span className="ml-2 text-sm font-medium text-gray-500">
                  Payment
                </span>
              </div>
            </div>
          </div>

          {/* Flight and Quote Details */}
          <FlightQuoteDetails
            flightDetails={flightDetails}
            premiumDetails={premiumDetails}
          />

          {/* Transaction Status Alerts */}
          {transactionStatus === "pending" && (
            <Alert className="mb-8 bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200 shadow-lg">
              <div className="flex items-center">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                  <Timer className="h-5 w-5 text-blue-600 animate-spin" />
                </div>
                <div>
                  <AlertTitle className="text-blue-800 font-semibold">
                    Processing Your Transaction
                  </AlertTitle>
                  <AlertDescription className="text-blue-700">
                    Your payment is being processed on the Sepolia testnet.
                    Please confirm the transaction in your MetaMask wallet and
                    keep this window open.
                  </AlertDescription>
                </div>
              </div>
            </Alert>
          )}

          {transactionStatus === "success" && (
            <Alert className="mb-8 bg-gradient-to-r from-green-50 to-emerald-50 border-green-200 shadow-lg">
              <div className="flex items-center">
                <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center mr-3">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                </div>
                <div className="flex-1">
                  <AlertTitle className="text-green-800 font-semibold mb-2">
                    🎉 Policy Created Successfully!
                  </AlertTitle>
                  <AlertDescription className="text-green-700 mb-3">
                    Your flight delay insurance policy is now active on the
                    blockchain. You're protected against delays!
                  </AlertDescription>
                  {transactionHash && (
                    <div className="flex items-center gap-2 bg-white/50 p-3 rounded-lg">
                      <Globe className="h-4 w-4 text-green-600" />
                      <span className="text-sm font-medium text-green-800">
                        Transaction Hash:
                      </span>
                      <code className="text-xs text-green-700 bg-green-100 px-2 py-1 rounded font-mono">
                        {transactionHash.slice(0, 10)}...
                        {transactionHash.slice(-8)}
                      </code>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => copyToClipboard(transactionHash)}
                        className="h-8 w-8 p-0"
                      >
                        {copied ? (
                          <CheckCheck className="h-3 w-3 text-green-600" />
                        ) : (
                          <Copy className="h-3 w-3 text-green-600" />
                        )}
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </Alert>
          )}

          {transactionStatus === "error" && (
            <Alert
              className="mb-8 bg-gradient-to-r from-red-50 to-pink-50 border-red-200 shadow-lg"
              variant="destructive"
            >
              <div className="flex items-center">
                <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center mr-3">
                  <AlertTriangle className="h-5 w-5 text-red-600" />
                </div>
                <div>
                  <AlertTitle className="text-red-800 font-semibold">
                    Transaction Failed
                  </AlertTitle>
                  <AlertDescription className="text-red-700">
                    We encountered an error processing your payment. Please
                    check your wallet connection and try again. Contact support
                    if the issue continues.
                  </AlertDescription>
                </div>
              </div>
            </Alert>
          )}

          {/* Enhanced Wallet Connection and Purchase Section */}
          <Card className="shadow-2xl border-0 bg-white/90 backdrop-blur-sm overflow-hidden">
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-4">
              <CardTitle className="text-white text-xl font-semibold flex items-center">
                <Lock className="mr-3 h-6 w-6" />
                Secure Policy Purchase
              </CardTitle>
            </div>

            <CardContent className="p-8">
              <div className="space-y-8">
                {/* Step 1: Wallet Connection */}
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <span className="text-blue-600 font-bold text-sm">1</span>
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                      <Wallet className="mr-2 h-5 w-5 text-blue-600" />
                      Connect Your Wallet
                    </h3>
                  </div>

                  <div className="pl-11">
                    <p className="text-gray-600 mb-4 leading-relaxed">
                      Your MetaMask wallet will be used to pay the premium and
                      receive automatic payouts if your flight is delayed.
                    </p>

                    <div className="bg-gray-50 rounded-lg p-4 mb-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                            <Wallet className="h-5 w-5 text-orange-600" />
                          </div>
                          <div>
                            <div className="font-medium text-gray-900">
                              MetaMask Wallet
                            </div>
                            {account ? (
                              <div className="flex items-center gap-2">
                                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                <code className="text-sm text-gray-600">
                                  {account.slice(0, 6)}...{account.slice(-4)}
                                </code>
                                <Badge
                                  variant="secondary"
                                  className="bg-green-100 text-green-700"
                                >
                                  Connected
                                </Badge>
                              </div>
                            ) : (
                              <div className="text-sm text-gray-500">
                                Not connected
                              </div>
                            )}
                          </div>
                        </div>

                        <Button
                          variant="outline"
                          onClick={connectWallet}
                          disabled={!!account}
                          className="border-blue-200 hover:border-blue-300"
                        >
                          {account ? (
                            <>
                              <CheckCircle className="mr-2 h-4 w-4 text-green-600" />
                              Connected
                            </>
                          ) : (
                            <>
                              <Wallet className="mr-2 h-4 w-4" />
                              Connect Wallet
                            </>
                          )}
                        </Button>
                      </div>
                    </div>

                    {error && (
                      <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                        <div className="flex items-center">
                          <AlertCircle className="h-4 w-4 text-red-600 mr-2" />
                          <span className="text-red-700 text-sm">{error}</span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <Separator />

                {/* Step 2: Terms & Conditions */}
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <span className="text-blue-600 font-bold text-sm">2</span>
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                      <FileText className="mr-2 h-5 w-5 text-blue-600" />
                      Policy Terms & Coverage
                    </h3>
                  </div>

                  <div className="pl-11">
                    <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
                      <CardContent className="p-6">
                        <div className="grid md:grid-cols-2 gap-6">
                          <div className="space-y-4">
                            <div className="flex items-start gap-3">
                              <Timer className="h-5 w-5 text-blue-600 mt-0.5" />
                              <div>
                                <div className="font-medium text-gray-900">
                                  Delay Threshold
                                </div>
                                <div className="text-sm text-gray-600">
                                  Coverage activates after{" "}
                                  <strong>
                                    {premiumDetails.delayThreshold}
                                  </strong>{" "}
                                  delay
                                </div>
                              </div>
                            </div>

                            <div className="flex items-start gap-3">
                              <DollarSign className="h-5 w-5 text-green-600 mt-0.5" />
                              <div>
                                <div className="font-medium text-gray-900">
                                  Payout Amount
                                </div>
                                <div className="text-sm text-gray-600">
                                  <strong>
                                    {premiumDetails.coverageAmount} ETH
                                  </strong>{" "}
                                  automatic compensation
                                </div>
                              </div>
                            </div>
                          </div>

                          <div className="space-y-4">
                            <div className="flex items-start gap-3">
                              <Users className="h-5 w-5 text-purple-600 mt-0.5" />
                              <div>
                                <div className="font-medium text-gray-900">
                                  Coverage
                                </div>
                                <div className="text-sm text-gray-600">
                                  {flightDetails.numPersons} passenger
                                  {flightDetails.numPersons > 1 ? "s" : ""}{" "}
                                  covered
                                </div>
                              </div>
                            </div>

                            <div className="flex items-start gap-3">
                              <Globe className="h-5 w-5 text-indigo-600 mt-0.5" />
                              <div>
                                <div className="font-medium text-gray-900">
                                  Smart Contract
                                </div>
                                <div className="text-sm text-gray-600">
                                  Automated on Sepolia testnet
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>

                        <Separator className="my-4" />

                        <div className="space-y-3">
                          <div className="flex items-center gap-2">
                            <Info className="h-4 w-4 text-blue-600" />
                            <span className="font-medium text-gray-900">
                              Key Benefits:
                            </span>
                          </div>
                          <ul className="grid md:grid-cols-2 gap-2 text-sm text-gray-700">
                            <li className="flex items-center gap-2">
                              <CheckCircle className="h-3 w-3 text-green-600" />
                              Automatic delay detection
                            </li>
                            <li className="flex items-center gap-2">
                              <CheckCircle className="h-3 w-3 text-green-600" />
                              Instant payout processing
                            </li>
                            <li className="flex items-center gap-2">
                              <CheckCircle className="h-3 w-3 text-green-600" />
                              No claim forms required
                            </li>
                            <li className="flex items-center gap-2">
                              <CheckCircle className="h-3 w-3 text-green-600" />
                              Blockchain-secured policy
                            </li>
                          </ul>
                        </div>
                      </CardContent>
                    </Card>

                    <div className="flex items-start space-x-3 mt-6 p-4 bg-white border border-gray-200 rounded-lg">
                      <Checkbox
                        id="terms"
                        checked={termsAccepted}
                        onCheckedChange={(checked) =>
                          setTermsAccepted(checked === true)
                        }
                        className="mt-1"
                      />
                      <Label
                        htmlFor="terms"
                        className="text-sm leading-relaxed cursor-pointer"
                      >
                        I understand and agree to the flight delay insurance
                        terms, automatic payout conditions, and acknowledge that
                        premium payments are non-refundable once the policy is
                        activated on the blockchain.
                      </Label>
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Step 3: Payment */}
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <span className="text-blue-600 font-bold text-sm">3</span>
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                      <CreditCard className="mr-2 h-5 w-5 text-blue-600" />
                      Complete Payment
                    </h3>
                  </div>

                  <div className="pl-11">
                    <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg p-6">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                            <DollarSign className="h-6 w-6 text-green-600" />
                          </div>
                          <div>
                            <div className="text-lg font-semibold text-gray-900">
                              Premium Payment
                            </div>
                            <div className="text-sm text-gray-600">
                              One-time payment for full coverage
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-2xl font-bold text-green-600">
                            {amount} ETH
                          </div>
                          <div className="text-sm text-gray-500">
                            {/* ≈ {(parseFloat(amount) * 83678.85).toFixed(2)} THB{" "}
                            Example conversion rate */}
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Per person:</span>
                          <span className="font-medium">
                            {premiumDetails.premiumPerPerson} ETH
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Passengers:</span>
                          <span className="font-medium">
                            {flightDetails.numPersons}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="mt-4 p-4 bg-amber-50 border border-amber-200 rounded-lg">
                      <div className="flex items-start gap-3">
                        <AlertTriangle className="h-5 w-5 text-amber-600 mt-0.5" />
                        <div className="text-sm text-amber-800">
                          <strong>Important:</strong> This transaction will be
                          processed on the Sepolia testnet. Make sure your
                          MetaMask is connected to the correct network.
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>

            <CardFooter className="bg-gray-50 px-8 py-6 flex justify-between border-t">
              <Button
                variant="outline"
                asChild
                disabled={isSubmitting}
                className="border-gray-300"
              >
                <Link href="/dashboard/insurance/flight/apply">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back to Details
                </Link>
              </Button>

              <Button
                onClick={handlePurchasePolicy}
                disabled={
                  !termsAccepted ||
                  isSubmitting ||
                  transactionStatus === "success" ||
                  !account
                }
                className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white shadow-lg px-8"
                size="lg"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                    Processing Payment...
                  </>
                ) : (
                  <>
                    <Shield className="mr-2 h-5 w-5" />
                    Purchase Policy ({premiumDetails.premium} ETH)
                  </>
                )}
              </Button>
            </CardFooter>
          </Card>

          {/* Additional Info */}
          <div className="mt-8 text-center">
            <p className="text-sm text-gray-500 flex items-center justify-center gap-2">
              <Lock className="h-4 w-4" />
              Your transaction is secured by blockchain technology
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
