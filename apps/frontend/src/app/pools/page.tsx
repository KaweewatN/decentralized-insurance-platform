"use client"

import type React from "react"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Search, Filter, ArrowUpDown, Shield } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

// Mock data for insurance pools
const mockPools = [
  {
    id: "POOL-001",
    name: "Flight Delay Insurance",
    description: "Coverage for flight delays and cancellations",
    tvl: "250,000 USDC",
    members: 1250,
    claimRatio: "5.2%",
    status: "Active",
    category: "Travel",
    minCoverage: "100 USDC",
    maxCoverage: "2,000 USDC",
    premiumRate: "3.5%",
  },
  {
    id: "POOL-002",
    name: "Crypto Asset Protection",
    description: "Coverage against smart contract vulnerabilities",
    tvl: "500,000 USDC",
    members: 850,
    claimRatio: "3.8%",
    status: "Active",
    category: "Crypto",
    minCoverage: "1,000 USDC",
    maxCoverage: "50,000 USDC",
    premiumRate: "5.0%",
  },
  {
    id: "POOL-003",
    name: "Health Emergency Fund",
    description: "Community-funded healthcare coverage",
    tvl: "750,000 USDC",
    members: 2100,
    claimRatio: "7.5%",
    status: "Active",
    category: "Health",
    minCoverage: "500 USDC",
    maxCoverage: "10,000 USDC",
    premiumRate: "4.2%",
  },
  {
    id: "POOL-004",
    name: "Property Insurance",
    description: "Protection for physical property and assets",
    tvl: "1,200,000 USDC",
    members: 450,
    claimRatio: "2.1%",
    status: "Active",
    category: "Property",
    minCoverage: "5,000 USDC",
    maxCoverage: "100,000 USDC",
    premiumRate: "2.8%",
  },
  {
    id: "POOL-005",
    name: "Device Protection",
    description: "Coverage for smartphones, laptops, and other devices",
    tvl: "180,000 USDC",
    members: 920,
    claimRatio: "6.3%",
    status: "Active",
    category: "Electronics",
    minCoverage: "200 USDC",
    maxCoverage: "3,000 USDC",
    premiumRate: "4.5%",
  },
  {
    id: "POOL-006",
    name: "Income Protection",
    description: "Coverage for unexpected loss of income",
    tvl: "420,000 USDC",
    members: 680,
    claimRatio: "4.7%",
    status: "Active",
    category: "Financial",
    minCoverage: "1,000 USDC",
    maxCoverage: "20,000 USDC",
    premiumRate: "3.9%",
  },
]

