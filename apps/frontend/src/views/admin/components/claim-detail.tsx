"use client";

import { AlertDialogTrigger } from "@/components/ui/alert-dialog";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  ArrowLeft,
  FileText,
  Calendar,
  User,
  DollarSign,
  Clipboard,
  AlertTriangle,
} from "lucide-react";
import Link from "next/link";
import { DocumentReviewCard } from "./document-review-card";

interface ClaimHistoryItem {
  date: string;
  action: string;
  user: string;
  notes?: string;
}

interface ClaimDocument {
  id: string;
  title: string;
  description: string;
  submittedBy: string;
  submittedDate: string;
  documentType: string;
  status: "pending" | "approved" | "rejected";
  imageUrl: string;
}

interface PolicyDetails {
  id: string;
  policyType: string;
  coverageAmount: string;
  startDate: string;
  endDate: string;
  status: string;
}

interface ClaimDetailProps {
  id: string;
  title: string;
  description: string;
  claimantAddress: string;
  submittedDate: string;
  claimType: string;
  requestedAmount: string;
  status: "pending" | "approved" | "rejected" | "processing";
  policyId: string;
  documents: ClaimDocument[];
  history: ClaimHistoryItem[];
  policy: PolicyDetails;
  incidentDate: string;
  incidentDescription: string;
}

