"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, Shield, Info, FileText, BarChart3, Users, ExternalLink } from "lucide-react"
import { ShieldCheck, AlertTriangle, Star, ThumbsUp, ThumbsDown, Award, HelpCircle } from "lucide-react"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Progress } from "@/components/ui/progress"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Skeleton } from "@/components/ui/skeleton"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

// Mock data for pool details
const mockPoolDetails = {
  "POOL-001": {
    id: "POOL-001",
    name: "Flight Delay Insurance",
    description: "Coverage for flight delays and cancellations",
    longDescription:
      "This insurance pool provides coverage for travelers experiencing flight delays and cancellations. The policy pays out based on the length of the delay, with higher compensation for longer delays or complete cancellations. Claims are verified using flight data from reliable oracles.",
    tvl: "250,000 USDC",
    members: 1250,
    claimRatio: "5.2%",
    status: "Active",
    category: "Travel",
    createdAt: "2023-01-15",
    contractAddress: "0x1234...5678",
    riskParameters: {
      minCoverage: "100 USDC",
      maxCoverage: "2,000 USDC",
      basePremiumRate: "3.5%",
      deductible: "50 USDC",
      claimValidationThreshold: "2 hours",
    },
    rules: [
      "Flight must be delayed by at least 2 hours to qualify for a claim",
      "Maximum payout is 100% of the coverage amount for cancellations",
      "Delays between 2-4 hours receive 25% of coverage amount",
      "Delays between 4-8 hours receive 50% of coverage amount",
      "Delays over 8 hours receive 75% of coverage amount",
      "Claims must be submitted within 48 hours of the scheduled arrival time",
      "Evidence must include boarding pass and official delay notification",
    ],
    recentClaims: [
      {
        id: "CLM-001",
        date: "2023-10-18",
        amount: "250 USDC",
        status: "Approved",
        description: "Flight AA123 delayed by 3 hours",
      },
      {
        id: "CLM-002",
        date: "2023-10-17",
        amount: "500 USDC",
        status: "Processing",
        description: "Flight BA456 cancelled",
      },
      {
        id: "CLM-003",
        date: "2023-10-15",
        amount: "150 USDC",
        status: "Denied",
        description: "Flight DL789 delayed by 1 hour",
      },
    ],
    performance: {
      monthlyTVL: [
        { month: "May", value: 180000 },
        { month: "Jun", value: 195000 },
        { month: "Jul", value: 210000 },
        { month: "Aug", value: 225000 },
        { month: "Sep", value: 240000 },
        { month: "Oct", value: 250000 },
      ],
      monthlyClaims: [
        { month: "May", value: 12 },
        { month: "Jun", value: 15 },
        { month: "Jul", value: 18 },
        { month: "Aug", value: 14 },
        { month: "Sep", value: 20 },
        { month: "Oct", value: 22 },
      ],
    },
    coverageDetails: {
      covered: [
        "Flight delays over 2 hours",
        "Flight cancellations",
        "Missed connections due to delays",
        "Lost baggage during transit",
        "Emergency accommodations due to delays",
      ],
      notCovered: [
        "Delays under 2 hours",
        "Cancellations due to passenger reasons",
        "Pre-existing flight schedule changes",
        "Voluntary flight changes",
        "Non-covered airlines",
      ],
    },
    riskAssessment: {
      riskLevel: "Medium",
      riskScore: 65,
      factors: [
        { name: "Historical Delay Rate", impact: "High" },
        { name: "Seasonal Weather Patterns", impact: "Medium" },
        { name: "Airline Reliability", impact: "Medium" },
        { name: "Airport Congestion", impact: "Low" },
      ],
    },
    reviews: [
      {
        id: 1,
        user: "0x7a23...45df",
        avatar: "A",
        rating: 5,
        date: "2023-09-15",
        comment:
          "Quick and easy claim process. My flight was delayed by 4 hours and I received compensation within 24 hours of submitting my claim.",
        helpful: 24,
        unhelpful: 2,
      },
      {
        id: 2,
        user: "0x3f56...89ab",
        avatar: "B",
        rating: 4,
        date: "2023-08-22",
        comment: "Good coverage for the price. The policy terms are clear and the claim process is straightforward.",
        helpful: 18,
        unhelpful: 3,
      },
      {
        id: 3,
        user: "0x9c12...67ef",
        avatar: "C",
        rating: 3,
        date: "2023-10-05",
        comment: "Decent service but took a bit longer than expected to process my claim. Eventually got paid though.",
        helpful: 12,
        unhelpful: 5,
      },
    ],
    faq: [
      {
        question: "How do I file a claim?",
        answer:
          "To file a claim, connect your wallet, navigate to the dashboard, select the policy, and click 'File Claim'. You'll need to provide evidence of the delay or cancellation, such as your boarding pass and official delay notification.",
      },
      {
        question: "How quickly are claims processed?",
        answer:
          "Claims are processed automatically through smart contracts. Once validated by our oracle network, payouts are typically issued within 24-48 hours.",
      },
      {
        question: "Can I purchase multiple policies for the same flight?",
        answer:
          "No, you can only purchase one policy per flight per wallet address. This helps prevent insurance fraud and keeps premiums affordable for everyone.",
      },
      {
        question: "What evidence do I need for a claim?",
        answer:
          "You'll need your boarding pass, flight details, and official documentation of the delay or cancellation from the airline or airport. All evidence is uploaded to IPFS and linked to your claim.",
      },
      {
        question: "Are all airlines covered?",
        answer:
          "We cover most major commercial airlines. You can check if your airline is covered during the quote process by entering the airline code.",
      },
    ],
    additionalBenefits: [
      "No paperwork - all digital claims process",
      "Instant policy issuance",
      "Coverage for all family members on the same booking",
      "Multi-trip discounts available",
      "24/7 support via Discord community",
    ],
    historicalPerformance: {
      payoutRatio: "95.2%",
      averageClaimTime: "36 hours",
      disputeRate: "3.8%",
      renewalRate: "78%",
    },
    liquidityHealth: {
      status: "Excellent",
      ratio: 4.2,
      description: "This pool has 4.2x more funds than required to cover all active policies.",
    },
  },
  "POOL-002": {
    id: "POOL-002",
    name: "Crypto Asset Protection",
    description: "Coverage against smart contract vulnerabilities",
    longDescription:
      "This insurance pool provides protection for crypto assets against smart contract vulnerabilities and exploits. It covers losses due to bugs, hacks, or other security issues in covered protocols. Claims are verified through on-chain evidence and security audits.",
    tvl: "500,000 USDC",
    members: 850,
    claimRatio: "3.8%",
    status: "Active",
    category: "Crypto",
    createdAt: "2023-02-20",
    contractAddress: "0x5678...9012",
    riskParameters: {
      minCoverage: "1,000 USDC",
      maxCoverage: "50,000 USDC",
      basePremiumRate: "5.0%",
      deductible: "500 USDC",
      claimValidationThreshold: "24 hours",
    },
    rules: [
      "Coverage applies only to listed and approved protocols",
      "Exploit must be verified by at least two security firms",
      "Claims must be submitted within 7 days of the exploit",
      "Maximum payout is limited to the actual loss or coverage amount, whichever is lower",
      "Deductible of 500 USDC applies to all claims",
      "Evidence must include transaction hashes and wallet addresses",
      "Social engineering attacks and phishing are not covered",
    ],
    recentClaims: [
      {
        id: "CLM-004",
        date: "2023-10-19",
        amount: "10,000 USDC",
        status: "Processing",
        description: "Smart contract exploit on DeFi protocol",
      },
      {
        id: "CLM-005",
        date: "2023-10-16",
        amount: "5,000 USDC",
        status: "Approved",
        description: "Wallet compromise due to protocol vulnerability",
      },
    ],
    performance: {
      monthlyTVL: [
        { month: "May", value: 350000 },
        { month: "Jun", value: 380000 },
        { month: "Jul", value: 420000 },
        { month: "Aug", value: 450000 },
        { month: "Sep", value: 480000 },
        { month: "Oct", value: 500000 },
      ],
      monthlyClaims: [
        { month: "May", value: 5 },
        { month: "Jun", value: 7 },
        { month: "Jul", value: 4 },
        { month: "Aug", value: 6 },
        { month: "Sep", value: 8 },
        { month: "Oct", value: 9 },
      ],
    },
    coverageDetails: {
      covered: [
        "Smart contract exploits",
        "Security vulnerabilities",
        "Hacks and breaches",
        "Bug bounties",
        "Protocol failures",
      ],
      notCovered: ["Social engineering attacks", "Phishing scams", "Rug pulls", "Exchange hacks", "Wallet compromises"],
    },
    riskAssessment: {
      riskLevel: "High",
      riskScore: 85,
      factors: [
        { name: "Smart Contract Complexity", impact: "High" },
        { name: "Protocol TVL", impact: "High" },
        { name: "Security Audit Frequency", impact: "Medium" },
        { name: "Community Reputation", impact: "Low" },
      ],
    },
    reviews: [
      {
        id: 1,
        user: "0x1b89...cdef",
        avatar: "D",
        rating: 5,
        date: "2023-09-28",
        comment:
          "Peace of mind knowing my crypto assets are protected. The claim process was smooth and the payout was timely.",
        helpful: 32,
        unhelpful: 1,
      },
      {
        id: 2,
        user: "0x6e45...0123",
        avatar: "E",
        rating: 4,
        date: "2023-08-15",
        comment:
          "Good coverage for DeFi protocols. The policy terms are comprehensive and the support team is responsive.",
        helpful: 25,
        unhelpful: 4,
      },
      {
        id: 3,
        user: "0x2d78...9abc",
        avatar: "F",
        rating: 3,
        date: "2023-10-12",
        comment: "Decent service but the premium is a bit high. Overall, worth it for the security it provides.",
        helpful: 15,
        unhelpful: 6,
      },
    ],
    faq: [
      {
        question: "What types of crypto assets are covered?",
        answer:
          "We cover most major cryptocurrencies and DeFi tokens. You can check if your specific asset is covered during the quote process.",
      },
      {
        question: "How are smart contract exploits verified?",
        answer:
          "Exploits are verified by our network of security firms and on-chain evidence. We require confirmation from at least two independent sources.",
      },
      {
        question: "What is the maximum payout amount?",
        answer:
          "The maximum payout amount is limited to the actual loss or coverage amount, whichever is lower. Deductibles also apply.",
      },
      {
        question: "How do I submit evidence for a claim?",
        answer:
          "You'll need to provide transaction hashes, wallet addresses, and any relevant security audit reports. All evidence is uploaded to IPFS and linked to your claim.",
      },
      {
        question: "Are all DeFi protocols covered?",
        answer:
          "We cover a wide range of DeFi protocols. You can check if your protocol is covered during the quote process.",
      },
    ],
    additionalBenefits: [
      "Coverage for multiple protocols",
      "Automated claim processing",
      "Expert security analysis",
      "Multi-year discounts available",
      "Dedicated account manager",
    ],
    historicalPerformance: {
      payoutRatio: "92.5%",
      averageClaimTime: "48 hours",
      disputeRate: "5.2%",
      renewalRate: "82%",
    },
    liquidityHealth: {
      status: "Good",
      ratio: 3.8,
      description: "This pool has 3.8x more funds than required to cover all active policies.",
    },
  },
}

