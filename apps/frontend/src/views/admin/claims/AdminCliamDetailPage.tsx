"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  CheckCircle,
  XCircle,
  User,
  Wallet,
  Calendar,
  DollarSign,
  Shield,
  FileText,
  ExternalLink,
  Clock,
  AlertTriangle,
  ArrowLeft,
  HeartPulse,
  Plane,
  CloudRain,
  Receipt,
  Info,
} from "lucide-react";
import { toastError, toastSuccess } from "@/components/core/common/appToast";

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
    walletAddress: string;
    premium: string;
    totalPremium: string;
    coverageAmount: string;
    status: string;
    coverageStartDate: string;
    coverageEndDate: string;
    purchaseTransactionHash: string | null;
    contractCreationHash: string;
    contractAddress: string;
    documentUrl: string;
    planTypeId: number;
    createdAt: string;
    updatedAt: string;
    user: {
      walletAddress: string;
      fullName: string;
      username: string;
      age: number;
      gender: string;
      occupation: string;
      contactInfo: string;
    };
  };
}

export default function AdminClaimDetailPage() {
  const router = useRouter();
  const params = useParams();
  const [claimData, setClaimData] = useState<ClaimData | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (params?.id) {
      fetchClaimData();
    }
  }, [params?.id]);

  const fetchClaimData = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch(
        `http://localhost:3001/api/admin/claims/${params?.id}`
      );
      if (!response.ok) throw new Error("Failed to fetch claim data");
      const data = await response.json();
      setClaimData(data.data);
    } catch (error) {
      console.error("Error fetching claim data:", error);
      setError("Failed to fetch claim data");
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (newStatus: "APPROVED" | "REJECTED") => {
    try {
      setActionLoading(true);

      let response: Response;

      if (newStatus === "APPROVED") {
        // Extract amount in THB - you might need to adjust this conversion
        const amountEth = parseFloat(claimData?.amount || "0");
        const exchangeRate = 100000; // You might want to get this from an API or config
        const amountThb = amountEth * exchangeRate;

        // Call health claim endpoint for approval
        response = await fetch(`http://localhost:3001/api/health/claim`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            policyId: claimData?.policyId || claimData?.policy?.id,
            // claimAmount: amountThb,
            claimAmount: 100, // For testing, in real case, use amountThb
          }),
        });
      } else if (newStatus === "REJECTED") {
        // Call specific reject endpoint
        response = await fetch(
          `http://localhost:3001/api/admin/claims/${params?.id}/reject`,
          {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
            },
          }
        );
      } else {
        throw new Error("Invalid status");
      }

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.message || `Failed to ${newStatus.toLowerCase()} claim`
        );
      }

      const responseData = await response.json();

      // Show success message
      toastSuccess(`Claim ${newStatus.toLowerCase()} successfully`);
      console.log("Claim response:", responseData);
      await fetchClaimData(); // Refresh data
    } catch (error) {
      console.error(`Error ${newStatus.toLowerCase()} claim:`, error);
      toastError(`Failed to ${newStatus.toLowerCase()} claim`);
    } finally {
      setActionLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "PENDING":
        return (
          <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
            <Clock className="w-3 h-3 mr-1" />
            Pending
          </Badge>
        );
      case "APPROVED":
        return (
          <Badge variant="secondary" className="bg-green-100 text-green-800">
            <CheckCircle className="w-3 h-3 mr-1" />
            Approved
          </Badge>
        );
      case "REJECTED":
        return (
          <Badge variant="destructive">
            <XCircle className="w-3 h-3 mr-1" />
            Rejected
          </Badge>
        );
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getClaimTypeBadge = (type: string) => {
    switch (type) {
      case "HEALTH":
        return (
          <Badge className="bg-pink-100 text-pink-700 font-medium inline-flex items-center gap-1">
            <HeartPulse size={16} className="text-pink-500" />
            Health Insurance
          </Badge>
        );
      case "FLIGHT":
        return (
          <Badge className="bg-blue-100 text-blue-700 font-medium inline-flex items-center gap-1">
            <Plane size={16} className="text-blue-500" />
            Flight Insurance
          </Badge>
        );
      case "RAINFALL":
        return (
          <Badge className="bg-green-100 text-green-700 font-medium inline-flex items-center gap-1">
            <CloudRain size={16} className="text-green-500" />
            Rainfall Insurance
          </Badge>
        );
      default:
        return (
          <Badge className="bg-gray-100 text-gray-500 font-medium inline-flex items-center gap-1">
            Unknown
          </Badge>
        );
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

  const formatDateOnly = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatEther = (value: string) => {
    return `${parseFloat(value).toFixed(4)} ETH`;
  };

  const getSepoliaLink = (hash: string, type: "tx" | "address") => {
    const baseUrl = "https://sepolia.etherscan.io";
    return type === "tx"
      ? `${baseUrl}/tx/${hash}`
      : `${baseUrl}/address/${hash}`;
  };

  if (loading) {
    return (
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-2 border-gray-300 border-t-gray-900"></div>
      </div>
    );
  }

  if (error || !claimData) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Alert className="max-w-md">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>{error || "Claim not found"}</AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.push("/admin/claims")}
          className="flex items-center gap-2 text-blue-800"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Claims
        </Button>
        <h1 className="text-3xl font-bold">Claim Details</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-10">
        {/* Main Claim Information */}
        <div className="lg:col-span-2 space-y-6">
          {/* Claim Overview */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Receipt className="w-5 h-5" />
                  Claim Overview
                </CardTitle>
                {getStatusBadge(claimData.status)}
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <FileText className="w-4 h-4 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Claim ID</p>
                    <p className="font-mono text-sm">{claimData.id}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <Info className="w-4 h-4 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Claim Type</p>
                    {getClaimTypeBadge(claimData.type)}
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <DollarSign className="w-4 h-4 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Claim Amount</p>
                    <p className="font-semibold">
                      {formatEther(claimData.amount || "0")}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-orange-100 rounded-lg">
                    <Calendar className="w-4 h-4 text-orange-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Incident Date</p>
                    <p className="font-semibold">
                      {formatDateOnly(claimData.dateOfIncident)}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Claim Details */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Claim Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm text-gray-600 mb-2">Subject</p>
                <p className="font-semibold text-lg">{claimData.subject}</p>
              </div>
              <Separator />
              <div>
                <p className="text-sm text-gray-600 mb-2">Description</p>
                <p className="text-gray-800 leading-relaxed">
                  {claimData.description}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Policy Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="w-5 h-5" />
                Related Policy Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Policy ID</p>
                  <p className="font-mono text-sm">{claimData.policy.id}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Policy Status</p>
                  <Badge
                    variant="secondary"
                    className="bg-green-100 text-green-800"
                  >
                    {claimData.policy.status}
                  </Badge>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Coverage Amount</p>
                  <p className="font-semibold">
                    {formatEther(claimData.policy.coverageAmount)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Premium Paid</p>
                  <p className="font-semibold">
                    {formatEther(claimData.policy.premium)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Coverage Start</p>
                  <p className="text-sm">
                    {formatDateOnly(claimData.policy.coverageStartDate)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Coverage End</p>
                  <p className="text-sm">
                    {formatDateOnly(claimData.policy.coverageEndDate)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Blockchain Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Wallet className="w-5 h-5" />
                Blockchain Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm text-gray-600 mb-1">Wallet Address</p>
                <div className="flex items-center gap-2">
                  <p className="font-mono text-sm text-primary bg-gray-100 p-2 rounded flex-1">
                    {claimData.walletAddress}
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      window.open(
                        getSepoliaLink(claimData.walletAddress, "address"),
                        "_blank"
                      )
                    }
                  >
                    <ExternalLink className="w-3 h-3" />
                  </Button>
                </div>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">Contract Address</p>
                <div className="flex items-center gap-2">
                  <p className="font-mono text-sm text-primary bg-gray-100 p-2 rounded flex-1">
                    {claimData.contractAddress}
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      window.open(
                        getSepoliaLink(claimData.contractAddress, "address"),
                        "_blank"
                      )
                    }
                  >
                    <ExternalLink className="w-3 h-3" />
                  </Button>
                </div>
              </div>
              {claimData.claimedTransactionHash && (
                <div>
                  <p className="text-sm text-gray-600 mb-1">
                    Claim Transaction Hash
                  </p>
                  <div className="flex items-center gap-2">
                    <p className="font-mono text-sm text-primary bg-gray-100 p-2 rounded break-all flex-1">
                      {claimData.claimedTransactionHash}
                    </p>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        window.open(
                          getSepoliaLink(
                            claimData.claimedTransactionHash!,
                            "tx"
                          ),
                          "_blank"
                        )
                      }
                    >
                      <ExternalLink className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* User Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="w-5 h-5" />
                Claimant Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <p className="text-sm text-gray-600">Full Name</p>
                <p className="font-semibold">
                  {claimData.policy.user.fullName}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Username</p>
                <p className="font-semibold">
                  {claimData.policy.user.username}
                </p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Age</p>
                  <p className="font-semibold">{claimData.policy.user.age}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Gender</p>
                  <p className="font-semibold capitalize">
                    {claimData.policy.user.gender}
                  </p>
                </div>
              </div>
              <div>
                <p className="text-sm text-gray-600">Occupation</p>
                <p className="font-semibold capitalize">
                  {claimData.policy.user.occupation}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Contact Info</p>
                <p className="font-semibold">
                  {claimData.policy.user.contactInfo}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Claim Document */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Claim Document
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Button
                variant="outline"
                className="w-full"
                onClick={() => window.open(claimData.documentUrl, "_blank")}
              >
                <ExternalLink className="w-4 h-4 mr-2" />
                View Document
              </Button>
            </CardContent>
          </Card>

          {/* Policy Document */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="w-5 h-5" />
                Policy Document
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Button
                variant="outline"
                className="w-full"
                onClick={() =>
                  window.open(claimData.policy.documentUrl, "_blank")
                }
              >
                <ExternalLink className="w-4 h-4 mr-2" />
                View Policy Document
              </Button>
            </CardContent>
          </Card>

          {/* Actions */}
          {claimData.status === "PENDING" && (
            <Card>
              <CardHeader>
                <CardTitle>Claim Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Dialog>
                  <DialogTrigger asChild>
                    <Button className="w-full" disabled={actionLoading}>
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Approve Claim
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Approve Claim</DialogTitle>
                      <DialogDescription>
                        Are you sure you want to approve this claim? This action
                        will process the payout to the claimant.
                      </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                      <Button
                        onClick={() => handleStatusUpdate("APPROVED")}
                        disabled={actionLoading}
                      >
                        {actionLoading ? "Approving..." : "Approve Claim"}
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>

                <Dialog>
                  <DialogTrigger asChild>
                    <Button
                      variant="destructive"
                      className="w-full"
                      disabled={actionLoading}
                    >
                      <XCircle className="w-4 h-4 mr-2" />
                      Reject Claim
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Reject Claim</DialogTitle>
                      <DialogDescription>
                        Are you sure you want to reject this claim? This action
                        cannot be undone and the claimant will be notified.
                      </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                      <Button
                        variant="destructive"
                        onClick={() => handleStatusUpdate("REJECTED")}
                        disabled={actionLoading}
                      >
                        {actionLoading ? "Rejecting..." : "Reject Claim"}
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </CardContent>
            </Card>
          )}

          {/* Timestamps */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="w-5 h-5" />
                Timestamps
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <p className="text-sm text-gray-600">Submitted At</p>
                <p className="text-sm">{formatDate(claimData.createdAt)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Updated At</p>
                <p className="text-sm">{formatDate(claimData.updatedAt)}</p>
              </div>
              {claimData.approvedDate && (
                <div>
                  <p className="text-sm text-gray-600">Approved At</p>
                  <p className="text-sm">
                    {formatDate(claimData.approvedDate)}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
