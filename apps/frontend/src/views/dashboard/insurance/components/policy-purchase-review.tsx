"use client";

import type React from "react";

import { useState } from "react";
import Link from "next/link";
import {
  AlertTriangle,
  Info,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  ArrowRight,
  FileText,
  DollarSign,
  Clock,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { PolicyInformationSection } from "./policy-information-section";

interface PolicyPurchaseReviewProps {
  insuranceType: "health" | "flight" | "rainfall";
  policyDetails: Record<string, any>;
  premiumDetails: {
    amount: number;
    currency: string;
    frequency?: string;
  };
  nextStepUrl: string;
  additionalInfo?: React.ReactNode;
}

export function PolicyPurchaseReview({
  insuranceType,
  policyDetails,
  premiumDetails,
  nextStepUrl,
  additionalInfo,
}: PolicyPurchaseReviewProps) {
  const [expandedSections, setExpandedSections] = useState<
    Record<string, boolean>
  >({
    coverage: true,
    exclusions: false,
    terms: false,
  });
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [privacyAccepted, setPrivacyAccepted] = useState(false);

  const toggleSection = (section: string) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  // Insurance type specific content
  const content = {
    health: {
      title: "Health Insurance Policy Review",
      subtitle:
        "Review your personalized health insurance policy details before proceeding to payment.",
      coverage: {
        title: "Coverage Details",
        items: [
          "Hospitalization expenses up to policy limit",
          "Surgical procedures and related costs",
          "Pre and post hospitalization expenses",
          "Day care treatments",
          "Emergency ambulance services",
          "Specialist consultation fees",
          "Diagnostic tests and procedures",
          "Prescription medications during hospital stay",
        ],
      },
      exclusions: {
        title: "Policy Exclusions",
        items: [
          "Pre-existing conditions (for first 12 months)",
          "Cosmetic surgeries unless medically necessary",
          "Self-inflicted injuries or attempted suicide",
          "Treatment for alcohol or drug abuse",
          "Experimental or unproven treatments",
          "Dental treatments unless due to accident",
          "Expenses related to HIV/AIDS (unless specifically covered)",
          "Non-medical expenses like administrative charges",
        ],
      },
      terms: {
        title: "Terms & Conditions",
        items: [
          "30-day waiting period for all claims except accidents",
          "12-month waiting period for pre-existing conditions",
          "Co-payment of 10% applies to certain treatments",
          "Minimum 24-hour hospitalization required for inpatient claims",
          "Claims must be submitted within 30 days of treatment",
          "Policy is renewable annually subject to terms",
          "Premium may be adjusted at renewal based on claim history",
          "Cancellation requires 30-day written notice",
        ],
      },
    },
    flight: {
      title: "Flight Delay Insurance Policy Review",
      subtitle:
        "Review your flight delay insurance details before proceeding to payment.",
      coverage: {
        title: "Coverage Details",
        items: [
          "Automatic payout if flight is delayed by more than 3 hours",
          "Coverage for the specific flight number and date only",
          "Fixed payout amount regardless of actual expenses",
          "Coverage begins 24 hours before scheduled departure",
          "Coverage ends upon actual arrival or flight cancellation",
          "No proof of expenses required for payout",
          "Payout processed automatically via smart contract",
          "Compensation delivered directly to your connected wallet",
        ],
      },
      exclusions: {
        title: "Policy Exclusions",
        items: [
          "Delays less than the specified threshold (3 hours)",
          "Flight cancellations (separate coverage available)",
          "Missed connections due to delay",
          "Additional expenses incurred due to delay",
          "Alternative transportation costs",
          "Accommodation or meal expenses",
          "Delays due to passenger issues (e.g., late check-in)",
          "Changes to flight schedule made more than 24 hours in advance",
        ],
      },
      terms: {
        title: "Terms & Conditions",
        items: [
          "Premium is non-refundable once policy is activated",
          "Policy is non-transferable to other flights or dates",
          "Delay verification through our oracle flight data service",
          "Smart contract automatically executes payout when conditions are met",
          "Payout typically processed within 24 hours of confirmed delay",
          "Multiple policies can be purchased for the same flight",
          "Policy expires after flight arrival or 48 hours after scheduled arrival",
          "Blockchain transaction fees for payout are covered by the insurer",
        ],
      },
    },
    rainfall: {
      title: "Rainfall Insurance Policy Review",
      subtitle:
        "Review your parametric rainfall insurance details before proceeding to payment.",
      coverage: {
        title: "Coverage Details",
        items: [
          "Protection against specified rainfall conditions at exact location",
          "Automatic payout when rainfall threshold is crossed",
          "Fixed payout amount regardless of actual losses",
          "Coverage for the specific period specified in policy",
          "Rainfall data collected from multiple weather sources",
          "No proof of loss required for payout",
          "Payout processed automatically via smart contract",
          "Compensation delivered directly to your connected wallet",
        ],
      },
      exclusions: {
        title: "Policy Exclusions",
        items: [
          "Rainfall events outside the coverage period",
          "Rainfall at locations other than the specified coordinates",
          "Losses due to other weather events (temperature, wind, etc.)",
          "Crop or property damage not related to rainfall",
          "Business interruption or consequential losses",
          "Rainfall events that don't meet the threshold criteria",
          "Man-made flooding or irrigation issues",
          "Losses that exceed the policy coverage amount",
        ],
      },
      terms: {
        title: "Terms & Conditions",
        items: [
          "Premium is non-refundable once policy is activated",
          "Policy is location-specific based on provided coordinates",
          "Rainfall verification through our oracle weather data service",
          "Smart contract automatically executes payout when conditions are met",
          "Payout typically processed within 48 hours of confirmed threshold breach",
          "Multiple policies can be purchased for different locations",
          "Policy expires at the end of the specified coverage period",
          "Blockchain transaction fees for payout are covered by the insurer",
        ],
      },
    },
  };

  const selectedContent = content[insuranceType];

  return (
    <div className="space-y-6">
      <Card className="border-blue-100">
        <CardHeader className="bg-blue-50">
          <CardTitle className="text-2xl text-blue-800">
            {selectedContent.title}
          </CardTitle>
          <p className="text-blue-600 mt-1">{selectedContent.subtitle}</p>
        </CardHeader>
        <CardContent className="p-6 space-y-6">
          {/* Premium Summary */}
          <div className="bg-green-50 border border-green-100 rounded-lg p-4">
            <div className="flex items-start">
              <DollarSign className="h-6 w-6 text-green-600 mt-0.5 mr-3 flex-shrink-0" />
              <div>
                <h3 className="text-lg font-medium text-green-800">
                  Premium Summary
                </h3>
                <p className="text-2xl font-bold text-green-900 mt-1">
                  {premiumDetails.amount} {premiumDetails.currency}
                  {premiumDetails.frequency && (
                    <span className="text-sm font-normal text-green-700 ml-1">
                      {premiumDetails.frequency}
                    </span>
                  )}
                </p>
                <p className="text-sm text-green-700 mt-1">
                  {insuranceType === "health"
                    ? "Your premium is based on your age, medical history, and coverage selections."
                    : insuranceType === "flight"
                      ? "One-time payment for coverage of your selected flight."
                      : "One-time payment for coverage during your selected period."}
                </p>
              </div>
            </div>
          </div>

          {/* Policy Details */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center">
              <FileText className="h-5 w-5 mr-2 text-blue-600" />
              Policy Details
            </h3>

            {/* Coverage Details */}
            <div className="border rounded-md overflow-hidden">
              <button
                onClick={() => toggleSection("coverage")}
                className="w-full flex items-center justify-between p-3 text-left bg-gray-50 hover:bg-gray-100 transition-colors"
              >
                <div className="flex items-center">
                  <CheckCircle2 className="h-5 w-5 text-green-600 mr-2" />
                  <span className="font-medium">
                    {selectedContent.coverage.title}
                  </span>
                </div>
                {expandedSections.coverage ? (
                  <ChevronUp className="h-5 w-5 text-gray-500" />
                ) : (
                  <ChevronDown className="h-5 w-5 text-gray-500" />
                )}
              </button>
              {expandedSections.coverage && (
                <div className="p-4 border-t">
                  <ul className="space-y-2">
                    {selectedContent.coverage.items.map((item, index) => (
                      <li key={index} className="flex items-start">
                        <CheckCircle2 className="h-4 w-4 text-green-500 mt-1 mr-2 flex-shrink-0" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* Exclusions */}
            <div className="border rounded-md overflow-hidden">
              <button
                onClick={() => toggleSection("exclusions")}
                className="w-full flex items-center justify-between p-3 text-left bg-gray-50 hover:bg-gray-100 transition-colors"
              >
                <div className="flex items-center">
                  <AlertTriangle className="h-5 w-5 text-amber-500 mr-2" />
                  <span className="font-medium">
                    {selectedContent.exclusions.title}
                  </span>
                </div>
                {expandedSections.exclusions ? (
                  <ChevronUp className="h-5 w-5 text-gray-500" />
                ) : (
                  <ChevronDown className="h-5 w-5 text-gray-500" />
                )}
              </button>
              {expandedSections.exclusions && (
                <div className="p-4 border-t">
                  <ul className="space-y-2">
                    {selectedContent.exclusions.items.map((item, index) => (
                      <li key={index} className="flex items-start">
                        <AlertTriangle className="h-4 w-4 text-amber-500 mt-1 mr-2 flex-shrink-0" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* Terms & Conditions */}
            <div className="border rounded-md overflow-hidden">
              <button
                onClick={() => toggleSection("terms")}
                className="w-full flex items-center justify-between p-3 text-left bg-gray-50 hover:bg-gray-100 transition-colors"
              >
                <div className="flex items-center">
                  <Info className="h-5 w-5 text-blue-600 mr-2" />
                  <span className="font-medium">
                    {selectedContent.terms.title}
                  </span>
                </div>
                {expandedSections.terms ? (
                  <ChevronUp className="h-5 w-5 text-gray-500" />
                ) : (
                  <ChevronDown className="h-5 w-5 text-gray-500" />
                )}
              </button>
              {expandedSections.terms && (
                <div className="p-4 border-t">
                  <ul className="space-y-2">
                    {selectedContent.terms.items.map((item, index) => (
                      <li key={index} className="flex items-start">
                        <Info className="h-4 w-4 text-blue-500 mt-1 mr-2 flex-shrink-0" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>

          {/* Additional Policy Information */}
          <PolicyInformationSection insuranceType={insuranceType} />

          {/* Additional Info (if provided) */}
          {additionalInfo && <div className="mt-4">{additionalInfo}</div>}

          {/* Processing Time Notice */}
          <Alert className="bg-blue-50 border-blue-100">
            <Clock className="h-4 w-4 text-blue-600" />
            <AlertDescription className="text-blue-700">
              {insuranceType === "health"
                ? "Policy activation typically takes 24 hours after payment confirmation."
                : insuranceType === "flight"
                  ? "Policy is activated immediately after blockchain transaction confirmation."
                  : "Policy is activated within 1 hour after blockchain transaction confirmation."}
            </AlertDescription>
          </Alert>

          {/* Agreements */}
          <div className="space-y-4 pt-4">
            <div className="flex items-start space-x-2">
              <Checkbox
                id="terms"
                checked={termsAccepted}
                onCheckedChange={(checked) =>
                  setTermsAccepted(checked === true)
                }
              />
              <div className="grid gap-1.5 leading-none">
                <Label
                  htmlFor="terms"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  I have read and agree to the Terms and Conditions
                </Label>
                <p className="text-sm text-muted-foreground">
                  By checking this box, you confirm that you have read,
                  understood and agree to the policy terms.
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-2">
              <Checkbox
                id="privacy"
                checked={privacyAccepted}
                onCheckedChange={(checked) =>
                  setPrivacyAccepted(checked === true)
                }
              />
              <div className="grid gap-1.5 leading-none">
                <Label
                  htmlFor="privacy"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  I consent to the Privacy Policy
                </Label>
                <p className="text-sm text-muted-foreground">
                  Your data will be processed in accordance with our privacy
                  policy to administer your insurance policy.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex justify-between p-6 border-t">
          <Button
            variant="outline"
            onClick={() => localStorage.removeItem("flightPolicyDraft")}
            asChild
          >
            <Link href="/dashboard">Cancel</Link>
          </Button>
          <Button
            className="bg-[#28A745] hover:bg-[#218838] text-white"
            disabled={!termsAccepted || !privacyAccepted}
            asChild
          >
            <Link href={nextStepUrl}>
              Proceed to Payment
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
