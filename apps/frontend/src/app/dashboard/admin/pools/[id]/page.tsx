"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import { ArrowLeft, Settings, Users, FileText, BarChart3, TrendingUp, TrendingDown } from "lucide-react"
import Link from "next/link"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Skeleton } from "@/components/ui/skeleton"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

// Mock data for pool details
const mockPoolDetails = {
  "POOL-001": {
    id: "POOL-001",
    name: "Flight Delay Insurance",
    description: "Coverage for flight delays and cancellations",
    tvl: "250,000 USDC",
    members: 1250,
    claimRatio: "5.2%",
    status: "Healthy",
    createdAt: "2023-01-15",
    contractAddress: "0x1234...5678",
    riskParameters: {
      minCoverage: "100 USDC",
      maxCoverage: "2,000 USDC",
      basePremiumRate: "3.5%",
      deductible: "50 USDC",
      claimValidationThreshold: "2 hours",
    },
    recentClaims: [
      {
        id: "CLM-001",
        policyId: "NFT-1234",
        date: "2023-10-18",
        amount: "250 USDC",
        status: "Approved",
        description: "Flight AA123 delayed by 3 hours",
      },
      {
        id: "CLM-002",
        policyId: "NFT-5678",
        date: "2023-10-17",
        amount: "500 USDC",
        status: "Processing",
        description: "Flight BA456 cancelled",
      },
      {
        id: "CLM-003",
        policyId: "NFT-9012",
        date: "2023-10-15",
        amount: "150 USDC",
        status: "Denied",
        description: "Flight DL789 delayed by 1 hour",
      },
    ],
    members: [
      {
        address: "0xabcd...1234",
        policies: 2,
        totalCoverage: "1,500 USDC",
        joinedAt: "2023-05-20",
      },
      {
        address: "0xefgh...5678",
        policies: 1,
        totalCoverage: "500 USDC",
        joinedAt: "2023-06-15",
      },
      {
        address: "0xijkl...9012",
        policies: 3,
        totalCoverage: "3,000 USDC",
        joinedAt: "2023-04-10",
      },
    ],
  },
  "POOL-002": {
    id: "POOL-002",
    name: "Crypto Asset Protection",
    description: "Coverage against smart contract vulnerabilities",
    tvl: "500,000 USDC",
    members: 850,
    claimRatio: "3.8%",
    status: "Healthy",
    createdAt: "2023-02-20",
    contractAddress: "0x5678...9012",
    riskParameters: {
      minCoverage: "1,000 USDC",
      maxCoverage: "50,000 USDC",
      basePremiumRate: "5.0%",
      deductible: "500 USDC",
      claimValidationThreshold: "24 hours",
    },
    recentClaims: [
      {
        id: "CLM-004",
        policyId: "NFT-3456",
        date: "2023-10-19",
        amount: "10,000 USDC",
        status: "Processing",
        description: "Smart contract exploit on DeFi protocol",
      },
      {
        id: "CLM-005",
        policyId: "NFT-7890",
        date: "2023-10-16",
        amount: "5,000 USDC",
        status: "Approved",
        description: "Wallet compromise due to phishing",
      },
    ],
    members: [
      {
        address: "0xmnop...3456",
        policies: 1,
        totalCoverage: "25,000 USDC",
        joinedAt: "2023-03-10",
      },
      {
        address: "0xqrst...7890",
        policies: 2,
        totalCoverage: "40,000 USDC",
        joinedAt: "2023-04-05",
      },
    ],
  },
}

