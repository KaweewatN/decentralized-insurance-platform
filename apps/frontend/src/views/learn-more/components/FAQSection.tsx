import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"; // Adjust path

function FAQSection() {
  return (
    <section className="py-16 bg-muted/30">
      <div className="container px-4 md:px-6">
        <div className="flex flex-col items-center justify-center space-y-4 text-center mb-10">
          <h2 className="text-3xl font-bold tracking-tighter">
            Frequently Asked Questions
          </h2>
          <p className="text-muted-foreground md:text-xl max-w-[700px]">
            Answers to common questions about ChainSure
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 max-w-4xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle>How do I purchase a policy?</CardTitle>
            </CardHeader>
            <CardContent>
              <p>
                To purchase a policy, you need to connect your wallet, browse
                available insurance pools, get a quote based on your coverage
                needs, and complete the purchase by paying the premium in
                cryptocurrency. Once the transaction is confirmed, you'll
                receive a Policy NFT representing your coverage.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>How are claims processed?</CardTitle>
            </CardHeader>
            <CardContent>
              <p>
                Claims are submitted through our platform with supporting
                evidence, which is stored on IPFS. Our smart contracts
                automatically validate claims using predefined rules and trusted
                oracles. If approved, payouts are automatically transferred to
                your wallet.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>What cryptocurrencies can I use?</CardTitle>
            </CardHeader>
            <CardContent>
              <p>
                Currently, ChainSure accepts USDC for premium payments and claim
                payouts. We plan to add support for additional stablecoins and
                cryptocurrencies in the future based on community demand.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>How secure is ChainSure?</CardTitle>
            </CardHeader>
            <CardContent>
              <p>
                ChainSure's smart contracts undergo rigorous security audits by
                leading blockchain security firms. All policy terms, claims, and
                fund movements are recorded on the blockchain, providing
                transparency and security. We also implement best practices for
                secure fund management.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>What if I disagree with a claim decision?</CardTitle>
            </CardHeader>
            <CardContent>
              <p>
                If you disagree with a claim decision, you can initiate a
                dispute through our Dispute Resolution Center. Disputes are
                reviewed by a decentralized arbitration process to ensure fair
                outcomes for all parties involved.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Can I cancel my policy?</CardTitle>
            </CardHeader>
            <CardContent>
              <p>
                Policy cancellation terms vary by insurance pool. Some policies
                allow cancellation with a partial premium refund, while others
                may not offer refunds. The specific terms are clearly stated in
                the policy details before purchase.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
}

export default FAQSection;
