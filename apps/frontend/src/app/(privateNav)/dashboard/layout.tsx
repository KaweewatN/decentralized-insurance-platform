import PrimaryHeader from "@/components/core/header/PrimaryHeader";
import React from "react";
import { authenticateUser } from "@/app/api/auth/[...nextauth]/auth";
import { redirect } from "next/navigation";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  try {
    await authenticateUser();
  } catch {
    redirect("/");
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <PrimaryHeader />
      <main className="px-10">{children}</main>
    </div>
  );
}
