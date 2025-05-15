import { ShieldCheck, FileText, Zap } from "lucide-react";
import SummaryCard from "./summary-card";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function SummaryCardsSection() {
  return (
    <div className="grid gap-6 mb-10 md:grid-cols-2 lg:grid-cols-3">
      <SummaryCard
        icon={<ShieldCheck className="w-6 h-6" />}
        title="Active Policies"
        value={3}
        linkText="View My Policies"
        linkHref="/dashboard/policies"
      />

      <SummaryCard
        icon={<FileText className="w-6 h-6" />}
        title="Pending Claims"
        value={1}
        linkText="View Claims History"
        linkHref="/dashboard/claims/history"
      />

      <SummaryCard
        icon={<Zap className="w-6 h-6" />}
        title="Quick Actions"
        value=""
      >
        <div className="flex flex-col gap-2 mt-2">
          <Button
            className="w-full bg-[#0D47A1] hover:bg-[#083984] text-white"
            asChild
          >
            <Link href="/dashboard/policies">View My Policies</Link>
          </Button>
          <Button
            className="w-full bg-[#28A745] hover:bg-[#218838] text-white"
            asChild
          >
            <Link href="/dashboard/claims/submit">Submit a Claim</Link>
          </Button>
          <Button
            className="w-full bg-[#6C757D] hover:bg-[#5a6268] text-white"
            asChild
          >
            <Link href="/dashboard/insurance">Get New Insurance</Link>
          </Button>
        </div>
      </SummaryCard>
    </div>
  );
}
