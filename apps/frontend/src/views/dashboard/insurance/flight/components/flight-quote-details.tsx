import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import {
  Plane,
  Calendar,
  PlaneTakeoff,
  PlaneLanding,
  Shield,
  Clock,
  AlertTriangle,
} from "lucide-react";
import apiService from "@/utils/apiService";

interface FlightDetails {
  flightNumber: string;
  departureDate: Date;
  departureAirport: string;
  arrivalAirport: string;
  coverageTier: string;
}

interface PremiumDetails {
  premium: number;
  coverageAmount: number;
  delayThreshold: string;
  policyTerms: string;
  riskFactor: string;
  validUntil: Date;
}

interface FlightQuoteDetailsProps {
  flightDetails: FlightDetails;
  premiumDetails: PremiumDetails;
}

interface EthToThbResponse {
  ethToThb: number;
}

export function FlightQuoteDetails({
  flightDetails,
  premiumDetails,
}: FlightQuoteDetailsProps) {
  // Format the departure date
  const [ethToThb, setEthToThb] = useState<number>(0);

  // Fetch ETH/THB price from API
  useEffect(() => {
    const fetchEthToThb = async () => {
      try {
        const data = await apiService.get<EthToThbResponse>("/price/eththb");
        setEthToThb(data.ethToThb);
      } catch (error) {
        console.error("Error fetching ETH to THB price:", error);
      }
    };

    fetchEthToThb();
  }, []);

  // Helper function to convert ETH to THB
  const ethToThbAmount = (ethAmount: number) => {
    return (ethAmount * ethToThb).toFixed(0);
  };

  // Format currency with commas
  const formatCurrency = (amount: string | number) => {
    return amount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  };

  const formattedDepartureDate = flightDetails.departureDate.toLocaleDateString(
    "en-US",
    {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    }
  );

  // Format the quote validity
  const formattedValidUntil = premiumDetails.validUntil.toLocaleString(
    "en-US",
    {
      dateStyle: "medium",
      timeStyle: "short",
    }
  );

  // Get coverage tier display name
  const getCoverageTierName = (tier: string) => {
    switch (tier) {
      case "tier1":
        return "Basic (0.1 ETH)";
      case "tier2":
        return "Standard (0.25 ETH)";
      case "tier3":
        return "Premium (0.5 ETH)";
      default:
        return "Custom";
    }
  };

  return (
    <div className="space-y-6 mb-6">
      {/* Flight Details Card */}
      <Card>
        <CardContent className="p-6">
          <h2 className="text-xl font-semibold text-[#212529] mb-4">
            Flight Details
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-start">
              <Plane className="h-5 w-5 text-[#0D47A1] mt-0.5 mr-3" />
              <div>
                <p className="text-sm text-gray-500">Flight Number</p>
                <p className="font-medium text-[#212529]">
                  {flightDetails.flightNumber}
                </p>
              </div>
            </div>
            <div className="flex items-start">
              <Calendar className="h-5 w-5 text-[#0D47A1] mt-0.5 mr-3" />
              <div>
                <p className="text-sm text-gray-500">Departure Date</p>
                <p className="font-medium text-[#212529]">
                  {formattedDepartureDate}
                </p>
              </div>
            </div>
            <div className="flex items-start">
              <PlaneTakeoff className="h-5 w-5 text-[#0D47A1] mt-0.5 mr-3" />
              <div>
                <p className="text-sm text-gray-500">Departure Airport</p>
                <p className="font-medium text-[#212529]">
                  {flightDetails.departureAirport}
                </p>
              </div>
            </div>
            <div className="flex items-start">
              <PlaneLanding className="h-5 w-5 text-[#0D47A1] mt-0.5 mr-3" />
              <div>
                <p className="text-sm text-gray-500">Arrival Airport</p>
                <p className="font-medium text-[#212529]">
                  {flightDetails.arrivalAirport}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Premium Quote Card */}
      <Card>
        <CardContent className="p-6">
          <h2 className="text-xl font-semibold text-[#212529] mb-4">
            Premium Quote
          </h2>

          <div className="bg-[#E3F2FD] border border-[#64B5F6] rounded-md p-4 mb-6">
            <div className="flex items-start">
              <Shield className="h-5 w-5 text-[#0D47A1] mt-0.5 mr-3" />
              <div>
                <p className="font-medium text-[#0D47A1]">Your Premium</p>
                <div className="flex items-baseline gap-2">
                  <p className="text-2xl font-bold text-[#0D47A1]">
                    {premiumDetails.premium} ETH
                  </p>
                  <p className="text-sm text-[#0D47A1]">
                    (฿{formatCurrency(ethToThbAmount(premiumDetails.premium))}{" "}
                    THB)
                  </p>
                </div>
                <p className="text-sm text-[#0D47A1] mt-1">
                  For coverage of {premiumDetails.coverageAmount} ETH (฿
                  {formatCurrency(
                    ethToThbAmount(premiumDetails.coverageAmount)
                  )}{" "}
                  THB) if flight is delayed by more than{" "}
                  {premiumDetails.delayThreshold}
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-start">
              <Shield className="h-5 w-5 text-[#0D47A1] mt-0.5 mr-3" />
              <div>
                <p className="text-sm text-gray-500">Coverage Tier</p>
                <p className="font-medium text-[#212529]">
                  {getCoverageTierName(flightDetails.coverageTier)}
                </p>
              </div>
            </div>
            <div className="flex items-start">
              <Clock className="h-5 w-5 text-[#0D47A1] mt-0.5 mr-3" />
              <div>
                <p className="text-sm text-gray-500">Delay Threshold</p>
                <p className="font-medium text-[#212529]">
                  {premiumDetails.delayThreshold}
                </p>
              </div>
            </div>
            <div className="flex items-start">
              <AlertTriangle className="h-5 w-5 text-[#0D47A1] mt-0.5 mr-3" />
              <div>
                <p className="text-sm text-gray-500">Risk Factor</p>
                <p className="font-medium text-[#212529]">
                  {premiumDetails.riskFactor}
                </p>
              </div>
            </div>
            <div className="flex items-start">
              <Clock className="h-5 w-5 text-[#0D47A1] mt-0.5 mr-3" />
              <div>
                <p className="text-sm text-gray-500">Quote Valid Until</p>
                <p className="font-medium text-[#212529]">
                  {formattedValidUntil}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
