import Image from "next/image";
import { ArrowRight, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export function HeroSection() {
  return (
    <section className="relative py-20 overflow-hidden">
      <div className="container px-10 mx-auto relative z-10">
        <div className="flex flex-col lg:flex-row items-center ">
          <div className="w-full lg:w-1/2 flex flex-col items-center lg:items-start text-center lg:text-left">
            <h1 className="max-w-4xl mb-6 text-4xl font-bold tracking-tight text-[#0D47A1] md:text-5xl lg:text-6xl">
              Decentralized Insurance, Reimagined for You
            </h1>
            <p className="max-w-2xl mb-10 text-lg text-black md:text-xl">
              Join ChainSure for fair, transparent, and automated insurance
              policies powered by blockchain technology. Offering Manual Health
              and innovative Parametric (Flight Delay, Rainfall) coverage.
            </p>
            <div className="flex flex-col space-y-4 sm:flex-row sm:space-y-0 sm:space-x-4">
              <Button
                className="px-8 py-6 text-lg bg-[#28A745] hover:bg-[#218838] text-white"
                asChild
              >
                <Link href="/dashboard">
                  <ShieldCheck className="w-5 h-5 mr-2" />
                  Get Started Now
                </Link>
              </Button>
              <Button
                variant="outline"
                className="px-8 py-6 text-lg border-[#0D47A1] text-[#0D47A1] hover:bg-[#0D47A1] hover:text-white"
                asChild
              >
                <Link href="#how-it-works">
                  Learn How It Works
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Link>
              </Button>
            </div>
          </div>
          <div className="mt-16 lg:mt-0 w-full lg:w-1/2 flex justify-end mb-10 lg:mb-0 ">
            <Image
              src="/assets/images/landing-image.png"
              alt="Landing"
              width={500}
              height={400}
              className="max-w-full h-auto"
              priority
            />
          </div>
        </div>
      </div>
    </section>
  );
}
