"use client";

import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, FileText, Home, ExternalLink, Clock } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useMemo } from "react";
import { uuidV4, randomBytes } from "ethers";

export default function FlightInsuranceSuccessPage() {
  const searchParams = useSearchParams();
  const txHash =
    searchParams.get("txHash") ||
    "0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef";

  // Get policy draft from localStorage
  const policyDraft = useMemo(() => {
    if (typeof window !== "undefined") {
      const data = localStorage.getItem("flightPolicyDraft");
      return data ? JSON.parse(data) : null;
    }
    return null;
  }, []);

  // Fallbacks if no data found
  const policyId = uuidV4(randomBytes(16));
  const flightNumber = policyDraft?.flightNumber || "N/A";
  const departureDate = policyDraft
    ? `${policyDraft.flightDate} ${policyDraft.depTime}`
    : "N/A";
  const route = policyDraft
    ? `${policyDraft.depAirport} → ${policyDraft.arrAirport}`
    : "N/A";
  const premium = policyDraft ? `${policyDraft.totalPremium} ETH` : "N/A";
  const coverage = policyDraft ? `${policyDraft.coverageAmount} ETH` : "N/A";
  const delayThreshold = "3 hours"; // You can adjust if you store this in draft

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
                  Flight Delay Insurance Activated!
                </h1>
                <p className="text-gray-600">
                  Your parametric flight delay insurance policy has been created
                  on the blockchain and is now active.
                </p>
              </div>

              <div className="bg-[#F4F6F8] rounded-lg p-4 mb-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Policy ID</p>
                    <p className="text-[#212529] font-medium">{policyId}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Flight Number</p>
                    <p className="text-[#212529] font-medium">{flightNumber}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Departure Date</p>
                    <p className="text-[#212529] font-medium">
                      {departureDate}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Route</p>
                    <p className="text-[#212529] font-medium">{route}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Premium Paid</p>
                    <p className="text-[#212529] font-medium">{premium}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 mb-1">
                      Coverage Amount
                    </p>
                    <p className="text-[#212529] font-medium">{coverage}</p>
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
                    1. Your policy is now active for flight {flightNumber} on{" "}
                    {departureDate}.
                  </li>
                  <li>
                    2. If your flight is delayed by more than {delayThreshold},
                    you'll automatically receive {coverage} to your wallet.
                  </li>
                  <li>
                    3. Our oracle system will monitor your flight status and
                    trigger the payout if the delay threshold is exceeded.
                  </li>
                  <li>
                    4. You don't need to submit a claim - everything happens
                    automatically!
                  </li>
                </ol>
              </div>

              <div className="bg-[#0D47A1]/5 rounded-lg p-4 mb-6">
                <div className="flex items-start">
                  <Clock className="w-5 h-5 text-[#0D47A1] mt-0.5 mr-3 flex-shrink-0" />
                  <p className="text-[#0D47A1] text-sm">
                    After your flight lands, you'll receive a notification about
                    the outcome. If a delay occurred, the payout will be sent
                    directly to your connected wallet.
                  </p>
                </div>
              </div>
            </CardContent>

            <CardFooter className="flex flex-col sm:flex-row gap-4 p-6">
              <Button
                onClick={() => localStorage.remove("flightPolicyDraft")}
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
                onClick={() => localStorage.remove("flightPolicyDraft")}
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
