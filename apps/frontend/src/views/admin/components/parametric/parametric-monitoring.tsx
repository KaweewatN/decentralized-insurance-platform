"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { AlertCircle, CloudRain, Eye, Filter, Plane, Search } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

// Mock data for parametric policies
const mockPolicies = [
  {
    id: "POL-F-001",
    type: "Flight",
    policyHolder: "0x1a2b...3c4d",
    createdAt: "2025-05-10",
    premium: "0.05 ETH",
    coverage: "0.5 ETH",
    status: "Active",
    details: {
      flightNumber: "UA123",
      departureDate: "2025-05-15",
      delayThreshold: "3 hours",
    },
  },
  {
    id: "POL-F-002",
    type: "Flight",
    policyHolder: "0x5e6f...7g8h",
    createdAt: "2025-05-11",
    premium: "0.04 ETH",
    coverage: "0.4 ETH",
    status: "PaidOut",
    details: {
      flightNumber: "BA456",
      departureDate: "2025-05-12",
      delayThreshold: "2 hours",
    },
  },
  {
    id: "POL-R-001",
    type: "Rainfall",
    policyHolder: "0x9i0j...1k2l",
    createdAt: "2025-05-09",
    premium: "0.08 ETH",
    coverage: "0.8 ETH",
    status: "ConditionNotMet",
    details: {
      zone: "Zone A",
      startDate: "2025-05-10",
      endDate: "2025-05-20",
      thresholdMm: "50 mm",
    },
  },
  {
    id: "POL-R-002",
    type: "Rainfall",
    policyHolder: "0x3m4n...5o6p",
    createdAt: "2025-05-08",
    premium: "0.06 ETH",
    coverage: "0.6 ETH",
    status: "Expired",
    details: {
      zone: "Zone B",
      startDate: "2025-05-01",
      endDate: "2025-05-08",
      thresholdMm: "40 mm",
    },
  },
]

