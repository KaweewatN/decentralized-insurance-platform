"use client";

import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, FileText, Home, ExternalLink, Heart } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useMemo } from "react";
import { uuidV4, randomBytes } from "ethers";

export default function HealthInsuranceSuccessPage() {
  const searchParams = useSearchParams();
  // remove the hardcoded txHash in production, use actual transaction hash
  const txHash =
    searchParams.get("txHash") ||
    "0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef";

  // Get policy draft from sessionStorage
  const policyDraft = useMemo(() => {
    if (typeof window !== "undefined") {
      const data = sessionStorage.getItem("healthPolicyDraft");
      return data ? JSON.parse(data) : null;
    }
    return null;
  }, []);

  // Fallbacks if no data found
  const policyId = uuidV4(randomBytes(16));
  const bmi = policyDraft?.bmi || "N/A";
  const coverageTier = policyDraft?.coverageTier || "N/A";
  const exerciseFrequency = policyDraft?.exerciseFrequency || "N/A";
  const smokingStatus = policyDraft?.smokingStatus || "N/A";
  const preExistingConditions = policyDraft?.preExistingConditions || "None";
  const premium = policyDraft ? `${policyDraft.premiumEth} ETH` : "N/A";
  const sumAssured = policyDraft ? `${policyDraft.sumAssuredEth} ETH` : "N/A";

  return (
    <>
      <main className="container px-4 py-8 mx-auto bg-[#F4F6F8]">
        <div className="max-w-2xl mx-auto">
          <Card className="border-t-4 border-t-[#28A745]">
            <CardContent className="pt-6 px-6 pb-0">
              <div className="flex flex-col items-center text-center mb-8">
                <div className="w-16 h-16 bg-[#28A745]/10 rounded-full flex items-center justify-center mb-4">
                  <CheckCircle className="w-8 h-8 text-[#28A745]" />
                </div>
                <h1 className="text-2xl font-bold text-[#212529] mb-2">
                  Health Insurance Activated!
                </h1>
                <p className="text-gray-600">
                  Your decentralized health insurance policy has been created on
                  the blockchain and is now active.
                </p>
              </div>

              <div className="bg-[#F4F6F8] rounded-lg p-4 mb-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Policy ID</p>
                    <p className="text-[#212529] font-medium">{policyId}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Coverage Tier</p>
                    <p className="text-[#212529] font-medium">
                      ${coverageTier}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 mb-1">BMI</p>
                    <p className="text-[#212529] font-medium">{bmi}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 mb-1">
                      Exercise Frequency
                    </p>
                    <p className="text-[#212529] font-medium">
                      {exerciseFrequency}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Premium Paid</p>
                    <p className="text-[#212529] font-medium">{premium}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Sum Assured</p>
                    <p className="text-[#212529] font-medium">{sumAssured}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Smoking Status</p>
                    <p className="text-[#212529] font-medium">
                      {smokingStatus}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 mb-1">
                      Pre-existing Conditions
                    </p>
                    <p className="text-[#212529] font-medium">
                      {preExistingConditions}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-[#E3F2FD] rounded-lg p-4 mb-6">
                <p className="text-sm text-[#0D47A1] font-medium mb-2">
                  Blockchain Transaction Details
                </p>
                <div className="flex items-center justify-between">
                  <p className="text-xs text-gray-600 truncate w-3/4">
                    {txHash}
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-[#0D47A1] border-[#0D47A1]"
                    onClick={() =>
                      window.open(
                        `https://sepolia.etherscan.io/tx/${txHash}`,
                        "_blank"
                      )
                    }
                  >
                    <ExternalLink className="h-3 w-3 mr-1" />
                    View
                  </Button>
                </div>
              </div>

              <div className="mb-6">
                <h2 className="text-lg font-semibold text-[#212529] mb-2">
                  How This Works
                </h2>
                <ol className="space-y-2 text-[#212529]">
                  <li>
                    1. Your health insurance policy is now active with coverage
                    up to {sumAssured}.
                  </li>
                  <li>
                    2. Submit claims through our platform with medical
                    documentation for covered treatments.
                  </li>
                  <li>
                    3. Our decentralized oracle system will verify claims and
                    process payouts automatically.
                  </li>
                  <li>
                    4. Approved claims will be paid directly to your wallet or
                    healthcare provider.
                  </li>
                </ol>
              </div>

              <div className="bg-[#0D47A1]/5 rounded-lg p-4 mb-6">
                <div className="flex items-start">
                  <Heart className="w-5 h-5 text-[#0D47A1] mt-0.5 mr-3 flex-shrink-0" />
                  <p className="text-[#0D47A1] text-sm">
                    Your policy includes coverage for medical treatments,
                    prescriptions, and emergency care. Keep your health data
                    updated in your dashboard to maintain optimal coverage.
                  </p>
                </div>
              </div>
            </CardContent>

            <CardFooter className="flex flex-col sm:flex-row gap-4 p-6">
              <Button
                onClick={() => sessionStorage.remove("healthPolicyDraft")}
                className="w-full sm:w-auto bg-[#0D47A1] hover:bg-[#083984] text-white"
                asChild
              >
                <Link href="/dashboard">
                  <Home className="mr-2 h-4 w-4" />
                  Return to Dashboard
                </Link>
              </Button>
              <Button
                variant="outline"
                className="w-full sm:w-auto"
                onClick={() => sessionStorage.remove("healthPolicyDraft")}
                asChild
              >
                <Link href="/dashboard/policies">
                  <FileText className="mr-2 h-4 w-4" />
                  View My Policies
                </Link>
              </Button>
            </CardFooter>
          </Card>
        </div>
      </main>
    </>
  );
}
