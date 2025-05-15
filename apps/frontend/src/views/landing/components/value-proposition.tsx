import type React from "react"
import { Users, Lock, TrendingUp, HeartPulse } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface FeatureCardProps {
  icon: React.ReactNode
  title: string
  description: string
}

function FeatureCard({ icon, title, description }: FeatureCardProps) {
  return (
    <Card className="h-full">
      <CardHeader className="pb-2">
        <div className="mb-2 text-[#0D47A1]">{icon}</div>
        <CardTitle className="text-xl font-semibold text-[#212529]">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-[#212529]">{description}</p>
      </CardContent>
    </Card>
  )
}

export function ValueProposition() {
  const features = [
    {
      icon: <Users className="w-8 h-8" />,
      title: "Community Governed",
      description:
        "Our platform is governed by the community, ensuring fair policies and transparent decision-making for all members.",
    },
    {
      icon: <Lock className="w-8 h-8" />,
      title: "True Security",
      description:
        "Blockchain technology ensures your policy details and claims are securely stored and cannot be tampered with.",
    },
    {
      icon: <TrendingUp className="w-8 h-8" />,
      title: "Automated Transparency",
      description:
        "Smart contracts automatically execute claims when conditions are met, eliminating delays and ensuring fairness.",
    },
    {
      icon: <HeartPulse className="w-8 h-8" />,
      title: "Comprehensive Coverage",
      description:
        "From health insurance to parametric policies, we offer a wide range of coverage options to meet your needs.",
    },
  ]

  return (
    <section id="features" className="py-20 bg-white">
      <div className="container px-4 mx-auto">
        <div className="max-w-3xl mx-auto mb-16 text-center">
          <h2 className="mb-4 text-3xl font-bold text-[#212529] md:text-4xl">Why Choose ChainSure?</h2>
          <p className="text-lg text-[#212529]">
            The future of insurance is decentralized, transparent, and community-driven.
          </p>
        </div>
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
          {features.map((feature, index) => (
            <FeatureCard key={index} icon={feature.icon} title={feature.title} description={feature.description} />
          ))}
        </div>
      </div>
    </section>
  )
}
