"use client";

import type React from "react";

import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";

import Link from "next/link";
import {
  BarChart3,
  FileCheck,
  FileText,
  Shield,
  ArrowRight,
  TrendingUp,
  Umbrella,
  Plane,
  Search,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import apiService from "@/utils/apiService";

export default function AdminDashboardPage() {
  const [adminSummary, setAdminSummary] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    const fetchData = async () => {
      try {
        const data = await apiService.get<any>(
          "http://localhost:3001/api/admin/all-policy-summary"
        );
        setAdminSummary(data.summary);
        console.log("Admin Dashboard Data:", adminSummary);
      } catch (error) {
        console.error("Error fetching admin dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real app, this would search across policies, claims, applications
    console.log("Searching for:", searchQuery);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center">
        <div className="text-center">
          <Shield className="h-12 w-12 text-[#4CAF50] mx-auto animate-pulse" />
          <h2 className="mt-4 text-xl font-semibold text-gray-700">
            Loading admin dashboard...
          </h2>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <main className="container px-4 mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-[#1E293B]">
              Admin Dashboard
            </h1>
            <p className="text-gray-600 mt-1">
              Manage insurance policies, claims, and documents
            </p>
          </div>
          <div className="mt-4 md:mt-0 flex items-center gap-4">
            <form onSubmit={handleSearch} className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-400" />
              <Input
                type="search"
                placeholder="Search policies, claims, users..."
                className="pl-8 w-full md:w-[300px]"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </form>
            <p className="text-sm text-gray-500 hidden md:block">
              Last updated:{" "}
              <span className="font-medium">{new Date().toLocaleString()}</span>
            </p>
          </div>
        </div>

        {/* adminSummary Cards */}
        {adminSummary && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card className="border-[#E2E8F0]">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center">
                  <FileCheck className="h-5 w-5 mr-2 text-[#4CAF50]" />
                  Policy Applications
                </CardTitle>
                <CardDescription>Pending applications</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">
                  {adminSummary.policyStatusCounts?.find(
                    (item: any) => item.status === "PendingPayment"
                  )?.count ?? 0}
                </div>
                <div className="mt-2 flex justify-between items-center">
                  <span className="text-sm text-gray-500">Requires review</span>
                  <Link href="/admin/applications">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-[#4CAF50]"
                    >
                      Review <ArrowRight className="ml-1 h-4 w-4" />
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>

            <Card className="border-[#E2E8F0]">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center">
                  <FileText className="h-5 w-5 mr-2 text-[#0D47A1]" />
                  Claim Processing
                </CardTitle>
                <CardDescription>Pending claim reviews</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">
                  {adminSummary.claimStatusCounts?.find(
                    (item: any) => item.status === "PendingPayment"
                  )?.count ?? 0}
                </div>
                <div className="mt-2 flex justify-between items-center">
                  <span className="text-sm text-gray-500">
                    Awaiting decision
                  </span>
                  <Link href="/admin/claims">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-[#0D47A1]"
                    >
                      Process <ArrowRight className="ml-1 h-4 w-4" />
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>

            <Card className="border-[#E2E8F0]">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center">
                  <Shield className="h-5 w-5 mr-2 text-[#6200EA]" />
                  Active Policies
                </CardTitle>
                <CardDescription>
                  Total active insurance policies
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">
                  {adminSummary.activePolicyCount}
                </div>
                <div className="mt-2 flex justify-between items-center">
                  <span className="text-sm text-gray-500">
                    {adminSummary.activePolicyCount}/
                    {adminSummary.totalPolicies} policies active
                  </span>
                  <div className="flex items-center text-[#6200EA] text-sm font-medium">
                    <TrendingUp className="h-4 w-4 mr-1" />
                    {Math.round(
                      (adminSummary.activePolicyCount /
                        adminSummary.totalPolicies) *
                        100
                    )}
                    %
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-[#E2E8F0]">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center">
                  <Umbrella className="h-5 w-5 mr-2 text-[#F57C00]" />
                  Parametric Events
                </CardTitle>
                <CardDescription>Recent oracle activity</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">
                  {adminSummary.parametricPolicyCount || 0}
                </div>
                <div className="mt-2 flex justify-between items-center">
                  <span className="text-sm text-gray-500">Last 24 hours</span>
                  <Link href="/admin/parametric/monitoring">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-[#F57C00]"
                    >
                      View <ArrowRight className="ml-1 h-4 w-4" />
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Recent Activity Tabs */}
        {/* <Tabs defaultValue="applications" className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-[#1E293B]">
              Recent Activity
            </h2>
            <TabsList>
              <TabsTrigger value="applications">Applications</TabsTrigger>
              <TabsTrigger value="claims">Claims</TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="applications" className="space-y-4">
            {pendingApplications && pendingApplications.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {pendingApplications.map((application) => (
                  <ApplicationReviewCard
                    key={application.id}
                    application={application}
                  />
                ))}
              </div>
            ) : (
              <Card className="border-[#E2E8F0] bg-gray-50">
                <CardContent className="pt-6 text-center">
                  <CheckCircle2 className="h-12 w-12 mx-auto text-gray-400 mb-2" />
                  <p className="text-gray-500">
                    No pending applications to review
                  </p>
                </CardContent>
              </Card>
            )}

            {pendingApplications && pendingApplications.length > 0 && (
              <div className="text-center mt-4">
                <Link href="/admin/applications">
                  <Button variant="outline">View All Applications</Button>
                </Link>
              </div>
            )}
          </TabsContent>

          <TabsContent value="claims" className="space-y-4">
            {pendingClaims && pendingClaims.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {pendingClaims.map((claim) => (
                  <ClaimReviewCard
                    key={claim.id}
                    id={claim.id}
                    title={`${claim.type} Insurance Claim`}
                    description={claim.description || "No description provided"}
                    claimantAddress={claim.userId || "Unknown"}
                    submittedDate={new Date(
                      claim.submittedAt
                    ).toLocaleDateString()}
                    claimType={claim.type}
                    requestedAmount={`$${claim.amount?.toFixed(2) || "0.00"}`}
                    status={claim.status}
                    policyId={claim.policyId}
                    documentCount={claim.documents?.length || 0}
                  />
                ))}
              </div>
            ) : (
              <Card className="border-[#E2E8F0] bg-gray-50">
                <CardContent className="pt-6 text-center">
                  <CheckCircle2 className="h-12 w-12 mx-auto text-gray-400 mb-2" />
                  <p className="text-gray-500">No pending claims to process</p>
                </CardContent>
              </Card>
            )}

            {pendingClaims && pendingClaims.length > 0 && (
              <div className="text-center mt-4">
                <Link href="/admin/claims">
                  <Button variant="outline">View All Claims</Button>
                </Link>
              </div>
            )}
          </TabsContent>
        </Tabs> */}

        {/* Quick Actions */}
        <div className="mb-8">
          <h2 className="text-xl font-bold text-[#1E293B] mb-4">
            Quick Actions
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Link href="/admin/applications">
              <Card className="border-[#E2E8F0] hover:border-[#4CAF50] hover:shadow-md transition-all cursor-pointer">
                <CardContent className="pt-6">
                  <div className="flex flex-col items-center text-center">
                    <FileCheck className="h-8 w-8 text-[#4CAF50] mb-2" />
                    <h3 className="font-medium">Review Applications</h3>
                    <p className="text-sm text-gray-500 mt-1">
                      Process new insurance applications
                    </p>
                  </div>
                </CardContent>
              </Card>
            </Link>

            <Link href="/admin/claims">
              <Card className="border-[#E2E8F0] hover:border-[#0D47A1] hover:shadow-md transition-all cursor-pointer">
                <CardContent className="pt-6">
                  <div className="flex flex-col items-center text-center">
                    <FileText className="h-8 w-8 text-[#0D47A1] mb-2" />
                    <h3 className="font-medium">Process Claims</h3>
                    <p className="text-sm text-gray-500 mt-1">
                      Review and process insurance claims
                    </p>
                  </div>
                </CardContent>
              </Card>
            </Link>

            <Link href="/admin/parametric/config">
              <Card className="border-[#E2E8F0] hover:border-[#F57C00] hover:shadow-md transition-all cursor-pointer">
                <CardContent className="pt-6">
                  <div className="flex flex-col items-center text-center">
                    <Plane className="h-8 w-8 text-[#F57C00] mb-2" />
                    <h3 className="font-medium">Parametric Config</h3>
                    <p className="text-sm text-gray-500 mt-1">
                      Configure parametric insurance products
                    </p>
                  </div>
                </CardContent>
              </Card>
            </Link>

            <Link href="/admin/analytics">
              <Card className="border-[#E2E8F0] hover:border-[#6200EA] hover:shadow-md transition-all cursor-pointer">
                <CardContent className="pt-6">
                  <div className="flex flex-col items-center text-center">
                    <BarChart3 className="h-8 w-8 text-[#6200EA] mb-2" />
                    <h3 className="font-medium">View Analytics</h3>
                    <p className="text-sm text-gray-500 mt-1">
                      See platform statistics and trends
                    </p>
                  </div>
                </CardContent>
              </Card>
            </Link>
          </div>
        </div>

        {/* System Status */}
        {/* <Card className="border-[#E2E8F0] mb-8">
          <CardHeader>
            <CardTitle className="text-lg">System Status</CardTitle>
            <CardDescription>
              Current status of the ChainSure platform
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="h-3 w-3 rounded-full bg-[#4CAF50] mr-2"></div>
                  <span className="text-sm font-medium">
                    Blockchain Connection
                  </span>
                </div>
                <span className="text-sm text-[#4CAF50]">Operational</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="h-3 w-3 rounded-full bg-[#4CAF50] mr-2"></div>
                  <span className="text-sm font-medium">Smart Contracts</span>
                </div>
                <span className="text-sm text-[#4CAF50]">Operational</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="h-3 w-3 rounded-full bg-[#4CAF50] mr-2"></div>
                  <span className="text-sm font-medium">API Services</span>
                </div>
                <span className="text-sm text-[#4CAF50]">Operational</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="h-3 w-3 rounded-full bg-[#F57C00] mr-2"></div>
                  <span className="text-sm font-medium">Oracle Data Feeds</span>
                </div>
                <span className="text-sm text-[#F57C00] flex items-center">
                  <AlertTriangle className="h-3 w-3 mr-1" /> Degraded
                  Performance
                </span>
              </div>
            </div>
          </CardContent>
        </Card> */}
      </main>
    </div>
  );
}
