"use client";
import Link from "next/link";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowRight, Shield, CheckCircle } from "lucide-react";

export function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-blue-50 to-white py-20 sm:py-32">
      <div className="absolute inset-0 bg-[url('/assets/images/abstract-blockchain.png')] bg-cover bg-center opacity-5"></div>
      <div className="container mx-auto px-4 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center lg:text-left"
          >
            <div className="inline-flex items-center px-3 py-1 rounded-full bg-blue-100 text-blue-800 text-sm font-medium mb-6">
              <Shield className="h-4 w-4 mr-2" />
              Blockchain-Powered Insurance
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 leading-tight mb-6">
              Insurance for the{" "}
              <span className="text-primary">Digital Age</span>
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-lg mx-auto lg:mx-0">
              ChainSure combines blockchain technology with traditional
              insurance to create transparent, efficient, and secure coverage
              for your needs.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <Button
                size="lg"
                className="bg-primary hover:bg-primary/90 text-white"
                asChild
              >
                <Link href="/welcome">
                  Get Started <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link href="#how-it-works">Learn More</Link>
              </Button>
            </div>
            <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-4">
              {[
                "Transparent Claims",
                "Instant Payouts",
                "Secure Blockchain",
              ].map((feature) => (
                <div
                  key={feature}
                  className="flex items-center justify-center lg:justify-start"
                >
                  <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                  <span className="text-gray-700">{feature}</span>
                </div>
              ))}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="relative"
          >
            <div className="relative mx-auto max-w-[500px]">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-600 rounded-3xl blur-xl opacity-20 transform -rotate-6"></div>
              <div className="relative bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-200">
                <div className="bg-gradient-to-r from-blue-600 to-blue-800 p-6">
                  <div className="flex items-center">
                    <Shield className="h-8 w-8 text-white" />
                    <span className="ml-2 text-xl font-bold text-white">
                      ChainSure
                    </span>
                  </div>
                  <h3 className="text-white text-2xl font-bold mt-4">
                    Blockchain Insurance Platform
                  </h3>
                  <p className="text-blue-100 mt-2">
                    Secure, transparent, and efficient
                  </p>
                </div>
                <div className="p-6">
                  <div className="space-y-4">
                    <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
                      <h4 className="font-medium text-gray-900 mb-2">
                        Health Insurance
                      </h4>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Premium:</span>
                        <span className="font-medium">0.05 ETH / month</span>
                      </div>
                      <div className="flex justify-between items-center mt-1">
                        <span className="text-gray-600">Coverage:</span>
                        <span className="font-medium">Up to 5 ETH</span>
                      </div>
                    </div>
                    <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
                      <h4 className="font-medium text-gray-900 mb-2">
                        Flight Delay Insurance
                      </h4>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Premium:</span>
                        <span className="font-medium">0.01 ETH / flight</span>
                      </div>
                      <div className="flex justify-between items-center mt-1">
                        <span className="text-gray-600">Payout:</span>
                        <span className="font-medium">
                          0.1 ETH for 2+ hour delay
                        </span>
                      </div>
                    </div>
                  </div>
                  <Button
                    className="w-full mt-6 bg-primary hover:bg-primary/90"
                    asChild
                  >
                    <Link href="/welcome">Connect Wallet</Link>
                  </Button>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
