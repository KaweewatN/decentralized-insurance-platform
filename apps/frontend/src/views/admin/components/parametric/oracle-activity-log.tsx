"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { AlertCircle, Calendar, ChevronDown, ChevronUp, Database, Filter, Search } from "lucide-react"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"

// Mock data for oracle activity logs
const mockOracleActivity = [
  {
    id: "LOG-001",
    timestamp: "2025-05-15 14:30:22",
    type: "Flight",
    action: "Data Request",
    status: "Success",
    details: {
      requestId: "REQ-F-001",
      flightNumber: "UA123",
      date: "2025-05-15",
      response: {
        status: "Delayed",
        delayMinutes: 240,
        actualDeparture: "2025-05-15 18:45:00",
      },
      affectedPolicies: ["POL-F-001"],
      transaction: {
        hash: "0x1a2b3c4d5e6f7g8h9i0j",
        blockNumber: 12345678,
        gasUsed: "45000",
      },
    },
  },
  {
    id: "LOG-002",
    timestamp: "2025-05-15 14:31:05",
    type: "Flight",
    action: "Payout Triggered",
    status: "Success",
    details: {
      requestId: "REQ-F-001",
      policyId: "POL-F-001",
      payoutAmount: "0.5 ETH",
      recipient: "0x1a2b...3c4d",
      transaction: {
        hash: "0x9i8h7g6f5e4d3c2b1a0",
        blockNumber: 12345679,
        gasUsed: "65000",
      },
    },
  },
  {
    id: "LOG-003",
    timestamp: "2025-05-14 09:15:33",
    type: "Rainfall",
    action: "Data Request",
    status: "Success",
    details: {
      requestId: "REQ-R-001",
      zone: "Zone A",
      period: "2025-05-10 to 2025-05-20",
      response: {
        totalRainfall: 35,
        threshold: 50,
        conditionMet: false,
      },
      affectedPolicies: ["POL-R-001"],
      transaction: {
        hash: "0x2b3c4d5e6f7g8h9i0j1a",
        blockNumber: 12345670,
        gasUsed: "42000",
      },
    },
  },
  {
    id: "LOG-004",
    timestamp: "2025-05-14 09:16:12",
    type: "Rainfall",
    action: "Condition Not Met",
    status: "Success",
    details: {
      requestId: "REQ-R-001",
      policyId: "POL-R-001",
      reason: "Rainfall below threshold (35mm < 50mm)",
      transaction: {
        hash: "0x8h9i0j1a2b3c4d5e6f7g",
        blockNumber: 12345671,
        gasUsed: "38000",
      },
    },
  },
  {
    id: "LOG-005",
    timestamp: "2025-05-13 16:45:09",
    type: "Flight",
    action: "Data Request",
    status: "Error",
    details: {
      requestId: "REQ-F-002",
      flightNumber: "SQ789",
      date: "2025-05-13",
      error: "Oracle data source unavailable",
      retryScheduled: true,
    },
  },
]

export function OracleActivityLog() {
  const [logs, setLogs] = useState(mockOracleActivity)
  const [searchTerm, setSearchTerm] = useState("")
  const [typeFilter, setTypeFilter] = useState("all")
  const [actionFilter, setActionFilter] = useState("all")
  const [statusFilter, setStatusFilter] = useState("all")
  const [expandedLogs, setExpandedLogs] = useState<string[]>([])

  // Filter logs based on search term and filters
  const filteredLogs = logs.filter((log) => {
    const matchesSearch =
      log.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (log.details.requestId && log.details.requestId.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (log.details.policyId && log.details.policyId.toLowerCase().includes(searchTerm.toLowerCase()))

    const matchesType = typeFilter === "all" || log.type === typeFilter
    const matchesAction = actionFilter === "all" || log.action === actionFilter
    const matchesStatus = statusFilter === "all" || log.status === statusFilter

    return matchesSearch && matchesType && matchesAction && matchesStatus
  })

  const toggleLogExpansion = (logId: string) => {
    setExpandedLogs((prev) => (prev.includes(logId) ? prev.filter((id) => id !== logId) : [...prev, logId]))
  }

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case "Success":
        return "success"
      case "Error":
        return "destructive"
      case "Warning":
        return "warning"
      default:
        return "outline"
    }
  }

  // Get unique action types for filter
  const actionTypes = Array.from(new Set(logs.map((log) => log.action)))

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Database className="h-5 w-5" />
          Oracle Activity Log
        </CardTitle>
        <CardDescription>Monitor oracle data requests and blockchain interactions</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-4 sm:flex-row">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by log ID, request ID, or policy ID"
                className="pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex flex-wrap gap-2">
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="w-[120px]">
                  <Filter className="mr-2 h-4 w-4" />
                  <span>Type</span>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="Flight">Flight</SelectItem>
                  <SelectItem value="Rainfall">Rainfall</SelectItem>
                </SelectContent>
              </Select>

              <Select value={actionFilter} onValueChange={setActionFilter}>
                <SelectTrigger className="w-[160px]">
                  <Filter className="mr-2 h-4 w-4" />
                  <span>Action</span>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Actions</SelectItem>
                  {actionTypes.map((action) => (
                    <SelectItem key={action} value={action}>
                      {action}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[120px]">
                  <Filter className="mr-2 h-4 w-4" />
                  <span>Status</span>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="Success">Success</SelectItem>
                  <SelectItem value="Error">Error</SelectItem>
                  <SelectItem value="Warning">Warning</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {filteredLogs.length > 0 ? (
            <div className="border rounded-md">
              {filteredLogs.map((log) => (
                <Collapsible
                  key={log.id}
                  open={expandedLogs.includes(log.id)}
                  onOpenChange={() => toggleLogExpansion(log.id)}
                  className="border-b last:border-b-0"
                >
                  <div className="flex items-center justify-between p-4 hover:bg-muted/50 cursor-pointer">
                    <div className="grid grid-cols-1 md:grid-cols-5 gap-2 w-full">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-sm">{log.id}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">{log.timestamp}</span>
                      </div>
                      <div>
                        <Badge variant="outline">{log.type}</Badge>
                      </div>
                      <div>
                        <span className="text-sm">{log.action}</span>
                      </div>
                      <div>
                        <Badge variant={getStatusBadgeVariant(log.status)}>{log.status}</Badge>
                      </div>
                    </div>
                    <CollapsibleTrigger asChild>
                      <Button variant="ghost" size="sm">
                        {expandedLogs.includes(log.id) ? (
                          <ChevronUp className="h-4 w-4" />
                        ) : (
                          <ChevronDown className="h-4 w-4" />
                        )}
                      </Button>
                    </CollapsibleTrigger>
                  </div>
                  <CollapsibleContent>
                    <div className="p-4 pt-0 bg-muted/20">
                      <div className="rounded-md bg-muted p-4 font-mono text-sm">
                        <pre className="whitespace-pre-wrap break-all">{JSON.stringify(log.details, null, 2)}</pre>
                      </div>
                    </div>
                  </CollapsibleContent>
                </Collapsible>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <AlertCircle className="h-10 w-10 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold">No activity logs found</h3>
              <p className="text-muted-foreground mt-1">Try adjusting your search or filters</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
