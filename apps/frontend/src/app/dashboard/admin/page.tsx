"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { ArrowRight, AlertTriangle, TrendingUp, TrendingDown, BarChart3 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

// Mock data for admin dashboard
const mockPoolsData = [
  {
    id: "POOL-001",
    name: "Flight Delay Insurance",
    tvl: "250,000 USDC",
    members: 1250,
    claimRatio: "5.2%",
    status: "Healthy",
    recentClaims: 12,
  },
  {
    id: "POOL-002",
    name: "Crypto Asset Protection",
    tvl: "500,000 USDC",
    members: 850,
    claimRatio: "3.8%",
    status: "Healthy",
    recentClaims: 8,
  },
  {
    id: "POOL-003",
    name: "Health Emergency Fund",
    tvl: "750,000 USDC",
    members: 2100,
    claimRatio: "7.5%",
    status: "Warning",
    recentClaims: 24,
  },
  {
    id: "POOL-004",
    name: "Property Insurance",
    tvl: "1,200,000 USDC",
    members: 450,
    claimRatio: "2.1%",
    status: "Healthy",
    recentClaims: 5,
  },
]

const mockAlerts = [
  {
    id: "ALERT-001",
    title: "Low Liquidity Warning",
    description: "Health Emergency Fund pool liquidity ratio below 15% threshold",
    severity: "warning",
    timestamp: "2023-10-20T14:30:00Z",
  },
  {
    id: "ALERT-002",
    title: "High Claim Volume",
    description: "Unusual claim activity detected in Flight Delay Insurance pool",
    severity: "medium",
    timestamp: "2023-10-19T09:15:00Z",
  },
]

const mockRecentActivity = [
  {
    id: "ACT-001",
    description: "New policy purchased in Crypto Asset Protection pool",
    timestamp: "2023-10-20T16:45:00Z",
    type: "policy",
  },
  {
    id: "ACT-002",
    description: "Claim approved for Flight Delay Insurance",
    timestamp: "2023-10-20T15:30:00Z",
    type: "claim",
  },
  {
    id: "ACT-003",
    description: "Risk parameters updated for Health Emergency Fund",
    timestamp: "2023-10-20T14:00:00Z",
    type: "admin",
  },
  {
    id: "ACT-004",
    description: "New dispute filed for Crypto Asset Protection claim",
    timestamp: "2023-10-20T12:15:00Z",
    type: "dispute",
  },
]

