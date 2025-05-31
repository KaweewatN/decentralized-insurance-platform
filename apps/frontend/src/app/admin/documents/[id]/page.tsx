"use client"

import { useEffect, useState } from "react"
import { DocumentDetail } from "@/components/admin/document-detail"

interface DocumentHistoryItem {
  date: string
  action: string
  user: string
  notes?: string
}

interface DocumentData {
  id: string
  title: string
  description: string
  submittedBy: string
  submittedDate: string
  documentType: string
  status: "pending" | "approved" | "rejected"
  imageUrl: string
  claimId?: string
  policyId?: string
  history: DocumentHistoryItem[]
}

// Mock document data
const mockDocumentData: Record<string, DocumentData> = {
  "doc-001": {
    id: "doc-001",
    title: "Medical Report",
    description: "Hospital discharge summary",
    submittedBy: "0x1a2b...3c4d",
    submittedDate: "2023-05-10",
    documentType: "Medical Record",
    status: "pending",
    imageUrl: "/medical-report-concept.png",
    claimId: "claim-001",
    policyId: "policy-001",
    history: [
      {
        date: "2023-05-10T14:30:00Z",
        action: "Submitted",
        user: "0x1a2b...3c4d",
        notes: "Initial submission",
      },
    ],
  },
  "doc-002": {
    id: "doc-002",
    title: "Prescription",
    description: "Medication prescription from Dr. Smith",
    submittedBy: "0x5e6f...7g8h",
    submittedDate: "2023-05-11",
    documentType: "Prescription",
    status: "approved",
    imageUrl: "/prescription-pad.png",
    claimId: "claim-002",
    policyId: "policy-002",
    history: [
      {
        date: "2023-05-11T10:15:00Z",
        action: "Submitted",
        user: "0x5e6f...7g8h",
      },
      {
        date: "2023-05-12T09:30:00Z",
        action: "Approved",
        user: "Admin User",
        notes: "Valid prescription with all required information",
      },
    ],
  },
  "doc-003": {
    id: "doc-003",
    title: "Lab Test Results",
    description: "Blood work results from City Lab",
    submittedBy: "0x9i0j...1k2l",
    submittedDate: "2023-05-12",
    documentType: "Lab Results",
    status: "rejected",
    imageUrl: "/placeholder-09l43.png",
    claimId: "claim-003",
    policyId: "policy-003",
    history: [
      {
        date: "2023-05-12T16:45:00Z",
        action: "Submitted",
        user: "0x9i0j...1k2l",
      },
      {
        date: "2023-05-13T11:20:00Z",
        action: "Rejected",
        user: "Admin User",
        notes: "Document is illegible. Please resubmit a clearer scan.",
      },
    ],
  },
  "doc-004": {
    id: "doc-004",
    title: "Flight Ticket",
    description: "Boarding pass for delayed flight",
    submittedBy: "0x3m4n...5o6p",
    submittedDate: "2023-05-13",
    documentType: "Travel Document",
    status: "pending",
    imageUrl: "/placeholder-nh766.png",
    claimId: "claim-004",
    policyId: "policy-004",
    history: [
      {
        date: "2023-05-13T08:10:00Z",
        action: "Submitted",
        user: "0x3m4n...5o6p",
        notes: "Submitted for flight delay claim",
      },
    ],
  },
  "doc-005": {
    id: "doc-005",
    title: "Weather Report",
    description: "Official rainfall measurements",
    submittedBy: "0x7q8r...9s0t",
    submittedDate: "2023-05-14",
    documentType: "Weather Data",
    status: "pending",
    imageUrl: "/placeholder-wenql.png",
    claimId: "claim-005",
    policyId: "policy-005",
    history: [
      {
        date: "2023-05-14T13:25:00Z",
        action: "Submitted",
        user: "0x7q8r...9s0t",
        notes: "Official weather report from meteorological department",
      },
    ],
  },
}

export default function DocumentDetailPage({ params }: { params: { id: string } }) {
  const [document, setDocument] = useState<DocumentData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    // Simulate API fetch
    const fetchDocument = async () => {
      try {
        await new Promise((resolve) => setTimeout(resolve, 500)) // Simulate network delay

        const doc = mockDocumentData[params.id]
        if (doc) {
          setDocument(doc)
        } else {
          setError("Document not found")
        }
      } catch (err) {
        setError("Failed to load document details")
      } finally {
        setLoading(false)
      }
    }

    fetchDocument()
  }, [params.id])

  if (loading) {
    return (
      <div className="container mx-auto py-6">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
        </div>
      </div>
    )
  }

  if (error || !document) {
    return (
      <div className="container mx-auto py-6">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          <p>{error || "Document not found"}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-6">
      <DocumentDetail {...document} />
    </div>
  )
}
