"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, Upload, CheckCircle, AlertCircle } from "lucide-react"
import Link from "next/link"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

// Mock policies for selection
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

export default function ClaimSubmissionWizard() {
  const router = useRouter()

  // Wizard state
  const [step, setStep] = useState<number>(1)
  const [selectedPolicy, setSelectedPolicy] = useState<string>("")
  const [claimDetails, setClaimDetails] = useState({
    incidentDate: "",
    claimAmount: "",
    description: "",
    evidenceType: "document",
  })
  const [files, setFiles] = useState<File[]>([])
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<boolean>(false)

  // Handle policy selection
  const handlePolicySelect = (policyId: string) => {
    setSelectedPolicy(policyId)
  }

  // Handle form input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setClaimDetails((prev) => ({ ...prev, [name]: value }))
  }

  // Handle evidence type selection
  const handleEvidenceTypeChange = (value: string) => {
    setClaimDetails((prev) => ({ ...prev, evidenceType: value }))
  }

  // Handle file upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFiles(Array.from(e.target.files))
    }
  }

  // Handle next step
  const handleNextStep = () => {
    if (step === 1 && !selectedPolicy) {
      setError("Please select a policy to continue")
      return
    }

    if (step === 2) {
      if (!claimDetails.incidentDate) {
        setError("Please enter the incident date")
        return
      }
      if (!claimDetails.claimAmount) {
        setError("Please enter the claim amount")
        return
      }
      if (!claimDetails.description) {
        setError("Please provide a description of the incident")
        return
      }
    }

    if (step === 3 && files.length === 0) {
      setError("Please upload at least one evidence file")
      return
    }

    setError(null)
    setStep((prev) => prev + 1)
  }

  // Handle previous step
  const handlePrevStep = () => {
    setStep((prev) => prev - 1)
  }

  // Handle claim submission
  const handleSubmitClaim = async () => {
    setIsSubmitting(true)
    setError(null)

    try {
      // Simulate IPFS upload
      console.log("Uploading files to IPFS...")

      // Simulate blockchain transaction
      console.log("Submitting claim to ClaimManager contract...")

      // Simulate transaction delay
      await new Promise((resolve) => setTimeout(resolve, 2000))

      // Success
      setSuccess(true)

      // Redirect after a delay
      setTimeout(() => {
        router.push("/dashboard/claims")
      }, 3000)
    } catch (err) {
      setError("An error occurred while submitting your claim. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  // Render step 1: Policy selection
  const renderStep1 = () => (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-medium">Step 1: Select Policy</h2>
        <p className="text-sm text-muted-foreground">Choose the policy you want to file a claim for</p>
      </div>

      <div className="space-y-4">
        {mockPolicies.map((policy) => (
          <div
            key={policy.id}
            className={`rounded-lg border p-4 cursor-pointer transition-colors ${
              selectedPolicy === policy.id ? "border-primary bg-primary/5" : "hover:bg-muted/50"
            }`}
            onClick={() => handlePolicySelect(policy.id)}
          >
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium">{policy.name}</h3>
                <p className="text-sm text-muted-foreground">Policy ID: {policy.id}</p>
              </div>
              <RadioGroup value={selectedPolicy}>
                <RadioGroupItem value={policy.id} id={policy.id} />
              </RadioGroup>
            </div>
            <div className="mt-2 grid grid-cols-2 gap-2 text-sm">
              <div>
                <p className="text-muted-foreground">Coverage</p>
                <p>{policy.coverageAmount}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Expires</p>
                <p>{policy.expiryDate}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
    </div>
  )

  // Render step 2: Claim details
  const renderStep2 = () => (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-medium">Step 2: Claim Details</h2>
        <p className="text-sm text-muted-foreground">Provide information about your claim</p>
      </div>

      <div className="space-y-4">
        <div className="grid gap-2">
          <Label htmlFor="incidentDate">Incident Date</Label>
          <Input
            id="incidentDate"
            name="incidentDate"
            type="date"
            value={claimDetails.incidentDate}
            onChange={handleInputChange}
          />
        </div>

        <div className="grid gap-2">
          <Label htmlFor="claimAmount">Claim Amount (USDC)</Label>
          <Input
            id="claimAmount"
            name="claimAmount"
            type="number"
            placeholder="Enter amount in USDC"
            value={claimDetails.claimAmount}
            onChange={handleInputChange}
          />
        </div>

        <div className="grid gap-2">
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            name="description"
            placeholder="Describe what happened and why you're filing this claim"
            rows={4}
            value={claimDetails.description}
            onChange={handleInputChange}
          />
        </div>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
    </div>
  )

  // Render step 3: Evidence upload
  const renderStep3 = () => (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-medium">Step 3: Evidence Upload</h2>
        <p className="text-sm text-muted-foreground">Upload evidence to support your claim</p>
      </div>

      <div className="space-y-4">
        <div className="grid gap-2">
          <Label htmlFor="evidenceType">Evidence Type</Label>
          <Select value={claimDetails.evidenceType} onValueChange={handleEvidenceTypeChange}>
            <SelectTrigger>
              <SelectValue placeholder="Select evidence type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="document">Document</SelectItem>
              <SelectItem value="image">Image</SelectItem>
              <SelectItem value="video">Video</SelectItem>
              <SelectItem value="other">Other</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="grid gap-2">
          <Label htmlFor="evidenceFiles">Upload Files</Label>
          <div className="border-2 border-dashed rounded-lg p-6 text-center">
            <Upload className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
            <p className="text-sm text-muted-foreground mb-2">Drag and drop files here, or click to browse</p>
            <p className="text-xs text-muted-foreground mb-4">Supported formats: PDF, JPG, PNG, MP4 (Max 10MB)</p>
            <Input id="evidenceFiles" type="file" multiple className="hidden" onChange={handleFileUpload} />
            <Button variant="outline" onClick={() => document.getElementById("evidenceFiles")?.click()}>
              Browse Files
            </Button>
          </div>
        </div>

        {files.length > 0 && (
          <div className="space-y-2">
            <Label>Selected Files</Label>
            <div className="rounded-lg border divide-y">
              {files.map((file, index) => (
                <div key={index} className="flex items-center justify-between p-3">
                  <div className="flex items-center gap-2">
                    <div className="rounded-full bg-primary/10 p-1">
                      <CheckCircle className="h-4 w-4 text-primary" />
                    </div>
                    <span className="text-sm">{file.name}</span>
                  </div>
                  <span className="text-xs text-muted-foreground">{(file.size / 1024 / 1024).toFixed(2)} MB</span>
                </div>
              ))}
            </div>
            <p className="text-xs text-muted-foreground">
              These files will be uploaded to IPFS and linked to your claim on the blockchain
            </p>
          </div>
        )}
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
    </div>
  )

  // Render step 4: Review and submit
  const renderStep4 = () => (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-medium">Step 4: Review and Submit</h2>
        <p className="text-sm text-muted-foreground">Review your claim details before submitting</p>
      </div>

      {success ? (
        <div className="text-center py-8">
          <div className="rounded-full bg-green-100 p-3 w-fit mx-auto mb-4">
            <CheckCircle className="h-8 w-8 text-green-600" />
          </div>
          <h3 className="text-xl font-medium mb-2">Claim Submitted Successfully!</h3>
          <p className="text-muted-foreground mb-6">
            Your claim has been submitted to the blockchain and is being processed.
          </p>
          <p className="text-sm text-muted-foreground">You will be redirected to your claims dashboard shortly...</p>
        </div>
      ) : (
        <>
          <div className="space-y-4">
            <div className="rounded-lg border p-4">
              <h3 className="font-medium mb-2">Selected Policy</h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Policy Name</p>
                  <p className="font-medium">{mockPolicies.find((p) => p.id === selectedPolicy)?.name}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Policy ID</p>
                  <p className="font-medium">{selectedPolicy}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Coverage</p>
                  <p className="font-medium">{mockPolicies.find((p) => p.id === selectedPolicy)?.coverageAmount}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Expires</p>
                  <p className="font-medium">{mockPolicies.find((p) => p.id === selectedPolicy)?.expiryDate}</p>
                </div>
              </div>
            </div>

            <div className="rounded-lg border p-4">
              <h3 className="font-medium mb-2">Claim Details</h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Incident Date</p>
                  <p className="font-medium">{claimDetails.incidentDate}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Claim Amount</p>
                  <p className="font-medium">{claimDetails.claimAmount} USDC</p>
                </div>
              </div>
              <div className="mt-4 text-sm">
                <p className="text-muted-foreground">Description</p>
                <p>{claimDetails.description}</p>
              </div>
            </div>

            <div className="rounded-lg border p-4">
              <h3 className="font-medium mb-2">Evidence Files</h3>
              <div className="space-y-2 text-sm">
                {files.map((file, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span>{file.name}</span>
                    <span className="text-xs text-muted-foreground ml-auto">
                      {(file.size / 1024 / 1024).toFixed(2)} MB
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="rounded-lg bg-muted/50 p-4 text-sm">
            <p className="font-medium mb-2">Important Information</p>
            <ul className="list-disc list-inside space-y-1 text-muted-foreground">
              <li>Your claim will be submitted to the ClaimManager smart contract</li>
              <li>Evidence files will be uploaded to IPFS and linked to your claim</li>
              <li>You will need to sign a transaction with your wallet to submit the claim</li>
              <li>Gas fees will apply for the transaction</li>
            </ul>
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
        </>
      )}
    </div>
  )

  // Render the current step
  const renderCurrentStep = () => {
    switch (step) {
      case 1:
        return renderStep1()
      case 2:
        return renderStep2()
      case 3:
        return renderStep3()
      case 4:
        return renderStep4()
      default:
        return null
    }
  }

  return (
    <div className="container py-8">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center gap-2 mb-6">
          <Link href="/dashboard/claims">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <h1 className="text-2xl font-bold">Submit a Claim</h1>
        </div>

        <Card>
          <CardContent className="pt-6">
            {/* Progress indicator */}
            <div className="mb-8">
              <div className="flex justify-between">
                {[1, 2, 3, 4].map((stepNumber) => (
                  <div key={stepNumber} className="flex flex-col items-center">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center ${
                        stepNumber < step
                          ? "bg-primary text-primary-foreground"
                          : stepNumber === step
                            ? "bg-primary/20 text-primary border-2 border-primary"
                            : "bg-muted text-muted-foreground"
                      }`}
                    >
                      {stepNumber < step ? <CheckCircle className="h-4 w-4" /> : stepNumber}
                    </div>
                    <span className="text-xs mt-1 text-muted-foreground">
                      {stepNumber === 1
                        ? "Policy"
                        : stepNumber === 2
                          ? "Details"
                          : stepNumber === 3
                            ? "Evidence"
                            : "Review"}
                    </span>
                  </div>
                ))}
              </div>
              <div className="relative mt-2">
                <div className="absolute top-0 left-0 right-0 h-1 bg-muted" />
                <div
                  className="absolute top-0 left-0 h-1 bg-primary transition-all"
                  style={{ width: `${((step - 1) / 3) * 100}%` }}
                />
              </div>
            </div>

            {/* Current step content */}
            {renderCurrentStep()}
          </CardContent>

          <CardFooter className="flex justify-between border-t p-6">
            {step > 1 && !success && (
              <Button variant="outline" onClick={handlePrevStep}>
                Back
              </Button>
            )}
            {step < 4 ? (
              <Button className="ml-auto" onClick={handleNextStep}>
                Continue
              </Button>
            ) : !success ? (
              <Button className="ml-auto" onClick={handleSubmitClaim} disabled={isSubmitting}>
                {isSubmitting ? "Submitting..." : "Submit Claim"}
              </Button>
            ) : (
              <Button className="ml-auto" onClick={() => router.push("/dashboard/claims")}>
                Go to Claims
              </Button>
            )}
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}
