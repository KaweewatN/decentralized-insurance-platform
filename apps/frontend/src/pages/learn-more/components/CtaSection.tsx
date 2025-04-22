import React from "react";
import Link from "next/link"; // Assuming Next.js Link
import { Button } from "@/components/ui/button"; // Adjust path
import { ArrowRight } from "lucide-react"; // Adjust import

function CtaSection() {
  return (
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
            <Link href="/pools" legacyBehavior>
              <Button size="lg" variant="secondary" className="gap-1">
                Explore Pools <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link href="/dashboard" legacyBehavior>
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
  );
}

export default CtaSection;
