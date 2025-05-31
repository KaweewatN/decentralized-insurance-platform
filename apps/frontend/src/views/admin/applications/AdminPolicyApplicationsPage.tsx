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
  Info,
  HeartPulse,
  Plane,
  CloudRain,
} from "lucide-react";
import { PolicyType } from "../types/admin.types";

export default function AdminPolicyApplicationsPage() {
  const [activeTab, setActiveTab] = useState("payment");
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [allPolicies, setAllPolicies] = useState<PolicyType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPolicies = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/admin/all-policies`
        );
        if (!response.ok) throw new Error("Failed to fetch policies");
        const data = await response.json();
        setAllPolicies(data.policies || []);
      } catch (error) {
        setError("Error loading policies");
        setAllPolicies([]);
      } finally {
        setLoading(false);
      }
    };
    fetchPolicies();
  }, []);

  // Map statuses for display and filtering
  const statusMap = {
    Payment: "PendingPayment",
    "Info Requested": "info_requested",
    Approved: "Active",
    Rejected: "Expired",
  };

  // Separate policies by status
  const paymentPolicies = allPolicies.filter(
    (p) => p.status === "PendingPayment"
  );
  const infoRequestedPolicies = allPolicies.filter(
    (p) => p.status === "info_requested"
  );
  const approvedPolicies = allPolicies.filter((p) => p.status === "Active");
  const rejectedPolicies = allPolicies.filter((p) => p.status === "Expired");

  // Get policies for current tab
  const getCurrentTabPolicies = () => {
    switch (activeTab) {
      case "payment":
        return paymentPolicies;
      case "info_requested":
        return infoRequestedPolicies;
      case "approved":
        return approvedPolicies;
      case "rejected":
        return rejectedPolicies;
      default:
        return [];
    }
  };

  // Filter policies based on search query and filters
  const filteredPolicies = getCurrentTabPolicies().filter((policy) => {
    // Filter by search query
    if (
      searchQuery &&
      !policy.walletAddress.toLowerCase().includes(searchQuery.toLowerCase()) &&
      !policy.user?.fullName?.toLowerCase().includes(searchQuery.toLowerCase())
    ) {
      return false;
    }
    // Filter by application type (planTypeId)
    if (typeFilter !== "all") {
      if (typeFilter === "flight" && policy.planTypeId !== 2) return false;
      if (typeFilter === "health" && policy.planTypeId !== 1) return false;
      if (typeFilter === "rainfall" && policy.planTypeId !== 3) return false;
    }
    return true;
  });

  // Status badge with icon and color
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "PendingPayment":
        return (
          <Badge className="bg-blue-500 text-white flex items-center gap-1">
            <Clock size={16} className="mr-1" /> Payment
          </Badge>
        );
      case "Active":
        return (
          <Badge className="bg-green-500 text-white flex items-center gap-1">
            <CheckCircle size={16} className="mr-1" /> Approved
          </Badge>
        );
      case "Expired":
        return (
          <Badge className="bg-red-500 text-white flex items-center gap-1">
            <XCircle size={16} className="mr-1" /> Rejected
          </Badge>
        );
      case "info_requested":
        return (
          <Badge className="bg-yellow-500 text-white flex items-center gap-1">
            <Info size={16} className="mr-1" /> Info Requested
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

  const renderTabContent = (
    tabName: string,
    policies: PolicyType[],
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
              <p className="mt-4">Loading policies...</p>
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
          ) : filteredPolicies.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredPolicies.map((policy) => (
                <Card
                  key={policy.id}
                  onClick={() => {
                    window.location.href = `/admin/applications/${policy.id}`;
                  }}
                  className="hover:shadow-md transition-shadow cursor-pointer"
                >
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-semibold text-lg">
                          {policy.user?.fullName || "Unknown"}
                        </div>
                        <div className="text-xs text-gray-500 break-all">
                          {policy.walletAddress.substring(0, 6)}...
                          {policy.walletAddress.substring(
                            policy.walletAddress.length - 4
                          )}
                        </div>
                      </div>
                      {getStatusBadge(policy.status)}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-col gap-2">
                      <div>
                        <span className="font-semibold">Plan Type: </span>
                        {policy.planTypeId === 1 ? (
                          <Badge className="bg-pink-100 text-pink-700 font-medium inline-flex items-center gap-1 hover:text-white">
                            <HeartPulse size={16} className="text-pink-500" />
                            Health Insurance
                          </Badge>
                        ) : policy.planTypeId === 2 ? (
                          <Badge className="bg-blue-100 text-blue-700 font-medium inline-flex items-center gap-1 hover:text-white">
                            <Plane size={16} className="text-blue-500" />
                            Flight Insurance
                          </Badge>
                        ) : policy.planTypeId === 3 ? (
                          <Badge className="bg-green-100 text-green-700 font-medium inline-flex items-center gap-1 hover:text-white">
                            <CloudRain size={16} className="text-green-500" />
                            Rainfall Insurance
                          </Badge>
                        ) : (
                          <Badge className="bg-gray-100 text-gray-500 font-medium inline-flex items-center gap-1">
                            Unknown
                          </Badge>
                        )}
                      </div>
                      <div>
                        <span className="font-semibold">Sum Assured: </span>
                        {policy.sumAssured}
                      </div>
                      <div>
                        <span className="font-semibold">Premium: </span>
                        {policy.premium}
                      </div>
                      <div>
                        <span className="font-semibold">Coverage: </span>
                        {policy.coverageStartDate?.slice(0, 10)} -{" "}
                        {policy.coverageEndDate?.slice(0, 10)}
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
                  ? "No policies match your current filters. Try adjusting your search criteria."
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
          <h1 className="text-3xl font-bold">Policy Applications</h1>
          <p className="text-gray-500">Review and process insurance policies</p>
        </div>
      </div>

      <div className="mb-6">
        <Tabs
          defaultValue="payment"
          value={activeTab}
          onValueChange={setActiveTab}
          className="w-full"
        >
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
            <TabsList className="grid w-full sm:w-auto grid-cols-4">
              <TabsTrigger value="payment">
                Payment
                {paymentPolicies.length > 0 && (
                  <span className="ml-2 bg-blue-100 text-blue-800 text-xs font-medium px-2 py-0.5 rounded-full">
                    {paymentPolicies.length}
                  </span>
                )}
              </TabsTrigger>
              <TabsTrigger value="info_requested">
                Info Requested
                {infoRequestedPolicies.length > 0 && (
                  <span className="ml-2 bg-yellow-100 text-yellow-800 text-xs font-medium px-2 py-0.5 rounded-full">
                    {infoRequestedPolicies.length}
                  </span>
                )}
              </TabsTrigger>
              <TabsTrigger value="approved">
                Approved
                {approvedPolicies.length > 0 && (
                  <span className="ml-2 bg-green-100 text-green-800 text-xs font-medium px-2 py-0.5 rounded-full">
                    {approvedPolicies.length}
                  </span>
                )}
              </TabsTrigger>
              <TabsTrigger value="rejected">
                Rejected
                {rejectedPolicies.length > 0 && (
                  <span className="ml-2 bg-red-100 text-red-800 text-xs font-medium px-2 py-0.5 rounded-full">
                    {rejectedPolicies.length}
                  </span>
                )}
              </TabsTrigger>
            </TabsList>

            <div className="flex flex-col sm:flex-row gap-2">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-400" />
                <Input
                  type="search"
                  placeholder="Search by wallet or name..."
                  className="pl-8 w-full sm:w-[200px]"
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
                  <SelectValue placeholder="Insurance Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="health">Health Insurance</SelectItem>
                  <SelectItem value="flight">Flight Insurance</SelectItem>
                  <SelectItem value="rainfall">Rainfall Insurance</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {renderTabContent(
            "payment",
            paymentPolicies,
            <Clock className="h-12 w-12 text-blue-300 mx-auto mb-4" />,
            "Payment Policies",
            "There are no payment policies to review."
          )}

          {renderTabContent(
            "info_requested",
            infoRequestedPolicies,
            <Info className="h-12 w-12 text-yellow-300 mx-auto mb-4" />,
            "Policies Awaiting Additional Information",
            "There are no policies awaiting additional information."
          )}

          {renderTabContent(
            "approved",
            approvedPolicies,
            <CheckCircle className="h-12 w-12 text-green-300 mx-auto mb-4" />,
            "Approved Policies",
            "There are no approved policies."
          )}

          {renderTabContent(
            "rejected",
            rejectedPolicies,
            <XCircle className="h-12 w-12 text-red-300 mx-auto mb-4" />,
            "Rejected Policies",
            "There are no rejected policies."
          )}
        </Tabs>
      </div>
    </div>
  );
}
