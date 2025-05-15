"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Shield } from "lucide-react";
import { useMobile } from "@/hooks/use-mobile";
import SignInButton from "@/components/core/common/SignInButton";

export default function PublicHeader() {
  const { data: session } = useSession();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const isMobile = useMobile();

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const navLinks = [
    { href: "#how-it-works", label: "How It Works" },
    { href: "#features", label: "Features" },
    { href: "/learn-more", label: "Learn More" },
    { href: "/dashboard", label: "Dashboard", protected: true },
  ];

  return (
    <nav className="sticky top-0 z-50 w-full bg-white border-b border-gray-200 shadow-sm">
      <div className="container flex items-center justify-between h-16 px-4 mx-auto">
        {/* Logo */}
        <Link href="/" className="flex items-center">
          <Shield className="h-8 w-8 text-blue-700" />
          <span className="ml-2 text-xl font-bold text-blue-700">
            ChainSure
          </span>
        </Link>

        {/* Desktop Navigation */}
        {!isMobile && (
          <div className="flex items-center space-x-6 ml-10">
            {navLinks.map((link) =>
              link.protected && !session ? (
                <span
                  key={link.href}
                  className="text-gray-300 font-medium rounded-md px-3 py-2 cursor-not-allowed"
                  title="Sign in to access"
                >
                  {link.label}
                </span>
              ) : (
                <Link
                  key={link.href}
                  href={link.href}
                  className="text-gray-500 hover:text-[#0D47A1] hover:bg-blue-100 font-medium transition-colors rounded-md px-3 py-2"
                >
                  {link.label}
                </Link>
              )
            )}
          </div>
        )}

        {/* Launch DApp Button */}
        {!isMobile && <SignInButton />}

        {/* Mobile Menu Button */}
        {isMobile && (
          <Button
            variant="ghost"
            size="icon"
            className="ml-auto mr-2"
            onClick={toggleMenu}
            aria-label={isMenuOpen ? "Close menu" : "Open menu"}
          >
            {isMenuOpen ? (
              <X className="w-5 h-5" />
            ) : (
              <Menu className="w-5 h-5" />
            )}
          </Button>
        )}

        {/* Mobile Launch Button */}
        {isMobile && (
          <Button
            className="bg-[#28A745] hover:bg-[#218838] text-white"
            size="sm"
            asChild
          >
            <SignInButton />
          </Button>
        )}
      </div>

      {/* Mobile Navigation Menu */}
      {isMobile && isMenuOpen && (
        <div className="absolute w-full bg-white border-b border-gray-200 shadow-md">
          <div className="container px-4 py-3 mx-auto space-y-3">
            {navLinks.map((link) =>
              link.protected && !session ? (
                <span
                  key={link.href}
                  className="block py-2 text-gray-300 font-medium cursor-not-allowed"
                  title="Sign in to access"
                >
                  {link.label}
                </span>
              ) : (
                <Link
                  key={link.href}
                  href={link.href}
                  className="block py-2 text-[#212529] hover:text-[#0D47A1] font-medium transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {link.label}
                </Link>
              )
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
