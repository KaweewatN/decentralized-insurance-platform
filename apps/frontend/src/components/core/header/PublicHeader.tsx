import Link from "next/link";
import { Shield } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function PublicHeader() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-2">
          <Link href="/" className="flex items-center gap-2">
            <Shield className="h-6 w-6 text-primary" />
            <span className="text-xl font-bold">ChainSure</span>
          </Link>
        </div>
        <nav className="hidden md:flex items-center gap-6">
          <Link
            href="/#how-it-works"
            className="text-sm font-medium hover:text-primary"
          >
            How It Works
          </Link>
          <Link
            href="/#benefits"
            className="text-sm font-medium hover:text-primary"
          >
            Benefits
          </Link>
          <Link
            href="/pools"
            className="text-sm font-medium hover:text-primary"
          >
            Insurance Pools
          </Link>
          <Link
            href="/#security"
            className="text-sm font-medium hover:text-primary"
          >
            Security
          </Link>
        </nav>
        <Link href="/dashboard">
          <Button>Connect Wallet</Button>
        </Link>
      </div>
    </header>
  );
}
