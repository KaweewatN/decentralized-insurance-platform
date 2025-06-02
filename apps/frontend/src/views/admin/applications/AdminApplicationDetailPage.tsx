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
  Heart,
  Plane,
} from "lucide-react";
import apiService from "@/utils/apiService";
import { toastSuccess, toastError } from "@/components/core/common/appToast";

interface HealthInsuranceSpecificDetails {
  id: string;
  policyId: string;
  preExistingConditions: string;
  medicalCoverage: string;
  bmi: string;
  smokingStatus: string;
  exerciseFrequency: string;
  expectedNumber: number;
  createdAt: string;
  updatedAt: string;
}

interface FlightDelaySpecificDetails {
  id: string;
  policyId: string;
  airline: string;
  flightNumber: string;
  depAirport: string;
  arrAirport: string;
  depTime: string;
  flightDate: string;
  depCountry: string;
  arrCountry: string;
  coverageAmount: string;
  numPersons: number;
  createdAt: string;
}

interface PolicyData {
  id: string;
  walletAddress: string;
  premium: string;
  totalPremium: string;
  coverageAmount: string;
  status: string;
  coverageStartDate: string;
  coverageEndDate: string;
  purchaseTransactionHash: string;
  contractCreationHash: string | null;
  contractAddress: string;
  documentUrl: string;
  planTypeId: number;
  createdAt: string;
  updatedAt: string;
  specificDetails?: HealthInsuranceSpecificDetails | FlightDelaySpecificDetails;
  user: {
    walletAddress: string;
    fullName: string;
    username: string;
    age: number;
    gender: string;
    occupation: string;
    contactInfo: string;
  };
}

