import { HeartPulse, Plane, Cloud, Heart } from "lucide-react";
import InsuranceProductCard from "./insurance-product-card";

export default function InsuranceProductsSection() {
  const products = [
    {
      icon: <HeartPulse className="w-6 h-6" />,
      title: "Health Insurance",
      description:
        "Comprehensive health coverage with fair and transparent claim reviews.",
      features: [
        "Community-driven claim assessment",
        "Transparent review process",
        "Flexible coverage options",
        "Direct payouts to your wallet",
      ],
      ctaText: "Apply Now",
      ctaLink: "/dashboard/insurance/health/apply",
    },
    {
      icon: <Heart className="w-6 h-6" />,
      title: "Life Insurance",
      description:
        "Secure your family's future with transparent and reliable life coverage.",
      features: [
        "Blockchain-verified payouts",
        "Transparent claim process",
        "Flexible premium options",
        "Instant beneficiary payments",
      ],
      ctaText: "Apply Now",
      ctaLink: "/dashboard/insurance/life/apply",
    },
    {
      icon: <Plane className="w-6 h-6" />,
      title: "Flight Delay Insurance",
      description:
        "Automatic compensation for flight delays without the hassle of manual claims.",
      features: [
        "Instant verification via flight APIs",
        "Automatic payouts",
        "Coverage for all airlines",
        "Customizable delay thresholds",
      ],
      ctaText: "Apply Now",
      ctaLink: "/dashboard/insurance/flight/apply",
    },
    {
      icon: <Cloud className="w-6 h-6" />,
      title: "Rainfall Insurance",
      description:
        "Protect your business or event against unexpected weather conditions.",
      features: [
        "Data from trusted weather oracles",
        "Customizable rainfall thresholds",
        "Location-specific coverage",
        "Immediate settlement on trigger",
      ],
      ctaText: "Apply Now",
      ctaLink: "/dashboard/insurance/rainfall/apply",
    },
  ];

  return (
    <div className="mb-10">
      <h2 className="mb-6 text-2xl font-bold text-[#212529]">
        Explore Our Insurance Products
      </h2>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {products.map((product, index) => (
          <InsuranceProductCard
            key={index}
            icon={product.icon}
            title={product.title}
            description={product.description}
            features={product.features}
            ctaText={product.ctaText}
            ctaLink={product.ctaLink}
          />
        ))}
      </div>
    </div>
  );
}