export default function PoolsBrowser() {
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [pools, setPools] = useState<any[]>([])
  const [filteredPools, setFilteredPools] = useState<any[]>([])
  const [searchQuery, setSearchQuery] = useState<string>("")
  const [categoryFilter, setCategoryFilter] = useState<string>("all")
  const [sortBy, setSortBy] = useState<string>("tvl")
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc")

  // Simulate loading pools data
  useEffect(() => {
    const loadPoolsData = async () => {
      setIsLoading(true)
      // Simulate API call delay
      setTimeout(() => {
        setPools(mockPools)
        setFilteredPools(mockPools)
        setIsLoading(false)
      }, 1000)
    }

    loadPoolsData()
  }, [])

  // Filter and sort pools when search, category, or sort options change
  useEffect(() => {
    if (pools.length === 0) return

    let result = [...pools]

    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      result = result.filter(
        (pool) =>
          pool.name.toLowerCase().includes(query) ||
          pool.description.toLowerCase().includes(query) ||
          pool.category.toLowerCase().includes(query),
      )
    }

    // Apply category filter
    if (categoryFilter !== "all") {
      result = result.filter((pool) => pool.category.toLowerCase() === categoryFilter.toLowerCase())
    }

    // Apply sorting
    result.sort((a, b) => {
      let valueA, valueB

      switch (sortBy) {
        case "tvl":
          valueA = Number.parseInt(a.tvl.replace(/[^0-9]/g, ""))
          valueB = Number.parseInt(b.tvl.replace(/[^0-9]/g, ""))
          break
        case "members":
          valueA = a.members
          valueB = b.members
          break
        case "claimRatio":
          valueA = Number.parseFloat(a.claimRatio.replace("%", ""))
          valueB = Number.parseFloat(b.claimRatio.replace("%", ""))
          break
        case "name":
          valueA = a.name
          valueB = b.name
          return sortOrder === "asc" ? valueA.localeCompare(valueB) : valueB.localeCompare(valueA)
        default:
          valueA = Number.parseInt(a.tvl.replace(/[^0-9]/g, ""))
          valueB = Number.parseInt(b.tvl.replace(/[^0-9]/g, ""))
      }

      return sortOrder === "asc" ? valueA - valueB : valueB - valueA
    })

    setFilteredPools(result)
  }, [pools, searchQuery, categoryFilter, sortBy, sortOrder])

  // Handle search input change
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value)
  }

  // Handle category filter change
  const handleCategoryChange = (value: string) => {
    setCategoryFilter(value)
  }

  // Handle sort change
  const handleSortChange = (value: string) => {
    setSortBy(value)
  }

  // Toggle sort order
  const toggleSortOrder = () => {
    setSortOrder(sortOrder === "asc" ? "desc" : "asc")
  }

  // Get unique categories from pools
  const categories = ["all", ...new Set(pools.map((pool) => pool.category.toLowerCase()))]

  return (
    <div className="flex min-h-screen flex-col">
      {/* Header */}
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
            {/* Page header */}
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Insurance Pools</h1>
              <p className="text-muted-foreground mt-1">Browse and compare available insurance options</p>
            </div>

            {/* Search and filters */}
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search pools..."
                  className="pl-10"
                  value={searchQuery}
                  onChange={handleSearchChange}
                />
              </div>
              <div className="flex gap-2">
                <Select value={categoryFilter} onValueChange={handleCategoryChange}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectLabel>Categories</SelectLabel>
                      {categories.map((category) => (
                        <SelectItem key={category} value={category}>
                          {category === "all" ? "All Categories" : category.charAt(0).toUpperCase() + category.slice(1)}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="flex gap-2">
                      <Filter className="h-4 w-4" />
                      Sort By
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuLabel>Sort By</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => handleSortChange("tvl")}>
                      Total Value Locked {sortBy === "tvl" && "✓"}
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleSortChange("members")}>
                      Members {sortBy === "members" && "✓"}
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleSortChange("claimRatio")}>
                      Claim Ratio {sortBy === "claimRatio" && "✓"}
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleSortChange("name")}>
                      Name {sortBy === "name" && "✓"}
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={toggleSortOrder}>
                      Order: {sortOrder === "asc" ? "Ascending" : "Descending"}
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>

                <Button variant="outline" size="icon" onClick={toggleSortOrder}>
                  <ArrowUpDown className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Results count */}
            <div>
              <p className="text-sm text-muted-foreground">
                Showing {filteredPools.length} of {pools.length} pools
              </p>
            </div>

            {/* Pools grid */}
            {isLoading ? (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <Skeleton key={i} className="h-[300px] rounded-xl" />
                ))}
              </div>
            ) : filteredPools.length > 0 ? (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {filteredPools.map((pool) => (
                  <Card key={pool.id} className="overflow-hidden">
                    <CardHeader className="pb-3">
                      <div className="flex justify-between items-start">
                        <Badge variant="outline">{pool.category}</Badge>
                        <Badge className="bg-green-500">{pool.status}</Badge>
                      </div>
                      <CardTitle className="mt-2">{pool.name}</CardTitle>
                      <CardDescription>{pool.description}</CardDescription>
                    </CardHeader>
                    <CardContent className="pb-3">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm text-muted-foreground">Total Value Locked</p>
                          <p className="font-medium">{pool.tvl}</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Members</p>
                          <p className="font-medium">{pool.members.toLocaleString()}</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Claim Ratio</p>
                          <p className="font-medium">{pool.claimRatio}</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Premium Rate</p>
                          <p className="font-medium">{pool.premiumRate}</p>
                        </div>
                      </div>
                      <div className="mt-4 text-sm">
                        <p className="text-muted-foreground">Coverage Range</p>
                        <p>
                          {pool.minCoverage} - {pool.maxCoverage}
                        </p>
                      </div>
                    </CardContent>
                    <CardFooter className="flex justify-between pt-0">
                      <Link href={`/pools/${pool.id}`}>
                        <Button variant="outline">View Details</Button>
                      </Link>
                      <Link href={`/pools/${pool.id}/quote`}>
                        <Button>Get Quote</Button>
                      </Link>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <h2 className="text-2xl font-bold mb-2">No Pools Found</h2>
                <p className="text-muted-foreground mb-6">Try adjusting your search or filters</p>
                <Button
                  onClick={() => {
                    setSearchQuery("")
                    setCategoryFilter("all")
                    setSortBy("tvl")
                    setSortOrder("desc")
                  }}
                >
                  Reset Filters
                </Button>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Footer */}
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
