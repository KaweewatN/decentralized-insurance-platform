"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  CalendarIcon,
  FileTextIcon,
  DollarSignIcon,
  DownloadIcon,
  ExternalLinkIcon,
  CopyIcon,
  CheckCircleIcon,
  ClockIcon,
  XCircleIcon,
  ArrowLeftIcon,
  ShieldIcon,
  AlertCircleIcon,
} from "lucide-react";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";

interface ClaimData {
  id: string;
  walletAddress: string;
  policyId: string;
  subject: string;
  description: string;
  dateOfIncident: string;
  amount: string;
  claimedTransactionHash: string | null;
  documentUrl: string;
  status: string;
  contractAddress: string;
  approvedDate: string | null;
  createdAt: string;
  updatedAt: string;
  type: string;
  policy: {
    id: string;
    planType: {
      id: number;
      name: string;
      description: string;
      isActive: boolean;
      createdAt: string;
      updatedAt: string;
    };
    premium: string;
    coverageAmount: string;
  };
}

const getStatusIcon = (status: string) => {
  switch (status.toLowerCase()) {
    case "approved":
      return <CheckCircleIcon className="h-5 w-5 text-green-500" />;
    case "pending":
      return <ClockIcon className="h-5 w-5 text-yellow-500" />;
    case "rejected":
      return <XCircleIcon className="h-5 w-5 text-red-500" />;
    default:
      return <AlertCircleIcon className="h-5 w-5 text-gray-500" />;
  }
};

const getStatusColor = (status: string) => {
  switch (status.toLowerCase()) {
    case "approved":
      return "bg-green-100 text-green-800 border-green-200";
    case "pending":
      return "bg-yellow-100 text-yellow-800 border-yellow-200";
    case "rejected":
      return "bg-red-100 text-red-800 border-red-200";
    default:
      return "bg-gray-100 text-gray-800 border-gray-200";
  }
};

const copyToClipboard = async (text: string, label: string) => {
  try {
    await navigator.clipboard.writeText(text);
    toast.success(`${label} copied to clipboard`);
  } catch (err) {
    toast.error("Failed to copy to clipboard");
  }
};

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const formatAddress = (address: string) => {
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
};

// Add utility function for Sepolia explorer URLs
const getSepoliaExplorerUrl = (address: string, type: "address" | "tx") => {
  const baseUrl = "https://sepolia.etherscan.io";
  return type === "address"
    ? `${baseUrl}/address/${address}`
    : `${baseUrl}/tx/${address}`;
};

