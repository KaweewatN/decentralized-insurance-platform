"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { ArrowRight, FileText, AlertCircle } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Badge } from "@/components/ui/badge"

// Mock function to check if user is admin - would be replaced with actual contract call
const checkIsAdmin = async (address: string) => {
  // This would be a call to your smart contract
  // For demo purposes, let's assume addresses starting with "0xA" are admins
  return address.startsWith("0xA")
}

// Mock data for user policies
const mockPolicies = [
  {
    id: "NFT-1234",
    name: "Flight Delay Insurance",
    coverageAmount: "500 USDC",
    expiryDate: "2023-12-31",
    status: "Active",
    policyType: "Travel",
  },
  {
    id: "NFT-5678",
    name: "Crypto Asset Protection",
    coverageAmount: "10,000 USDC",
    expiryDate: "2024-06-30",
    status: "Active",
    policyType: "Crypto",
  },
]

// Mock data for user claims
const mockClaims = [
  {
    id: "CLM-9012",
    policyId: "NFT-1234",
    date: "2023-10-15",
    amount: "250 USDC",
    status: "Processing",
    description: "Flight AA123 delayed by 3 hours",
  },
]

export default function Dashboard() {
  const [isAdmin, setIsAdmin] = useState<boolean>(false)
  const [walletAddress, setWalletAddress] = useState<string>("0xA1B2C3D4E5F6G7H8I9J0K1L2M3N4O5P6Q7R8S9T0")
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [policies, setPolicies] = useState(mockPolicies)
  const [claims, setClaims] = useState(mockClaims)

  // Simulate loading user data
  useEffect(() => {
    const loadUserData = async () => {
      setIsLoading(true)

      // Check if user is admin
      const admin = await checkIsAdmin(walletAddress)
      setIsAdmin(admin)

      // Simulate API call delay
      setTimeout(() => {
        setPolicies(mockPolicies)
        setClaims(mockClaims)
        setIsLoading(false)
      }, 1000)
    }

    loadUserData()
  }, [walletAddress])

  // Get first name from wallet address for personalization
  const firstName = "User"

  return (
    <div className="container py-8">
      <div className="flex flex-col gap-8">
        {/* Welcome section */}
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Welcome, {firstName}</h1>
          <p className="text-muted-foreground mt-1">Manage your insurance policies and claims in one place</p>
        </div>

        {/* Summary metrics */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Total Policies</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">
                {isLoading ? <Skeleton className="h-9 w-12" /> : policies.length}
              </div>
              <p className="text-xs text-muted-foreground mt-1">Active insurance policies</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Total Coverage</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{isLoading ? <Skeleton className="h-9 w-24" /> : "10,500 USDC"}</div>
              <p className="text-xs text-muted-foreground mt-1">Combined policy coverage</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Active Claims</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{isLoading ? <Skeleton className="h-9 w-12" /> : claims.length}</div>
              <p className="text-xs text-muted-foreground mt-1">Claims in progress</p>
            </CardContent>
          </Card>
        </div>

        {/* My Policies section */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">My Policies</h2>
            <Link href="/dashboard/policies">
              <Button variant="ghost" size="sm" className="gap-1">
                View All <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>

          {isLoading ? (
            <div className="grid gap-4 md:grid-cols-2">
              <Skeleton className="h-[200px] rounded-xl" />
              <Skeleton className="h-[200px] rounded-xl" />
            </div>
          ) : policies.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2">
              {policies.map((policy) => (
                <Card key={policy.id}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <Badge variant="outline">{policy.policyType}</Badge>
                      <Badge className={policy.status === "Active" ? "bg-green-500" : "bg-yellow-500"}>
                        {policy.status}
                      </Badge>
                    </div>
                    <CardTitle className="mt-2">{policy.name}</CardTitle>
                    <CardDescription>Policy ID: {policy.id}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>
                        <p className="text-muted-foreground">Coverage</p>
                        <p className="font-medium">{policy.coverageAmount}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Expires</p>
                        <p className="font-medium">{policy.expiryDate}</p>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="flex justify-between">
                    <Button variant="outline" size="sm">
                      View Details
                    </Button>
                    <Button size="sm">File Claim</Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-8 text-center">
                <FileText className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium">No Policies Found</h3>
                <p className="text-sm text-muted-foreground mb-4">You don't have any active insurance policies yet.</p>
                <Button>Browse Insurance Pools</Button>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Active Claims section */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">Active Claims</h2>
            <Link href="/dashboard/claims">
              <Button variant="ghost" size="sm" className="gap-1">
                View All <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>

          {isLoading ? (
            <Skeleton className="h-[200px] rounded-xl" />
          ) : claims.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2">
              {claims.map((claim) => (
                <Card key={claim.id}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <Badge variant="outline">Claim ID: {claim.id}</Badge>
                      <Badge className="bg-yellow-500">{claim.status}</Badge>
                    </div>
                    <CardTitle className="mt-2">
                      {policies.find((p) => p.id === claim.policyId)?.name || "Unknown Policy"}
                    </CardTitle>
                    <CardDescription>Filed on {claim.date}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm">{claim.description}</p>
                    <div className="mt-2">
                      <p className="text-sm text-muted-foreground">Claim Amount</p>
                      <p className="font-medium">{claim.amount}</p>
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button variant="outline" className="w-full">
                      Track Claim Status
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-8 text-center">
                <AlertCircle className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium">No Active Claims</h3>
                <p className="text-sm text-muted-foreground">
                  You don't have any active insurance claims at the moment.
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
