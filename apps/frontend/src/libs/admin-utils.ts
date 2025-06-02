// List of wallet addresses that have admin privileges
// In a real application, this would be stored in a database or smart contract
const ADMIN_ADDRESSES: string[] = [
  "0xf3B4a7d3C0a3C539F091B4c8e8F9cC4e730D2f98", // Example admin address - this matches the mock wallet in dashboard
  "0x742d35Cc6634C0532925a3b844Bc454e4438f44e", // Example admin address
]

/**
 * Check if a wallet address has admin privileges
 * @param address The wallet address to check
 * @returns True if the address has admin privileges, false otherwise
 */
export function isAdmin(address: string | null | undefined): boolean {
  if (!address) return false
  return ADMIN_ADDRESSES.some((admin) => admin.toLowerCase() === address.toLowerCase())
}

/**
 * Check if a wallet address has admin privileges
 * @param address The wallet address to check
 * @returns True if the address has admin privileges, false otherwise
 */
export function isAdminWallet(address: string | null | undefined): boolean {
  if (!address) return false
  return ADMIN_ADDRESSES.some((admin) => admin.toLowerCase() === address.toLowerCase())
}

// Mock application data
const mockApplications = [
  {
    id: "app-001",
    type: "Health",
    userId: "user-123",
    userWallet: "0x1a2b...3c4d",
    status: "pending",
    submittedAt: new Date().toISOString(),
    riskScore: 75,
    preliminaryPremium: 120.0,
    personalInfo: {
      fullName: "John Doe",
      dateOfBirth: "1990-01-01",
      gender: "Male",
      email: "john.doe@example.com",
      phone: "+15551234567",
      address: "123 Main St, Anytown, USA",
      occupation: "Software Engineer",
    },
    healthInfo: {
      height: 180,
      weight: 80,
      smoker: false,
      alcoholConsumption: "Occasionally",
      exerciseFrequency: "Regularly",
      preExistingConditions: [],
      medications: [],
      familyHistory: [],
    },
    coverageDetails: {
      planType: "Gold",
      sumAssured: 50000,
      term: 12,
      paymentFrequency: "Monthly",
    },
  },
  {
    id: "app-002",
    type: "Flight",
    userId: "user-456",
    userWallet: "0x5e6f...7g8h",
    status: "pending",
    submittedAt: new Date(Date.now() - 86400000).toISOString(),
    riskScore: 25,
    preliminaryPremium: 15.0,
    personalInfo: {
      fullName: "Jane Smith",
      dateOfBirth: "1985-05-15",
      gender: "Female",
      email: "jane.smith@example.com",
      phone: "+15557654321",
      address: "456 Elm St, Anytown, USA",
      occupation: "Teacher",
    },
    flightDetails: {
      flightNumber: "AA123",
      departureDate: new Date(Date.now() + 7 * 86400000).toISOString(),
      departureAirport: "JFK",
      arrivalAirport: "LAX",
    },
    coverageDetails: {
      planType: "Basic",
      sumAssured: 200,
      term: 1,
      paymentFrequency: "One-time",
    },
  },
  {
    id: "app-003",
    type: "Rainfall",
    userId: "user-789",
    userWallet: "0x9a8b...7c6d",
    status: "pending",
    submittedAt: new Date(Date.now() - 2 * 86400000).toISOString(),
    riskScore: 40,
    preliminaryPremium: 75.0,
    personalInfo: {
      fullName: "Robert Johnson",
      dateOfBirth: "1975-08-22",
      gender: "Male",
      email: "robert.johnson@example.com",
      phone: "+15559876543",
      address: "789 Oak St, Anytown, USA",
      occupation: "Farmer",
    },
    rainfallDetails: {
      location: "Farmland County",
      cropType: "Corn",
      acreage: 50,
      coveragePeriod: "May 2023 - September 2023",
    },
    coverageDetails: {
      planType: "Premium",
      sumAssured: 10000,
      term: 5,
      paymentFrequency: "Monthly",
    },
  },
]

