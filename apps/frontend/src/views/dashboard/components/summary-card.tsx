import type React from "react";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface SummaryCardProps {
  icon: React.ReactNode;
  title: string;
  value: string | number;
  linkText?: string;
  linkHref?: string;
  children?: React.ReactNode;
}

export default function SummaryCard({
  icon,
  title,
  value,
  linkText,
  linkHref,
  children,
}: SummaryCardProps) {
  return (
    <Card className="h-full">
      <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
        <CardTitle className="text-lg font-semibold text-[#212529]">
          {title}
        </CardTitle>
        <div className="text-[#0D47A1]">{icon}</div>
      </CardHeader>
      <CardContent>
        <div className="text-3xl font-bold text-[#212529]">{value}</div>
        {children}
      </CardContent>
      {linkText && linkHref && (
        <CardFooter className="pt-0">
          <Link
            href={linkHref}
            className="text-sm text-[#0D47A1] hover:underline"
          >
            {linkText}
          </Link>
        </CardFooter>
      )}
    </Card>
  );
}
