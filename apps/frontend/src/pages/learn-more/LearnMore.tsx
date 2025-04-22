import Link from "next/link";
import { Shield } from "lucide-react";

// components
import PublicHeader from "@/components/core/header/PublicHeader";
import LearnMoreHero from "./components/LearnMoreHero";
import HowItWorksSection from "./components/HowItWorksSection";
import BenefitsSection from "./components/BenefitsSection";
import FAQSection from "./components/FAQSection";
import CtaSection from "./components/CtaSection";

export default function LearnMore() {
  return (
    <div className="flex min-h-screen flex-col">
      {/* Header */}
      <PublicHeader />

      <main className="flex-1">
        <LearnMoreHero />

        <HowItWorksSection />
        <BenefitsSection />
        <FAQSection />
        <CtaSection />
      </main>

      {/* Footer */}
      <footer className="border-t py-12">
        <div className="container px-4 md:px-6">
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Shield className="h-6 w-6 text-primary" />
                <span className="text-xl font-bold">ChainSure</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Decentralized insurance for the digital age, powered by
                blockchain technology.
              </p>
            </div>
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Platform</h3>
              <ul className="space-y-2">
                <li>
                  <Link
                    href="/#how-it-works"
                    className="text-sm text-muted-foreground hover:text-foreground"
                  >
                    How It Works
                  </Link>
                </li>
                <li>
                  <Link
                    href="/pools"
                    className="text-sm text-muted-foreground hover:text-foreground"
                  >
                    Insurance Pools
                  </Link>
                </li>
                <li>
                  <Link
                    href="/dashboard"
                    className="text-sm text-muted-foreground hover:text-foreground"
                  >
                    Policyholder Dashboard
                  </Link>
                </li>
                <li>
                  <Link
                    href="/dashboard/claims/new"
                    className="text-sm text-muted-foreground hover:text-foreground"
                  >
                    File a Claim
                  </Link>
                </li>
              </ul>
            </div>
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Resources</h3>
              <ul className="space-y-2">
                <li>
                  <Link
                    href="#"
                    className="text-sm text-muted-foreground hover:text-foreground"
                  >
                    Documentation
                  </Link>
                </li>
                <li>
                  <Link
                    href="#"
                    className="text-sm text-muted-foreground hover:text-foreground"
                  >
                    Smart Contracts
                  </Link>
                </li>
                <li>
                  <Link
                    href="#"
                    className="text-sm text-muted-foreground hover:text-foreground"
                  >
                    Security Audits
                  </Link>
                </li>
                <li>
                  <Link
                    href="#"
                    className="text-sm text-muted-foreground hover:text-foreground"
                  >
                    FAQ
                  </Link>
                </li>
              </ul>
            </div>
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Legal</h3>
              <ul className="space-y-2">
                <li>
                  <Link
                    href="#"
                    className="text-sm text-muted-foreground hover:text-foreground"
                  >
                    Terms of Service
                  </Link>
                </li>
                <li>
                  <Link
                    href="#"
                    className="text-sm text-muted-foreground hover:text-foreground"
                  >
                    Privacy Policy
                  </Link>
                </li>
                <li>
                  <Link
                    href="#"
                    className="text-sm text-muted-foreground hover:text-foreground"
                  >
                    Cookie Policy
                  </Link>
                </li>
              </ul>
            </div>
          </div>
          <div className="mt-12 pt-8 border-t">
            <p className="text-center text-sm text-muted-foreground">
              © {new Date().getFullYear()} ChainSure. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