// Mock function to get pending applications
export async function getPendingApplications() {
  // In a real app, this would fetch from an API or blockchain
  return mockApplications
}

// Mock function to get a specific application
export async function getApplication(id: string) {
  return mockApplications.find((app) => app.id === id) || null
}

// Mock function to process an application
export async function processApplication(id: string, status: string, amount?: number, notes?: string) {
  // In a real app, this would update a database or blockchain
  console.log(`Application ${id} ${status} with amount: ${amount || "N/A"} and notes: ${notes || "none"}`)
  return { success: true }
}

// Mock function to get pending documents
export async function getPendingDocuments() {
  // In a real app, this would fetch from an API or blockchain
  return [
    {
      id: "doc-1",
      title: "ID Verification Document",
      description: "Government-issued ID for verification",
      documentType: "ID Verification",
      policyId: "POL-HEALTH-001",
      userId: "user-123",
      submittedBy: "0x1a2b...3c4d",
      submittedDate: new Date().toISOString().split("T")[0],
      status: "pending",
      imageUrl: "/document-stack.png",
      claimId: "claim-001",
    },
    {
      id: "doc-2",
      title: "Medical Report",
      description: "Hospital medical report",
      documentType: "Medical Report",
      policyId: "POL-HEALTH-002",
      userId: "user-456",
      submittedBy: "0x5e6f...7g8h",
      submittedDate: new Date(Date.now() - 86400000).toISOString().split("T")[0],
      status: "pending",
      imageUrl: "/medical-report-concept.png",
      claimId: "claim-002",
    },
    {
      id: "doc-3",
      title: "Proof of Address",
      description: "Utility bill as proof of address",
      documentType: "Proof of Address",
      policyId: "POL-HEALTH-003",
      userId: "user-789",
      submittedBy: "0x9i0j...1k2l",
      submittedDate: new Date(Date.now() - 172800000).toISOString().split("T")[0],
      status: "pending",
      imageUrl: "/placeholder-09l43.png",
      claimId: "claim-003",
    },
  ]
}

// Mock function to get a specific document
export async function getDocument(id: string) {
  const documents = await getPendingDocuments()
  return documents.find((doc) => doc.id === id) || null
}

// Mock function to get pending claims
export async function getPendingClaims() {
  // In a real app, this would fetch from an API or blockchain
  return [
    {
      id: "claim-1",
      title: "Health Insurance Claim",
      type: "Health",
      policyId: "POL-HEALTH-001",
      userId: "user-123",
      status: "pending",
      amount: 500.0,
      submittedAt: new Date().toISOString(),
      description: "Hospital visit for flu treatment",
      documents: [
        { id: "doc-1", type: "Medical Bill", url: "/placeholder-nh766.png" },
        { id: "doc-2", type: "Doctor Report", url: "/placeholder-wenql.png" },
      ],
    },
    {
      id: "claim-2",
      title: "Health Insurance Claim",
      type: "Health",
      policyId: "POL-HEALTH-002",
      userId: "user-456",
      status: "pending",
      amount: 1200.0,
      submittedAt: new Date(Date.now() - 86400000).toISOString(),
      description: "Surgery procedure",
      documents: [
        { id: "doc-3", type: "Hospital Invoice", url: "/placeholder-7w6qc.png" },
        { id: "doc-4", type: "Surgery Report", url: "/placeholder-20w9i.png" },
      ],
    },
    {
      id: "claim-3",
      title: "Health Insurance Claim",
      type: "Health",
      policyId: "POL-HEALTH-003",
      userId: "user-789",
      status: "pending",
      amount: 300.0,
      submittedAt: new Date(Date.now() - 172800000).toISOString(),
      description: "Prescription medication",
      documents: [
        { id: "doc-5", type: "Pharmacy Receipt", url: "/placeholder-hmfds.png" },
        { id: "doc-6", type: "Prescription", url: "/prescription-pad.png" },
      ],
    },
  ]
}

// Mock function to get a specific claim
export async function getClaim(id: string) {
  const claims = await getPendingClaims()
  return claims.find((claim) => claim.id === id) || null
}

