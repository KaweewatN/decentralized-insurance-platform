import { HeroSection } from "./components/hero-section";
import { ValueProposition } from "./components/value-proposition";
import { InsuranceProducts } from "./components/insurance-products";
import { HowItWorks } from "./components/how-it-works";

export default function LandingPage() {
  return (
    <>
      <HeroSection />
      <ValueProposition />
      <InsuranceProducts />
      <HowItWorks />
    </>
  );
}
