import Link from "next/link"
import Image from "next/image"
import { Shield, ArrowRight, CheckCircle, Lock, Zap, Users, FileText, Wallet, Clock } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function LearnMore() {
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
          <nav className="hidden md:flex items-center gap-6">
            <Link href="/#how-it-works" className="text-sm font-medium hover:text-primary">
              How It Works
            </Link>
            <Link href="/#benefits" className="text-sm font-medium hover:text-primary">
              Benefits
            </Link>
            <Link href="/pools" className="text-sm font-medium hover:text-primary">
              Insurance Pools
            </Link>
            <Link href="/#security" className="text-sm font-medium hover:text-primary">
              Security
            </Link>
          </nav>
          <Link href="/dashboard">
            <Button>Connect Wallet</Button>
          </Link>
        </div>
      </header>

      <main className="flex-1">
        {/* Hero Section */}
        <section className="py-20 md:py-28 bg-muted/30">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center text-center space-y-4 max-w-3xl mx-auto">
              <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
                Decentralized Insurance Reimagined
              </h1>
              <p className="text-muted-foreground md:text-xl max-w-[700px]">
                ChainSure leverages blockchain technology to create a transparent, efficient, and community-driven
                insurance platform that puts policyholders first.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 pt-4">
                <Link href="/pools">
                  <Button size="lg" className="gap-1">
                    Explore Pools <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
                <Link href="/dashboard">
                  <Button size="lg" variant="outline">
                    Connect Wallet
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* About Section */}
        <section className="py-16">
          <div className="container px-4 md:px-6">
            <div className="grid gap-6 lg:grid-cols-2 lg:gap-12 items-center">
              <div className="space-y-4">
                <h2 className="text-3xl font-bold tracking-tighter">About ChainSure</h2>
                <p className="text-muted-foreground">
                  ChainSure was founded with a simple mission: to make insurance more transparent, efficient, and
                  accessible to everyone. By leveraging blockchain technology, we've created a platform where insurance
                  policies are represented as NFTs, claims are processed automatically through smart contracts, and
                  community members can participate in insurance pools.
                </p>
                <p className="text-muted-foreground">
                  Our platform eliminates the traditional insurance model's inefficiencies and opacity, replacing them
                  with transparent rules, automated processes, and community governance. This results in lower premiums,
                  faster claims, and a more equitable insurance ecosystem for all participants.
                </p>
              </div>
              <div className="relative h-[350px] w-full rounded-lg overflow-hidden">
                <Image
                  src="/placeholder.svg?height=700&width=700"
                  alt="About ChainSure"
                  fill
                  className="object-cover"
                />
              </div>
            </div>
          </div>
        </section>

        {/* How It Works (Detailed) */}
        <section className="py-16 bg-muted/30">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center mb-10">
              <h2 className="text-3xl font-bold tracking-tighter">How ChainSure Works</h2>
              <p className="text-muted-foreground md:text-xl max-w-[700px]">
                A detailed look at our blockchain-powered insurance platform
              </p>
            </div>

            <div className="grid gap-8 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                    <Wallet className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle>Smart Contract Architecture</CardTitle>
                  <CardDescription>The technology behind ChainSure</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p>
                    ChainSure is built on a robust system of smart contracts that handle every aspect of the insurance
                    process:
                  </p>
                  <ul className="space-y-2">
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                      <span>
                        <strong>PolicyFactory:</strong> Creates new policy pools and types
                      </span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                      <span>
                        <strong>PolicyPool:</strong> Manages specific insurance types, holds funds, defines rules
                      </span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                      <span>
                        <strong>PolicyNFT (ERC721):</strong> Represents individual policies as NFTs
                      </span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                      <span>
                        <strong>ClaimManager:</strong> Handles claim submission, validation, and payouts
                      </span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                      <span>
                        <strong>Treasury/PremiumHandler:</strong> Manages premium payments and pooled funds
                      </span>
                    </li>
                  </ul>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                    <FileText className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle>Policy Lifecycle</CardTitle>
                  <CardDescription>From purchase to claim</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <ol className="space-y-4">
                    <li className="flex items-start gap-2">
                      <div className="bg-primary/10 text-primary rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0 mt-0.5">
                        1
                      </div>
                      <div>
                        <strong>Browse and Select:</strong> Users browse available insurance pools and select one that
                        meets their needs
                      </div>
                    </li>
                    <li className="flex items-start gap-2">
                      <div className="bg-primary/10 text-primary rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0 mt-0.5">
                        2
                      </div>
                      <div>
                        <strong>Get Quote:</strong> Users receive an instant premium calculation based on their specific
                        coverage needs
                      </div>
                    </li>
                    <li className="flex items-start gap-2">
                      <div className="bg-primary/10 text-primary rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0 mt-0.5">
                        3
                      </div>
                      <div>
                        <strong>Purchase Policy:</strong> Users pay the premium with cryptocurrency and receive a Policy
                        NFT representing their coverage
                      </div>
                    </li>
                    <li className="flex items-start gap-2">
                      <div className="bg-primary/10 text-primary rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0 mt-0.5">
                        4
                      </div>
                      <div>
                        <strong>File Claim:</strong> If an insured event occurs, users submit a claim with evidence
                        (stored on IPFS)
                      </div>
                    </li>
                    <li className="flex items-start gap-2">
                      <div className="bg-primary/10 text-primary rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0 mt-0.5">
                        5
                      </div>
                      <div>
                        <strong>Claim Processing:</strong> Smart contracts automatically validate the claim using
                        oracles and predefined rules
                      </div>
                    </li>
                    <li className="flex items-start gap-2">
                      <div className="bg-primary/10 text-primary rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0 mt-0.5">
                        6
                      </div>
                      <div>
                        <strong>Payout:</strong> If approved, the claim amount is automatically transferred to the
                        user's wallet
                      </div>
                    </li>
                  </ol>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Key Benefits (Expanded) */}
        <section className="py-16">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center mb-10">
              <h2 className="text-3xl font-bold tracking-tighter">Key Benefits</h2>
              <p className="text-muted-foreground md:text-xl max-w-[700px]">
                Why ChainSure is revolutionizing the insurance industry
              </p>
            </div>

            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              <Card>
                <CardHeader>
                  <Lock className="h-10 w-10 text-primary mb-4" />
                  <CardTitle>Transparency</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground mb-4">
                    All policies, claims, and fund movements are recorded on the blockchain, providing complete
                    transparency to all participants.
                  </p>
                  <ul className="space-y-2">
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                      <span>Verifiable policy terms stored on-chain</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                      <span>Auditable claim processing</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                      <span>Public pool performance metrics</span>
                    </li>
                  </ul>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <Zap className="h-10 w-10 text-primary mb-4" />
                  <CardTitle>Speed & Efficiency</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground mb-4">
                    Smart contracts automate policy issuance and claims processing, reducing wait times and
                    administrative costs.
                  </p>
                  <ul className="space-y-2">
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                      <span>Instant policy issuance</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                      <span>Automated claims processing</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                      <span>Lower operational costs</span>
                    </li>
                  </ul>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <Users className="h-10 w-10 text-primary mb-4" />
                  <CardTitle>Community-Driven</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground mb-4">
                    Insurance pools are created and managed by the community, ensuring fair terms and competitive
                    premiums.
                  </p>
                  <ul className="space-y-2">
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                      <span>Community-governed pools</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                      <span>Competitive premium rates</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                      <span>Aligned incentives</span>
                    </li>
                  </ul>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <Clock className="h-10 w-10 text-primary mb-4" />
                  <CardTitle>Accessibility</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground mb-4">
                    ChainSure makes insurance accessible to anyone with a crypto wallet, regardless of location or
                    traditional financial access.
                  </p>
                  <ul className="space-y-2">
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                      <span>Global access</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                      <span>No credit checks</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                      <span>Cryptocurrency payments</span>
                    </li>
                  </ul>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <Shield className="h-10 w-10 text-primary mb-4" />
                  <CardTitle>Security</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground mb-4">
                    All smart contracts undergo rigorous security audits, and funds are managed with the highest
                    security standards.
                  </p>
                  <ul className="space-y-2">
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                      <span>Audited smart contracts</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                      <span>Secure fund management</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                      <span>Immutable policy terms</span>
                    </li>
                  </ul>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <FileText className="h-10 w-10 text-primary mb-4" />
                  <CardTitle>Customization</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground mb-4">
                    ChainSure offers a wide range of insurance pools with customizable coverage options to meet diverse
                    needs.
                  </p>
                  <ul className="space-y-2">
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                      <span>Flexible coverage amounts</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                      <span>Multiple insurance types</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                      <span>Tailored policy terms</span>
                    </li>
                  </ul>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="py-16 bg-muted/30">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center mb-10">
              <h2 className="text-3xl font-bold tracking-tighter">Frequently Asked Questions</h2>
              <p className="text-muted-foreground md:text-xl max-w-[700px]">
                Answers to common questions about ChainSure
              </p>
            </div>

            <div className="grid gap-6 md:grid-cols-2 max-w-4xl mx-auto">
              <Card>
                <CardHeader>
                  <CardTitle>How do I purchase a policy?</CardTitle>
                </CardHeader>
                <CardContent>
                  <p>
                    To purchase a policy, you need to connect your wallet, browse available insurance pools, get a quote
                    based on your coverage needs, and complete the purchase by paying the premium in cryptocurrency.
                    Once the transaction is confirmed, you'll receive a Policy NFT representing your coverage.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>How are claims processed?</CardTitle>
                </CardHeader>
                <CardContent>
                  <p>
                    Claims are submitted through our platform with supporting evidence, which is stored on IPFS. Our
                    smart contracts automatically validate claims using predefined rules and trusted oracles. If
                    approved, payouts are automatically transferred to your wallet.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>What cryptocurrencies can I use?</CardTitle>
                </CardHeader>
                <CardContent>
                  <p>
                    Currently, ChainSure accepts USDC for premium payments and claim payouts. We plan to add support for
                    additional stablecoins and cryptocurrencies in the future based on community demand.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>How secure is ChainSure?</CardTitle>
                </CardHeader>
                <CardContent>
                  <p>
                    ChainSure's smart contracts undergo rigorous security audits by leading blockchain security firms.
                    All policy terms, claims, and fund movements are recorded on the blockchain, providing transparency
                    and security. We also implement best practices for secure fund management.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>What if I disagree with a claim decision?</CardTitle>
                </CardHeader>
                <CardContent>
                  <p>
                    If you disagree with a claim decision, you can initiate a dispute through our Dispute Resolution
                    Center. Disputes are reviewed by a decentralized arbitration process to ensure fair outcomes for all
                    parties involved.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Can I cancel my policy?</CardTitle>
                </CardHeader>
                <CardContent>
                  <p>
                    Policy cancellation terms vary by insurance pool. Some policies allow cancellation with a partial
                    premium refund, while others may not offer refunds. The specific terms are clearly stated in the
                    policy details before purchase.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 bg-primary text-primary-foreground">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">Ready to Get Started?</h2>
                <p className="md:text-xl opacity-90">Join the decentralized insurance revolution today</p>
              </div>
              <div className="flex flex-col sm:flex-row gap-3 pt-4">
                <Link href="/pools">
                  <Button size="lg" variant="secondary" className="gap-1">
                    Explore Pools <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
                <Link href="/dashboard">
                  <Button
                    size="lg"
                    variant="outline"
                    className="bg-transparent border-primary-foreground hover:bg-primary-foreground hover:text-primary"
                  >
                    Connect Wallet
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>
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
                Decentralized insurance for the digital age, powered by blockchain technology.
              </p>
            </div>
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Platform</h3>
              <ul className="space-y-2">
                <li>
                  <Link href="/#how-it-works" className="text-sm text-muted-foreground hover:text-foreground">
                    How It Works
                  </Link>
                </li>
                <li>
                  <Link href="/pools" className="text-sm text-muted-foreground hover:text-foreground">
                    Insurance Pools
                  </Link>
                </li>
                <li>
                  <Link href="/dashboard" className="text-sm text-muted-foreground hover:text-foreground">
                    Policyholder Dashboard
                  </Link>
                </li>
                <li>
                  <Link href="/dashboard/claims/new" className="text-sm text-muted-foreground hover:text-foreground">
                    File a Claim
                  </Link>
                </li>
              </ul>
            </div>
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Resources</h3>
              <ul className="space-y-2">
                <li>
                  <Link href="#" className="text-sm text-muted-foreground hover:text-foreground">
                    Documentation
                  </Link>
                </li>
                <li>
                  <Link href="#" className="text-sm text-muted-foreground hover:text-foreground">
                    Smart Contracts
                  </Link>
                </li>
                <li>
                  <Link href="#" className="text-sm text-muted-foreground hover:text-foreground">
                    Security Audits
                  </Link>
                </li>
                <li>
                  <Link href="#" className="text-sm text-muted-foreground hover:text-foreground">
                    FAQ
                  </Link>
                </li>
              </ul>
            </div>
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Legal</h3>
              <ul className="space-y-2">
                <li>
                  <Link href="#" className="text-sm text-muted-foreground hover:text-foreground">
                    Terms of Service
                  </Link>
                </li>
                <li>
                  <Link href="#" className="text-sm text-muted-foreground hover:text-foreground">
                    Privacy Policy
                  </Link>
                </li>
                <li>
                  <Link href="#" className="text-sm text-muted-foreground hover:text-foreground">
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
  )
}
