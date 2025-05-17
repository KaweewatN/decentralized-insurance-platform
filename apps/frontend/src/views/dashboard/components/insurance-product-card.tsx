"use client";

import type React from "react";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";

interface InsuranceProductCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  features: string[];
  ctaText: string;
  ctaLink: string;
}

export default function InsuranceProductCard({
  icon,
  title,
  description,
  features,
  ctaText,
  ctaLink,
}: InsuranceProductCardProps) {
  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="pb-2">
        <div className="flex items-center gap-2">
          <div className="text-[#0D47A1]">{icon}</div>
          <CardTitle className="text-xl font-semibold text-[#212529]">
            {title}
          </CardTitle>
        </div>
      </CardHeader>
      <CardContent className="flex-grow">
        <p className="mb-4 text-[#212529]">{description}</p>
        <ul className="space-y-2">
          {features &&
            features.map((feature, index) => (
              <li key={index} className="flex items-start">
                <svg
                  className="w-5 h-5 mr-2 text-[#28A745]"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
                <span className="text-sm text-[#212529]">{feature}</span>
              </li>
            ))}
        </ul>
      </CardContent>
      <CardFooter className="pt-4">
        <Button
          className="w-full bg-[#0D47A1] hover:bg-[#083984] text-white"
          asChild
        >
          <Link href={ctaLink}>{ctaText}</Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
