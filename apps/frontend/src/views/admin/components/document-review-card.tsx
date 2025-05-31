"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Check, Clock, Eye, FileText, X } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import Link from "next/link";

interface DocumentReviewCardProps {
  id: string;
  title?: string;
  description?: string;
  type?: string;
  submittedBy?: string;
  submittedDate?: string;
  documentType?: string;
  status: "pending" | "approved" | "rejected";
  imageUrl?: string;
  claimId?: string;
  onApprove?: (id: string, notes: string) => void;
  onReject?: (id: string, notes: string) => void;
}

export function DocumentReviewCard({
  id,
  title,
  description,
  type,
  submittedBy,
  submittedDate,
  documentType,
  status,
  imageUrl,
  claimId,
  onApprove,
  onReject,
}: DocumentReviewCardProps) {
  const [approvalNotes, setApprovalNotes] = useState("");
  const [rejectionNotes, setRejectionNotes] = useState("");
  const [rejectionError, setRejectionError] = useState(false);

  const handleApprove = () => {
    if (onApprove) {
      onApprove(id, approvalNotes);
      setApprovalNotes("");
    }
  };

  const handleReject = () => {
    if (!rejectionNotes.trim()) {
      setRejectionError(true);
      return;
    }

    if (onReject) {
      onReject(id, rejectionNotes);
      setRejectionNotes("");
      setRejectionError(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return (
          <Badge variant="outline" className="flex items-center gap-1">
            <Clock className="h-3 w-3" /> Pending Review
          </Badge>
        );
      case "approved":
        return (
          <Badge variant="default" className="flex items-center gap-1">
            <Check className="h-3 w-3" /> Approved
          </Badge>
        );
      case "rejected":
        return (
          <Badge variant="destructive" className="flex items-center gap-1">
            <X className="h-3 w-3" /> Rejected
          </Badge>
        );
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <CardTitle className="text-lg font-semibold">
            {title || documentType || "Document"}
          </CardTitle>
          {getStatusBadge(status)}
        </div>
      </CardHeader>
      <CardContent className="pb-2">
        <div className="grid gap-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Document ID:</span>
            <span className="font-medium">{id}</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Type:</span>
            <span>{type || documentType}</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Submitted By:</span>
            <span>{submittedBy}</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Submitted At:</span>
            <span>{submittedDate}</span>
          </div>
          {claimId && (
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Related Claim:</span>
              <Link
                href={`/admin/claims/${claimId}`}
                className="text-primary hover:underline"
              >
                {claimId}
              </Link>
            </div>
          )}
        </div>

        <div className="mt-4 flex justify-center">
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm" className="w-full">
                <FileText className="mr-2 h-4 w-4" />
                Preview Document
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Document Preview</DialogTitle>
                <DialogDescription>
                  {title || documentType || "Document"} ({id})
                </DialogDescription>
              </DialogHeader>
              <div className="flex justify-center p-2">
                <img
                  src={imageUrl || "/placeholder.svg"}
                  alt={title || documentType || "Document"}
                  className="max-h-[60vh] object-contain rounded-md border"
                  onError={(e) => {
                    e.currentTarget.src = "/placeholder-hmfds.png";
                    e.currentTarget.alt = "Error loading document";
                  }}
                />
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </CardContent>

      {status === "pending" && (
        <CardFooter className="flex justify-between gap-2 pt-2">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Link href={`/admin/documents/${id}`}>
                  <Button variant="outline" size="sm">
                    <Eye className="mr-2 h-4 w-4" />
                    Details
                  </Button>
                </Link>
              </TooltipTrigger>
              <TooltipContent>
                <p>View detailed document information</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <div className="flex gap-2">
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" size="sm">
                  <X className="mr-2 h-4 w-4" />
                  Reject
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Reject Document</AlertDialogTitle>
                  <AlertDialogDescription>
                    Are you sure you want to reject this document? This action
                    cannot be undone. Please provide a reason for rejection.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <div className="py-4">
                  <Textarea
                    placeholder="Enter rejection reason..."
                    value={rejectionNotes}
                    onChange={(e) => {
                      setRejectionNotes(e.target.value);
                      if (e.target.value.trim()) setRejectionError(false);
                    }}
                    className={rejectionError ? "border-destructive" : ""}
                  />
                  {rejectionError && (
                    <p className="text-destructive text-sm mt-1">
                      Please provide a reason for rejection
                    </p>
                  )}
                </div>
                <AlertDialogFooter>
                  <AlertDialogCancel
                    onClick={() => {
                      setRejectionError(false);
                      setRejectionNotes("");
                    }}
                  >
                    Cancel
                  </AlertDialogCancel>
                  <AlertDialogAction onClick={handleReject}>
                    Confirm Rejection
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>

            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="default" size="sm">
                  <Check className="mr-2 h-4 w-4" />
                  Approve
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Approve Document</AlertDialogTitle>
                  <AlertDialogDescription>
                    Are you sure you want to approve this document? You can add
                    optional notes below.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <div className="py-4">
                  <Textarea
                    placeholder="Enter optional notes..."
                    value={approvalNotes}
                    onChange={(e) => setApprovalNotes(e.target.value)}
                  />
                </div>
                <AlertDialogFooter>
                  <AlertDialogCancel onClick={() => setApprovalNotes("")}>
                    Cancel
                  </AlertDialogCancel>
                  <AlertDialogAction onClick={handleApprove}>
                    Confirm Approval
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </CardFooter>
      )}
    </Card>
  );
}
