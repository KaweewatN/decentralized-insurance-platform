"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Shield, ArrowLeft } from "lucide-react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { WalletConnector } from "@/components/blockchain/wallet-connector"
import { isAdmin } from "@/lib/admin-utils"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"

export default function AdminLoginPageClient() {
  const [walletAddress, setWalletAddress] = useState<string | null>(null)
  const [isAdminWallet, setIsAdminWallet] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  const handleWalletConnect = (address: string) => {
    setWalletAddress(address)
    const adminStatus = isAdmin(address)
    setIsAdminWallet(adminStatus)

    if (!adminStatus) {
      setError("This wallet does not have admin privileges.")
    } else {
      // Store the wallet address in session storage for admin authentication
      sessionStorage.setItem("adminWallet", address)
      router.push("/admin")
    }
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col items-center justify-center p-4">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="flex justify-center">
            <Shield className="h-12 w-12 text-[#4CAF50]" />
          </div>
          <h1 className="mt-4 text-3xl font-bold text-[#1E293B]">Admin Access</h1>
          <p className="mt-2 text-gray-600">Connect your wallet to access the admin dashboard</p>
        </div>

        <Card className="border-[#E2E8F0] shadow-lg">
          <CardHeader>
            <CardTitle>Admin Authentication</CardTitle>
            <CardDescription>
              Connect your MetaMask wallet with admin privileges to access the dashboard
            </CardDescription>
          </CardHeader>
          <CardContent>
            {error && (
              <Alert variant="destructive" className="mb-4">
                <AlertTitle>Access Denied</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            <WalletConnector onConnect={handleWalletConnect} />
          </CardContent>
          <CardFooter className="flex justify-center border-t pt-4">
            <Button variant="ghost" onClick={() => router.push("/role-select")} className="text-gray-500">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Role Selection
            </Button>
          </CardFooter>
        </Card>

        <div className="text-center text-sm text-gray-500">
          <p>
            For testing purposes, the wallet address <code>0xf3B4a7d3C0a3C539F091B4c8e8F9cC4e730D2f98</code> has admin
            privileges.
          </p>
        </div>
      </div>
    </div>
  )
}
