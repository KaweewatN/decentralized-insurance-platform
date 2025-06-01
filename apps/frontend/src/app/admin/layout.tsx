import type React from "react";
import { redirect } from "next/navigation";
import AdminHeader from "@/components/core/header/AdminHeader";
import { authenticateAdmin } from "@/app/api/auth/[...nextauth]/auth";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  try {
    await authenticateAdmin();
  } catch (error) {
    // Redirect to login page instead of throwing error
    redirect("/");
  }

  return (
    <>
      <AdminHeader />
      <div className="bg-[#F8FAFC] pt-10">{children}</div>
    </>
  );
}