export default function PoolDetails() {
  const params = useParams()
  const router = useRouter()
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
      <div className="flex min-h-screen flex-col">
        <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="container flex h-16 items-center justify-between">
            <div className="flex items-center gap-2">
              <Link href="/" className="flex items-center gap-2">
                <Shield className="h-6 w-6 text-primary" />
                <span className="text-xl font-bold">ChainSure</span>
              </Link>
            </div>
            <Link href="/dashboard">
              <Button>Connect Wallet</Button>
            </Link>
          </div>
        </header>
        <main className="flex-1 container py-8">
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
        </main>
        <footer className="border-t py-6">
          <div className="container">
            <p className="text-center text-sm text-muted-foreground">
              © {new Date().getFullYear()} ChainSure. All rights reserved.
            </p>
          </div>
        </footer>
      </div>
    )
  }

  if (!poolData) {
    return (
      <div className="flex min-h-screen flex-col">
        <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="container flex h-16 items-center justify-between">
            <div className="flex items-center gap-2">
              <Link href="/" className="flex items-center gap-2">
                <Shield className="h-6 w-6 text-primary" />
                <span className="text-xl font-bold">ChainSure</span>
              </Link>
            </div>
            <Link href="/dashboard">
              <Button>Connect Wallet</Button>
            </Link>
          </div>
        </header>
        <main className="flex-1 container py-8">
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <h2 className="text-2xl font-bold mb-2">Pool Not Found</h2>
            <p className="text-muted-foreground mb-6">The insurance pool you're looking for doesn't exist.</p>
            <Link href="/pools">
              <Button>Browse All Pools</Button>
            </Link>
          </div>
        </main>
        <footer className="border-t py-6">
          <div className="container">
            <p className="text-center text-sm text-muted-foreground">
              © {new Date().getFullYear()} ChainSure. All rights reserved.
            </p>
          </div>
        </footer>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-2">
            <Link href="/" className="flex items-center gap-2">
              <Shield className="h-6 w-6 text-primary" />
              <span className="text-xl font-bold">ChainSure</span>
            </Link>
          </div>
          <nav className="hidden md:flex items-center gap-6">
            <Link href="/#how-it-works" className="text-sm font-medium hover:text-primary">
              How It Works
            </Link>
            <Link href="/#benefits" className="text-sm font-medium hover:text-primary">
              Benefits
            </Link>
            <Link href="/pools" className="text-sm font-medium text-primary">
              Insurance Pools
            </Link>
            <Link href="/#security" className="text-sm font-medium hover:text-primary">
              Security
            </Link>
          </nav>
          <Link href="/dashboard">
            <Button>Connect Wallet</Button>
          </Link>
        </div>
      </header>

      <main className="flex-1">
        <div className="container py-8">
          <div className="flex flex-col gap-8">
            {/* Pool header */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Link href="/pools">
                  <Button variant="ghost" size="icon">
                    <ArrowLeft className="h-4 w-4" />
                  </Button>
                </Link>
                <h1 className="text-3xl font-bold tracking-tight">{poolData.name}</h1>
                <Badge
                  className={
                    poolData.status === "Active"
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
              <div className="flex items-center gap-1 mt-1">
                <p className="text-xs text-muted-foreground">Contract: {poolData.contractAddress}</p>
                <Link href="#" className="text-xs text-primary ml-2 flex items-center gap-1">
                  View on Explorer <ExternalLink className="h-3 w-3" />
                </Link>
              </div>
            </div>

            {/* Pool metrics */}
            <div className="grid gap-4 md:grid-cols-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Total Value Locked</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{poolData.tvl}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Members</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{poolData.members.toLocaleString()}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Claim Ratio</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{poolData.claimRatio}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Category</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{poolData.category}</div>
                </CardContent>
              </Card>
            </div>

            {/* CTA buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href={`/pools/${poolData.id}/quote`} className="flex-1">
                <Button size="lg" className="w-full">
                  Get Quote
                </Button>
              </Link>
              <Link href="/dashboard" className="flex-1">
                <Button size="lg" variant="outline" className="w-full">
                  Connect Wallet to Purchase
                </Button>
              </Link>
            </div>

            {/* Pool tabs */}
            <Tabs defaultValue="overview" className="mt-6">
              <TabsList className="grid w-full grid-cols-5">
                <TabsTrigger value="overview" className="flex items-center gap-2">
                  <Info className="h-4 w-4" /> Overview
                </TabsTrigger>
                <TabsTrigger value="rules" className="flex items-center gap-2">
                  <FileText className="h-4 w-4" /> Rules
                </TabsTrigger>
                <TabsTrigger value="performance" className="flex items-center gap-2">
                  <BarChart3 className="h-4 w-4" /> Performance
                </TabsTrigger>
                <TabsTrigger value="claims" className="flex items-center gap-2">
                  <Users className="h-4 w-4" /> Claims
                </TabsTrigger>
                <TabsTrigger value="reviews" className="flex items-center gap-2">
                  <Star className="h-4 w-4" /> Reviews
                </TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="mt-6">
                <div className="grid gap-6 md:grid-cols-2">
                  <Card>
                    <CardHeader>
                      <CardTitle>Pool Overview</CardTitle>
                      <CardDescription>Detailed information about this insurance pool</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div>
                        <h3 className="text-lg font-medium mb-2">Description</h3>
                        <p>{poolData.longDescription}</p>
                      </div>

                      <div>
                        <h3 className="text-lg font-medium mb-2">Coverage Details</h3>
                        <div className="grid gap-4 md:grid-cols-2">
                          <div className="space-y-2">
                            <h4 className="font-medium flex items-center gap-2 text-green-600">
                              <ShieldCheck className="h-4 w-4" /> What's Covered
                            </h4>
                            <ul className="space-y-1">
                              {poolData.coverageDetails.covered.map((item, index) => (
                                <li key={index} className="flex items-start gap-2 text-sm">
                                  <ThumbsUp className="h-4 w-4 text-green-500 flex-shrink-0 mt-0.5" />
                                  <span>{item}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                          <div className="space-y-2">
                            <h4 className="font-medium flex items-center gap-2 text-red-600">
                              <AlertTriangle className="h-4 w-4" /> What's Not Covered
                            </h4>
                            <ul className="space-y-1">
                              {poolData.coverageDetails.notCovered.map((item, index) => (
                                <li key={index} className="flex items-start gap-2 text-sm">
                                  <ThumbsDown className="h-4 w-4 text-red-500 flex-shrink-0 mt-0.5" />
                                  <span>{item}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      </div>

                      <div>
                        <h3 className="text-lg font-medium mb-2">Coverage Parameters</h3>
                        <div className="grid gap-4 md:grid-cols-2">
                          {Object.entries(poolData.riskParameters).map(([key, value]) => (
                            <div key={key} className="flex justify-between border-b pb-2">
                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <span className="font-medium capitalize flex items-center gap-1">
                                      {key.replace(/([A-Z])/g, " $1").replace(/^./, (str) => str.toUpperCase())}
                                      <HelpCircle className="h-3 w-3 text-muted-foreground" />
                                    </span>
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    <p className="text-xs max-w-[200px]">
                                      {key === "minCoverage" && "Minimum amount of coverage you can purchase"}
                                      {key === "maxCoverage" && "Maximum amount of coverage you can purchase"}
                                      {key === "basePremiumRate" && "Base rate used to calculate your premium"}
                                      {key === "deductible" && "Amount deducted from your claim payout"}
                                      {key === "claimValidationThreshold" && "Minimum threshold for claim validation"}
                                    </p>
                                  </TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                              <span>{value}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div>
                        <h3 className="text-lg font-medium mb-2">Additional Benefits</h3>
                        <ul className="space-y-1">
                          {poolData.additionalBenefits.map((benefit, index) => (
                            <li key={index} className="flex items-start gap-2 text-sm">
                              <Award className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
                              <span>{benefit}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      <div>
                        <h3 className="text-lg font-medium mb-2">Smart Contract</h3>
                        <div className="bg-muted p-4 rounded-md">
                          <p className="text-sm mb-2">Contract Address: {poolData.contractAddress}</p>
                          <div className="flex gap-2">
                            <Button variant="outline" size="sm">
                              View on Explorer
                            </Button>
                            <Button variant="outline" size="sm">
                              View Source Code
                            </Button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <div className="space-y-6">
                    <Card>
                      <CardHeader>
                        <CardTitle>Risk Assessment</CardTitle>
                        <CardDescription>Analysis of risk factors for this insurance pool</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex items-center justify-between">
                          <span className="font-medium">Risk Level:</span>
                          <Badge
                            className={
                              poolData.riskAssessment.riskLevel === "Low"
                                ? "bg-green-500"
                                : poolData.riskAssessment.riskLevel === "Medium"
                                  ? "bg-yellow-500"
                                  : "bg-red-500"
                            }
                          >
                            {poolData.riskAssessment.riskLevel}
                          </Badge>
                        </div>

                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span>Risk Score</span>
                            <span>{poolData.riskAssessment.riskScore}/100</span>
                          </div>
                          <Progress value={poolData.riskAssessment.riskScore} className="h-2" />
                        </div>

                        <div className="space-y-2">
                          <h4 className="text-sm font-medium">Risk Factors</h4>
                          <div className="space-y-2">
                            {poolData.riskAssessment.factors.map((factor, index) => (
                              <div key={index} className="flex justify-between text-sm">
                                <span>{factor.name}</span>
                                <Badge
                                  variant="outline"
                                  className={
                                    factor.impact === "High"
                                      ? "text-red-500 border-red-200"
                                      : factor.impact === "Medium"
                                        ? "text-yellow-500 border-yellow-200"
                                        : "text-green-500 border-green-200"
                                  }
                                >
                                  {factor.impact} Impact
                                </Badge>
                              </div>
                            ))}
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle>Pool Health</CardTitle>
                        <CardDescription>Current status and performance metrics</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-1">
                            <p className="text-sm text-muted-foreground">Liquidity Health</p>
                            <div className="flex items-center gap-2">
                              <Badge
                                className={
                                  poolData.liquidityHealth.status === "Excellent"
                                    ? "bg-green-500"
                                    : poolData.liquidityHealth.status === "Good"
                                      ? "bg-blue-500"
                                      : poolData.liquidityHealth.status === "Adequate"
                                        ? "bg-yellow-500"
                                        : "bg-red-500"
                                }
                              >
                                {poolData.liquidityHealth.status}
                              </Badge>
                              <span className="text-sm">{poolData.liquidityHealth.ratio}x coverage</span>
                            </div>
                          </div>
                          <div className="space-y-1">
                            <p className="text-sm text-muted-foreground">Payout Ratio</p>
                            <p className="font-medium">{poolData.historicalPerformance.payoutRatio}</p>
                          </div>
                          <div className="space-y-1">
                            <p className="text-sm text-muted-foreground">Avg. Claim Time</p>
                            <p className="font-medium">{poolData.historicalPerformance.averageClaimTime}</p>
                          </div>
                          <div className="space-y-1">
                            <p className="text-sm text-muted-foreground">Dispute Rate</p>
                            <p className="font-medium">{poolData.historicalPerformance.disputeRate}</p>
                          </div>
                        </div>

                        <div className="pt-2">
                          <p className="text-sm text-muted-foreground mb-1">Liquidity Ratio</p>
                          <div className="h-2 bg-muted rounded-full overflow-hidden">
                            <div
                              className="h-full bg-green-500 rounded-full"
                              style={{ width: `${Math.min((poolData.liquidityHealth.ratio / 5) * 100, 100)}%` }}
                            ></div>
                          </div>
                          <p className="text-xs text-muted-foreground mt-1">{poolData.liquidityHealth.description}</p>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>

                <Card className="mt-6">
                  <CardHeader>
                    <CardTitle>Frequently Asked Questions</CardTitle>
                    <CardDescription>Common questions about this insurance pool</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Accordion type="single" collapsible className="w-full">
                      {poolData.faq.map((item, index) => (
                        <AccordionItem key={index} value={`item-${index}`}>
                          <AccordionTrigger>{item.question}</AccordionTrigger>
                          <AccordionContent>{item.answer}</AccordionContent>
                        </AccordionItem>
                      ))}
                    </Accordion>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="rules" className="mt-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Policy Rules</CardTitle>
                    <CardDescription>Terms and conditions for this insurance pool</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <p>The following rules govern claims and payouts for this insurance pool:</p>
                      <ul className="space-y-2">
                        {poolData.rules.map((rule, index) => (
                          <li key={index} className="flex items-start gap-2">
                            <span className="bg-primary/10 text-primary rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0 mt-0.5">
                              {index + 1}
                            </span>
                            <span>{rule}</span>
                          </li>
                        ))}
                      </ul>
                      <Separator className="my-4" />
                      <div className="bg-muted/50 p-4 rounded-md">
                        <h4 className="font-medium mb-2">Important Notice</h4>
                        <p className="text-sm text-muted-foreground">
                          All rules are enforced by smart contracts and cannot be modified after policy purchase. Claims
                          are processed automatically based on these rules and verified data from trusted oracles.
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="performance" className="mt-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Pool Performance</CardTitle>
                    <CardDescription>Historical data and trends for this insurance pool</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-8">
                      <div>
                        <h3 className="text-lg font-medium mb-4">Total Value Locked (TVL)</h3>
                        <div className="h-[200px] bg-muted/20 rounded-md flex items-center justify-center">
                          <p className="text-muted-foreground">TVL chart visualization would appear here</p>
                        </div>
                        <div className="mt-4 grid grid-cols-6 gap-2">
                          {poolData.performance.monthlyTVL.map((item) => (
                            <div key={item.month} className="text-center">
                              <div className="text-xs text-muted-foreground">{item.month}</div>
                              <div className="text-sm font-medium">{(item.value / 1000).toFixed(0)}K</div>
                            </div>
                          ))}
                        </div>
                      </div>

                      <Separator />

                      <div>
                        <h3 className="text-lg font-medium mb-4">Monthly Claims</h3>
                        <div className="h-[200px] bg-muted/20 rounded-md flex items-center justify-center">
                          <p className="text-muted-foreground">Claims chart visualization would appear here</p>
                        </div>
                        <div className="mt-4 grid grid-cols-6 gap-2">
                          {poolData.performance.monthlyClaims.map((item) => (
                            <div key={item.month} className="text-center">
                              <div className="text-xs text-muted-foreground">{item.month}</div>
                              <div className="text-sm font-medium">{item.value}</div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="claims" className="mt-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Recent Claims</CardTitle>
                    <CardDescription>Recent claims processed by this pool</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Claim ID</TableHead>
                          <TableHead>Date</TableHead>
                          <TableHead>Description</TableHead>
                          <TableHead>Amount</TableHead>
                          <TableHead>Status</TableHead>
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
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </CardContent>
                  <CardFooter>
                    <p className="text-sm text-muted-foreground">
                      All claims are processed transparently on the blockchain and can be verified.
                    </p>
                  </CardFooter>
                </Card>
              </TabsContent>

              <TabsContent value="reviews" className="mt-6">
                <Card>
                  <CardHeader>
                    <CardTitle>User Reviews</CardTitle>
                    <CardDescription>Feedback from policyholders</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-6">
                      {poolData.reviews.map((review) => (
                        <div key={review.id} className="border-b pb-6 last:border-0 last:pb-0">
                          <div className="flex justify-between items-start">
                            <div className="flex items-center gap-2">
                              <Avatar>
                                <AvatarFallback>{review.avatar}</AvatarFallback>
                              </Avatar>
                              <div>
                                <p className="font-medium">
                                  {review.user.substring(0, 6)}...{review.user.substring(review.user.length - 4)}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                  {new Date(review.date).toLocaleDateString()}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center">
                              {[...Array(5)].map((_, i) => (
                                <Star
                                  key={i}
                                  className={`h-4 w-4 ${i < review.rating ? "text-yellow-400 fill-yellow-400" : "text-muted-foreground"}`}
                                />
                              ))}
                            </div>
                          </div>
                          <p className="mt-3 text-sm">{review.comment}</p>
                          <div className="flex items-center gap-4 mt-3">
                            <button className="text-xs flex items-center gap-1 text-muted-foreground hover:text-foreground">
                              <ThumbsUp className="h-3 w-3" /> Helpful ({review.helpful})
                            </button>
                            <button className="text-xs flex items-center gap-1 text-muted-foreground hover:text-foreground">
                              <ThumbsDown className="h-3 w-3" /> Not helpful ({review.unhelpful})
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </main>

      <footer className="border-t py-6">
        <div className="container">
          <p className="text-center text-sm text-muted-foreground">
            © {new Date().getFullYear()} ChainSure. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  )
}