function AdminApplicationDetailPage(params: { params: string }) {
  const router = useRouter();
  const [policyData, setPolicyData] = useState<PolicyData | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    if (params) {
      fetchPolicyData();
    }
  }, [params]);

  const fetchPolicyData = async () => {
    try {
      setLoading(true);
      const data = await apiService.get<any>(`admin/policy/${params.params}`);
      setPolicyData(data);
    } catch (error) {
      console.error("Error fetching policy data:", error);
      toastError("Failed to fetch policy data");
    } finally {
      setLoading(false);
    }
  };
  const handleStatusUpdate = async (newStatus: "Active" | "Rejected") => {
    try {
      setActionLoading(true);

      // If rejecting, call the reject API endpoint
      if (newStatus === "Rejected" && policyData) {
        try {
          await apiService.put<any>(`admin/policy/rejected/${policyData.id}`);
          toastSuccess("Policy rejected successfully");
          await fetchPolicyData(); // Refresh data
          return;
        } catch (rejectError) {
          console.error("Error rejecting policy:", rejectError);
          toastError("Failed to reject policy");
          return;
        }
      }

      // If approving, call specific insurance APIs based on plan type
      if (newStatus === "Active" && policyData) {
        try {
          // Get ETH to THB exchange rate
          const ethToThbResponse = await apiService.get<{ rate: number }>(
            "/price/eththb"
          );
          const ethToThbRate = ethToThbResponse.rate;

          // Convert coverage amount from ETH to THB
          const coverageAmountEth = parseFloat(policyData.coverageAmount);
          const sumAssuredThb = coverageAmountEth * ethToThbRate;

          // Call specific insurance API based on plan type
          switch (policyData.planTypeId) {
            case 1: // Health Insurance
              // Create an AbortController for timeout
              const controller = new AbortController();
              const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout

              try {
                const response = await fetch(
                  `${process.env.NEXT_PUBLIC_BACKEND_URL}/health/purchase`,
                  {
                    method: "POST",
                    headers: {
                      "Content-Type": "application/json",
                      // Add any auth headers if needed
                      // 'Authorization': `Bearer ${token}`,
                    },
                    body: JSON.stringify({
                      userId: policyData.walletAddress,
                      sumAssured: 50001, // ****for testing purposes****
                      policyId: policyData.id,
                    }),
                    signal: controller.signal,
                  }
                );

                clearTimeout(timeoutId);

                if (!response.ok) {
                  throw new Error(`HTTP error! status: ${response.status}`);
                }

                const data = await response.json();
                console.log(
                  "Health insurance purchase API called successfully",
                  data
                );
              } catch (error) {
                clearTimeout(timeoutId);
                if (error instanceof Error && error.name === "AbortError") {
                  throw new Error("Request timed out after 30 seconds");
                }
                throw error;
              }
              break;

            case 2: // Flight Delay
              null;
              break;

            case 3: // Rainfall
              null;
              break;

            case 4: // Life Insurance
              await apiService.post("/life/purchase", {
                userId: policyData.walletAddress,
                sumAssured: sumAssuredThb,
              });
              console.log("Life insurance purchase API called successfully");
              break;

            default:
              console.log(
                `No specific API call needed for plan type ${policyData.planTypeId}`
              );
              break;
          }
          toastSuccess(
            `Successfully processed` +
              ` ${getPlanTypeName(policyData.planTypeId).toLowerCase()} insurance purchase`
          );
          window.location.reload();
        } catch (insuranceApiError) {
          console.error(
            `Error calling insurance purchase API for plan ${policyData.planTypeId}:`,
            insuranceApiError
          );
          return;
        }
      }

      toastSuccess(`Policy ${newStatus.toLowerCase()} successfully`);
      await fetchPolicyData(); // Refresh data
    } catch (error) {
      console.error("Error updating policy status:", error);
      toastError(`Failed to ${newStatus.toLowerCase()} policy`);
    } finally {
      setActionLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "PendingPayment":
        return (
          <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
            <Clock className="w-3 h-3 mr-1" />
            Pending Payment
          </Badge>
        );
      case "Active":
        return (
          <Badge variant="secondary" className="bg-green-100 text-green-800">
            <CheckCircle className="w-3 h-3 mr-1" />
            Active
          </Badge>
        );
      case "Rejected":
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

  const getPlanTypeName = (planTypeId: number) => {
    switch (planTypeId) {
      case 1:
        return "Health Insurance";
      case 2:
        return "Flight Delay";
      case 3:
        return "Rainfall";
      case 4:
        return "Life";
      default:
        return `Plan ${planTypeId}`;
    }
  };

  const getSepoliaLink = (hash: string, type: "tx" | "address") => {
    const baseUrl = "https://sepolia.etherscan.io";
    return type === "tx"
      ? `${baseUrl}/tx/${hash}`
      : `${baseUrl}/address/${hash}`;
  };

  const renderHealthInsuranceDetails = (
    details: HealthInsuranceSpecificDetails
  ) => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Heart className="w-5 h-5 text-red-500" />
          Health Insurance Details
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-600">Pre-existing Conditions</p>
            <p className="font-semibold">
              {details.preExistingConditions || "None"}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Medical Coverage</p>
            <p className="font-semibold">
              {formatEther(details.medicalCoverage)}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-600">BMI</p>
            <p className="font-semibold">{details.bmi}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Smoking Status</p>
            <p className="font-semibold capitalize">
              {details.smokingStatus.toLowerCase()}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Exercise Frequency</p>
            <p className="font-semibold capitalize">
              {details.exerciseFrequency.toLowerCase()}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Expected Number</p>
            <p className="font-semibold">{details.expectedNumber}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const renderFlightDelayDetails = (details: FlightDelaySpecificDetails) => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Plane className="w-5 h-5 text-blue-500" />
          Flight Delay Details
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-600">Airline</p>
            <p className="font-semibold">{details.airline}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Flight Number</p>
            <p className="font-semibold">{details.flightNumber}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Departure Airport</p>
            <p className="font-semibold">
              {details.depAirport} ({details.depCountry})
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Arrival Airport</p>
            <p className="font-semibold">
              {details.arrAirport} ({details.arrCountry})
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Departure Time</p>
            <p className="font-semibold">{details.depTime}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Flight Date</p>
            <p className="font-semibold">
              {formatDateOnly(details.flightDate)}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Coverage Amount</p>
            <p className="font-semibold">
              {formatEther(details.coverageAmount)}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Number of Persons</p>
            <p className="font-semibold">{details.numPersons}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const renderSpecificDetails = () => {
    if (!policyData?.specificDetails) return null;

    if (policyData.planTypeId === 1) {
      return renderHealthInsuranceDetails(
        policyData.specificDetails as HealthInsuranceSpecificDetails
      );
    } else if (policyData.planTypeId === 2) {
      return renderFlightDelayDetails(
        policyData.specificDetails as FlightDelaySpecificDetails
      );
    }

    return null;
  };

  if (loading) {
    return (
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-2 border-gray-300 border-t-gray-900"></div>
      </div>
    );
  }

  if (!policyData) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Alert className="max-w-md">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>Policy not found</AlertDescription>
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
          onClick={() => router.push("/admin/applications")}
          className="flex items-center gap-2 text-blue-800"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Applications
        </Button>
        <h1 className="text-3xl font-bold">Policy Application Details</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-10">
        {/* Main Policy Information */}
        <div className="lg:col-span-2 space-y-6">
          {/* Policy Overview */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Shield className="w-5 h-5" />
                  Policy Overview
                </CardTitle>
                {getStatusBadge(policyData.status)}
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <FileText className="w-4 h-4 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Policy ID</p>
                    <p className="font-mono text-sm">{policyData.id}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <DollarSign className="w-4 h-4 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Coverage Amount</p>
                    <p className="font-semibold">
                      {formatEther(policyData.coverageAmount)}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <DollarSign className="w-4 h-4 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Premium</p>
                    <p className="font-semibold">
                      {formatEther(policyData.premium)}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-orange-100 rounded-lg">
                    <Calendar className="w-4 h-4 text-orange-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Plan Type</p>
                    <p className="font-semibold">
                      {getPlanTypeName(policyData.planTypeId)}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Specific Details based on plan type */}
          {renderSpecificDetails()}

          {/* Coverage Period */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                Coverage Period
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Start Date</p>
                  <p className="font-semibold">
                    {formatDate(policyData.coverageStartDate)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">End Date</p>
                  <p className="font-semibold">
                    {formatDate(policyData.coverageEndDate)}
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
                    {policyData.walletAddress}
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      window.open(
                        getSepoliaLink(policyData.walletAddress, "address"),
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
                    {policyData.contractAddress}
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      window.open(
                        getSepoliaLink(policyData.contractAddress, "address"),
                        "_blank"
                      )
                    }
                  >
                    <ExternalLink className="w-3 h-3" />
                  </Button>
                </div>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">
                  Purchase Transaction Hash
                </p>
                <div className="flex items-center gap-2">
                  <p className="font-mono text-sm text-primary bg-gray-100 p-2 rounded break-all flex-1">
                    {policyData.purchaseTransactionHash}
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      window.open(
                        getSepoliaLink(
                          policyData.purchaseTransactionHash,
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
              {policyData.contractCreationHash && (
                <div>
                  <p className="text-sm text-gray-600 mb-1">
                    Contract Creation Hash
                  </p>
                  <div className="flex items-center gap-2">
                    <p className="font-mono text-sm text-blue-800 bg-gray-100 p-2 rounded break-all flex-1">
                      {policyData.contractCreationHash}
                    </p>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        policyData.contractCreationHash &&
                        window.open(
                          getSepoliaLink(policyData.contractCreationHash, "tx"),
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
                Applicant Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <p className="text-sm text-gray-600">Full Name</p>
                <p className="font-semibold">{policyData.user.fullName}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Username</p>
                <p className="font-semibold">{policyData.user.username}</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Age</p>
                  <p className="font-semibold">{policyData.user.age}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Gender</p>
                  <p className="font-semibold capitalize">
                    {policyData.user.gender}
                  </p>
                </div>
              </div>
              <div>
                <p className="text-sm text-gray-600">Occupation</p>
                <p className="font-semibold capitalize">
                  {policyData.user.occupation}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Contact Info</p>
                <p className="font-semibold">{policyData.user.contactInfo}</p>
              </div>
            </CardContent>
          </Card>

          {/* Document */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Policy Document
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Button
                variant="outline"
                className="w-full"
                onClick={() => window.open(policyData.documentUrl, "_blank")}
              >
                <ExternalLink className="w-4 h-4 mr-2" />
                View Document
              </Button>
            </CardContent>
          </Card>

          {/* Actions */}
          {policyData.status === "PendingPayment" && (
            <Card>
              <CardHeader>
                <CardTitle>Policy Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Dialog>
                  <DialogTrigger asChild>
                    <Button className="w-full" disabled={actionLoading}>
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Approve Policy
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Approve Policy</DialogTitle>
                      <DialogDescription>
                        Are you sure you want to approve this policy? This
                        action will activate the policy and make it effective.
                      </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                      <Button
                        onClick={() => handleStatusUpdate("Active")}
                        disabled={actionLoading}
                      >
                        {actionLoading ? "Approving..." : "Approve Policy"}
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
                      Reject Policy
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Reject Policy</DialogTitle>
                      <DialogDescription>
                        Are you sure you want to reject this policy? This action
                        cannot be undone.
                      </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                      <Button
                        variant="destructive"
                        onClick={() => handleStatusUpdate("Rejected")}
                        disabled={actionLoading}
                      >
                        {actionLoading ? "Rejecting..." : "Reject Policy"}
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
                <p className="text-sm text-gray-600">Created At</p>
                <p className="text-sm">{formatDate(policyData.createdAt)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Updated At</p>
                <p className="text-sm">{formatDate(policyData.updatedAt)}</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

export default AdminApplicationDetailPage;
