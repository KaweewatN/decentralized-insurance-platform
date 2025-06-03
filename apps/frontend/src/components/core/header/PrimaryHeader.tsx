"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { signOut } from "next-auth/react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/libs/utils";
import { Button } from "@/components/ui/button";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Home,
  Shield,
  FileText,
  User,
  Menu,
  X,
  ChevronDown,
  Umbrella,
  Plane,
  Cloud,
  Heart,
  LogOut,
  Wallet,
} from "lucide-react";

export default function PrimaryHeader() {
  const pathname = usePathname() || "";
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { data: session } = useSession();
  const walletAddress = session?.user?.id || "";

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  // Navigation paths in Dashboard
  const navItems = [
    {
      name: "Dashboard",
      href: "/dashboard",
      icon: <Home className="h-5 w-5" />,
    },
    {
      name: "Insurance",
      href: "/dashboard/insurance",
      icon: <Shield className="h-5 w-5" />,
      dropdown: [
        {
          name: "Health Insurance",
          href: "/dashboard/insurance/health/apply",
          icon: <Heart className="h-4 w-4" />,
        },
        {
          name: "Life Insurance",
          href: "/dashboard/insurance/life/apply",
          icon: <Umbrella className="h-4 w-4" />,
        },
        {
          name: "Flight Delay Insurance",
          href: "/dashboard/insurance/flight/apply",
          icon: <Plane className="h-4 w-4" />,
        },
        {
          name: "Rainfall Insurance",
          href: "/dashboard/insurance/rainfall/apply",
          icon: <Cloud className="h-4 w-4" />,
        },
      ],
    },
    {
      name: "My Policies",
      href: "/dashboard/policies",
      icon: <FileText className="h-5 w-5" />,
    },
    {
      name: "Claims",
      href: "/dashboard/claims",
      icon: <Umbrella className="h-5 w-5" />,
      dropdown: [
        {
          name: "Submit a Claim",
          href: "/dashboard/claims/submit",
          icon: <FileText className="h-4 w-4" />,
        },
        {
          name: "Claims History",
          href: "/dashboard/claims/history",
          icon: <FileText className="h-4 w-4" />,
        },
      ],
    },
    {
      name: "Account",
      href: "/dashboard/account",
      icon: <User className="h-5 w-5" />,
    },
  ];

  const isActive = (path: string) => {
    if (path === "/dashboard" && pathname === "/dashboard") {
      return true;
    }
    return pathname.startsWith(path) && path !== "/dashboard";
  };

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-30">
      <div className="w-full mx-auto px-4 sm:px-6 lg:px-16">
        <div className="flex justify-between h-16 ">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <Link href="/" className="flex items-center">
                <Shield className="h-8 w-8 text-blue-700" />
                <span className="ml-2 text-xl font-bold text-blue-700">
                  ChainSure
                </span>
              </Link>
            </div>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex md:items-center md:space-x-4">
            {navItems.map((item) => {
              if (item.dropdown) {
                return (
                  <DropdownMenu key={item.name}>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        className={cn(
                          "flex items-center px-3 py-2 text-sm font-semibold rounded-md",
                          isActive(item.href)
                            ? "text-blue-700 bg-blue-100"
                            : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                        )}
                      >
                        {item.icon}
                        <span className="ml-2">{item.name}</span>
                        <ChevronDown className="ml-1 h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      {item.dropdown.map((dropdownItem) => (
                        <DropdownMenuItem key={dropdownItem.name} asChild>
                          <Link
                            href={dropdownItem.href}
                            className="flex items-center"
                          >
                            {dropdownItem.icon}
                            <span className="ml-2">{dropdownItem.name}</span>
                          </Link>
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>
                );
              }

              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    "flex items-center px-3 py-2 text-sm font-semibold rounded-md",
                    isActive(item.href)
                      ? "text-blue-700 bg-blue-100"
                      : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                  )}
                >
                  {item.icon}
                  <span className="ml-2">{item.name}</span>
                </Link>
              );
            })}
            {walletAddress && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <span className="flex items-center px-3 py-2 text-sm font-semibold rounded-md text-gray-700 cursor-pointer border border-gray-300">
                    <Wallet className="h-5 w-5 mr-2 text-primary" />
                    {walletAddress.substring(0, 6)}...
                    {walletAddress.substring(walletAddress.length - 4)}
                  </span>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem asChild>
                    <a
                      href={`https://etherscan.io/address/${walletAddress}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center text-blue-600 hover:text-blue-800 cursor-pointer"
                    >
                      <Wallet className="h-5 w-5 font-semibold mr-1" />
                      <span className="font-semibold">View on Etherscan</span>
                    </a>
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    className="flex items-center text-red-600 hover:text-red-800 cursor-pointer"
                    onClick={() => signOut()}
                  >
                    <LogOut className="h-5 w-5 font-semibold mr-1" />
                    <span className="font-semibold">Sign out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="flex items-center md:hidden">
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleMenu}
              aria-label="Open menu"
            >
              {isMenuOpen ? (
                <X className="h-10 w-10" />
              ) : (
                <Menu className="h-10 w-10" />
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-white border-t border-gray-200">
          <div className="pt-2 pb-4 space-y-1">
            {navItems.map((item) => {
              if (item.dropdown) {
                return (
                  <div key={item.name} className="space-y-1">
                    <div
                      className={cn(
                        "flex items-center px-4 py-2 text-base font-semibold",
                        isActive(item.href)
                          ? "text-primary bg-primary/10"
                          : "text-gray-600"
                      )}
                    >
                      {item.icon}
                      <span className="ml-3">{item.name}</span>
                    </div>
                    <div className="pl-10 space-y-1">
                      {item.dropdown.map((dropdownItem) => (
                        <Link
                          key={dropdownItem.name}
                          href={dropdownItem.href}
                          className={cn(
                            "flex items-center px-4 py-2 text-sm font-semibold",
                            pathname === dropdownItem.href
                              ? "text-primary bg-primary/10"
                              : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                          )}
                          onClick={() => setIsMenuOpen(false)}
                        >
                          {dropdownItem.icon}
                          <span className="ml-3">{dropdownItem.name}</span>
                        </Link>
                      ))}
                    </div>
                  </div>
                );
              }

              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    "flex items-center px-4 py-2 text-base font-semibold",
                    isActive(item.href)
                      ? "text-primary bg-primary/10"
                      : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                  )}
                  onClick={() => setIsMenuOpen(false)}
                >
                  {item.icon}
                  <span className="ml-3">{item.name}</span>
                </Link>
              );
            })}
            <button
              className="flex items-center px-4 py-2 text-base font-semibold text-red-600 hover:text-red-800 w-full"
              onClick={() => {
                setIsMenuOpen(false);
                () => signOut();
              }}
            >
              <a
                href={`https://etherscan.io/address/${walletAddress}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center text-blue-600 hover:text-blue-800 cursor-pointer"
              >
                <Wallet className="h-5 w-5 font-semibold mr-1" />
                <span className="font-semibold">View on Etherscan</span>
              </a>
            </button>

            {/* Signout Button for Mobile */}
            <button
              className="flex items-center px-4 py-2 text-base font-medium text-red-600 hover:text-red-800 w-full"
              onClick={() => {
                setIsMenuOpen(false);
                () => signOut();
              }}
            >
              <LogOut className="h-5 w-5 font-semibold" />
              <span className="font-semibold ml-1">Sign out</span>
            </button>
          </div>
        </div>
      )}
    </nav>
  );
}
