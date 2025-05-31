"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Check, ChevronLeft, Clock, Download, FileText, RotateCcw, RotateCw, X, ZoomIn, ZoomOut } from "lucide-react"
import Link from "next/link"

interface DocumentDetailProps {
  document: {
    id: string
    title: string
    type: string
    submittedBy: string
    submittedAt: string
    status: "pending" | "approved" | "rejected"
    imageUrl: string
    claimId?: string
    history?: Array<{
      action: string
      timestamp: string
      user: string
      notes?: string
    }>
  }
  onApprove?: (id: string, notes: string) => void
  onReject?: (id: string, notes: string) => void
}

export function DocumentDetail({ document, onApprove, onReject }: DocumentDetailProps) {
  const [approvalNotes, setApprovalNotes] = useState('')
  const [rejectionNotes, setRejectionNotes] = useState('')
  const [rejectionError, setRejectionError] = useState(false)
  const [zoom, setZoom] = useState(1)
  const [rotation, setRotation] = useState(0)
  
  const handleApprove = () => {
    if (onApprove) {
      onApprove(document.id, approvalNotes)
      setApprovalNotes('')
    }
  }
  
  const handleReject = () => {
    if (!rejectionNotes.trim()) {
      setRejectionError(true)
      return
    }
    
    if (onReject) {
      onReject(document.id, rejectionNotes)
      setRejectionNotes('')
      setRejectionError(false)
    }
  }
  
  const zoomIn = () => setZoom(prev => Math.min(prev + 0.25, 3))
  const zoomOut = () => setZoom(prev => Math.max(prev - 0.25, 0.5))
  const rotateClockwise = () => setRotation(prev => (prev + 90) % 360)
  const rotateCounterClockwise = () => setRotation(prev => (prev - 90 + 360) % 360)
  
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline" className="flex items-center gap-1"><Clock className="h-3 w-3" /> Pending Review</Badge>
      case 'approved':
        return <Badge variant="success" className="flex items-center gap-1"><Check className="h-3 w-3" /> Approved</Badge>
      case 'rejected':
        return <Badge variant="destructive" className="flex items-center gap-1"><X className="h-3 w-3" /> Rejected</Badge>
      default:
        return <Badge variant="outline">Unknown</Badge>
    }
  }
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Link href="/admin/documents" className="flex items-center text-sm text-muted-foreground hover:text-foreground">
          <ChevronLeft className="mr-1 h-4 w-4" />
          Back to Documents
        </Link>
        {getStatusBadge(document.status)}
      </div>
      
      <div className="grid gap-6 md:grid-cols-5">
        <Card className="md:col-span-3">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Document Preview
            </CardTitle>
            <CardDescription>
              {document.title} ({document.id})
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex justify-center mb-4">
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={zoomOut}>
                  <ZoomOut className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="sm" onClick={zoomIn}>
                  <ZoomIn className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="sm" onClick={rotateCounterClockwise}>
                  <RotateCcw className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="sm" onClick={rotateClockwise}>
                  <RotateCw className="h-4 w-4" />
                </Button>
                <a href={document.imageUrl} target="_blank" rel="noopener noreferrer">
                  <Button variant="outline" size="sm">
                    <Download className="h-4 w-4" />
                  </Button>
                </a>
              </div>
            </div>
            <div
              style={{
                width: '100%',
                height: '500px',
                overflow: 'hidden',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
              }}
            >
              <img
                src={document.imageUrl || "/placeholder.svg"}
                alt={document.title}
                style={{
                  transform: `rotate(${rotation}deg) scale(${zoom})`,
                  transition: 'transform 0.3s ease',
                  maxWidth: 'none',
                  maxHeight: 'none',
                }}
              />
            </div>
          </CardContent>

Let's create the document review components:
\
