import type React from "react";
import AdminHeader from "@/components/core/header/AdminHeader";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <AdminHeader />
      <div className="bg-[#F8FAFC] pt-10">{children}</div>
    </>
  );
}
