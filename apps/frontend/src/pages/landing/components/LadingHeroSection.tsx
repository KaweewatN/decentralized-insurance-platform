import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

export default function LandingHeroSection() {
  return (
    <section className="py-20">
      <div className="container px-4 md:px-6">
        <div className="grid gap-6 lg:grid-cols-2 lg:gap-12 items-center">
          <div className="space-y-4">
            <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
              Decentralized Insurance for the Digital Age
            </h1>
            <p className="text-muted-foreground md:text-xl">
              ChainSure leverages blockchain technology to provide transparent,
              efficient, and community-driven insurance solutions.
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
  );
}
