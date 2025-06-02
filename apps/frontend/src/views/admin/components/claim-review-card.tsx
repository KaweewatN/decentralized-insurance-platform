"use client";

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
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Check, X, FileText } from "lucide-react";
import Link from "next/link";

interface ClaimReviewCardProps {
  claim: {
    id: string;
    title: string;
    description: string;
    userId: string;
    status: "pending" | "approved" | "rejected" | "processing";
    amount?: number; // Make amount optional
    submittedAt: string;
    type: string;
    policyId: string;
    documents?: Array<{ id: string; type: string; url: string }>;
  };
}

export function ClaimReviewCard({ claim }: ClaimReviewCardProps) {
  const [isApproveDialogOpen, setIsApproveDialogOpen] = useState(false);
  const [isRejectDialogOpen, setIsRejectDialogOpen] = useState(false);
  const [notes, setNotes] = useState("");
  const [approvedAmount, setApprovedAmount] = useState(
    claim.amount != null ? claim.amount.toString() : "0"
  );
  const [currentStatus, setCurrentStatus] = useState(claim.status);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleApprove = async () => {
    setError(""); // Clear previous errors

    if (!approvedAmount || !approvedAmount.trim()) {
      setError("Please enter an approved amount");
      return;
    }

    setIsSubmitting(true);
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));
      setCurrentStatus("approved");
      setIsApproveDialogOpen(false);
      setNotes("");
      setError("");
    } catch (err) {
      setError("Failed to approve claim. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReject = async () => {
    setError(""); // Clear previous errors

    if (!notes || !notes.trim()) {
      setError("Please provide rejection reason");
      return;
    }

    setIsSubmitting(true);
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));
      setCurrentStatus("rejected");
      setIsRejectDialogOpen(false);
      setNotes("");
      setError("");
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

  // Format the date for display - add error handling
  const formattedDate = claim.submittedAt
    ? new Date(claim.submittedAt).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      })
    : "Invalid Date";

  // Format the amount for display
  const formattedAmount = `$${(claim.amount || 0).toFixed(2)}`;

  return (
    <>
      <Card className="w-full">
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="text-lg">
                {claim.title || "Untitled Claim"}
              </CardTitle>
              <CardDescription>
                {claim.description || "No description provided"}
              </CardDescription>
            </div>
            {getStatusBadge()}
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div>
                <p className="text-sm font-medium">Claimant</p>
                <p className="text-sm text-gray-500">
                  {claim.userId || "Unknown"}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium">Submitted Date</p>
                <p className="text-sm text-gray-500">{formattedDate}</p>
              </div>
              <div>
                <p className="text-sm font-medium">Claim Type</p>
                <p className="text-sm text-gray-500">
                  {claim.type || "Unknown"}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium">Requested Amount</p>
                <p className="text-sm text-gray-500">{formattedAmount}</p>
              </div>
              <div>
                <p className="text-sm font-medium">Policy ID</p>
                <Link
                  href={`/dashboard/policies/${claim.policyId}`}
                  className="text-sm text-blue-500 hover:underline"
                >
                  {claim.policyId || "Unknown"}
                </Link>
              </div>
              <div>
                <p className="text-sm font-medium">Documents</p>
                <div className="flex items-center gap-1">
                  <FileText className="h-4 w-4 text-gray-500" />
                  <span className="text-sm text-gray-500">
                    {claim.documents?.length || 0} document
                    {(claim.documents?.length || 0) !== 1 ? "s" : ""}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button variant="outline" asChild>
            <Link href={`/dashboard/claims/${claim.id}`}>View Details</Link>
          </Button>

          {currentStatus === "pending" && (
            <div className="flex gap-2">
              <Button
                variant="outline"
                className="border-green-500 text-green-500 hover:bg-green-50"
                onClick={() => setIsApproveDialogOpen(true)}
              >
                <Check className="h-4 w-4 mr-2" />
                Approve
              </Button>
              <Button
                variant="outline"
                className="border-red-500 text-red-500 hover:bg-red-50"
                onClick={() => setIsRejectDialogOpen(true)}
              >
                <X className="h-4 w-4 mr-2" />
                Reject
              </Button>
            </div>
          )}
        </CardFooter>
      </Card>

      {/* Approve Dialog */}
      <AlertDialog
        open={isApproveDialogOpen}
        onOpenChange={setIsApproveDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Approve Claim</AlertDialogTitle>
            <AlertDialogDescription>
              Please confirm the approved payout amount and any notes.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="space-y-4 my-4">
            <div>
              <Label htmlFor="approved-amount">
                Approved Amount <span className="text-red-500">*</span>
              </Label>
              <Input
                id="approved-amount"
                type="number"
                step="0.01"
                min="0"
                value={approvedAmount}
                onChange={(e) => setApprovedAmount(e.target.value)}
                className={`mt-2 ${error && (!approvedAmount || !approvedAmount.trim()) ? "border-red-500" : ""}`}
              />
              {error && (!approvedAmount || !approvedAmount.trim()) && (
                <p className="text-red-500 text-sm mt-1">{error}</p>
              )}
            </div>
            <div>
              <Label htmlFor="approve-notes">Notes (Optional)</Label>
              <Textarea
                id="approve-notes"
                placeholder="Add any notes about this approval..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="mt-2"
              />
            </div>
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isSubmitting}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault();
                handleApprove();
              }}
              disabled={isSubmitting}
              className="bg-green-500 hover:bg-green-600"
            >
              {isSubmitting ? "Processing..." : "Approve Claim"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Reject Dialog */}
      <AlertDialog
        open={isRejectDialogOpen}
        onOpenChange={setIsRejectDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Reject Claim</AlertDialogTitle>
            <AlertDialogDescription>
              Please provide a reason for rejecting this claim. This will be
              shared with the claimant.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="my-4">
            <Label htmlFor="reject-reason">
              Rejection Reason <span className="text-red-500">*</span>
            </Label>
            <Textarea
              id="reject-reason"
              placeholder="Explain why this claim is being rejected..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className={`mt-2 ${error && (!notes || !notes.trim()) ? "border-red-500" : ""}`}
            />
            {error && (!notes || !notes.trim()) && (
              <p className="text-red-500 text-sm mt-1">{error}</p>
            )}
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isSubmitting}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault();
                handleReject();
              }}
              disabled={isSubmitting}
              className="bg-red-500 hover:bg-red-600"
            >
              {isSubmitting ? "Processing..." : "Reject Claim"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