export default function ClaimByIdPage({
  walletAddress,
  claimId,
}: {
  walletAddress: string;
  claimId: string;
}) {
  const router = useRouter();
  const [claimData, setClaimData] = useState<ClaimData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchClaimData = async () => {
      if (!walletAddress || !claimId) {
        setError("Missing wallet address or claim ID");
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(
          `http://localhost:3001/api/user/claim/${walletAddress}/${claimId}`
        );

        if (!response.ok) {
          throw new Error("Failed to fetch claim data");
        }

        console.log(response);

        const data = await response.json();
        setClaimData(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setLoading(false);
      }
    };

    fetchClaimData();
  }, [walletAddress, claimId]);

  console.log("Claim Data:", claimData);

  if (loading) {
    return (
      <div className="container mx-auto px-6 py-8 max-w-6xl">
        <div className="space-y-6">
          <Skeleton className="h-8 w-64" />
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <Skeleton className="h-64 w-full" />
              <Skeleton className="h-48 w-full" />
            </div>
            <div className="space-y-6">
              <Skeleton className="h-32 w-full" />
              <Skeleton className="h-48 w-full" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !claimData) {
    return (
      <div className="container mx-auto px-6 py-8 max-w-6xl">
        <Card className="border-red-200">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <XCircleIcon className="h-12 w-12 text-red-500 mb-4" />
            <h3 className="text-lg font-semibold text-red-800 mb-2">
              Error Loading Claim
            </h3>
            <p className="text-red-600 text-center mb-4">
              {error || "Claim not found"}
            </p>
            <Button onClick={() => router.back()} variant="outline">
              <ArrowLeftIcon className="h-4 w-4 mr-2" />
              Go Back
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-6 py-8 max-w-6xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.back()}
            className="flex items-center"
          >
            <ArrowLeftIcon className="h-4 w-4 mr-2" />
            Back
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Claim Details</h1>
            <p className="text-gray-600">
              View and manage your insurance claim
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          {getStatusIcon(claimData.status)}
          <Badge className={getStatusColor(claimData.status)}>
            {claimData.status}
          </Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Claim Overview */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <FileTextIcon className="h-5 w-5 mr-2" />
                Claim Overview
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-600">
                    Claim ID
                  </label>
                  <div className="flex items-center space-x-2 mt-1">
                    <code className="text-sm bg-gray-100 px-2 py-1 rounded">
                      {formatAddress(claimData.id)}
                    </code>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => copyToClipboard(claimData.id, "Claim ID")}
                    >
                      <CopyIcon className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">
                    Claim Type
                  </label>
                  <p className="text-sm mt-1 font-medium">{claimData.type}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">
                    Subject
                  </label>
                  <p className="text-sm mt-1">{claimData.subject}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">
                    Incident Date
                  </label>
                  <div className="flex items-center space-x-2 mt-1">
                    <CalendarIcon className="h-4 w-4 text-gray-500" />
                    <span className="text-sm">
                      {formatDate(claimData.dateOfIncident)}
                    </span>
                  </div>
                </div>
              </div>

              <Separator />

              <div>
                <label className="text-sm font-medium text-gray-600">
                  Description
                </label>
                <p className="text-sm mt-1 p-3 bg-gray-50 rounded-md">
                  {claimData.description}
                </p>
              </div>

              {claimData.amount !== "0" && (
                <div>
                  <label className="text-sm font-medium text-gray-600">
                    Claimed Amount
                  </label>
                  <div className="flex items-center space-x-2 mt-1">
                    <DollarSignIcon className="h-4 w-4 text-gray-500" />
                    <span className="text-lg font-semibold">
                      {claimData.amount} ETH
                    </span>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Policy Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <ShieldIcon className="h-5 w-5 mr-2" />
                Associated Policy
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-600">
                    Policy Type
                  </label>
                  <p className="text-sm mt-1 font-medium">
                    {claimData.policy.planType.name}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">
                    Coverage Amount
                  </label>
                  <p className="text-sm mt-1 font-semibold text-green-600">
                    {claimData.policy.coverageAmount} ETH
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">
                    Premium
                  </label>
                  <p className="text-sm mt-1">{claimData.policy.premium} ETH</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">
                    Policy ID
                  </label>
                  <div className="flex items-center space-x-2 mt-1">
                    <code className="text-sm bg-gray-100 px-2 py-1 rounded">
                      {formatAddress(claimData.policyId)}
                    </code>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() =>
                        copyToClipboard(claimData.policyId, "Policy ID")
                      }
                    >
                      <CopyIcon className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </div>

              <Separator />

              <div>
                <label className="text-sm font-medium text-gray-600">
                  Policy Description
                </label>
                <p className="text-sm mt-1 text-gray-700">
                  {claimData.policy.planType.description}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Status Card */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Claim Status</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-center space-x-2 p-4 rounded-lg bg-gray-50">
                {getStatusIcon(claimData.status)}
                <span className="font-medium text-lg">{claimData.status}</span>
              </div>

              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Submitted:</span>
                  <span>{formatDate(claimData.createdAt)}</span>
                </div>
                {claimData.approvedDate && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Approved:</span>
                    <span>{formatDate(claimData.approvedDate)}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-gray-600">Last Updated:</span>
                  <span>{formatDate(claimData.updatedAt)}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Document */}
          {claimData.documentUrl && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Supporting Document</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="border-2 border-dashed border-gray-200 rounded-lg p-4 text-center">
                  <FileTextIcon className="h-8 w-8 mx-auto text-gray-400 mb-2" />
                  <p className="text-sm text-gray-600 mb-3">
                    Document attached
                  </p>
                  <div className="space-y-2">
                    <Button
                      size="sm"
                      variant="outline"
                      className="w-full"
                      onClick={() =>
                        window.open(claimData.documentUrl, "_blank")
                      }
                    >
                      <ExternalLinkIcon className="h-4 w-4 mr-2" />
                      View Document
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="w-full"
                      onClick={() => {
                        const link = document.createElement("a");
                        link.href = claimData.documentUrl;
                        link.download = "claim-document";
                        link.click();
                      }}
                    >
                      <DownloadIcon className="h-4 w-4 mr-2" />
                      Download
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Blockchain Info */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Blockchain Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-600">
                  Wallet Address
                </label>
                <div className="flex items-center space-x-2 mt-1">
                  <code
                    className="text-xs bg-gray-100 px-2 py-1 rounded flex-1 cursor-pointer hover:bg-gray-200 transition-colors"
                    onClick={() =>
                      window.open(
                        getSepoliaExplorerUrl(
                          claimData.walletAddress,
                          "address"
                        ),
                        "_blank"
                      )
                    }
                    title="Click to view on Sepolia Etherscan"
                  >
                    {formatAddress(claimData.walletAddress)}
                  </code>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() =>
                      copyToClipboard(claimData.walletAddress, "Wallet Address")
                    }
                    title="Copy to clipboard"
                  >
                    <CopyIcon className="h-3 w-3" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() =>
                      window.open(
                        getSepoliaExplorerUrl(
                          claimData.walletAddress,
                          "address"
                        ),
                        "_blank"
                      )
                    }
                    title="View on Sepolia Etherscan"
                  >
                    <ExternalLinkIcon className="h-3 w-3" />
                  </Button>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-600">
                  Contract Address
                </label>
                <div className="flex items-center space-x-2 mt-1">
                  <code
                    className="text-xs bg-gray-100 px-2 py-1 rounded flex-1 cursor-pointer hover:bg-gray-200 transition-colors"
                    onClick={() =>
                      window.open(
                        getSepoliaExplorerUrl(
                          claimData.contractAddress,
                          "address"
                        ),
                        "_blank"
                      )
                    }
                    title="Click to view on Sepolia Etherscan"
                  >
                    {formatAddress(claimData.contractAddress)}
                  </code>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() =>
                      copyToClipboard(
                        claimData.contractAddress,
                        "Contract Address"
                      )
                    }
                    title="Copy to clipboard"
                  >
                    <CopyIcon className="h-3 w-3" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() =>
                      window.open(
                        getSepoliaExplorerUrl(
                          claimData.contractAddress,
                          "address"
                        ),
                        "_blank"
                      )
                    }
                    title="View on Sepolia Etherscan"
                  >
                    <ExternalLinkIcon className="h-3 w-3" />
                  </Button>
                </div>
              </div>

              {claimData.claimedTransactionHash && (
                <div>
                  <label className="text-sm font-medium text-gray-600">
                    Transaction Hash
                  </label>
                  <div className="flex items-center space-x-2 mt-1">
                    <code
                      className="text-xs bg-gray-100 px-2 py-1 rounded flex-1 cursor-pointer hover:bg-gray-200 transition-colors"
                      onClick={() =>
                        window.open(
                          getSepoliaExplorerUrl(
                            claimData.claimedTransactionHash!,
                            "tx"
                          ),
                          "_blank"
                        )
                      }
                      title="Click to view transaction on Sepolia Etherscan"
                    >
                      {formatAddress(claimData.claimedTransactionHash)}
                    </code>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() =>
                        copyToClipboard(
                          claimData.claimedTransactionHash!,
                          "Transaction Hash"
                        )
                      }
                      title="Copy to clipboard"
                    >
                      <CopyIcon className="h-3 w-3" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() =>
                        window.open(
                          getSepoliaExplorerUrl(
                            claimData.claimedTransactionHash!,
                            "tx"
                          ),
                          "_blank"
                        )
                      }
                      title="View transaction on Sepolia Etherscan"
                    >
                      <ExternalLinkIcon className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
