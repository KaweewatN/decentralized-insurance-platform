import Link from "next/link";
import Image from "next/image";
import {
  Shield,
  Lock,
  Zap,
  Users,
  ArrowRight,
  CheckCircle,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import LandingHeroSection from "./components/LadingHeroSection";
import HowItWorks from "./components/HowItWorks";
import FeaturedPool from "./components/FeaturedPools";
import KeyBenefits from "./components/KeyBenefits";

export default function Landing() {
  return (
    <div className="flex min-h-screen flex-col">
      <main className="flex-1">
        {/* Hero Section */}
        <LandingHeroSection />

        {/* How It Works */}
        <HowItWorks />

        {/* Key Benefits */}
        <KeyBenefits />

        {/* Featured Pools */}
        <FeaturedPool />

        {/* Trust & Security */}
        <section id="security" className="py-16">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
                  Trust & Security
                </h2>
                <p className="text-muted-foreground md:text-xl">
                  Your security is our top priority
                </p>
              </div>
            </div>
            <div className="grid gap-8 md:grid-cols-2 mt-12">
              <div className="space-y-4">
                <h3 className="text-xl font-bold">Audited Smart Contracts</h3>
                <p className="text-muted-foreground">
                  All our smart contracts undergo rigorous security audits by
                  leading blockchain security firms to ensure the safety of your
                  funds.
                </p>
                <ul className="space-y-2">
                  {[
                    "PolicyFactory",
                    "PolicyPool",
                    "PolicyNFT (ERC721)",
                    "ClaimManager",
                    "Treasury/PremiumHandler (ERC20)",
                  ].map((contract) => (
                    <li key={contract} className="flex items-center gap-2">
                      <CheckCircle className="h-5 w-5 text-green-500" />
                      <span>{contract}</span>
                    </li>
                  ))}
                </ul>
                <Button variant="outline">View Audit Reports</Button>
              </div>
              <div className="space-y-4">
                <h3 className="text-xl font-bold">Transparent Operations</h3>
                <p className="text-muted-foreground">
                  ChainSure operates with complete transparency. All
                  transactions, policy terms, and claim evidence are stored on
                  the blockchain and IPFS, accessible to anyone.
                </p>
                <div className="grid grid-cols-2 gap-4 mt-6">
                  <Card className="bg-muted/30">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg">Open Source</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground">
                        All our code is open source and available for review.
                      </p>
                    </CardContent>
                  </Card>
                  <Card className="bg-muted/30">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg">Decentralized</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground">
                        No central authority controls the platform.
                      </p>
                    </CardContent>
                  </Card>
                  <Card className="bg-muted/30">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg">Immutable</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground">
                        Policy terms cannot be changed after issuance.
                      </p>
                    </CardContent>
                  </Card>
                  <Card className="bg-muted/30">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg">Automated</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground">
                        Claims processing follows predefined rules.
                      </p>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 bg-primary text-primary-foreground">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
                  Ready to Get Started?
                </h2>
                <p className="md:text-xl opacity-90">
                  Join the decentralized insurance revolution today
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-3 pt-4">
                <Link href="/dashboard">
                  <Button size="lg" variant="secondary" className="gap-1">
                    Connect Wallet <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
                <Link href="/learn-more">
                  <Button
                    size="lg"
                    variant="outline"
                    className="bg-transparent border-primary-foreground hover:bg-primary-foreground hover:text-primary"
                  >
                    Learn More
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
