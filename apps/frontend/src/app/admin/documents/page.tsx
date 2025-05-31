"use client"

import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { DocumentReviewCard } from "@/components/admin/document-review-card"
import { Search, Filter } from "lucide-react"

// Mock data
const mockDocuments = [
  {
    id: "doc-001",
    title: "Medical Report",
    description: "Hospital discharge summary",
    submittedBy: "0x1a2b...3c4d",
    submittedDate: "2023-05-10",
    documentType: "Medical Record",
    status: "pending" as const,
    imageUrl: "/medical-report-concept.png",
    claimId: "claim-001",
  },
  {
    id: "doc-002",
    title: "Prescription",
    description: "Medication prescription from Dr. Smith",
    submittedBy: "0x5e6f...7g8h",
    submittedDate: "2023-05-11",
    documentType: "Prescription",
    status: "approved" as const,
    imageUrl: "/prescription-pad.png",
    claimId: "claim-002",
  },
  {
    id: "doc-003",
    title: "Lab Test Results",
    description: "Blood work results from City Lab",
    submittedBy: "0x9i0j...1k2l",
    submittedDate: "2023-05-12",
    documentType: "Lab Results",
    status: "rejected" as const,
    imageUrl: "/placeholder-09l43.png",
    claimId: "claim-003",
  },
  {
    id: "doc-004",
    title: "Flight Ticket",
    description: "Boarding pass for delayed flight",
    submittedBy: "0x3m4n...5o6p",
    submittedDate: "2023-05-13",
    documentType: "Travel Document",
    status: "pending" as const,
    imageUrl: "/placeholder-nh766.png",
    claimId: "claim-004",
  },
  {
    id: "doc-005",
    title: "Weather Report",
    description: "Official rainfall measurements",
    submittedBy: "0x7q8r...9s0t",
    submittedDate: "2023-05-14",
    documentType: "Weather Data",
    status: "pending" as const,
    imageUrl: "/placeholder-wenql.png",
    claimId: "claim-005",
  },
]

export default function DocumentsPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [activeTab, setActiveTab] = useState("pending")

  const filteredDocuments = mockDocuments.filter((doc) => {
    // Filter by status based on active tab
    if (activeTab !== "all" && doc.status !== activeTab) {
      return false
    }

    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      return (
        doc.title.toLowerCase().includes(query) ||
        doc.description.toLowerCase().includes(query) ||
        doc.submittedBy.toLowerCase().includes(query) ||
        doc.documentType.toLowerCase().includes(query)
      )
    }

    return true
  })

  const pendingCount = mockDocuments.filter((doc) => doc.status === "pending").length
  const approvedCount = mockDocuments.filter((doc) => doc.status === "approved").length
  const rejectedCount = mockDocuments.filter((doc) => doc.status === "rejected").length

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold">Document Review</h1>
          <p className="text-gray-500">Review and manage submitted documents</p>
        </div>
        <div className="flex gap-2 w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
            <Input
              placeholder="Search documents..."
              className="pl-8"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Button variant="outline">
            <Filter className="h-4 w-4 mr-2" />
            Filter
          </Button>
        </div>
      </div>

      <Tabs defaultValue="pending" onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="pending">Pending Review ({pendingCount})</TabsTrigger>
          <TabsTrigger value="approved">Approved ({approvedCount})</TabsTrigger>
          <TabsTrigger value="rejected">Rejected ({rejectedCount})</TabsTrigger>
          <TabsTrigger value="all">All Documents ({mockDocuments.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="pending" className="mt-6">
          {filteredDocuments.length > 0 ? (
            <div className="grid grid-cols-1 gap-6">
              {filteredDocuments.map((doc) => (
                <DocumentReviewCard
                  key={doc.id}
                  id={doc.id}
                  title={doc.title}
                  description={doc.description}
                  type={doc.documentType}
                  documentType={doc.documentType}
                  submittedBy={doc.submittedBy}
                  submittedDate={doc.submittedDate}
                  status={doc.status}
                  imageUrl={doc.imageUrl}
                  claimId={doc.claimId}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-500">No pending documents found.</p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="approved" className="mt-6">
          {filteredDocuments.length > 0 ? (
            <div className="grid grid-cols-1 gap-6">
              {filteredDocuments.map((doc) => (
                <DocumentReviewCard
                  key={doc.id}
                  id={doc.id}
                  title={doc.title}
                  description={doc.description}
                  type={doc.documentType}
                  documentType={doc.documentType}
                  submittedBy={doc.submittedBy}
                  submittedDate={doc.submittedDate}
                  status={doc.status}
                  imageUrl={doc.imageUrl}
                  claimId={doc.claimId}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-500">No approved documents found.</p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="rejected" className="mt-6">
          {filteredDocuments.length > 0 ? (
            <div className="grid grid-cols-1 gap-6">
              {filteredDocuments.map((doc) => (
                <DocumentReviewCard
                  key={doc.id}
                  id={doc.id}
                  title={doc.title}
                  description={doc.description}
                  type={doc.documentType}
                  documentType={doc.documentType}
                  submittedBy={doc.submittedBy}
                  submittedDate={doc.submittedDate}
                  status={doc.status}
                  imageUrl={doc.imageUrl}
                  claimId={doc.claimId}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-500">No rejected documents found.</p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="all" className="mt-6">
          {filteredDocuments.length > 0 ? (
            <div className="grid grid-cols-1 gap-6">
              {filteredDocuments.map((doc) => (
                <DocumentReviewCard
                  key={doc.id}
                  id={doc.id}
                  title={doc.title}
                  description={doc.description}
                  type={doc.documentType}
                  documentType={doc.documentType}
                  submittedBy={doc.submittedBy}
                  submittedDate={doc.submittedDate}
                  status={doc.status}
                  imageUrl={doc.imageUrl}
                  claimId={doc.claimId}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-500">No documents found matching your search.</p>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