export function ClaimDetail({
  id,
  title,
  description,
  claimantAddress,
  submittedDate,
  claimType,
  requestedAmount,
  status,
  policyId,
  documents,
  history,
  policy,
  incidentDate,
  incidentDescription,
}: ClaimDetailProps) {
  const [isApproveDialogOpen, setIsApproveDialogOpen] = useState(false);
  const [isRejectDialogOpen, setIsRejectDialogOpen] = useState(false);
  const [notes, setNotes] = useState("");
  const [approvedAmount, setApprovedAmount] = useState(requestedAmount);
  const [currentStatus, setCurrentStatus] = useState(status);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleApprove = async () => {
    if (!approvedAmount.trim()) {
      setError("Please enter an approved amount");
      return;
    }

    setIsSubmitting(true);
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));
      setCurrentStatus("approved");
      setIsApproveDialogOpen(false);

      // Add to history
      history.unshift({
        date: new Date().toISOString(),
        action: "Approved",
        user: "Admin User",
        notes: notes || `Claim approved with payout amount: ${approvedAmount}`,
      });

      setNotes("");
    } catch (err) {
      setError("Failed to approve claim. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReject = async () => {
    if (!notes.trim()) {
      setError("Please provide rejection reason");
      return;
    }

    setIsSubmitting(true);
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));
      setCurrentStatus("rejected");
      setIsRejectDialogOpen(false);

      // Add to history
      history.unshift({
        date: new Date().toISOString(),
        action: "Rejected",
        user: "Admin User",
        notes: notes,
      });

      setNotes("");
    } catch (err) {
      setError("Failed to reject claim. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatusBadge = () => {
    switch (currentStatus) {
      case "approved":
        return <Badge className="bg-green-500">Approved</Badge>;
      case "rejected":
        return <Badge className="bg-red-500">Rejected</Badge>;
      case "processing":
        return <Badge className="bg-blue-500">Processing</Badge>;
      default:
        return <Badge className="bg-yellow-500">Pending Review</Badge>;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  };

  const pendingDocuments = documents.filter(
    (doc) => doc.status === "pending"
  ).length;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Button variant="outline" size="sm" asChild>
          <Link href="/admin/claims">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Claims
          </Link>
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle>{title}</CardTitle>
                  <CardDescription>{description}</CardDescription>
                </div>
                {getStatusBadge()}
              </div>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="details">
                <TabsList className="mb-4">
                  <TabsTrigger value="details">Claim Details</TabsTrigger>
                  <TabsTrigger value="documents">
                    Documents{" "}
                    {pendingDocuments > 0 && `(${pendingDocuments} pending)`}
                  </TabsTrigger>
                  <TabsTrigger value="policy">Policy Information</TabsTrigger>
                </TabsList>

                <TabsContent value="details">
                  <div className="space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="flex items-start gap-2">
                        <User className="h-5 w-5 text-gray-500 mt-0.5" />
                        <div>
                          <p className="text-sm font-medium">Claimant</p>
                          <p className="text-sm text-gray-500">
                            {claimantAddress}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-start gap-2">
                        <Calendar className="h-5 w-5 text-gray-500 mt-0.5" />
                        <div>
                          <p className="text-sm font-medium">Submitted Date</p>
                          <p className="text-sm text-gray-500">
                            {submittedDate}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-start gap-2">
                        <Clipboard className="h-5 w-5 text-gray-500 mt-0.5" />
                        <div>
                          <p className="text-sm font-medium">Claim Type</p>
                          <p className="text-sm text-gray-500">{claimType}</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-2">
                        <DollarSign className="h-5 w-5 text-gray-500 mt-0.5" />
                        <div>
                          <p className="text-sm font-medium">
                            Requested Amount
                          </p>
                          <p className="text-sm text-gray-500">
                            {requestedAmount}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-start gap-2">
                        <Calendar className="h-5 w-5 text-gray-500 mt-0.5" />
                        <div>
                          <p className="text-sm font-medium">Incident Date</p>
                          <p className="text-sm text-gray-500">
                            {incidentDate}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-start gap-2">
                        <FileText className="h-5 w-5 text-gray-500 mt-0.5" />
                        <div>
                          <p className="text-sm font-medium">Claim ID</p>
                          <p className="text-sm text-gray-500">{id}</p>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h3 className="text-sm font-medium mb-2">
                        Incident Description
                      </h3>
                      <div className="bg-gray-50 p-3 rounded-md text-sm">
                        {incidentDescription}
                      </div>
                    </div>

                    {pendingDocuments > 0 && (
                      <div className="bg-yellow-50 border border-yellow-200 rounded-md p-3 flex items-start gap-2">
                        <AlertTriangle className="h-5 w-5 text-yellow-500 mt-0.5" />
                        <div>
                          <p className="text-sm font-medium text-yellow-800">
                            Pending Documents
                          </p>
                          <p className="text-sm text-yellow-700">
                            This claim has {pendingDocuments} document
                            {pendingDocuments !== 1 ? "s" : ""} pending review.
                            Please review all documents before processing the
                            claim.
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </TabsContent>

                <TabsContent value="documents">
                  <div className="space-y-4">
                    {documents.length > 0 ? (
                      documents.map((doc) => (
                        <DocumentReviewCard
                          key={doc.id}
                          {...doc}
                          claimId={id}
                        />
                      ))
                    ) : (
                      <div className="text-center py-8">
                        <p className="text-gray-500">
                          No documents attached to this claim.
                        </p>
                      </div>
                    )}
                  </div>
                </TabsContent>

                <TabsContent value="policy">
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm font-medium">Policy ID</p>
                        <p className="text-sm text-gray-500">{policyId}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium">Policy Type</p>
                        <p className="text-sm text-gray-500">
                          {policy.policyType}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm font-medium">Coverage Amount</p>
                        <p className="text-sm text-gray-500">
                          {policy.coverageAmount}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm font-medium">Start Date</p>
                        <p className="text-sm text-gray-500">
                          {formatDate(policy.startDate)}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm font-medium">End Date</p>
                        <p className="text-sm text-gray-500">
                          {formatDate(policy.endDate)}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm font-medium">Policy Status</p>
                        <p className="text-sm text-gray-500">{policy.status}</p>
                      </div>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>

        <div>
          <Card>
            <CardHeader>
              <CardTitle>Process Claim</CardTitle>
              <CardDescription>
                Review claim details and take action
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {error && (
                <div className="p-3 rounded-md bg-red-50 border border-red-200 text-red-700 text-sm">
                  {error}
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="approvedAmount">Approved Amount</Label>
                <Input
                  id="approvedAmount"
                  type="number"
                  placeholder="Enter amount"
                  value={approvedAmount}
                  onChange={(e) => setApprovedAmount(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  placeholder="Add notes here"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                />
              </div>
            </CardContent>
            <CardFooter className="space-x-2">
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full text-green-600 border-green-600 hover:bg-green-50"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? "Approving..." : "Approve Claim"}
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Approve Claim</AlertDialogTitle>
                    <AlertDialogDescription>
                      Are you sure you want to approve this claim? This action
                      cannot be undone.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={handleApprove}
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? "Approving..." : "Approve"}
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>

              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full text-red-600 border-red-600 hover:bg-red-50"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? "Rejecting..." : "Reject Claim"}
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Reject Claim</AlertDialogTitle>
                    <AlertDialogDescription>
                      Are you sure you want to reject this claim? This action
                      cannot be undone.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={handleReject}
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? "Reject..." : "Reject"}
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </CardFooter>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Claim History</CardTitle>
              <CardDescription>Recent actions on this claim</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {history.length > 0 ? (
                  history.map((item, index) => (
                    <div key={index} className="border rounded-md p-3">
                      <p className="text-sm font-medium">
                        {item.action} - {formatDate(item.date)}
                      </p>
                      <p className="text-sm text-gray-500">User: {item.user}</p>
                      {item.notes && (
                        <p className="text-sm text-gray-600 mt-1">
                          Notes: {item.notes}
                        </p>
                      )}
                    </div>
                  ))
                ) : (
                  <div className="text-center py-4">
                    <p className="text-gray-500">
                      No history available for this claim.
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
