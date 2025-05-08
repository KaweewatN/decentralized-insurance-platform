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
import PublicHeader from "@/components/core/header/PublicHeader";
import PublicFooter from "@/components/core/footer/PublicFooter";

export default function Landing() {
  return (
    <div className="flex min-h-screen flex-col">
      {/* Header */}
      <PublicHeader />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="py-20">
          <div className="container px-4 md:px-6">
            <div className="grid gap-6 lg:grid-cols-2 lg:gap-12 items-center">
              <div className="space-y-4">
                <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
                  Decentralized Insurance for the Digital Age
                </h1>
                <p className="text-muted-foreground md:text-xl">
                  ChainSure leverages blockchain technology to provide
                  transparent, efficient, and community-driven insurance
                  solutions.
                </p>
                <div className="flex flex-col sm:flex-row gap-3 pt-4">
                  <Link href="/pools">
                    <Button size="lg" className="gap-1">
                      Explore Pools <ArrowRight className="h-4 w-4" />
                    </Button>
                  </Link>
                  <Link href="/learn-more">
                    <Button size="lg" variant="outline">
                      Learn More
                    </Button>
                  </Link>
                </div>
              </div>
              <div className="relative h-full w-full rounded-lg overflow-hidden">
                <Image
                  src="./assets/images/landing-image.png"
                  alt="ChainSure Platform"
                  width={580}
                  height={580}
                  className="object-contain"
                  priority
                />
              </div>
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section
          id="how-it-works"
          className="py-16 bg-muted/50 bg-appLightBlue"
        >
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
                  How ChainSure Works
                </h2>
                <p className="text-muted-foreground md:text-xl">
                  A simple, transparent process powered by smart contracts
                </p>
              </div>
            </div>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4 mt-12">
              <Card className="bg-background">
                <CardHeader className="pb-2">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                    <span className="text-xl font-bold text-primary">1</span>
                  </div>
                  <CardTitle>Browse Pools</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Explore various insurance pools with different coverage
                    options and terms.
                  </p>
                </CardContent>
              </Card>
              <Card className="bg-background">
                <CardHeader className="pb-2">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                    <span className="text-xl font-bold text-primary">2</span>
                  </div>
                  <CardTitle>Get a Quote</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Receive an instant premium calculation based on your
                    specific needs.
                  </p>
                </CardContent>
              </Card>
              <Card className="bg-background">
                <CardHeader className="pb-2">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                    <span className="text-xl font-bold text-primary">3</span>
                  </div>
                  <CardTitle>Purchase Policy</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Pay premium with cryptocurrency and receive your policy as
                    an NFT.
                  </p>
                </CardContent>
              </Card>
              <Card className="bg-background">
                <CardHeader className="pb-2">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                    <span className="text-xl font-bold text-primary">4</span>
                  </div>
                  <CardTitle>File Claims</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Submit claims with evidence and receive automated payouts
                    when approved.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Key Benefits */}
        <section id="benefits" className="py-16">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
                  Key Benefits
                </h2>
                <p className="text-muted-foreground md:text-xl">
                  Why choose ChainSure for your insurance needs
                </p>
              </div>
            </div>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 mt-12">
              <Card>
                <CardHeader>
                  <Lock className="h-10 w-10 text-primary mb-4" />
                  <CardTitle>Transparency</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    All policies, claims, and fund movements are recorded on the
                    blockchain, providing complete transparency.
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <Zap className="h-10 w-10 text-primary mb-4" />
                  <CardTitle>Speed & Efficiency</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Smart contracts automate policy issuance and claims
                    processing, reducing wait times and administrative costs.
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <Users className="h-10 w-10 text-primary mb-4" />
                  <CardTitle>Community-Driven</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Insurance pools are created and managed by the community,
                    ensuring fair terms and competitive premiums.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Featured Pools */}
        <section id="pools" className="py-16 bg-muted/50 bg-appLightBlue">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
                  Featured Insurance Pools
                </h2>
                <p className="text-muted-foreground md:text-xl">
                  Explore our most popular insurance options
                </p>
              </div>
            </div>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 mt-12">
              <Card className="bg-background">
                <CardHeader>
                  <CardTitle>Flight Delay Insurance</CardTitle>
                  <CardDescription>
                    Protection against flight delays and cancellations
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">
                        Total Value Locked
                      </span>
                      <span className="font-medium">250,000 USDC</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Members</span>
                      <span className="font-medium">1,250</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Claims Paid</span>
                      <span className="font-medium">95%</span>
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  <Link href={`/pools/POOL-001`}>
                    <Button className="w-full">View Details</Button>
                  </Link>
                </CardFooter>
              </Card>
              <Card className="bg-background">
                <CardHeader>
                  <CardTitle>Crypto Asset Protection</CardTitle>
                  <CardDescription>
                    Coverage against smart contract vulnerabilities
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">
                        Total Value Locked
                      </span>
                      <span className="font-medium">500,000 USDC</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Members</span>
                      <span className="font-medium">850</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Claims Paid</span>
                      <span className="font-medium">92%</span>
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  <Link href={`/pools/POOL-002`}>
                    <Button className="w-full">View Details</Button>
                  </Link>
                </CardFooter>
              </Card>
              <Card className="bg-background">
                <CardHeader>
                  <CardTitle>Health Emergency Fund</CardTitle>
                  <CardDescription>
                    Community-funded healthcare coverage
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">
                        Total Value Locked
                      </span>
                      <span className="font-medium">750,000 USDC</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Members</span>
                      <span className="font-medium">2,100</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Claims Paid</span>
                      <span className="font-medium">98%</span>
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  <Link href={`/pools/POOL-003`}>
                    <Button className="w-full">View Details</Button>
                  </Link>
                </CardFooter>
              </Card>
            </div>
            <div className="flex justify-center mt-8">
              <Link href="/pools">
                <Button variant="outline" size="lg">
                  View All Insurance Pools
                </Button>
              </Link>
            </div>
          </div>
        </section>

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

      {/* Footer */}
      <PublicFooter />
    </div>
  );
}