// Mock function to update document status
export async function updateDocumentStatus(id: string, status: "approved" | "rejected", notes?: string) {
  // In a real app, this would update a database or blockchain
  console.log(`Document ${id} ${status} with notes: ${notes || "none"}`)
  return { success: true }
}

// Mock function to process a claim
export async function processClaim(id: string, status: "approved" | "rejected", amount?: number, notes?: string) {
  // In a real app, this would update a database or blockchain
  console.log(`Claim ${id} ${status} with amount: ${amount || "N/A"} and notes: ${notes || "none"}`)
  return { success: true }
}

/**
 * Types of documents that can be uploaded and require admin approval
 */
export enum DocumentType {
  IDENTITY = "identity",
  MEDICAL = "medical",
  PROOF_OF_CLAIM = "proof_of_claim",
  POLICY_APPLICATION = "policy_application",
}

/**
 * Status of a document
 */
export enum DocumentStatus {
  PENDING = "pending",
  APPROVED = "approved",
  REJECTED = "rejected",
}

/**
 * Status of a claim
 */
export enum ClaimStatus {
  SUBMITTED = "submitted",
  UNDER_REVIEW = "under_review",
  ADDITIONAL_INFO_REQUIRED = "additional_info_required",
  APPROVED = "approved",
  REJECTED = "rejected",
  PAYMENT_PROCESSING = "payment_processing",
  PAID = "paid",
}

// Get admin dashboard stats
export async function getAdminStats() {
  return {
    pendingDocuments: 12,
    pendingClaims: 8,
    pendingApplications: 15,
    approvedClaims: 45,
    rejectedClaims: 7,
    totalPolicies: 120,
    activePolicies: 98,
    recentOracleEvents: 5,
  }
}

// Mock function to get oracle events
export async function getOracleEvents() {
  return [
    {
      id: "event-1",
      type: "Flight Delay",
      flightNumber: "AA123",
      timestamp: new Date().toISOString(),
      data: { delayMinutes: 120, status: "Delayed" },
      affectedPolicies: 3,
    },
    {
      id: "event-2",
      type: "Rainfall",
      location: "Farmland County",
      timestamp: new Date(Date.now() - 86400000).toISOString(),
      data: { millimeters: 35.2, status: "Above Threshold" },
      affectedPolicies: 7,
    },
    {
      id: "event-3",
      type: "Flight Cancellation",
      flightNumber: "UA456",
      timestamp: new Date(Date.now() - 2 * 86400000).toISOString(),
      data: { status: "Cancelled", reason: "Weather" },
      affectedPolicies: 5,
    },
  ]
}

// Mock function to get parametric policies
export async function getParametricPolicies() {
  return [
    {
      id: "para-pol-1",
      type: "Flight",
      userId: "user-123",
      status: "active",
      createdAt: new Date(Date.now() - 30 * 86400000).toISOString(),
      details: {
        flightNumber: "AA123",
        departureDate: new Date(Date.now() + 7 * 86400000).toISOString(),
        coverage: "Delay > 2 hours",
        premium: 25.0,
        payout: 200.0,
      },
    },
    {
      id: "para-pol-2",
      type: "Rainfall",
      userId: "user-456",
      status: "active",
      createdAt: new Date(Date.now() - 45 * 86400000).toISOString(),
      details: {
        location: "Farmland County",
        period: "May-Sep 2023",
        coverage: "Rainfall < 100mm",
        premium: 150.0,
        payout: 1500.0,
      },
    },
    {
      id: "para-pol-3",
      type: "Flight",
      userId: "user-789",
      status: "expired",
      createdAt: new Date(Date.now() - 60 * 86400000).toISOString(),
      details: {
        flightNumber: "UA456",
        departureDate: new Date(Date.now() - 5 * 86400000).toISOString(),
        coverage: "Cancellation",
        premium: 30.0,
        payout: 300.0,
      },
    },
  ]
}

// Mock function to update parametric configuration
export async function updateParametricConfig(type: string, config: any) {
  console.log(`Updating ${type} parametric config:`, config)
  return { success: true }
}
