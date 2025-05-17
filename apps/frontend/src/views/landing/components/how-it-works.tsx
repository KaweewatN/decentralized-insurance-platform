import type React from "react"
import { Wallet, Search, FileText, ShieldCheck } from "lucide-react"

interface StepProps {
  icon: React.ReactNode
  title: string
  description: string
  step: number
}

function Step({ icon, title, description, step }: StepProps) {
  return (
    <div className="flex flex-col items-center text-center md:items-start md:text-left md:flex-row">
      <div className="flex items-center justify-center w-12 h-12 mb-4 rounded-full bg-[#0D47A1] text-white md:mb-0 md:mr-4">
        {step}
      </div>
      <div className="flex-1">
        <div className="flex flex-col items-center mb-2 md:flex-row md:items-start">
          <div className="mb-2 text-[#0D47A1] md:mb-0 md:mr-2">{icon}</div>
          <h3 className="text-xl font-semibold text-[#212529]">{title}</h3>
        </div>
        <p className="text-[#212529]">{description}</p>
      </div>
    </div>
  )
}

export function HowItWorks() {
  const steps = [
    {
      icon: <Wallet className="w-6 h-6" />,
      title: "Connect Your Wallet",
      description: "Securely connect your Web3 wallet like MetaMask to access the ChainSure platform.",
    },
    {
      icon: <Search className="w-6 h-6" />,
      title: "Choose Your Policy",
      description: "Explore our health and parametric insurance options to find the perfect coverage for your needs.",
    },
    {
      icon: <FileText className="w-6 h-6" />,
      title: "Apply & Pay Securely",
      description: "Complete your application and pay premiums securely on the blockchain with full transparency.",
    },
    {
      icon: <ShieldCheck className="w-6 h-6" />,
      title: "Get Covered & Claim Easily",
      description: "Your policy is active! Submit claims transparently and receive payouts directly to your wallet.",
    },
  ]

  return (
    <section id="how-it-works" className="py-20 bg-white">
      <div className="container px-4 mx-auto">
        <div className="max-w-3xl mx-auto mb-16 text-center">
          <h2 className="mb-4 text-3xl font-bold text-[#212529] md:text-4xl">Simple Steps to Get Insured</h2>
          <p className="text-lg text-[#212529]">Getting insured with ChainSure is quick, easy, and transparent.</p>
        </div>
        <div className="max-w-4xl mx-auto space-y-12">
          {steps.map((step, index) => (
            <Step key={index} icon={step.icon} title={step.title} description={step.description} step={index + 1} />
          ))}
        </div>
      </div>
    </section>
  )
}
