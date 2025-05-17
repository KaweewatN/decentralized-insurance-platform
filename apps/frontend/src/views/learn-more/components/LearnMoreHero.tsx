import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

export default function LearnMoreHero() {
  return (
    <>
      {/* Hero Section */}
      <section className="py-20 md:py-28 bg-muted/30">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center text-center space-y-4 max-w-3xl mx-auto">
            <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
              Decentralized Insurance Reimagined
            </h1>
            <p className="text-muted-foreground md:text-xl max-w-[700px]">
              ChainSure leverages blockchain technology to create a transparent,
              efficient, and community-driven insurance platform that puts
              policyholders first.
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
              <h2 className="text-3xl font-bold tracking-tighter">
                About ChainSure
              </h2>
              <p className="text-muted-foreground">
                ChainSure was founded with a simple mission: to make insurance
                more transparent, efficient, and accessible to everyone. By
                leveraging blockchain technology, we've created a platform where
                insurance policies are represented as NFTs, claims are processed
                automatically through smart contracts, and community members can
                participate in insurance pools.
              </p>
              <p className="text-muted-foreground">
                Our platform eliminates the traditional insurance model's
                inefficiencies and opacity, replacing them with transparent
                rules, automated processes, and community governance. This
                results in lower premiums, faster claims, and a more equitable
                insurance ecosystem for all participants.
              </p>
            </div>
            <div className="relative h-[350px] w-full rounded-lg overflow-hidden">
              <Image
                src="./assets/images/landing-image.png"
                alt="About ChainSure"
                fill
                className="object-cover"
              />
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
