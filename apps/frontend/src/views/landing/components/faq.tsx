"use client"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"

export function FAQ() {
  const faqs = [
    {
      question: "How does blockchain insurance work?",
      answer:
        "Blockchain insurance uses smart contracts to automate policy issuance, claims processing, and payouts. When certain conditions are met (like a flight delay), the smart contract automatically executes the payout without requiring manual claims processing.",
    },
    {
      question: "Is my data secure on the blockchain?",
      answer:
        "Yes, your personal data is encrypted and securely stored. The blockchain only contains anonymized policy and claim information, ensuring transparency while protecting your privacy.",
    },
    {
      question: "How fast are claims processed?",
      answer:
        "Parametric insurance claims (like flight delays) are processed automatically and instantly. For health insurance claims that require document verification, our admin team typically processes them within 24-48 hours.",
    },
    {
      question: "What cryptocurrencies can I use for payment?",
      answer:
        "Currently, we accept ETH (Ethereum) for premium payments. We're working on adding support for stablecoins and other cryptocurrencies in the future.",
    },
    {
      question: "Do I need technical knowledge to use ChainSure?",
      answer:
        "No, we've designed ChainSure to be user-friendly for everyone. You only need a digital wallet like MetaMask to connect to our platform. Our interface guides you through the process step by step.",
    },
  ]

  return (
    <section className="py-20 bg-gray-50" id="faq">
      <div className="container mx-auto px-4">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Frequently Asked Questions</h2>
          <p className="text-xl text-gray-600">
            Find answers to common questions about blockchain insurance and our platform.
          </p>
        </div>

        <div className="max-w-3xl mx-auto">
          <Accordion type="single" collapsible className="w-full">
            {faqs.map((faq, index) => (
              <AccordionItem key={index} value={`item-${index}`}>
                <AccordionTrigger className="text-left">{faq.question}</AccordionTrigger>
                <AccordionContent>{faq.answer}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </div>
    </section>
  )
}
