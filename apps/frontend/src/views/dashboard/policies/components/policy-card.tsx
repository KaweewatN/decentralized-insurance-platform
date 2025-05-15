"use client";

import {
  ArrowRight,
  HeartPulse,
  PlaneTakeoff,
  CloudRain,
  PlusCircle,
} from "lucide-react";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { PolicyCardProps } from "../types/policies.types";

export default function PolicyCard({
  id,
  type,
  status,
  coverageDetail,
  startDate,
  endDate,
  canClaim,
}: PolicyCardProps) {
  // Helper function to get policy type display name
  const getPolicyTypeDisplay = () => {
    switch (type) {
      case "health":
        return "Health Insurance";
      case "flight":
        return "Parametric Flight Delay Insurance";
      case "rainfall":
        return "Parametric Rainfall Insurance";
      default:
        return "Insurance Policy";
    }
  };

  // Helper function to get policy icon
  const getPolicyIcon = () => {
    switch (type) {
      case "health":
        return <HeartPulse className="w-5 h-5" />;
      case "flight":
        return <PlaneTakeoff className="w-5 h-5" />;
      case "rainfall":
        return <CloudRain className="w-5 h-5" />;
      default:
        return null;
    }
  };

  // Helper function to get coverage detail label
  const getCoverageDetailLabel = () => {
    switch (type) {
      case "health":
        return "Sum Assured:";
      case "flight":
        return "Flight:";
      case "rainfall":
        return "Location:";
      default:
        return "Coverage:";
    }
  };

  // Helper function to get status badge variant
  const getStatusBadgeVariant = ():
    | "default"
    | "destructive"
    | "outline"
    | "secondary" => {
    switch (status) {
      case "active":
        return "secondary";
      case "expired":
        return "outline";
      case "pending-payment":
        return "default";
      case "claimed":
      case "payout-processed":
        return "destructive";
      default:
        return "default";
    }
  };

  // Helper function to get status display text
  const getStatusDisplay = () => {
    if (!status) return "Unknown";
    return status
      .split("-")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  // Helper function to get policy type color
  const getPolicyTypeColor = () => {
    switch (type) {
      case "health":
        return "bg-red-50 text-red-600";
      case "flight":
        return "bg-blue-50 text-blue-600";
      case "rainfall":
        return "bg-green-50 text-green-600";
      default:
        return "bg-gray-50 text-gray-600";
    }
  };

  return (
    <Card className="overflow-hidden border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
      <CardContent className="p-5">
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-3">
              <div className={`p-2 rounded-full ${getPolicyTypeColor()}`}>
                {getPolicyIcon()}
              </div>
              <h3 className="text-base font-semibold text-[#212529]">
                {getPolicyTypeDisplay()}
              </h3>
            </div>

            <div className="space-y-2">
              <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
                <span className="text-xs text-gray-500">Policy ID:</span>
                <span className="text-xs font-medium text-[#212529]">{id}</span>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
                <span className="text-xs text-gray-500">
                  {getCoverageDetailLabel()}
                </span>
                <span className="text-xs font-medium text-[#212529]">
                  {coverageDetail}
                </span>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
                <span className="text-xs text-gray-500">Term:</span>
                <span className="text-xs font-medium text-[#212529]">
                  {startDate} to {endDate}
                </span>
              </div>
            </div>
          </div>

          <div className="flex flex-col items-start gap-2">
            <Badge
              variant={getStatusBadgeVariant()}
              className="px-2 py-0.5 text-xs"
            >
              {getStatusDisplay()}
            </Badge>
          </div>
        </div>
      </CardContent>

      <CardFooter className="flex flex-col sm:flex-row gap-2 p-4 pt-0 border-t border-gray-100">
        <Button
          className="w-full sm:w-auto bg-[#0D47A1] hover:bg-[#083984] text-white text-xs h-8 px-3"
          asChild
        >
          <Link href={`/dashboard/policies/${id}`}>
            View Details
            <ArrowRight className="w-3 h-3 ml-1" />
          </Link>
        </Button>

        {canClaim && (
          <Button
            className="w-full sm:w-auto bg-[#28A745] hover:bg-[#218838] text-white text-xs h-8 px-3"
            asChild
          >
            <Link href={`/dashboard/claims/submit?policyId=${id}`}>
              <PlusCircle className="w-3 h-3 mr-1" />
              Submit Claim
            </Link>
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}