export function ParametricMonitoring() {
  const [policies, setPolicies] = useState(mockPolicies)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [typeFilter, setTypeFilter] = useState("all")
  const [selectedPolicy, setSelectedPolicy] = useState<any>(null)

  // Filter policies based on search term and filters
  const filteredPolicies = policies.filter((policy) => {
    const matchesSearch =
      policy.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      policy.policyHolder.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesStatus = statusFilter === "all" || policy.status === statusFilter
    const matchesType = typeFilter === "all" || policy.type === typeFilter

    return matchesSearch && matchesStatus && matchesType
  })

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case "Active":
        return "default"
      case "PaidOut":
        return "success"
      case "ConditionNotMet":
        return "warning"
      case "Expired":
        return "secondary"
      default:
        return "outline"
    }
  }

  const viewPolicyDetails = (policy: any) => {
    setSelectedPolicy(policy)
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Parametric Policies</CardTitle>
        <CardDescription>Monitor the status of all parametric insurance policies</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-4 sm:flex-row">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by policy ID or wallet address"
                className="pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex gap-2">
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="w-[140px]">
                  <Filter className="mr-2 h-4 w-4" />
                  <span>Type</span>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="Flight">Flight</SelectItem>
                  <SelectItem value="Rainfall">Rainfall</SelectItem>
                </SelectContent>
              </Select>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[140px]">
                  <Filter className="mr-2 h-4 w-4" />
                  <span>Status</span>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="Active">Active</SelectItem>
                  <SelectItem value="PaidOut">Paid Out</SelectItem>
                  <SelectItem value="ConditionNotMet">Condition Not Met</SelectItem>
                  <SelectItem value="Expired">Expired</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <Tabs defaultValue="all">
            <TabsList>
              <TabsTrigger value="all">All Policies</TabsTrigger>
              <TabsTrigger value="flight">Flight Policies</TabsTrigger>
              <TabsTrigger value="rainfall">Rainfall Policies</TabsTrigger>
            </TabsList>

            <TabsContent value="all">
              {renderPoliciesTable(filteredPolicies, getStatusBadgeVariant, viewPolicyDetails)}
            </TabsContent>

            <TabsContent value="flight">
              {renderPoliciesTable(
                filteredPolicies.filter((p) => p.type === "Flight"),
                getStatusBadgeVariant,
                viewPolicyDetails,
              )}
            </TabsContent>

            <TabsContent value="rainfall">
              {renderPoliciesTable(
                filteredPolicies.filter((p) => p.type === "Rainfall"),
                getStatusBadgeVariant,
                viewPolicyDetails,
              )}
            </TabsContent>
          </Tabs>
        </div>

        {/* Policy Details Dialog */}
        <Dialog>
          <DialogContent className="sm:max-w-md">
            {selectedPolicy && (
              <>
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2">
                    {selectedPolicy.type === "Flight" ? (
                      <Plane className="h-5 w-5" />
                    ) : (
                      <CloudRain className="h-5 w-5" />
                    )}
                    Policy Details: {selectedPolicy.id}
                  </DialogTitle>
                  <DialogDescription>{selectedPolicy.type} Parametric Insurance Policy</DialogDescription>
                </DialogHeader>

                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-4 items-center gap-4">
                    <span className="text-sm font-medium col-span-1">Policy Holder:</span>
                    <span className="col-span-3">{selectedPolicy.policyHolder}</span>
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <span className="text-sm font-medium col-span-1">Created:</span>
                    <span className="col-span-3">{selectedPolicy.createdAt}</span>
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <span className="text-sm font-medium col-span-1">Premium:</span>
                    <span className="col-span-3">{selectedPolicy.premium}</span>
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <span className="text-sm font-medium col-span-1">Coverage:</span>
                    <span className="col-span-3">{selectedPolicy.coverage}</span>
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <span className="text-sm font-medium col-span-1">Status:</span>
                    <span className="col-span-3">
                      <Badge variant={getStatusBadgeVariant(selectedPolicy.status)}>{selectedPolicy.status}</Badge>
                    </span>
                  </div>

                  <div className="border-t pt-4 mt-2">
                    <h4 className="font-medium mb-2">Policy Specific Details</h4>
                    {selectedPolicy.type === "Flight" ? (
                      <>
                        <div className="grid grid-cols-4 items-center gap-4">
                          <span className="text-sm font-medium col-span-1">Flight:</span>
                          <span className="col-span-3">{selectedPolicy.details.flightNumber}</span>
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                          <span className="text-sm font-medium col-span-1">Departure:</span>
                          <span className="col-span-3">{selectedPolicy.details.departureDate}</span>
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                          <span className="text-sm font-medium col-span-1">Threshold:</span>
                          <span className="col-span-3">{selectedPolicy.details.delayThreshold}</span>
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="grid grid-cols-4 items-center gap-4">
                          <span className="text-sm font-medium col-span-1">Zone:</span>
                          <span className="col-span-3">{selectedPolicy.details.zone}</span>
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                          <span className="text-sm font-medium col-span-1">Period:</span>
                          <span className="col-span-3">
                            {selectedPolicy.details.startDate} to {selectedPolicy.details.endDate}
                          </span>
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                          <span className="text-sm font-medium col-span-1">Threshold:</span>
                          <span className="col-span-3">{selectedPolicy.details.thresholdMm}</span>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </>
            )}
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  )
}

function renderPoliciesTable(
  policies: any[],
  getStatusBadgeVariant: (status: string) => string,
  viewPolicyDetails: (policy: any) => void,
) {
  if (policies.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-8 text-center">
        <AlertCircle className="h-10 w-10 text-muted-foreground mb-4" />
        <h3 className="text-lg font-semibold">No policies found</h3>
        <p className="text-muted-foreground mt-1">Try adjusting your search or filters</p>
      </div>
    )
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Policy ID</TableHead>
          <TableHead>Type</TableHead>
          <TableHead>Policy Holder</TableHead>
          <TableHead>Created</TableHead>
          <TableHead>Premium</TableHead>
          <TableHead>Status</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {policies.map((policy) => (
          <TableRow key={policy.id}>
            <TableCell className="font-medium">{policy.id}</TableCell>
            <TableCell>
              {policy.type === "Flight" ? (
                <div className="flex items-center gap-1">
                  <Plane className="h-4 w-4" />
                  <span>Flight</span>
                </div>
              ) : (
                <div className="flex items-center gap-1">
                  <CloudRain className="h-4 w-4" />
                  <span>Rainfall</span>
                </div>
              )}
            </TableCell>
            <TableCell>{policy.policyHolder}</TableCell>
            <TableCell>{policy.createdAt}</TableCell>
            <TableCell>{policy.premium}</TableCell>
            <TableCell>
              <Badge variant={getStatusBadgeVariant(policy.status)}>{policy.status}</Badge>
            </TableCell>
            <TableCell className="text-right">
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm" onClick={() => viewPolicyDetails(policy)}>
                    <Eye className="h-4 w-4 mr-1" />
                    View
                  </Button>
                </DialogTrigger>
              </Dialog>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}
