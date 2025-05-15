"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  ArrowLeft,
  Calendar,
  Clock,
  CloudRain,
  Download,
  ExternalLink,
  FileText,
  HeartPulse,
  Info,
  Loader2,
  PlaneTakeoff,
  PlusCircle,
  Shield,
} from "lucide-react";
import Link from "next/link";
import mapApiPolicyToDetails from "./utils/mapApiPolicyToDetails";
import { PolicyDetailsProps } from "@/views/dashboard/policies/types/policies.types";

export default function PoliciesIdPage({
  walletAddress,
}: {
  walletAddress: string;
}) {
  const params = useParams();
  const { id } = params;
  const [policy, setPolicy] = useState<PolicyDetailsProps | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPolicyDetails = async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await fetch(
          `http://localhost:3001/api/user/policy?walletAddress=${walletAddress}`
        );
        const data = await res.json();
        const found = Array.isArray(data)
          ? data.find(
              (p: any) => `CS-POL-${p.id.toString().padStart(5, "0")}` === id
            )
          : null;
        if (!found) {
          setError("Policy not found.");
          setPolicy(null);
        } else {
          setPolicy(mapApiPolicyToDetails(found));
        }
      } catch (err) {
        setError("Failed to load policy details. Please try again.");
        setPolicy(null);
      } finally {
        setLoading(false);
      }
    };

    fetchPolicyDetails();
  }, [id]);

  const getPolicyIcon = () => {
    if (!policy) return <Shield className="h-6 w-6" />;

    switch (policy.type) {
      case "health":
        return <HeartPulse className="h-6 w-6 text-red-500" />;
      case "flight":
        return <PlaneTakeoff className="h-6 w-6 text-blue-500" />;
      case "rainfall":
        return <CloudRain className="h-6 w-6 text-green-500" />;
      default:
        return <Shield className="h-6 w-6" />;
    }
  };

  const getPolicyTypeDisplay = () => {
    if (!policy) return "Insurance Policy";

    switch (policy.type) {
      case "health":
        return "Health Insurance";
      case "flight":
        return "Flight Delay Insurance";
      case "rainfall":
        return "Rainfall Insurance";
      default:
        return "Insurance Policy";
    }
  };

  const getStatusBadgeVariant = () => {
    if (!policy) return "default";

    switch (policy.status) {
      case "active":
        return "secondary";
      case "expired":
        return "destructive";
      case "pending-payment":
        return "outline";
      case "claimed":
        return "default";
      default:
        return "default";
    }
  };

  const getStatusDisplay = () => {
    if (!policy) return "";

    return policy.status
      .split("-")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  if (loading) {
    return (
      <>
        <main className="container px-4 py-8 mx-auto">
          <div className="flex justify-center items-center min-h-[60vh]">
            <div className="text-center">
              <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
              <h2 className="text-xl font-semibold">Loading Policy Details</h2>
              <p className="text-gray-500 mt-2">
                Please wait while we fetch your policy information...
              </p>
            </div>
          </div>
        </main>
      </>
    );
  }

  if (error || !policy) {
    return (
      <>
        <main className="container px-4 py-8 mx-auto">
          <div className="max-w-3xl mx-auto">
            <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-red-100 text-red-500 mb-4">
                <Info className="h-6 w-6" />
              </div>
              <h2 className="text-xl font-semibold text-red-800 mb-2">
                Policy Not Found
              </h2>
              <p className="text-red-600 mb-4">
                {error || "The requested policy could not be found."}
              </p>
              <Button asChild>
                <Link href="/dashboard/policies">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back to My Policies
                </Link>
              </Button>
            </div>
          </div>
        </main>
      </>
    );
  }

  return (
    <>
      <main className="container px-4 py-8 mx-auto">
        <div className="max-w-4xl mx-auto">
          <div className="mb-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <Link
                  href="/dashboard/policies"
                  className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700 mb-10"
                >
                  <ArrowLeft className="mr-1 h-4 w-4" />
                  Back to My Policies
                </Link>
                <div className="flex items-center gap-2">
                  {getPolicyIcon()}
                  <h1 className="text-3xl font-bold">
                    {getPolicyTypeDisplay()}
                  </h1>
                  <Badge variant={getStatusBadgeVariant()}>
                    {getStatusDisplay()}
                  </Badge>
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="border-[#0D47A1] text-[#0D47A1]"
                  asChild
                >
                  <a
                    href={policy.documentUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Download className="mr-2 h-4 w-4" />
                    Download PDF
                  </a>
                </Button>
                {policy.canClaim && (
                  <Button
                    size="sm"
                    className="bg-[#0D47A1] hover:bg-[#083984]"
                    asChild
                  >
                    <Link
                      href={`/dashboard/claims/submit?policyId=${policy.id}`}
                    >
                      <PlusCircle className="mr-2 h-4 w-4" />
                      Submit Claim
                    </Link>
                  </Button>
                )}
              </div>
            </div>
          </div>

          {policy.status === "pending-payment" && (
            <Alert className="mb-6 bg-amber-50 border-amber-200 text-amber-800">
              <Clock className="h-4 w-4 text-amber-800" />
              <AlertDescription>
                This policy is pending payment. Please complete the payment to
                activate your coverage.
              </AlertDescription>
            </Alert>
          )}

          <Tabs defaultValue="details" className="space-y-6">
            <TabsList className="grid w-full grid-cols-3 lg:w-auto lg:inline-grid">
              <TabsTrigger value="details">Policy Details</TabsTrigger>
              <TabsTrigger value="coverage">Coverage</TabsTrigger>
              <TabsTrigger value="claims">Claims History</TabsTrigger>
            </TabsList>

            <TabsContent value="details" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Policy Information</CardTitle>
                  <CardDescription>
                    Details about your insurance policy
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-1">
                      <p className="text-sm text-gray-500">Policy ID</p>
                      <p className="font-medium">{policy.id}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm text-gray-500">Policy Type</p>
                      <p className="font-medium">{getPolicyTypeDisplay()}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm text-gray-500">Status</p>
                      <Badge variant={getStatusBadgeVariant()}>
                        {getStatusDisplay()}
                      </Badge>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm text-gray-500">Coverage Period</p>
                      <p className="font-medium flex items-center">
                        <Calendar className="mr-2 h-4 w-4 text-gray-400" />
                        {policy.startDate} - {policy.endDate}
                      </p>
                    </div>
                  </div>

                  <Separator />

                  <div>
                    <h3 className="font-semibold mb-3">
                      Blockchain Information
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-1">
                        <p className="text-sm text-gray-500">
                          Contract Address
                        </p>
                        <a
                          href={`https://sepolia.etherscan.io/address/${policy.blockchain.contractAddress}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="font-mono text-sm text-blue-600 hover:underline flex items-center"
                        >
                          {policy.blockchain.contractAddress.substring(0, 10)}
                          ...
                          {policy.blockchain.contractAddress.substring(
                            policy.blockchain.contractAddress.length - 8
                          )}
                          <ExternalLink className="ml-1 h-3 w-3" />
                        </a>
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm text-gray-500">Network</p>
                        <p className="font-medium">
                          {policy.blockchain.network}
                        </p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm text-gray-500">
                          Transaction Hash
                        </p>
                        <a
                          href={`https://sepolia.etherscan.io/tx/${policy.blockchain.transactionHash}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="font-mono text-sm text-blue-600 hover:underline flex items-center"
                        >
                          {policy.blockchain.transactionHash.substring(0, 10)}
                          ...
                          {policy.blockchain.transactionHash.substring(
                            policy.blockchain.transactionHash.length - 8
                          )}
                          <ExternalLink className="ml-1 h-3 w-3" />
                        </a>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Policyholder Information</CardTitle>
                  <CardDescription>
                    Details about the policyholder
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-1">
                      <p className="text-sm text-gray-500">Name</p>
                      <p className="font-medium">{policy.policyHolder.name}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm text-gray-500">Wallet Address</p>
                      <p className="font-mono text-sm">
                        {policy.policyHolder.walletAddress}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="coverage" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Coverage Details</CardTitle>
                  <CardDescription>
                    Information about your policy coverage
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-1">
                      <p className="text-sm text-gray-500">Coverage Amount</p>
                      <p className="text-2xl font-bold text-[#0D47A1]">
                        {policy.coverageAmount}
                      </p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm text-gray-500">Premium</p>
                      <p className="text-2xl font-bold">{policy.premium}</p>
                    </div>
                  </div>

                  <Separator />

                  <div>
                    <h3 className="text-lg font-semibold mb-3">
                      Coverage Details
                    </h3>
                    <div className="prose max-w-none">
                      {policy.type === "health" && (
                        <div className="space-y-4">
                          <p>
                            This health insurance policy provides coverage for
                            medical expenses up to{" "}
                            <strong>{policy.coverageAmount}</strong>. The policy
                            is valid from <strong>{policy.startDate}</strong> to{" "}
                            <strong>{policy.endDate}</strong>.
                          </p>
                          <h4 className="text-lg font-semibold">
                            What's Covered
                          </h4>
                          <ul className="list-disc pl-5 space-y-1">
                            <li>Hospital stays and treatments</li>
                            <li>Surgical procedures</li>
                            <li>Emergency medical services</li>
                            <li>Prescription medications</li>
                            <li>Diagnostic tests and lab work</li>
                          </ul>
                          <h4 className="text-lg font-semibold">
                            Claim Process
                          </h4>
                          <p>
                            Claims are processed through our blockchain-based
                            system, ensuring transparency and efficiency. Submit
                            your medical documentation and receipts through the
                            claims portal to initiate the process.
                          </p>
                        </div>
                      )}

                      {policy.type === "flight" && (
                        <div className="space-y-4">
                          <p>
                            This parametric flight delay insurance provides
                            automatic compensation of{" "}
                            <strong>{policy.coverageAmount}</strong> if your
                            flight is delayed by more than 3 hours. The policy
                            is valid from <strong>{policy.startDate}</strong> to{" "}
                            <strong>{policy.endDate}</strong>.
                          </p>
                          <h4 className="text-lg font-semibold">
                            How It Works
                          </h4>
                          <ul className="list-disc pl-5 space-y-1">
                            <li>
                              Register your flight details before departure
                            </li>
                            <li>
                              Our oracle monitors flight status in real-time
                            </li>
                            <li>
                              If a delay exceeds 3 hours, payment is
                              automatically triggered
                            </li>
                            <li>
                              Compensation is sent directly to your wallet
                            </li>
                          </ul>
                          <h4 className="text-lg font-semibold">
                            Smart Contract Execution
                          </h4>
                          <p>
                            This policy is executed through a smart contract on
                            the blockchain. When flight delay data is confirmed
                            by our oracle, the contract automatically processes
                            your claim without requiring any action from you.
                          </p>
                        </div>
                      )}

                      {policy.type === "rainfall" && (
                        <div className="space-y-4">
                          <p>
                            This parametric rainfall insurance provides
                            protection against insufficient rainfall. If
                            rainfall falls below the specified threshold, you'll
                            receive compensation of{" "}
                            <strong>{policy.coverageAmount}</strong>. The policy
                            is valid from <strong>{policy.startDate}</strong> to{" "}
                            <strong>{policy.endDate}</strong>.
                          </p>
                          <h4 className="text-lg font-semibold">
                            How It Works
                          </h4>
                          <ul className="list-disc pl-5 space-y-1">
                            <li>
                              Weather data is collected from trusted
                              meteorological sources
                            </li>
                            <li>
                              Our oracle verifies and records rainfall
                              measurements on the blockchain
                            </li>
                            <li>
                              If rainfall is below the threshold, payment is
                              automatically triggered
                            </li>
                            <li>
                              Compensation is sent directly to your wallet
                            </li>
                          </ul>
                          <h4 className="text-lg font-semibold">
                            Smart Contract Execution
                          </h4>
                          <p>
                            This policy is executed through a smart contract on
                            the blockchain. When rainfall data is confirmed by
                            our oracle, the contract automatically processes
                            your claim without requiring any action from you.
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="claims" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Claims History</CardTitle>
                  <CardDescription>
                    History of claims made against this policy
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {policy.claimHistory && policy.claimHistory.length > 0 ? (
                    <div className="space-y-4">
                      {policy.claimHistory.map((claim) => (
                        <div
                          key={claim.id}
                          className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-4 border rounded-lg"
                        >
                          <div className="flex items-start gap-3">
                            <FileText className="h-5 w-5 text-gray-400 mt-0.5" />
                            <div>
                              <p className="font-medium">{claim.id}</p>
                              <p className="text-sm text-gray-500">
                                {claim.date}
                              </p>
                            </div>
                          </div>
                          <div className="mt-3 sm:mt-0 flex flex-col sm:flex-row sm:items-center gap-3">
                            <p className="font-medium">{claim.amount}</p>
                            <Badge
                              variant={
                                claim.status === "approved" ||
                                claim.status === "paid"
                                  ? "secondary"
                                  : claim.status === "pending"
                                    ? "outline"
                                    : "default"
                              }
                            >
                              {claim.status.charAt(0).toUpperCase() +
                                claim.status.slice(1)}
                            </Badge>
                            <Button variant="outline" size="sm" asChild>
                              <Link href={`/dashboard/claims/${claim.id}`}>
                                View Details
                              </Link>
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <FileText className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                      <h3 className="text-lg font-medium mb-1">
                        No Claims Yet
                      </h3>
                      <p className="text-gray-500 mb-6">
                        You haven't made any claims against this policy yet.
                      </p>
                      {policy.canClaim && (
                        <Button asChild>
                          <Link
                            href={`/dashboard/claims/submit?policyId=${policy.id}`}
                          >
                            <PlusCircle className="mr-2 h-4 w-4" />
                            Submit a Claim
                          </Link>
                        </Button>
                      )}
                    </div>
                  )}
                </CardContent>
                <CardFooter className="flex justify-center border-t pt-6">
                  <Button variant="outline" asChild>
                    <Link href="/dashboard/claims/history">
                      View All Claims
                    </Link>
                  </Button>
                </CardFooter>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </>
  );
}
