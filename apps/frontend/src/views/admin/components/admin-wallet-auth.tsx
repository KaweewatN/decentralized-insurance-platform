"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle } from "lucide-react"
import { isAdminWallet } from "@/lib/admin-utils"

export function AdminWalletAuth() {
  const [wallet, setWallet] = useState<string | null>(null)
  const [isConnecting, setIsConnecting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  useEffect(() => {
    // Check if wallet is already connected and is admin
    const checkExistingWallet = async () => {
      if (typeof window.ethereum !== "undefined") {
        try {
          const accounts = await window.ethereum.request({ method: "eth_accounts" })
          if (accounts.length > 0) {
            const address = accounts[0]
            setWallet(address)

            // Check if this wallet has admin privileges
            const isAdmin = await isAdminWallet(address)
            if (isAdmin) {
              // Store admin session
              sessionStorage.setItem("adminWallet", address)
              router.push("/admin")
            }
          }
        } catch (err) {
          console.error("Error checking existing wallet:", err)
        }
      }
    }

    checkExistingWallet()
  }, [router])

  const connectWallet = async () => {
    setIsConnecting(true)
    setError(null)

    if (typeof window.ethereum !== "undefined") {
      try {
        const accounts = await window.ethereum.request({ method: "eth_requestAccounts" })
        const address = accounts[0]
        setWallet(address)

        // Check if this wallet has admin privileges
        const isAdmin = await isAdminWallet(address)
        if (isAdmin) {
          // Store admin session
          sessionStorage.setItem("adminWallet", address)
          router.push("/admin")
        } else {
          setError("This wallet does not have admin privileges")
        }
      } catch (err: any) {
        setError(err.message || "Failed to connect wallet")
      }
    } else {
      setError("Ethereum wallet not detected. Please install MetaMask or another wallet provider.")
    }

    setIsConnecting(false)
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Admin Authentication</CardTitle>
        <CardDescription>Connect your wallet to access admin features</CardDescription>
      </CardHeader>
      <CardContent>
        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {wallet ? (
          <div className="p-4 border rounded-md bg-muted">
            <p className="font-mono text-sm break-all">{wallet}</p>
            <p className="text-sm mt-2">{error ? "Not authorized as admin" : "Wallet connected"}</p>
          </div>
        ) : (
          <p className="text-center py-4">No wallet connected</p>
        )}
      </CardContent>
      <CardFooter>
        <Button onClick={connectWallet} disabled={isConnecting} className="w-full">
          {isConnecting ? "Connecting..." : wallet ? "Reconnect Wallet" : "Connect Wallet"}
        </Button>
      </CardFooter>
    </Card>
  )
}
