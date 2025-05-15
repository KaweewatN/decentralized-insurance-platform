import Link from "next/link";
import { Shield } from "lucide-react";

// components
import LearnMoreHero from "./components/LearnMoreHero";
import HowItWorksSection from "./components/HowItWorksSection";
import BenefitsSection from "./components/BenefitsSection";
import FAQSection from "./components/FAQSection";
import CtaSection from "./components/CtaSection";

export default function LearnMore() {
  return (
    <div className="flex min-h-screen flex-col">
      <main className="flex-1">
        <LearnMoreHero />
        <HowItWorksSection />
        <BenefitsSection />
        <FAQSection />
        <CtaSection />
      </main>
    </div>
  );
}
