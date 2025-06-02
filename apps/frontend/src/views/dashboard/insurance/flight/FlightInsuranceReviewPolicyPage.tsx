"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { PolicyPurchaseReview } from "@/views/dashboard/insurance/components/policy-purchase-review";

export default function FlightInsurancePolicyReviewPage() {
  const [policy, setPolicy] = useState<any | null>(null);

  useEffect(() => {
    const stored = sessionStorage.getItem("flightPolicyDraft");
    if (stored) {
      setPolicy(JSON.parse(stored));
    }
  }, []);

  console.log("Flight Policy:", policy);

  if (!policy) {
    return (
      <main className="container px-4 py-8 mx-auto bg-[#F4F6F8]">
        <div className="max-w-3xl mx-auto text-center py-20">
          <p>Loading policy details...</p>
        </div>
      </main>
    );
  }

  // Format the departure date
  const formattedDepartureDate = new Date(policy.flightDate).toLocaleDateString(
    "en-US",
    {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    }
  );

  return (
    <>
      <main className="container px-4 py-8 mx-auto bg-[#F4F6F8]">
        <div className="max-w-3xl mx-auto">
          <div className="flex items-center gap-2 mb-6">
            <Link
              href="/dashboard/insurance/flight/apply"
              className="text-[#0D47A1] hover:underline flex items-center"
            >
              <ArrowLeft className="h-4 w-4 mr-1" />
              Back to Flight Details
            </Link>
          </div>

          <h1 className="mb-4 text-3xl font-bold text-[#212529]">
            Flight Delay Insurance
          </h1>
          <p className="mb-8 text-gray-600">
            Review your policy details before proceeding to payment.
          </p>

          <div className="mt-8">
            <PolicyPurchaseReview
              insuranceType="flight"
              policyDetails={{
                flightNumber: policy.flightNumber,
                departureDate: policy.flightDate,
                departureAirport: policy.depAirport,
                arrivalAirport: policy.arrAirport,
                coverageTier: policy.coverageTier,
                numPersons: policy.numPersons,
              }}
              premiumDetails={{
                amount: policy.totalPremium,
                currency: "ETH",
              }}
              nextStepUrl="/dashboard/insurance/flight/apply/quote"
              additionalInfo={
                <div className="bg-gray-50 p-4 rounded-md border">
                  <h4 className="font-medium mb-2">Your Flight Details</h4>
                  <ul className="space-y-1 text-sm">
                    <li>
                      <strong>Flight Number:</strong> {policy.flightNumber}
                    </li>
                    <li>
                      <strong>Departure Date:</strong> {formattedDepartureDate}
                    </li>
                    <li>
                      <strong>Departure Time:</strong> {policy.depTime}
                    </li>
                    <li>
                      <strong>Route:</strong> {policy.depAirport} to{" "}
                      {policy.arrAirport}
                    </li>
                    <li>
                      <strong>Coverage Tier:</strong> Standard (
                      {policy.coverageAmount} ETH payout)
                    </li>
                    <li>
                      <strong>Delay Threshold:</strong> 3 hours
                    </li>
                    <li>
                      <strong>Automatic Payout:</strong> Yes, via smart contract
                    </li>
                    <li>
                      <strong>Number of Persons:</strong> {policy.numPersons}
                    </li>
                    <li>
                      <strong>Total Premium:</strong> {policy.totalPremium} ETH
                    </li>
                  </ul>
                </div>
              }
            />
          </div>
        </div>
      </main>
    </>
  );
}
