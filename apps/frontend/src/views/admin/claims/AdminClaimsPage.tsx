"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Search,
  Filter,
  X,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Clock,
  HeartPulse,
  Plane,
  CloudRain,
  FileText,
  Calendar,
  DollarSign,
} from "lucide-react";

interface ClaimType {
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
    planTypeId: number;
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

export default function AdminClaimsPage() {
  const [activeTab, setActiveTab] = useState("pending");
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [allClaims, setAllClaims] = useState<ClaimType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchClaims = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch("http://localhost:3001/api/admin/claims");
        if (!response.ok) throw new Error("Failed to fetch claims");
        const data = await response.json();
        setAllClaims(data.data.claims || []);
      } catch (error) {
        setError("Error loading claims");
        setAllClaims([]);
      } finally {
        setLoading(false);
      }
    };
    fetchClaims();
  }, []);

  // Separate claims by status
  const pendingClaims = allClaims.filter((c) => c.status === "PENDING");
  const approvedClaims = allClaims.filter((c) => c.status === "APPROVED");
  const rejectedClaims = allClaims.filter((c) => c.status === "REJECTED");

  // Get claims for current tab
  const getCurrentTabClaims = () => {
    switch (activeTab) {
      case "pending":
        return pendingClaims;
      case "approved":
        return approvedClaims;
      case "rejected":
        return rejectedClaims;
      default:
        return [];
    }
  };

  // Filter claims based on search query and filters
  const filteredClaims = getCurrentTabClaims().filter((claim) => {
    // Filter by search query
    if (
      searchQuery &&
      !claim.walletAddress.toLowerCase().includes(searchQuery.toLowerCase()) &&
      !claim.policy?.user?.fullName
        ?.toLowerCase()
        .includes(searchQuery.toLowerCase()) &&
      !claim.subject.toLowerCase().includes(searchQuery.toLowerCase())
    ) {
      return false;
    }
    // Filter by claim type
    if (typeFilter !== "all") {
      if (typeFilter === "health" && claim.type !== "HEALTH") return false;
      if (typeFilter === "flight" && claim.type !== "FLIGHT") return false;
      if (typeFilter === "rainfall" && claim.type !== "RAINFALL") return false;
    }
    return true;
  });

  // Status badge with icon and color
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "PENDING":
        return (
          <Badge className="bg-yellow-500 text-white flex items-center gap-1">
            <Clock size={16} className="mr-1" /> Pending
          </Badge>
        );
      case "APPROVED":
        return (
          <Badge className="bg-green-500 text-white flex items-center gap-1">
            <CheckCircle size={16} className="mr-1" /> Approved
          </Badge>
        );
      case "REJECTED":
        return (
          <Badge className="bg-red-500 text-white flex items-center gap-1">
            <XCircle size={16} className="mr-1" /> Rejected
          </Badge>
        );
      default:
        return (
          <Badge variant="outline" className="flex items-center gap-1">
            <AlertTriangle size={16} className="mr-1" /> {status}
          </Badge>
        );
    }
  };

  // Get claim type badge
  const getClaimTypeBadge = (type: string) => {
    switch (type) {
      case "HEALTH":
        return (
          <Badge className="bg-pink-100 text-pink-700 font-medium inline-flex items-center gap-1">
            <HeartPulse size={16} className="text-pink-500" />
            Health
          </Badge>
        );
      case "FLIGHT":
        return (
          <Badge className="bg-blue-100 text-blue-700 font-medium inline-flex items-center gap-1">
            <Plane size={16} className="text-blue-500" />
            Flight
          </Badge>
        );
      case "RAINFALL":
        return (
          <Badge className="bg-green-100 text-green-700 font-medium inline-flex items-center gap-1">
            <CloudRain size={16} className="text-green-500" />
            Rainfall
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

  const renderTabContent = (
    tabName: string,
    claims: ClaimType[],
    emptyIcon: any,
    emptyTitle: string,
    emptyDescription: string
  ) => (
    <TabsContent value={tabName} className="mt-0">
      <Card>
        <CardHeader>
          <CardTitle>{emptyTitle}</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">
              <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]"></div>
              <p className="mt-4">Loading claims...</p>
            </div>
          ) : error ? (
            <div className="text-center py-12 bg-red-50 rounded-lg border border-red-200">
              <XCircle className="h-12 w-12 text-red-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-1 text-red-800">Error</h3>
              <p className="text-red-600 mb-6">{error}</p>
              <Button
                onClick={() => window.location.reload()}
                variant="outline"
                className="border-red-300 text-red-700 hover:bg-red-50"
              >
                Try Again
              </Button>
            </div>
          ) : filteredClaims.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredClaims.map((claim) => (
                <Card
                  key={claim.id}
                  onClick={() => {
                    window.location.href = `/admin/claims/${claim.id}`;
                  }}
                  className="hover:shadow-md transition-shadow cursor-pointer"
                >
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-semibold text-lg">
                          {claim.policy?.user?.fullName || "Unknown"}
                        </div>
                        <div className="text-xs text-gray-500 break-all">
                          {claim.walletAddress.substring(0, 6)}...
                          {claim.walletAddress.substring(
                            claim.walletAddress.length - 4
                          )}
                        </div>
                      </div>
                      {getStatusBadge(claim.status)}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-col gap-2">
                      <div>
                        <span className="font-semibold">Subject: </span>
                        <span className="text-sm">{claim.subject}</span>
                      </div>
                      <div>
                        <span className="font-semibold">Claim Type: </span>
                        {getClaimTypeBadge(claim.type)}
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar size={16} className="text-gray-400" />
                        <span className="font-semibold text-sm">
                          Incident Date:{" "}
                        </span>
                        <span className="text-sm">
                          {new Date(claim.dateOfIncident).toLocaleDateString()}
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        <DollarSign size={16} className="text-gray-400" />
                        <span className="font-semibold text-sm">Amount: </span>
                        <span className="text-sm">
                          {claim.amount || "0"} ETH
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        <FileText size={16} className="text-gray-400" />
                        <span className="font-semibold text-sm">
                          Coverage:{" "}
                        </span>
                        <span className="text-sm">
                          {claim.policy?.coverageAmount || "N/A"} ETH
                        </span>
                      </div>
                      {claim.documentUrl && (
                        <div className="mt-2">
                          <Button
                            variant="outline"
                            size="sm"
                            className="w-full"
                            onClick={(e) => {
                              e.stopPropagation();
                              window.open(claim.documentUrl, "_blank");
                            }}
                          >
                            <FileText size={16} className="mr-2" />
                            View Document
                          </Button>
                        </div>
                      )}
                      <div className="text-xs text-gray-500 mt-2">
                        Submitted:{" "}
                        {new Date(claim.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-gray-50 rounded-lg border">
              {emptyIcon}
              <h3 className="text-lg font-medium mb-1">{emptyTitle}</h3>
              <p className="text-gray-500 mb-6">
                {searchQuery || typeFilter !== "all"
                  ? "No claims match your current filters. Try adjusting your search criteria."
                  : emptyDescription}
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </TabsContent>
  );

  return (
    <div className="space-y-6 px-12 md:px-24">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Claims Management</h1>
          <p className="text-gray-500">Review and process insurance claims</p>
        </div>
      </div>

      <div className="mb-6">
        <Tabs
          defaultValue="pending"
          value={activeTab}
          onValueChange={setActiveTab}
          className="w-full"
        >
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
            <TabsList className="grid w-full sm:w-auto grid-cols-3">
              <TabsTrigger value="pending">
                Pending
                {pendingClaims.length > 0 && (
                  <span className="ml-2 bg-yellow-100 text-yellow-800 text-xs font-medium px-2 py-0.5 rounded-full">
                    {pendingClaims.length}
                  </span>
                )}
              </TabsTrigger>
              <TabsTrigger value="approved">
                Approved
                {approvedClaims.length > 0 && (
                  <span className="ml-2 bg-green-100 text-green-800 text-xs font-medium px-2 py-0.5 rounded-full">
                    {approvedClaims.length}
                  </span>
                )}
              </TabsTrigger>
              <TabsTrigger value="rejected">
                Rejected
                {rejectedClaims.length > 0 && (
                  <span className="ml-2 bg-red-100 text-red-800 text-xs font-medium px-2 py-0.5 rounded-full">
                    {rejectedClaims.length}
                  </span>
                )}
              </TabsTrigger>
            </TabsList>

            <div className="flex flex-col sm:flex-row gap-2">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-400" />
                <Input
                  type="search"
                  placeholder="Search by wallet, name, or subject..."
                  className="pl-8 w-full sm:w-[250px]"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <Button
                variant="outline"
                size="sm"
                className="flex items-center gap-1"
                onClick={() => {
                  setSearchQuery("");
                  setTypeFilter("all");
                }}
              >
                <X className="h-4 w-4" />
                Clear Filters
              </Button>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-gray-400" />
              <span className="text-sm text-gray-500">Filter by:</span>
            </div>
            <div className="grid grid-cols-2 sm:flex gap-2">
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="w-full sm:w-[180px]">
                  <SelectValue placeholder="Claim Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="health">Health Claims</SelectItem>
                  <SelectItem value="flight">Flight Claims</SelectItem>
                  <SelectItem value="rainfall">Rainfall Claims</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {renderTabContent(
            "pending",
            pendingClaims,
            <Clock className="h-12 w-12 text-yellow-300 mx-auto mb-4" />,
            "Pending Claims",
            "There are no pending claims to review."
          )}

          {renderTabContent(
            "approved",
            approvedClaims,
            <CheckCircle className="h-12 w-12 text-green-300 mx-auto mb-4" />,
            "Approved Claims",
            "There are no approved claims."
          )}

          {renderTabContent(
            "rejected",
            rejectedClaims,
            <XCircle className="h-12 w-12 text-red-300 mx-auto mb-4" />,
            "Rejected Claims",
            "There are no rejected claims."
          )}
        </Tabs>
      </div>
    </div>
  );
}