export default function PoolAnalytics() {
  const params = useParams()
  const poolId = params.id as string

  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [poolData, setPoolData] = useState<any>(null)

  // Simulate loading pool data
  useEffect(() => {
    const loadPoolData = async () => {
      setIsLoading(true)

      // Simulate API call delay
      setTimeout(() => {
        setPoolData(mockPoolDetails[poolId] || null)
        setIsLoading(false)
      }, 1000)
    }

    loadPoolData()
  }, [poolId])

  if (isLoading) {
    return (
      <div className="container py-8">
        <div className="space-y-6">
          <div className="flex items-center gap-2">
            <Skeleton className="h-10 w-10 rounded-full" />
            <Skeleton className="h-8 w-[200px]" />
          </div>
          <div className="grid gap-4 md:grid-cols-4">
            <Skeleton className="h-[125px] rounded-xl" />
            <Skeleton className="h-[125px] rounded-xl" />
            <Skeleton className="h-[125px] rounded-xl" />
            <Skeleton className="h-[125px] rounded-xl" />
          </div>
          <Skeleton className="h-[400px] rounded-xl" />
        </div>
      </div>
    )
  }

  if (!poolData) {
    return (
      <div className="container py-8">
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <h2 className="text-2xl font-bold mb-2">Pool Not Found</h2>
          <p className="text-muted-foreground mb-6">The insurance pool you're looking for doesn't exist.</p>
          <Link href="/dashboard/admin">
            <Button>Return to Admin Dashboard</Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="container py-8">
      <div className="flex flex-col gap-8">
        {/* Pool header */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <Link href="/dashboard/admin">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="h-4 w-4" />
              </Button>
            </Link>
            <h1 className="text-3xl font-bold tracking-tight">{poolData.name}</h1>
            <Badge
              className={
                poolData.status === "Healthy"
                  ? "bg-green-500 ml-2"
                  : poolData.status === "Warning"
                    ? "bg-yellow-500 ml-2"
                    : "bg-red-500 ml-2"
              }
            >
              {poolData.status}
            </Badge>
          </div>
          <p className="text-muted-foreground">
            {poolData.description} • Created on {new Date(poolData.createdAt).toLocaleDateString()}
          </p>
          <p className="text-xs text-muted-foreground mt-1">Contract: {poolData.contractAddress}</p>
        </div>

        {/* Pool metrics */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Total Value Locked</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{poolData.tvl}</div>
              <div className="flex items-center gap-1 text-xs text-green-500 mt-1">
                <TrendingUp className="h-3 w-3" />
                <span>+3.2% from last month</span>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Members</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{poolData.members}</div>
              <div className="flex items-center gap-1 text-xs text-green-500 mt-1">
                <TrendingUp className="h-3 w-3" />
                <span>+8.5% from last month</span>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Claim Ratio</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{poolData.claimRatio}</div>
              <div className="flex items-center gap-1 text-xs text-red-500 mt-1">
                <TrendingDown className="h-3 w-3" />
                <span>+0.8% from last month</span>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Active Policies</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">1,150</div>
              <div className="flex items-center gap-1 text-xs text-green-500 mt-1">
                <TrendingUp className="h-3 w-3" />
                <span>+5.2% from last month</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Pool tabs */}
        <Tabs defaultValue="analytics">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="analytics" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" /> Analytics
            </TabsTrigger>
            <TabsTrigger value="claims" className="flex items-center gap-2">
              <FileText className="h-4 w-4" /> Claims
            </TabsTrigger>
            <TabsTrigger value="members" className="flex items-center gap-2">
              <Users className="h-4 w-4" /> Members
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex items-center gap-2">
              <Settings className="h-4 w-4" /> Settings
            </TabsTrigger>
          </TabsList>

          <TabsContent value="analytics" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Pool Performance</CardTitle>
                <CardDescription>Historical data and trends for this insurance pool</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px] flex items-center justify-center bg-muted/20 rounded-md">
                  <p className="text-muted-foreground">Chart visualization would appear here</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="claims" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Recent Claims</CardTitle>
                <CardDescription>Review and manage claims submitted to this pool</CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Claim ID</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {poolData.recentClaims.map((claim) => (
                      <TableRow key={claim.id}>
                        <TableCell className="font-medium">{claim.id}</TableCell>
                        <TableCell>{new Date(claim.date).toLocaleDateString()}</TableCell>
                        <TableCell>{claim.description}</TableCell>
                        <TableCell>{claim.amount}</TableCell>
                        <TableCell>
                          <Badge
                            className={
                              claim.status === "Approved"
                                ? "bg-green-500"
                                : claim.status === "Processing"
                                  ? "bg-yellow-500"
                                  : "bg-red-500"
                            }
                          >
                            {claim.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button size="sm">Review</Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="members" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Pool Members</CardTitle>
                <CardDescription>Users who have purchased policies from this pool</CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Address</TableHead>
                      <TableHead>Policies</TableHead>
                      <TableHead>Total Coverage</TableHead>
                      <TableHead>Joined</TableHead>
                      <TableHead className="text-right">Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {poolData.members.map((member, index) => (
                      <TableRow key={index}>
                        <TableCell className="font-medium">{member.address}</TableCell>
                        <TableCell>{member.policies}</TableCell>
                        <TableCell>{member.totalCoverage}</TableCell>
                        <TableCell>{new Date(member.joinedAt).toLocaleDateString()}</TableCell>
                        <TableCell className="text-right">
                          <Button size="sm" variant="outline">
                            View Details
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="settings" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Risk Parameters</CardTitle>
                <CardDescription>Configure the risk parameters for this insurance pool</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-6 md:grid-cols-2">
                  {Object.entries(poolData.riskParameters).map(([key, value]) => (
                    <div key={key} className="space-y-2">
                      <h3 className="text-sm font-medium capitalize">
                        {key.replace(/([A-Z])/g, " $1").replace(/^./, (str) => str.toUpperCase())}
                      </h3>
                      <div className="flex items-center justify-between rounded-md border p-4">
                        <span>{value}</span>
                        <Button size="sm" variant="outline">
                          Edit
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-6 flex justify-end">
                  <Button>Save Changes</Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
