import React from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card"; // Adjust path as needed
import { Wallet, FileText, CheckCircle } from "lucide-react"; // Adjust import based on your icon library

function HowItWorksSection() {
  return (
    <section className="py-16 bg-muted/30">
      <div className="container px-4 md:px-6">
        <div className="flex flex-col items-center justify-center space-y-4 text-center mb-10">
          <h2 className="text-3xl font-bold tracking-tighter">
            How ChainSure Works
          </h2>
          <p className="text-muted-foreground md:text-xl max-w-[700px]">
            A detailed look at our blockchain-powered insurance platform
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-2">
          {/* Smart Contract Architecture Card */}
          <Card>
            <CardHeader>
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                <Wallet className="h-6 w-6 text-primary" />
              </div>
              <CardTitle>Smart Contract Architecture</CardTitle>
              <CardDescription>The technology behind ChainSure</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>
                ChainSure is built on a robust system of smart contracts that
                handle every aspect of the insurance process:
              </p>
              <ul className="space-y-2">
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                  <span>
                    <strong>PolicyFactory:</strong> Creates new policy pools and
                    types
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                  <span>
                    <strong>PolicyPool:</strong> Manages specific insurance
                    types, holds funds, defines rules
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                  <span>
                    <strong>PolicyNFT (ERC721):</strong> Represents individual
                    policies as NFTs
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                  <span>
                    <strong>ClaimManager:</strong> Handles claim submission,
                    validation, and payouts
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                  <span>
                    <strong>Treasury/PremiumHandler:</strong> Manages premium
                    payments and pooled funds
                  </span>
                </li>
              </ul>
            </CardContent>
          </Card>

          {/* Policy Lifecycle Card */}
          <Card>
            <CardHeader>
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                <FileText className="h-6 w-6 text-primary" />
              </div>
              <CardTitle>Policy Lifecycle</CardTitle>
              <CardDescription>From purchase to claim</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <ol className="space-y-4">
                <li className="flex items-start gap-2">
                  <div className="bg-primary/10 text-primary rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0 mt-0.5">
                    1
                  </div>
                  <div>
                    <strong>Browse and Select:</strong> Users browse available
                    insurance pools and select one that meets their needs
                  </div>
                </li>
                <li className="flex items-start gap-2">
                  <div className="bg-primary/10 text-primary rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0 mt-0.5">
                    2
                  </div>
                  <div>
                    <strong>Get Quote:</strong> Users receive an instant premium
                    calculation based on their specific coverage needs
                  </div>
                </li>
                <li className="flex items-start gap-2">
                  <div className="bg-primary/10 text-primary rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0 mt-0.5">
                    3
                  </div>
                  <div>
                    <strong>Purchase Policy:</strong> Users pay the premium with
                    cryptocurrency and receive a Policy NFT representing their
                    coverage
                  </div>
                </li>
                <li className="flex items-start gap-2">
                  <div className="bg-primary/10 text-primary rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0 mt-0.5">
                    4
                  </div>
                  <div>
                    <strong>File Claim:</strong> If an insured event occurs,
                    users submit a claim with evidence (stored on IPFS)
                  </div>
                </li>
                <li className="flex items-start gap-2">
                  <div className="bg-primary/10 text-primary rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0 mt-0.5">
                    5
                  </div>
                  <div>
                    <strong>Claim Processing:</strong> Smart contracts
                    automatically validate the claim using oracles and
                    predefined rules
                  </div>
                </li>
                <li className="flex items-start gap-2">
                  <div className="bg-primary/10 text-primary rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0 mt-0.5">
                    6
                  </div>
                  <div>
                    <strong>Payout:</strong> If approved, the claim amount is
                    automatically transferred to the user's wallet
                  </div>
                </li>
              </ol>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
}

export default HowItWorksSection;
