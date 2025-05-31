"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { formatDistanceToNow } from "date-fns";
import {
  CheckCircle,
  XCircle,
  ArrowLeft,
  AlertTriangle,
  FileText,
} from "lucide-react";
import { processApplication } from "@/libs/admin-utils";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface ApplicationDetailProps {
  application: {
    id: string;
    type: string;
    userId: string;
    userWallet: string;
    status: string;
    submittedAt: string;
    riskScore: number;
    preliminaryPremium: number;
    personalInfo: {
      fullName: string;
      dateOfBirth: string;
      gender: string;
      email: string;
      phone: string;
      address: string;
      occupation: string;
    };
    healthInfo: {
      height: number;
      weight: number;
      smoker: boolean;
      alcoholConsumption: string;
      exerciseFrequency: string;
      preExistingConditions: string[];
      medications: string[];
      familyHistory: string[];
    };
    coverageDetails: {
      planType: string;
      sumAssured: number;
      term: number;
      paymentFrequency: string;
    };
    applicationTermsHash?: string;
  };
}

export function ApplicationDetail({ application }: ApplicationDetailProps) {
  const [notes, setNotes] = useState("");
  const [premium, setPremium] = useState(
    application.preliminaryPremium.toString()
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const router = useRouter();

  const handleApprove = async () => {
    await handleStatusUpdate("approved");
  };

  const handleReject = async () => {
    await handleStatusUpdate("rejected");
  };

  const handleRequestInfo = async () => {
    await handleStatusUpdate("info_requested");
  };

  const handleStatusUpdate = async (
    status: "approved" | "rejected" | "info_requested"
  ) => {
    setIsSubmitting(true);
    setError(null);
    setSuccess(null);

    try {
      const amount =
        status === "approved" ? Number.parseFloat(premium) : undefined;
      const result = await processApplication(
        application.id,
        status,
        amount,
        notes
      );
      if (result.success) {
        setSuccess(
          `Application has been ${status.replace("_", " ")} successfully`
        );
        setTimeout(() => {
          router.push("/admin/applications");
        }, 2000);
      } else {
        setError("Failed to update application status");
      }
    } catch (err) {
      setError("An error occurred while processing the application");
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getRiskBadge = (score: number) => {
    if (score < 30) {
      return <Badge className="bg-green-500">Low Risk</Badge>;
    } else if (score < 70) {
      return <Badge className="bg-yellow-500">Medium Risk</Badge>;
    } else {
      return <Badge className="bg-red-500">High Risk</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Button variant="ghost" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Applications
        </Button>
        <Badge variant="outline">{application.status}</Badge>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {success && (
        <Alert className="bg-green-50 border-green-600 text-green-800">
          <AlertTitle>Success</AlertTitle>
          <AlertDescription>{success}</AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <FileText className="h-5 w-5 mr-2" />
                {application.type} Insurance Application
              </CardTitle>
              <div className="text-sm text-muted-foreground">
                <p>Application ID: {application.id}</p>
                <p>User ID: {application.userId}</p>
                <p>Wallet: {application.userWallet}</p>
                <p>
                  Submitted:{" "}
                  {formatDistanceToNow(new Date(application.submittedAt), {
                    addSuffix: true,
                  })}
                </p>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <Tabs defaultValue="personal" className="w-full">
                <TabsList className="grid grid-cols-3 w-full rounded-none border-b">
                  <TabsTrigger value="personal">Personal Details</TabsTrigger>
                  <TabsTrigger value="health">Health & Lifestyle</TabsTrigger>
                  <TabsTrigger value="coverage">Coverage Details</TabsTrigger>
                </TabsList>
                <TabsContent value="personal" className="p-4">
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label className="text-xs text-muted-foreground">
                          Full Name
                        </Label>
                        <p className="font-medium">
                          {application.personalInfo.fullName}
                        </p>
                      </div>
                      <div>
                        <Label className="text-xs text-muted-foreground">
                          Date of Birth
                        </Label>
                        <p className="font-medium">
                          {new Date(
                            application.personalInfo.dateOfBirth
                          ).toLocaleDateString()}
                        </p>
                      </div>
                      <div>
                        <Label className="text-xs text-muted-foreground">
                          Gender
                        </Label>
                        <p className="font-medium">
                          {application.personalInfo.gender}
                        </p>
                      </div>
                      <div>
                        <Label className="text-xs text-muted-foreground">
                          Email
                        </Label>
                        <p className="font-medium">
                          {application.personalInfo.email}
                        </p>
                      </div>
                      <div>
                        <Label className="text-xs text-muted-foreground">
                          Phone
                        </Label>
                        <p className="font-medium">
                          {application.personalInfo.phone}
                        </p>
                      </div>
                      <div>
                        <Label className="text-xs text-muted-foreground">
                          Occupation
                        </Label>
                        <p className="font-medium">
                          {application.personalInfo.occupation}
                        </p>
                      </div>
                    </div>
                    <div>
                      <Label className="text-xs text-muted-foreground">
                        Address
                      </Label>
                      <p className="font-medium">
                        {application.personalInfo.address}
                      </p>
                    </div>
                  </div>
                </TabsContent>
                <TabsContent value="health" className="p-4">
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label className="text-xs text-muted-foreground">
                          Height
                        </Label>
                        <p className="font-medium">
                          {application.healthInfo.height} cm
                        </p>
                      </div>
                      <div>
                        <Label className="text-xs text-muted-foreground">
                          Weight
                        </Label>
                        <p className="font-medium">
                          {application.healthInfo.weight} kg
                        </p>
                      </div>
                      <div>
                        <Label className="text-xs text-muted-foreground">
                          Smoker
                        </Label>
                        <p className="font-medium">
                          {application.healthInfo.smoker ? "Yes" : "No"}
                        </p>
                      </div>
                      <div>
                        <Label className="text-xs text-muted-foreground">
                          Alcohol Consumption
                        </Label>
                        <p className="font-medium">
                          {application.healthInfo.alcoholConsumption}
                        </p>
                      </div>
                      <div>
                        <Label className="text-xs text-muted-foreground">
                          Exercise Frequency
                        </Label>
                        <p className="font-medium">
                          {application.healthInfo.exerciseFrequency}
                        </p>
                      </div>
                    </div>
                    <div>
                      <Label className="text-xs text-muted-foreground">
                        Pre-existing Conditions
                      </Label>
                      {application.healthInfo.preExistingConditions.length >
                      0 ? (
                        <ul className="list-disc list-inside">
                          {application.healthInfo.preExistingConditions.map(
                            (condition, index) => (
                              <li key={index} className="font-medium">
                                {condition}
                              </li>
                            )
                          )}
                        </ul>
                      ) : (
                        <p className="font-medium">None reported</p>
                      )}
                    </div>
                    <div>
                      <Label className="text-xs text-muted-foreground">
                        Current Medications
                      </Label>
                      {application.healthInfo.medications.length > 0 ? (
                        <ul className="list-disc list-inside">
                          {application.healthInfo.medications.map(
                            (medication, index) => (
                              <li key={index} className="font-medium">
                                {medication}
                              </li>
                            )
                          )}
                        </ul>
                      ) : (
                        <p className="font-medium">None reported</p>
                      )}
                    </div>
                    <div>
                      <Label className="text-xs text-muted-foreground">
                        Family Medical History
                      </Label>
                      {application.healthInfo.familyHistory.length > 0 ? (
                        <ul className="list-disc list-inside">
                          {application.healthInfo.familyHistory.map(
                            (history, index) => (
                              <li key={index} className="font-medium">
                                {history}
                              </li>
                            )
                          )}
                        </ul>
                      ) : (
                        <p className="font-medium">None reported</p>
                      )}
                    </div>
                  </div>
                </TabsContent>
                <TabsContent value="coverage" className="p-4">
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label className="text-xs text-muted-foreground">
                          Plan Type
                        </Label>
                        <p className="font-medium">
                          {application.coverageDetails.planType}
                        </p>
                      </div>
                      <div>
                        <Label className="text-xs text-muted-foreground">
                          Sum Assured
                        </Label>
                        <p className="font-medium">
                          $
                          {application.coverageDetails.sumAssured.toLocaleString()}
                        </p>
                      </div>
                      <div>
                        <Label className="text-xs text-muted-foreground">
                          Term
                        </Label>
                        <p className="font-medium">
                          {application.coverageDetails.term} months
                        </p>
                      </div>
                      <div>
                        <Label className="text-xs text-muted-foreground">
                          Payment Frequency
                        </Label>
                        <p className="font-medium">
                          {application.coverageDetails.paymentFrequency}
                        </p>
                      </div>
                    </div>
                    {application.applicationTermsHash && (
                      <div>
                        <Label className="text-xs text-muted-foreground">
                          Application Terms Hash
                        </Label>
                        <p className="font-medium break-all text-xs">
                          {application.applicationTermsHash}
                        </p>
                      </div>
                    )}
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Risk Assessment</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="font-medium">Risk Score:</span>
                <div className="flex items-center">
                  {getRiskBadge(application.riskScore)}
                  <span className="ml-2 font-bold">
                    {application.riskScore}/100
                  </span>
                </div>
              </div>

              <div className="w-full bg-gray-200 rounded-full h-2.5">
                <div
                  className={`h-2.5 rounded-full ${
                    application.riskScore < 30
                      ? "bg-green-500"
                      : application.riskScore < 70
                        ? "bg-yellow-500"
                        : "bg-red-500"
                  }`}
                  style={{ width: `${application.riskScore}%` }}
                ></div>
              </div>

              <div className="pt-4 border-t">
                <Label htmlFor="premium">Premium Amount</Label>
                <div className="flex items-center mt-1">
                  <span className="text-lg font-bold mr-2">$</span>
                  <Input
                    id="premium"
                    type="number"
                    step="0.01"
                    value={premium}
                    onChange={(e) => setPremium(e.target.value)}
                    className="text-lg font-bold"
                  />
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Preliminary premium based on risk assessment. You can adjust
                  if needed.
                </p>
              </div>

              <div className="space-y-2 pt-4 border-t">
                <Label htmlFor="notes">Admin Notes</Label>
                <Textarea
                  id="notes"
                  placeholder="Add your review notes here..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={4}
                />
              </div>
            </CardContent>
            <CardFooter className="flex flex-col space-y-3">
              <Button
                className="w-full text-green-600 border-green-600 hover:bg-green-50"
                variant="outline"
                onClick={handleApprove}
                disabled={isSubmitting}
              >
                <CheckCircle className="h-5 w-5 mr-2" />
                Approve Application
              </Button>
              <Button
                className="w-full text-amber-600 border-amber-600 hover:bg-amber-50"
                variant="outline"
                onClick={handleRequestInfo}
                disabled={isSubmitting}
              >
                <AlertTriangle className="h-5 w-5 mr-2" />
                Request More Information
              </Button>
              <Button
                className="w-full text-red-600 border-red-600 hover:bg-red-50"
                variant="outline"
                onClick={handleReject}
                disabled={isSubmitting}
              >
                <XCircle className="h-5 w-5 mr-2" />
                Reject Application
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
}
