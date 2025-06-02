import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Clock, FileText, ArrowRight } from "lucide-react";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";

interface ApplicationReviewCardProps {
  application: {
    id: string;
    type: string;
    status: string;
    submittedAt: string;
    riskScore: number;
    preliminaryPremium: number;
    personalInfo: {
      fullName: string;
    };
    [key: string]: any;
  };
}

export function ApplicationReviewCard({
  application,
}: ApplicationReviewCardProps) {
  const {
    id,
    type,
    planTypeid,
    walletAddress,
    sumAssured,
    submittedAt,
    riskScore,
    premium,
    fullName,
  } = application;

  // Format the date as "X days/hours ago"
  const getTimeAgo = () => {
    try {
      const date = new Date(submittedAt);
      // Check if date is valid
      if (isNaN(date.getTime())) {
        return "Unknown date";
      }
      return formatDistanceToNow(date, { addSuffix: true });
    } catch (error) {
      console.warn("Invalid date format:", submittedAt);
      return "Unknown date";
    }
  };

  const timeAgo = getTimeAgo();
  // Determine risk level color based on score
  const getRiskColor = (score: number) => {
    if (score < 30) return "bg-green-100 text-green-800";
    if (score < 70) return "bg-yellow-100 text-yellow-800";
    return "bg-red-100 text-red-800";
  };

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <CardTitle className="text-lg">
            {fullName || "Unknown User"}
          </CardTitle>
          <Badge
            variant="outline"
            className="bg-blue-50 text-blue-700 hover:bg-blue-50"
          >
            {type}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="pb-2">
        <div className="grid grid-cols-2 gap-10 mb-4 mt-3">
          <div className="flex flex-col items-start gap-y-3">
            <div>
              <p className="text-sm text-gray-500">Wallet Address</p>
              <p className="font-mono text-sm">
                {walletAddress
                  ? `${walletAddress.substring(0, 6)}...${walletAddress.substring(walletAddress.length - 4)}`
                  : "Unknown"}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Sum Assured</p>
              <p>{sumAssured}</p>
            </div>
          </div>
          <div className="flex flex-col items-start gap-y-3">
            <div>
              <p className="text-sm text-gray-500">Premium</p>
              <p className="font-medium">{premium} ETH</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Risk</p>
              <div className="flex items-center mt-1">
                <span
                  className={`text-xs px-2 py-1 rounded-full ${getRiskColor(riskScore)}`}
                >
                  {riskScore}/100
                </span>
              </div>
            </div>
          </div>
        </div>
        <div className="flex items-center text-sm text-gray-500 gap-1">
          <FileText className="h-4 w-4" /> Application ID: {id}
        </div>
      </CardContent>
      <CardFooter className="pt-2">
        <Link href={`/admin/applications/${id}`} className="w-full">
          <Button variant="outline" className="w-full">
            Review Application <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </Link>
      </CardFooter>
    </Card>
  );
}
