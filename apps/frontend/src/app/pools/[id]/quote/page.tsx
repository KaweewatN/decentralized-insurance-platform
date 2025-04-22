"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, Shield, Calculator } from "lucide-react"
import { Info, CheckCircle, HelpCircle, Calendar, Plane, Users, Plus, Minus, FileText } from "lucide-react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Switch } from "@/components/ui/switch"
import { Input } from "@/components/ui/input"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Skeleton } from "@/components/ui/skeleton"
import { Separator } from "@/components/ui/separator"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Badge } from "@/components/ui/badge"

// Mock data for pool details (same as in pool details page)
const mockPoolDetails = {
  "POOL-001": {
    id: "POOL-001",
    name: "Flight Delay Insurance",
    description: "Coverage for flight delays and cancellations",
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
    minCoverageValue: 100,
    maxCoverageValue: 2000,
    basePremiumRateValue: 3.5,
    coverageOptions: [
      {
        id: "basic",
        name: "Basic",
        description: "Essential coverage for flight delays and cancellations",
        multiplier: 1.0,
        features: ["Flight delay compensation", "Flight cancellation coverage", "Basic customer support"],
      },
      {
        id: "premium",
        name: "Premium",
        description: "Enhanced coverage with additional benefits",
        multiplier: 1.5,
        features: [
          "All Basic features",
          "Missed connection coverage",
          "Lost baggage compensation",
          "Priority customer support",
        ],
      },
      {
        id: "comprehensive",
        name: "Comprehensive",
        description: "Maximum protection for your journey",
        multiplier: 2.0,
        features: [
          "All Premium features",
          "Emergency accommodation coverage",
          "Alternative transport coverage",
          "24/7 premium support",
          "No deductible",
        ],
      },
    ],
    addOns: [
      {
        id: "baggage",
        name: "Baggage Protection",
        description: "Coverage for lost, damaged, or delayed baggage",
        cost: 25,
        available: true,
      },
      {
        id: "medical",
        name: "Medical Emergency",
        description: "Coverage for medical emergencies during travel",
        cost: 50,
        available: true,
      },
      {
        id: "cancel",
        name: "Cancel for Any Reason",
        description: "Ability to cancel your flight for any reason and get partial compensation",
        cost: 75,
        available: true,
      },
      {
        id: "family",
        name: "Family Coverage",
        description: "Extend coverage to family members on the same booking",
        cost: 60,
        available: true,
      },
    ],
    discounts: [
      {
        id: "multi",
        name: "Multi-Trip Discount",
        description: "Discount for covering multiple trips",
        percent: 10,
        available: true,
      },
      {
        id: "loyalty",
        name: "Loyalty Discount",
        description: "Discount for returning customers",
        percent: 15,
        available: false,
      },
    ],
    paymentOptions: [
      {
        id: "usdc",
        name: "USDC",
        description: "Pay with USDC stablecoin",
        icon: "💲",
      },
      {
        id: "eth",
        name: "ETH",
        description: "Pay with Ethereum",
        icon: "Ξ",
      },
      {
        id: "installment",
        name: "Installment",
        description: "Pay in 3 monthly installments (5% fee)",
        icon: "🔄",
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
    minCoverageValue: 1000,
    maxCoverageValue: 50000,
    basePremiumRateValue: 5.0,
    coverageOptions: [
      {
        id: "basic",
        name: "Basic",
        description: "Essential coverage for flight delays and cancellations",
        multiplier: 1.0,
        features: ["Flight delay compensation", "Flight cancellation coverage", "Basic customer support"],
      },
      {
        id: "premium",
        name: "Premium",
        description: "Enhanced coverage with additional benefits",
        multiplier: 1.5,
        features: [
          "All Basic features",
          "Missed connection coverage",
          "Lost baggage compensation",
          "Priority customer support",
        ],
      },
      {
        id: "comprehensive",
        name: "Comprehensive",
        description: "Maximum protection for your journey",
        multiplier: 2.0,
        features: [
          "All Premium features",
          "Emergency accommodation coverage",
          "Alternative transport coverage",
          "24/7 premium support",
          "No deductible",
        ],
      },
    ],
    addOns: [
      {
        id: "baggage",
        name: "Baggage Protection",
        description: "Coverage for lost, damaged, or delayed baggage",
        cost: 25,
        available: true,
      },
      {
        id: "medical",
        name: "Medical Emergency",
        description: "Coverage for medical emergencies during travel",
        cost: 50,
        available: true,
      },
      {
        id: "cancel",
        name: "Cancel for Any Reason",
        description: "Ability to cancel your flight for any reason and get partial compensation",
        cost: 75,
        available: true,
      },
      {
        id: "family",
        name: "Family Coverage",
        description: "Extend coverage to family members on the same booking",
        cost: 60,
        available: true,
      },
    ],
    discounts: [
      {
        id: "multi",
        name: "Multi-Trip Discount",
        description: "Discount for covering multiple trips",
        percent: 10,
        available: true,
      },
      {
        id: "loyalty",
        name: "Loyalty Discount",
        description: "Discount for returning customers",
        percent: 15,
        available: false,
      },
    ],
    paymentOptions: [
      {
        id: "usdc",
        name: "USDC",
        description: "Pay with USDC stablecoin",
        icon: "💲",
      },
      {
        id: "eth",
        name: "ETH",
        description: "Pay with Ethereum",
        icon: "Ξ",
      },
      {
        id: "installment",
        name: "Installment",
        description: "Pay in 3 monthly installments (5% fee)",
        icon: "🔄",
      },
    ],
  },
}

export default function GetQuote() {
  const params = useParams()
  const router = useRouter()
  const poolId = params.id as string

  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [poolData, setPoolData] = useState<any>(null)
  const [coverageAmount, setCoverageAmount] = useState<number>(0)
  const [duration, setDuration] = useState<string>("30")
  const [calculatedPremium, setCalculatedPremium] = useState<number>(0)
  const [isCalculating, setIsCalculating] = useState<boolean>(false)
  const [selectedCoverageOption, setSelectedCoverageOption] = useState<string>("basic")
  const [selectedAddOns, setSelectedAddOns] = useState<string[]>([])
  const [selectedDiscounts, setSelectedDiscounts] = useState<string[]>([])
  const [selectedPaymentOption, setSelectedPaymentOption] = useState<string>("usdc")
  const [flightNumber, setFlightNumber] = useState<string>("")
  const [travelDate, setTravelDate] = useState<string>("")
  const [passengerCount, setPassengerCount] = useState<number>(1)
  const [currentStep, setCurrentStep] = useState<number>(1)
  const [showSummary, setShowSummary] = useState<boolean>(false)

  // Simulate loading pool data
  useEffect(() => {
    const loadPoolData = async () => {
      setIsLoading(true)

      // Simulate API call delay
      setTimeout(() => {
        const pool = mockPoolDetails[poolId]
        if (pool) {
          setPoolData(pool)
          setCoverageAmount(pool.minCoverageValue)
        }
        setIsLoading(false)
      }, 1000)
    }

    loadPoolData()
  }, [poolId])

  // Handle coverage option selection
  const handleCoverageOptionChange = (optionId: string) => {
    setSelectedCoverageOption(optionId)
  }

  // Handle add-on selection
  const handleAddOnToggle = (addOnId: string) => {
    setSelectedAddOns((prev) => (prev.includes(addOnId) ? prev.filter((id) => id !== addOnId) : [...prev, addOnId]))
  }

  // Handle discount selection
  const handleDiscountToggle = (discountId: string) => {
    setSelectedDiscounts((prev) =>
      prev.includes(discountId) ? prev.filter((id) => id !== discountId) : [...prev, discountId],
    )
  }

  // Handle payment option selection
  const handlePaymentOptionChange = (optionId: string) => {
    setSelectedPaymentOption(optionId)
  }

  // Handle passenger count change
  const handlePassengerCountChange = (change: number) => {
    const newCount = passengerCount + change
    if (newCount >= 1 && newCount <= 10) {
      setPassengerCount(newCount)
    }
  }

  // Handle next step
  const handleNextStep = () => {
    if (currentStep < 3) {
      setCurrentStep(currentStep + 1)
    } else {
      setShowSummary(true)
    }
  }

  // Handle previous step
  const handlePrevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  // Calculate final premium
  const calculateFinalPremium = () => {
    if (!poolData) return 0

    // Get base premium
    let premium = calculatedPremium

    // Apply coverage option multiplier
    const selectedOption = poolData.coverageOptions.find((opt) => opt.id === selectedCoverageOption)
    if (selectedOption) {
      premium *= selectedOption.multiplier
    }

    // Add costs for selected add-ons
    selectedAddOns.forEach((addOnId) => {
      const addOn = poolData.addOns.find((a) => a.id === addOnId)
      if (addOn) {
        premium += addOn.cost
      }
    })

    // Apply discounts
    selectedDiscounts.forEach((discountId) => {
      const discount = poolData.discounts.find((d) => d.id === discountId && d.available)
      if (discount) {
        premium *= 1 - discount.percent / 100
      }
    })

    // Multiply by passenger count
    premium *= passengerCount

    // Apply payment option fee if applicable
    if (selectedPaymentOption === "installment") {
      premium *= 1.05 // 5% fee for installment
    }

    return Number.parseFloat(premium.toFixed(2))
  }

  // Calculate premium when coverage amount or duration changes
  useEffect(() => {
    if (!poolData) return

    setIsCalculating(true)

    // Simulate calculation delay
    const timer = setTimeout(() => {
      // Simple premium calculation formula
      const durationFactor = Number.parseInt(duration) / 30 // Base is 30 days
      const basePremium = (coverageAmount * poolData.basePremiumRateValue) / 100
      const calculatedValue = basePremium * durationFactor
      setCalculatedPremium(Number.parseFloat(calculatedValue.toFixed(2)))
      setIsCalculating(false)
    }, 500)

    return () => clearTimeout(timer)
  }, [coverageAmount, duration, poolData])

  // Handle coverage amount change
  const handleCoverageChange = (value: number[]) => {
    setCoverageAmount(value[0])
  }

  // Handle duration change
  const handleDurationChange = (value: string) => {
    setDuration(value)
  }

  // Handle get quote button click
  const handleGetQuote = () => {
    // In a real app, this would save the quote and proceed to purchase
    router.push("/dashboard")
  }

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
            <Skeleton className="h-[500px] rounded-xl" />
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
          <div className="flex flex-col gap-8 max-w-4xl mx-auto">
            {/* Quote header */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Link href={`/pools/${poolData.id}`}>
                  <Button variant="ghost" size="icon">
                    <ArrowLeft className="h-4 w-4" />
                  </Button>
                </Link>
                <h1 className="text-3xl font-bold tracking-tight">Get a Quote</h1>
              </div>
              <p className="text-muted-foreground">
                Customize your coverage for {poolData.name} and get an instant premium calculation
              </p>
            </div>

            {/* Progress steps */}
            <div className="relative">
              <div className="flex justify-between">
                {[1, 2, 3].map((step) => (
                  <div key={step} className="flex flex-col items-center z-10">
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center ${
                        step < currentStep
                          ? "bg-primary text-primary-foreground"
                          : step === currentStep
                            ? "bg-primary/20 text-primary border-2 border-primary"
                            : "bg-muted text-muted-foreground"
                      }`}
                    >
                      {step < currentStep ? <CheckCircle className="h-5 w-5" /> : step}
                    </div>
                    <span className="text-xs mt-1 text-muted-foreground">
                      {step === 1 ? "Coverage" : step === 2 ? "Options" : "Details"}
                    </span>
                  </div>
                ))}
              </div>
              <div className="absolute top-5 left-0 right-0 h-0.5 bg-muted -z-0" />
              <div
                className="absolute top-5 left-0 h-0.5 bg-primary transition-all -z-0"
                style={{ width: `${((currentStep - 1) / 2) * 100}%` }}
              />
            </div>

            {showSummary ? (
              // Quote Summary View
              <Card>
                <CardHeader>
                  <CardTitle>Quote Summary</CardTitle>
                  <CardDescription>Review your customized insurance quote</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <h3 className="font-medium">Coverage Details</h3>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Insurance Pool</span>
                          <span className="font-medium">{poolData.name}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Coverage Amount</span>
                          <span className="font-medium">{coverageAmount} USDC</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Duration</span>
                          <span className="font-medium">{duration} Days</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Coverage Plan</span>
                          <span className="font-medium">
                            {poolData.coverageOptions.find((opt) => opt.id === selectedCoverageOption)?.name}
                          </span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Passengers</span>
                          <span className="font-medium">{passengerCount}</span>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <h3 className="font-medium">Travel Information</h3>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Flight Number</span>
                          <span className="font-medium">{flightNumber || "Not specified"}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Travel Date</span>
                          <span className="font-medium">{travelDate || "Not specified"}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Payment Method</span>
                          <span className="font-medium">
                            {poolData.paymentOptions.find((opt) => opt.id === selectedPaymentOption)?.name}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <Separator />

                  <div className="space-y-4">
                    <h3 className="font-medium">Selected Add-ons</h3>
                    {selectedAddOns.length > 0 ? (
                      <div className="space-y-2">
                        {selectedAddOns.map((addOnId) => {
                          const addOn = poolData.addOns.find((a) => a.id === addOnId)
                          return addOn ? (
                            <div key={addOn.id} className="flex justify-between text-sm">
                              <span>{addOn.name}</span>
                              <span className="font-medium">+{addOn.cost} USDC</span>
                            </div>
                          ) : null
                        })}
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground">No add-ons selected</p>
                    )}
                  </div>

                  <div className="space-y-4">
                    <h3 className="font-medium">Applied Discounts</h3>
                    {selectedDiscounts.length > 0 ? (
                      <div className="space-y-2">
                        {selectedDiscounts.map((discountId) => {
                          const discount = poolData.discounts.find((d) => d.id === discountId && d.available)
                          return discount ? (
                            <div key={discount.id} className="flex justify-between text-sm">
                              <span>{discount.name}</span>
                              <span className="font-medium text-green-600">-{discount.percent}%</span>
                            </div>
                          ) : null
                        })}
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground">No discounts applied</p>
                    )}
                  </div>

                  <Separator />

                  <div className="bg-muted/30 p-4 rounded-lg">
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="text-sm text-muted-foreground">Total Premium</p>
                        <p className="text-2xl font-bold">{calculateFinalPremium()} USDC</p>
                      </div>
                      <Button size="lg" onClick={handleGetQuote}>
                        Connect Wallet to Purchase
                      </Button>
                    </div>
                    <p className="text-xs text-muted-foreground mt-2">
                      By purchasing this policy, you agree to the terms and conditions of the smart contract.
                    </p>
                  </div>
                </CardContent>
                <CardFooter className="flex justify-between">
                  <Button variant="outline" onClick={() => setShowSummary(false)}>
                    Edit Quote
                  </Button>
                  <Button variant="ghost" onClick={() => window.print()}>
                    Save Quote
                  </Button>
                </CardFooter>
              </Card>
            ) : (
              <div className="grid md:grid-cols-3 gap-6">
                <div className="md:col-span-2">
                  {currentStep === 1 && (
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Calculator className="h-5 w-5" /> Coverage Calculator
                        </CardTitle>
                        <CardDescription>Adjust the parameters to customize your coverage</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-6">
                        {/* Coverage Amount Slider */}
                        <div className="space-y-4">
                          <div className="flex items-center justify-between">
                            <Label htmlFor="coverage-amount">Coverage Amount</Label>
                            <span className="text-sm font-medium">{coverageAmount} USDC</span>
                          </div>
                          <Slider
                            id="coverage-amount"
                            min={poolData.minCoverageValue}
                            max={poolData.maxCoverageValue}
                            step={poolData.minCoverageValue < 1000 ? 50 : 500}
                            value={[coverageAmount]}
                            onValueChange={handleCoverageChange}
                          />
                          <div className="flex justify-between text-xs text-muted-foreground">
                            <span>Min: {poolData.riskParameters.minCoverage}</span>
                            <span>Max: {poolData.riskParameters.maxCoverage}</span>
                          </div>
                        </div>

                        <Separator />

                        {/* Duration Selection */}
                        <div className="space-y-4">
                          <Label htmlFor="duration">Coverage Duration</Label>
                          <RadioGroup
                            id="duration"
                            value={duration}
                            onValueChange={handleDurationChange}
                            className="grid grid-cols-3 gap-4"
                          >
                            <div>
                              <RadioGroupItem value="30" id="30days" className="peer sr-only" />
                              <Label
                                htmlFor="30days"
                                className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                              >
                                <span className="text-sm font-medium">30 Days</span>
                              </Label>
                            </div>
                            <div>
                              <RadioGroupItem value="90" id="90days" className="peer sr-only" />
                              <Label
                                htmlFor="90days"
                                className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                              >
                                <span className="text-sm font-medium">90 Days</span>
                              </Label>
                            </div>
                            <div>
                              <RadioGroupItem value="180" id="180days" className="peer sr-only" />
                              <Label
                                htmlFor="180days"
                                className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                              >
                                <span className="text-sm font-medium">180 Days</span>
                              </Label>
                            </div>
                          </RadioGroup>
                        </div>

                        <Separator />

                        {/* Coverage Plan Selection */}
                        <div className="space-y-4">
                          <Label>Coverage Plan</Label>
                          <RadioGroup
                            value={selectedCoverageOption}
                            onValueChange={handleCoverageOptionChange}
                            className="space-y-3"
                          >
                            {poolData.coverageOptions.map((option) => (
                              <div key={option.id} className="relative">
                                <RadioGroupItem value={option.id} id={option.id} className="peer sr-only" />
                                <Label
                                  htmlFor={option.id}
                                  className="flex flex-col rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                                >
                                  <div className="flex justify-between items-center mb-2">
                                    <span className="font-medium">{option.name}</span>
                                    <Badge variant="outline">{option.multiplier}x</Badge>
                                  </div>
                                  <p className="text-sm text-muted-foreground mb-3">{option.description}</p>
                                  <ul className="space-y-1">
                                    {option.features.map((feature, idx) => (
                                      <li key={idx} className="text-sm flex items-start gap-2">
                                        <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0 mt-0.5" />
                                        <span>{feature}</span>
                                      </li>
                                    ))}
                                  </ul>
                                </Label>
                              </div>
                            ))}
                          </RadioGroup>
                        </div>

                        <Separator />

                        {/* Additional Info */}
                        <div className="rounded-lg bg-muted/50 p-4 text-sm">
                          <div className="flex items-start gap-2">
                            <Info className="h-5 w-5 text-muted-foreground flex-shrink-0 mt-0.5" />
                            <div>
                              <p className="font-medium mb-1">How is the premium calculated?</p>
                              <p className="text-muted-foreground">
                                The premium is calculated based on the coverage amount, duration, and the base premium
                                rate of {poolData.riskParameters.basePremiumRate}. The coverage plan multiplier and any
                                add-ons will affect the final premium.
                              </p>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                      <CardFooter className="flex justify-between">
                        <Button variant="outline" onClick={() => router.back()}>
                          Cancel
                        </Button>
                        <Button onClick={handleNextStep}>Continue</Button>
                      </CardFooter>
                    </Card>
                  )}

                  {currentStep === 2 && (
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Plus className="h-5 w-5" /> Add-ons & Discounts
                        </CardTitle>
                        <CardDescription>Customize your policy with additional coverage options</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-6">
                        {/* Add-ons */}
                        <div className="space-y-4">
                          <h3 className="text-lg font-medium">Available Add-ons</h3>
                          <div className="space-y-3">
                            {poolData.addOns.map((addOn) => (
                              <div
                                key={addOn.id}
                                className="flex items-center justify-between space-x-2 rounded-md border p-4"
                              >
                                <div className="flex-1 space-y-1">
                                  <div className="flex items-center">
                                    <p className="font-medium">{addOn.name}</p>
                                    <TooltipProvider>
                                      <Tooltip>
                                        <TooltipTrigger asChild>
                                          <HelpCircle className="h-4 w-4 text-muted-foreground ml-1" />
                                        </TooltipTrigger>
                                        <TooltipContent>
                                          <p className="max-w-[200px] text-xs">{addOn.description}</p>
                                        </TooltipContent>
                                      </Tooltip>
                                    </TooltipProvider>
                                  </div>
                                  <p className="text-sm text-muted-foreground">{addOn.description}</p>
                                </div>
                                <div className="flex items-center gap-4">
                                  <p className="font-medium whitespace-nowrap">+{addOn.cost} USDC</p>
                                  <Switch
                                    checked={selectedAddOns.includes(addOn.id)}
                                    onCheckedChange={() => handleAddOnToggle(addOn.id)}
                                    disabled={!addOn.available}
                                  />
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>

                        <Separator />

                        {/* Discounts */}
                        <div className="space-y-4">
                          <h3 className="text-lg font-medium">Available Discounts</h3>
                          <div className="space-y-3">
                            {poolData.discounts.map((discount) => (
                              <div
                                key={discount.id}
                                className={`flex items-center justify-between space-x-2 rounded-md border p-4 ${!discount.available ? "opacity-60" : ""}`}
                              >
                                <div className="flex-1 space-y-1">
                                  <p className="font-medium">{discount.name}</p>
                                  <p className="text-sm text-muted-foreground">{discount.description}</p>
                                </div>
                                <div className="flex items-center gap-4">
                                  <p className="font-medium text-green-600 whitespace-nowrap">-{discount.percent}%</p>
                                  <Switch
                                    checked={selectedDiscounts.includes(discount.id)}
                                    onCheckedChange={() => handleDiscountToggle(discount.id)}
                                    disabled={!discount.available}
                                  />
                                </div>
                              </div>
                            ))}
                          </div>
                          {poolData.discounts.some((d) => !d.available) && (
                            <p className="text-xs text-muted-foreground">
                              Some discounts are not available for this policy or require specific conditions.
                            </p>
                          )}
                        </div>
                      </CardContent>
                      <CardFooter className="flex justify-between">
                        <Button variant="outline" onClick={handlePrevStep}>
                          Back
                        </Button>
                        <Button onClick={handleNextStep}>Continue</Button>
                      </CardFooter>
                    </Card>
                  )}

                  {currentStep === 3 && (
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <FileText className="h-5 w-5" /> Travel & Payment Details
                        </CardTitle>
                        <CardDescription>Provide information about your trip and payment preferences</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-6">
                        {/* Travel Details */}
                        <div className="space-y-4">
                          <h3 className="text-lg font-medium">Travel Information</h3>
                          <div className="grid gap-4 md:grid-cols-2">
                            <div className="space-y-2">
                              <Label htmlFor="flight-number">Flight Number (Optional)</Label>
                              <div className="relative">
                                <Plane className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                <Input
                                  id="flight-number"
                                  placeholder="e.g. AA123"
                                  className="pl-10"
                                  value={flightNumber}
                                  onChange={(e) => setFlightNumber(e.target.value)}
                                />
                              </div>
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="travel-date">Travel Date (Optional)</Label>
                              <div className="relative">
                                <Calendar className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                <Input
                                  id="travel-date"
                                  type="date"
                                  className="pl-10"
                                  value={travelDate}
                                  onChange={(e) => setTravelDate(e.target.value)}
                                />
                              </div>
                            </div>
                          </div>
                        </div>

                        <Separator />

                        {/* Passenger Count */}
                        <div className="space-y-4">
                          <div className="flex items-center justify-between">
                            <Label htmlFor="passenger-count">Number of Passengers</Label>
                            <div className="flex items-center">
                              <Button
                                variant="outline"
                                size="icon"
                                className="h-8 w-8 rounded-r-none"
                                onClick={() => handlePassengerCountChange(-1)}
                                disabled={passengerCount <= 1}
                              >
                                <Minus className="h-4 w-4" />
                              </Button>
                              <div className="flex h-8 w-12 items-center justify-center border-y">{passengerCount}</div>
                              <Button
                                variant="outline"
                                size="icon"
                                className="h-8 w-8 rounded-l-none"
                                onClick={() => handlePassengerCountChange(1)}
                                disabled={passengerCount >= 10}
                              >
                                <Plus className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Users className="h-4 w-4" />
                            <span>
                              Coverage will apply to all passengers. Premium will be multiplied by passenger count.
                            </span>
                          </div>
                        </div>

                        <Separator />

                        {/* Payment Options */}
                        <div className="space-y-4">
                          <h3 className="text-lg font-medium">Payment Method</h3>
                          <RadioGroup
                            value={selectedPaymentOption}
                            onValueChange={handlePaymentOptionChange}
                            className="grid gap-4 md:grid-cols-3"
                          >
                            {poolData.paymentOptions.map((option) => (
                              <div key={option.id}>
                                <RadioGroupItem
                                  value={option.id}
                                  id={`payment-${option.id}`}
                                  className="peer sr-only"
                                />
                                <Label
                                  htmlFor={`payment-${option.id}`}
                                  className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                                >
                                  <span className="text-2xl mb-2">{option.icon}</span>
                                  <span className="text-sm font-medium">{option.name}</span>
                                  <span className="text-xs text-muted-foreground text-center mt-1">
                                    {option.description}
                                  </span>
                                </Label>
                              </div>
                            ))}
                          </RadioGroup>
                        </div>

                        <Separator />

                        {/* Terms and Conditions */}
                        <div className="rounded-lg bg-muted/50 p-4 text-sm">
                          <div className="flex items-start gap-2">
                            <Info className="h-5 w-5 text-muted-foreground flex-shrink-0 mt-0.5" />
                            <div>
                              <p className="font-medium mb-1">Important Information</p>
                              <ul className="space-y-1 text-muted-foreground">
                                <li className="flex items-start gap-2">
                                  <CheckCircle className="h-3 w-3 flex-shrink-0 mt-1" />
                                  <span>Your policy will be issued as an NFT to your wallet address</span>
                                </li>
                                <li className="flex items-start gap-2">
                                  <CheckCircle className="h-3 w-3 flex-shrink-0 mt-1" />
                                  <span>Claims are processed automatically through smart contracts</span>
                                </li>
                                <li className="flex items-start gap-2">
                                  <CheckCircle className="h-3 w-3 flex-shrink-0 mt-1" />
                                  <span>You'll need to sign a transaction to purchase the policy</span>
                                </li>
                              </ul>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                      <CardFooter className="flex justify-between">
                        <Button variant="outline" onClick={handlePrevStep}>
                          Back
                        </Button>
                        <Button onClick={handleNextStep}>Review Quote</Button>
                      </CardFooter>
                    </Card>
                  )}
                </div>

                <div>
                  <Card className="sticky top-24">
                    <CardHeader>
                      <CardTitle>Quote Summary</CardTitle>
                      <CardDescription>{poolData.name}</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Coverage Amount</span>
                        <span className="font-medium">{coverageAmount} USDC</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Duration</span>
                        <span className="font-medium">{duration} Days</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Coverage Plan</span>
                        <span className="font-medium">
                          {poolData.coverageOptions.find((opt) => opt.id === selectedCoverageOption)?.name}
                        </span>
                      </div>
                      {selectedAddOns.length > 0 && (
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Add-ons</span>
                          <span className="font-medium">{selectedAddOns.length} selected</span>
                        </div>
                      )}
                      {selectedDiscounts.length > 0 && (
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Discounts</span>
                          <span className="font-medium text-green-600">{selectedDiscounts.length} applied</span>
                        </div>
                      )}
                      {passengerCount > 1 && (
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Passengers</span>
                          <span className="font-medium">x{passengerCount}</span>
                        </div>
                      )}
                      <Separator />
                      <div className="flex justify-between items-center">
                        <span className="font-medium">Premium</span>
                        {isCalculating ? (
                          <Skeleton className="h-6 w-20" />
                        ) : (
                          <span className="text-xl font-bold">{calculateFinalPremium()} USDC</span>
                        )}
                      </div>
                      <div className="flex justify-between text-xs">
                        <span className="text-muted-foreground">Deductible</span>
                        <span>{poolData.riskParameters.deductible}</span>
                      </div>
                    </CardContent>
                    <CardFooter>
                      <Button
                        className="w-full"
                        size="lg"
                        disabled={currentStep < 3}
                        onClick={() => (currentStep === 3 ? handleNextStep() : null)}
                      >
                        {currentStep < 3 ? "Complete All Steps" : "Review Quote"}
                      </Button>
                    </CardFooter>
                  </Card>
                </div>
              </div>
            )}
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
