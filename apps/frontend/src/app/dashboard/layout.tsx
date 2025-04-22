"use client";

import type React from "react";

import { useState, useEffect } from "react";
import { Shield, Menu, X } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { Button } from "@/components/ui/button";
import { cn } from "@/libs/utils";
import { Skeleton } from "@/components/ui/skeleton";

// Mock function to check if user is admin - would be replaced with actual contract call
const checkIsAdmin = async (address: string) => {
  // This would be a call to your smart contract
  // For demo purposes, let's assume addresses starting with "0xA" are admins
  return address.startsWith("0xA");
};

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [walletAddress, setWalletAddress] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false);

  const pathname = usePathname();

  // Mock wallet connection
  const connectWallet = async () => {
    // This would be replaced with actual wallet connection logic
    setIsLoading(true);

    // Simulate connection delay
    setTimeout(() => {
      const mockAddress = "0xA1B2C3D4E5F6G7H8I9J0K1L2M3N4O5P6Q7R8S9T0";
      setWalletAddress(mockAddress);
      setIsConnected(true);

      // Check if user is admin
      checkIsAdmin(mockAddress).then((admin) => {
        setIsAdmin(admin);
        setIsLoading(false);
      });
    }, 1000);
  };

  // Disconnect wallet
  const disconnectWallet = () => {
    setIsConnected(false);
    setIsAdmin(false);
    setWalletAddress("");
  };

  // Simulate checking wallet connection on page load
  useEffect(() => {
    const checkConnection = async () => {
      // This would check if wallet is already connected
      setIsLoading(true);
      setTimeout(() => {
        setIsLoading(false);
      }, 1000);
    };

    checkConnection();
  }, []);

  // User navigation items
  const userNavItems = [
    { name: "Dashboard", href: "/dashboard" },
    { name: "My Policies", href: "/dashboard/policies" },
    { name: "My Claims", href: "/dashboard/claims" },
    { name: "Browse Pools", href: "/dashboard/pools" },
  ];

  // Admin navigation items
  const adminNavItems = [
    { name: "Admin Dashboard", href: "/dashboard/admin" },
    { name: "Manage Pools", href: "/dashboard/admin/pools" },
    { name: "Claims Review", href: "/dashboard/admin/claims" },
    { name: "Risk Parameters", href: "/dashboard/admin/risk" },
    { name: "Disputes", href: "/dashboard/admin/disputes" },
  ];

  // Determine which nav items to show based on role
  const navItems = isAdmin ? [...userNavItems, ...adminNavItems] : userNavItems;

  return (
    <div className="flex min-h-screen flex-col">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-2">
            <Link href="/" className="flex items-center gap-2">
              <Shield className="h-6 w-6 text-primary" />
              <span className="text-xl font-bold">ChainSure</span>
            </Link>
          </div>

          {/* Mobile menu button */}
          <button
            className="md:hidden"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? (
              <X className="h-6 w-6" />
            ) : (
              <Menu className="h-6 w-6" />
            )}
          </button>

          {/* Desktop navigation */}
          <nav className="hidden md:flex items-center gap-6">
            {isConnected && (
              <>
                {navItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "text-sm font-medium transition-colors hover:text-primary",
                      pathname === item.href
                        ? "text-primary"
                        : "text-muted-foreground"
                    )}
                  >
                    {item.name}
                  </Link>
                ))}
              </>
            )}
          </nav>

          <div className="flex items-center gap-4">
            {isConnected ? (
              <div className="flex items-center gap-4">
                <div className="hidden md:block">
                  <p className="text-sm font-medium">
                    {walletAddress.substring(0, 6)}...
                    {walletAddress.substring(walletAddress.length - 4)}
                  </p>
                  {isAdmin && (
                    <span className="text-xs text-primary">Admin</span>
                  )}
                </div>
                <Button variant="outline" onClick={disconnectWallet}>
                  Disconnect
                </Button>
              </div>
            ) : (
              <Button onClick={connectWallet} disabled={isLoading}>
                {isLoading ? "Connecting..." : "Connect Wallet"}
              </Button>
            )}
          </div>
        </div>
      </header>

      {/* Mobile navigation */}
      {isMobileMenuOpen && (
        <div className="md:hidden border-b">
          <nav className="container py-4">
            {isConnected ? (
              <div className="flex flex-col space-y-3">
                {navItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "text-sm font-medium transition-colors hover:text-primary",
                      pathname === item.href
                        ? "text-primary"
                        : "text-muted-foreground"
                    )}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    {item.name}
                  </Link>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                Connect your wallet to access the dashboard
              </p>
            )}
          </nav>
        </div>
      )}

      {/* Main content */}
      <main className="flex-1">
        {isLoading ? (
          <div className="container py-8">
            <div className="space-y-4">
              <Skeleton className="h-12 w-[250px]" />
              <div className="grid gap-4 md:grid-cols-3">
                <Skeleton className="h-[125px] rounded-xl" />
                <Skeleton className="h-[125px] rounded-xl" />
                <Skeleton className="h-[125px] rounded-xl" />
              </div>
              <Skeleton className="h-[400px] rounded-xl" />
            </div>
          </div>
        ) : isConnected ? (
          children
        ) : (
          <div className="container py-16 text-center">
            <div className="max-w-md mx-auto space-y-6">
              <h1 className="text-3xl font-bold">
                Welcome to ChainSure Dashboard
              </h1>
              <p className="text-muted-foreground">
                Connect your wallet to access your insurance policies, file
                claims, and manage your coverage.
              </p>
              <Button size="lg" onClick={connectWallet}>
                Connect Wallet
              </Button>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t py-6">
        <div className="container">
          <p className="text-center text-sm text-muted-foreground">
            © {new Date().getFullYear()} ChainSure. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
