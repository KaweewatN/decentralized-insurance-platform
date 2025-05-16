import { HeroSection } from "./components/hero-section";
import { ValueProposition } from "./components/value-proposition";
import { InsuranceProducts } from "./components/insurance-products";
import { HowItWorks } from "./components/how-it-works";
import { Testimonials } from "./components/testimonials";
import { FAQ } from "./components/faq";

export default function LandingPage() {
  return (
    <>
      <main>
        <HeroSection />
        <ValueProposition />
        <InsuranceProducts />
        <HowItWorks />
        <Testimonials />
        <FAQ />
      </main>
    </>
  );
}
