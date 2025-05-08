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
  // Removed isConnected
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [walletAddress, setWalletAddress] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false);

  const pathname = usePathname();

  // Removed connectWallet and disconnectWallet

  // Simulate checking wallet connection on page load
  useEffect(() => {
    const checkConnection = async () => {
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
          </nav>

          {/* Removed wallet connect/disconnect UI */}
        </div>
      </header>

      {/* Mobile navigation */}
      {isMobileMenuOpen && (
        <div className="md:hidden border-b">
          <nav className="container py-4">
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
        ) : (
          children
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
