"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { PolicyPurchaseReview } from "@/views/dashboard/insurance/components/policy-purchase-review";

export default function HealthInsurancePolicyReviewPage() {
  const [policy, setPolicy] = useState<any | null>(null);

  useEffect(() => {
    const stored = sessionStorage.getItem("healthPolicyDraft");
    if (stored) {
      setPolicy(JSON.parse(stored));
    }
  }, []);

  if (!policy) {
    return (
      <main className="container px-4 py-8 mx-auto bg-[#F4F6F8]">
        <div className="max-w-3xl mx-auto text-center py-20">
          <p>Loading policy details...</p>
        </div>
      </main>
    );
  }

  return (
    <>
      <main className="container px-4 py-8 mx-auto bg-[#F4F6F8]">
        <div className="max-w-3xl mx-auto">
          <div className="flex items-center gap-2 mb-6">
            <Link
              href="/dashboard/insurance/health/apply"
              className="text-[#0D47A1] hover:underline flex items-center"
            >
              <ArrowLeft className="h-4 w-4 mr-1" />
              Back to Health Insurance Form
            </Link>
          </div>

          <h1 className="mb-4 text-3xl font-bold text-[#212529]">
            Health Insurance Policy
          </h1>
          <p className="mb-8 text-gray-600">
            Review your health insurance policy details before proceeding to
            payment.
          </p>
          <div className="mt-8">
            <PolicyPurchaseReview
              insuranceType="health"
              policyDetails={{
                BMI: policy.bmi,
                CoverageTier: policy.coverageTier,
                ExerciseFrequency: policy.exerciseFrequency,
                PreExistingConditions: policy.preExistingConditions,
                SmokingStatus: policy.smokingStatus,
                SumAssured: policy.sumAssured,
                NumberOfPersons: policy.expectedNumber,
                UserAddress: policy.user_address,
              }}
              premiumDetails={{
                amount: policy.premium,
                currency: "Baht",
              }}
              nextStepUrl="/dashboard/insurance/health/apply/quote"
              additionalInfo={
                <div className="bg-gray-50 p-4 rounded-md border">
                  <h4 className="font-medium mb-2">
                    Your Health Policy Details
                  </h4>
                  <ul className="space-y-1 text-sm">
                    <li>
                      <strong>BMI:</strong> {policy.bmi}
                    </li>
                    <li>
                      <strong>Coverage Tier:</strong> {policy.coverageTier}
                    </li>
                    <li>
                      <strong>Sum Assured:</strong> {policy.sumAssured} Baht
                    </li>
                    <li>
                      <strong>Premium:</strong> {policy.premium} Baht (
                      {policy.premiumEth} ETH)
                    </li>
                    <li>
                      <strong>Number of Persons:</strong>{" "}
                      {policy.expectedNumber}
                    </li>
                    <li>
                      <strong>Smoking Status:</strong> {policy.smokingStatus}
                    </li>
                    <li>
                      <strong>Exercise Frequency:</strong>{" "}
                      {policy.exerciseFrequency}
                    </li>
                    <li>
                      <strong>Pre-existing Conditions:</strong>{" "}
                      {policy.preExistingConditions}
                    </li>
                    <li>
                      <strong>User Address:</strong> {policy.user_address}
                    </li>
                    <li>
                      <strong>Uploaded File:</strong>
                      {policy.fileUpload && (
                        <div className="mt-2">
                          <img
                            src={policy.fileUpload}
                            alt="Uploaded file"
                            className="max-h-40 rounded border"
                          />
                        </div>
                      )}
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
