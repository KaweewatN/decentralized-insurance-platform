"use client";

import { useEffect, useState } from "react";
import { ShieldCheck, FileText, Zap } from "lucide-react";
import SummaryCard from "./summary-card";
import { Button } from "@/components/ui/button";
import Link from "next/link";

type PolicySummary = {
  _count: { status: number };
  status: string;
};

export default function SummaryCardsSection() {
  const [activePolicies, setActivePolicies] = useState(0);
  const [pendingClaims, setPendingClaims] = useState(0);

  useEffect(() => {
    const fetchSummary = async () => {
      try {
        const res = await fetch(
          "http://localhost:3001/api/user/policy/summary"
        );
        const data: PolicySummary[] = await res.json();
        setActivePolicies(
          data.find((item) => item.status === "Active")?._count.status || 0
        );
        setPendingClaims(
          data.find((item) => item.status === "PendingPayment")?._count
            .status || 0
        );
      } catch {
        setActivePolicies(0);
        setPendingClaims(0);
      }
    };
    fetchSummary();
  }, []);

  return (
    <div className="grid gap-6 mb-10 md:grid-cols-2 lg:grid-cols-3">
      <SummaryCard
        icon={<ShieldCheck className="w-6 h-6" />}
        title="Active Policies"
        value={activePolicies}
        linkText="View My Policies"
        linkHref="/dashboard/policies"
      />

      <SummaryCard
        icon={<FileText className="w-6 h-6" />}
        title="Pending Claims"
        value={pendingClaims}
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