export default function AdminDashboard() {
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [poolsData, setPoolsData] = useState(mockPoolsData)
  const [alerts, setAlerts] = useState(mockAlerts)
  const [recentActivity, setRecentActivity] = useState(mockRecentActivity)

  // Simulate loading admin data
  useEffect(() => {
    const loadAdminData = async () => {
      setIsLoading(true)

      // Simulate API call delay
      setTimeout(() => {
        setPoolsData(mockPoolsData)
        setAlerts(mockAlerts)
        setRecentActivity(mockRecentActivity)
        setIsLoading(false)
      }, 1000)
    }

    loadAdminData()
  }, [])

  // Calculate aggregate metrics
  const totalTVL = isLoading
    ? "..."
    : poolsData
        .reduce((sum, pool) => {
          const value = Number.parseInt(pool.tvl.replace(/[^0-9]/g, ""))
          return sum + value
        }, 0)
        .toLocaleString()

  const totalMembers = isLoading ? "..." : poolsData.reduce((sum, pool) => sum + pool.members, 0).toLocaleString()

  const avgClaimRatio = isLoading
    ? "..."
    : (
        poolsData.reduce((sum, pool) => {
          return sum + Number.parseFloat(pool.claimRatio.replace("%", ""))
        }, 0) / poolsData.length
      ).toFixed(2) + "%"

  return (
    <div className="container py-8">
      <div className="flex flex-col gap-8">
        {/* Admin header */}
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Admin Dashboard</h1>
          <p className="text-muted-foreground mt-1">Monitor and manage insurance pools across the platform</p>
        </div>

        {/* Aggregate metrics */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Total Value Locked</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">
                {isLoading ? <Skeleton className="h-9 w-32" /> : `${totalTVL} USDC`}
              </div>
              <div className="flex items-center gap-1 text-xs text-green-500 mt-1">
                <TrendingUp className="h-3 w-3" />
                <span>+5.2% from last month</span>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Total Members</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{isLoading ? <Skeleton className="h-9 w-20" /> : totalMembers}</div>
              <div className="flex items-center gap-1 text-xs text-green-500 mt-1">
                <TrendingUp className="h-3 w-3" />
                <span>+12.8% from last month</span>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Average Claim Ratio</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{isLoading ? <Skeleton className="h-9 w-16" /> : avgClaimRatio}</div>
              <div className="flex items-center gap-1 text-xs text-red-500 mt-1">
                <TrendingDown className="h-3 w-3" />
                <span>+1.3% from last month</span>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Open Disputes</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{isLoading ? <Skeleton className="h-9 w-12" /> : "3"}</div>
              <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                <span>Requires attention</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Alerts section */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">System Alerts</h2>
            <Button variant="ghost" size="sm">
              Mark All as Read
            </Button>
          </div>

          {isLoading ? (
            <div className="space-y-4">
              <Skeleton className="h-[80px] rounded-xl" />
              <Skeleton className="h-[80px] rounded-xl" />
            </div>
          ) : alerts.length > 0 ? (
            <div className="space-y-4">
              {alerts.map((alert) => (
                <Alert key={alert.id} variant={alert.severity === "warning" ? "destructive" : "default"}>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertTitle className="flex items-center justify-between">
                    {alert.title}
                    <Badge variant="outline" className="ml-2">
                      {new Date(alert.timestamp).toLocaleDateString()}
                    </Badge>
                  </AlertTitle>
                  <AlertDescription>{alert.description}</AlertDescription>
                </Alert>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="flex items-center justify-center py-6 text-center">
                <p className="text-sm text-muted-foreground">No active alerts at this time</p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Managed Pools section */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">Managed Pools</h2>
            <Link href="/dashboard/admin/pools">
              <Button variant="ghost" size="sm" className="gap-1">
                View All <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>

          {isLoading ? (
            <Skeleton className="h-[300px] rounded-xl" />
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Pool Name</TableHead>
                    <TableHead className="hidden md:table-cell">TVL</TableHead>
                    <TableHead className="hidden md:table-cell">Members</TableHead>
                    <TableHead>Claim Ratio</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {poolsData.map((pool) => (
                    <TableRow key={pool.id}>
                      <TableCell className="font-medium">{pool.name}</TableCell>
                      <TableCell className="hidden md:table-cell">{pool.tvl}</TableCell>
                      <TableCell className="hidden md:table-cell">{pool.members}</TableCell>
                      <TableCell>{pool.claimRatio}</TableCell>
                      <TableCell>
                        <Badge
                          className={
                            pool.status === "Healthy"
                              ? "bg-green-500"
                              : pool.status === "Warning"
                                ? "bg-yellow-500"
                                : "bg-red-500"
                          }
                        >
                          {pool.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button size="sm">Manage</Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </div>

        {/* Recent Activity section */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">Recent Activity</h2>
            <Link href="/dashboard/admin/activity">
              <Button variant="ghost" size="sm" className="gap-1">
                View All <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>

          {isLoading ? (
            <Skeleton className="h-[200px] rounded-xl" />
          ) : (
            <Card>
              <CardContent className="p-0">
                <div className="divide-y">
                  {recentActivity.map((activity) => (
                    <div key={activity.id} className="flex items-center gap-4 p-4">
                      <div
                        className={`rounded-full p-2 
                        ${
                          activity.type === "policy"
                            ? "bg-blue-100 text-blue-600"
                            : activity.type === "claim"
                              ? "bg-green-100 text-green-600"
                              : activity.type === "dispute"
                                ? "bg-red-100 text-red-600"
                                : "bg-purple-100 text-purple-600"
                        }`}
                      >
                        <BarChart3 className="h-4 w-4" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm">{activity.description}</p>
                        <p className="text-xs text-muted-foreground">{new Date(activity.timestamp).toLocaleString()}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
