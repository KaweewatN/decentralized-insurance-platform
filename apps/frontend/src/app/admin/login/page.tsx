import type { Metadata } from "next"
import AdminLoginPageClient from "./AdminLoginPageClient"

export const metadata: Metadata = {
  title: "Admin Login | ChainSure",
  description: "Login to the ChainSure admin dashboard",
}

export default function AdminLoginPage() {
  return <AdminLoginPageClient />
}
