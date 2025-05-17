"use client"

import { useState } from "react"
import { ChevronDown, ChevronUp, Shield, AlertTriangle, Info } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface PolicyInformationProps {
  insuranceType: "health" | "flight" | "rainfall"
}

export function PolicyInformationSection({ insuranceType }: PolicyInformationProps) {
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    details: false,
    risks: false,
    overview: false,
  })

  const toggleSection = (section: string) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }))
  }

  // Content based on insurance type
  const content = {
    health: {
      details: {
        title: "Essential Policy Details",
        content: (
          <div className="space-y-3">
            <p>
              Our Health Insurance policy provides comprehensive coverage for medical expenses, including
              hospitalization, surgery, and outpatient care.
            </p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Coverage Duration: 12 months from policy activation</li>
              <li>Coverage Amount: Based on your selected plan tier</li>
              <li>Waiting Period: 30 days for most conditions, 12 months for pre-existing conditions</li>
              <li>Renewability: Guaranteed renewal with no additional medical underwriting</li>
              <li>
                Network: Access to our extensive network of hospitals and healthcare providers for cashless treatment
              </li>
            </ul>
          </div>
        ),
      },
      risks: {
        title: "Risk Information",
        content: (
          <div className="space-y-3">
            <p>
              While our Health Insurance provides extensive coverage, it's important to understand the following
              limitations:
            </p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Pre-existing conditions are covered only after a 12-month waiting period</li>
              <li>Cosmetic surgeries and treatments are not covered unless medically necessary</li>
              <li>Certain high-risk activities and sports injuries may have limited coverage or higher deductibles</li>
              <li>Mental health coverage is limited to 30 days of inpatient care and 20 outpatient visits per year</li>
              <li>Experimental treatments and procedures not approved by regulatory authorities are not covered</li>
            </ul>
          </div>
        ),
      },
      overview: {
        title: "Health Insurance Overview",
        content: (
          <div className="space-y-3">
            <p>
              Health insurance provides financial protection against medical expenses arising from illness or injury.
              Our blockchain-based health insurance offers:
            </p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Transparent policy terms stored on the blockchain</li>
              <li>Faster claims processing through smart contracts</li>
              <li>Secure storage of medical records with privacy protection</li>
              <li>Lower administrative costs resulting in more competitive premiums</li>
              <li>Immutable record of policy history, ensuring your coverage cannot be altered without your consent</li>
            </ul>
            <p className="text-sm text-gray-600 mt-2">
              Your premium is calculated based on your age, medical history, lifestyle factors, and chosen coverage
              amount. All policies are underwritten and backed by our insurance reserve fund.
            </p>
          </div>
        ),
      },
    },
    flight: {
      details: {
        title: "Essential Policy Details",
        content: (
          <div className="space-y-3">
            <p>
              Our Flight Delay Insurance provides compensation when your flight is delayed beyond the specified
              threshold.
            </p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Coverage: Single flight specified during purchase</li>
              <li>Delay Threshold: 3 hours from scheduled arrival time</li>
              <li>Payout: Automatic when delay is confirmed by our oracle</li>
              <li>
                Coverage Period: From 24 hours before scheduled departure until actual arrival or flight cancellation
              </li>
              <li>
                Claim Process: No claim filing needed - smart contract automatically processes payment when delay is
                confirmed
              </li>
            </ul>
          </div>
        ),
      },
      risks: {
        title: "Risk Information",
        content: (
          <div className="space-y-3">
            <p>
              While our Flight Delay Insurance provides protection against delays, please be aware of the following
              limitations:
            </p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Coverage is limited to the specific flight number, date, and route specified during purchase</li>
              <li>
                Delays must be verified by our oracle service which monitors actual flight arrival times from official
                sources
              </li>
              <li>Compensation is fixed at the purchased coverage amount regardless of actual expenses incurred</li>
              <li>
                Policy does not cover additional expenses such as accommodation, meals, or alternative transportation
              </li>
              <li>Premium is non-refundable even if the flight operates on time or you cancel your travel plans</li>
            </ul>
          </div>
        ),
      },
      overview: {
        title: "Flight Delay Insurance Overview",
        content: (
          <div className="space-y-3">
            <p>
              Flight Delay Insurance is a parametric insurance product that provides a fixed payout when your flight is
              delayed beyond a specified threshold.
            </p>
            <ul className="list-disc pl-5 space-y-1">
              <li>
                Parametric insurance means payout is triggered by a specific event (flight delay) rather than by proving
                financial loss
              </li>
              <li>
                Smart contracts automatically execute the payout when the delay is confirmed by our oracle service
              </li>
              <li>No paperwork or claims process required</li>
              <li>
                Coverage amount is fixed at purchase and is not related to actual expenses incurred due to the delay
              </li>
              <li>
                Premium is calculated based on historical delay data for the specific route, airline, time of year, and
                other risk factors
              </li>
            </ul>
            <p className="text-sm text-gray-600 mt-2">
              This insurance is ideal for travelers who want peace of mind and immediate compensation without the hassle
              of filing claims if their flight is delayed.
            </p>
          </div>
        ),
      },
    },
    rainfall: {
      details: {
        title: "Essential Policy Details",
        content: (
          <div className="space-y-3">
            <p>
              Our Rainfall Insurance provides protection against financial losses due to unexpected rainfall patterns at
              your specified location.
            </p>
            <ul className="list-disc pl-5 space-y-1">
              <li>
                Coverage Types: Drought protection (rainfall below threshold) or flood protection (rainfall above
                threshold)
              </li>
              <li>Coverage Period: User-defined period, typically aligned with growing seasons</li>
              <li>Location: Specific coordinates provided during application (must be land you own or operate)</li>
              <li>
                Payout Trigger: Automatic when rainfall measurements from weather oracles confirm threshold breach
              </li>
              <li>Documentation: Land ownership or farm registration document required to verify insurable interest</li>
            </ul>
          </div>
        ),
      },
      risks: {
        title: "Risk Information",
        content: (
          <div className="space-y-3">
            <p>
              While our Rainfall Insurance provides protection against rainfall-related risks, please be aware of the
              following limitations:
            </p>
            <ul className="list-disc pl-5 space-y-1">
              <li>
                Coverage is based solely on rainfall measurements from our oracle network, not on actual crop damage or
                losses
              </li>
              <li>
                Localized weather events that don't affect the broader area measured by weather stations may not trigger
                a payout
              </li>
              <li>
                The fixed payout amount may be more or less than your actual financial losses due to rainfall events
              </li>
              <li>
                Policy does not cover losses due to other weather events (temperature, wind, hail) unless specifically
                included
              </li>
              <li>
                Premium is non-refundable even if rainfall remains within normal parameters during the coverage period
              </li>
            </ul>
          </div>
        ),
      },
      overview: {
        title: "Rainfall Insurance Overview",
        content: (
          <div className="space-y-3">
            <p>
              Rainfall Insurance is a parametric insurance product designed to protect farmers and landowners from
              financial losses due to abnormal rainfall patterns.
            </p>
            <ul className="list-disc pl-5 space-y-1">
              <li>
                <strong>Drought Protection:</strong> Provides compensation when rainfall is below the 80mm threshold,
                helping cover losses from insufficient rainfall for crops
              </li>
              <li>
                <strong>Flood Protection:</strong> Provides compensation when rainfall exceeds the 80mm threshold,
                helping cover losses from excessive rainfall and flooding
              </li>
              <li>
                Payouts are triggered automatically when weather oracles confirm rainfall measurements cross the
                threshold
              </li>
              <li>No need to prove crop damage or financial loss - payout is based solely on rainfall data</li>
              <li>
                Premium is calculated based on historical rainfall patterns, location risk factors, coverage amount, and
                duration
              </li>
            </ul>
            <p className="text-sm text-gray-600 mt-2">
              This insurance is ideal for farmers, agricultural businesses, and landowners who want to mitigate
              financial risks associated with unexpected rainfall patterns.
            </p>
          </div>
        ),
      },
    },
  }

  const selectedContent = content[insuranceType]

  return (
    <Card className="mb-6 border-blue-100">
      <CardHeader className="bg-blue-50 pb-2">
        <CardTitle className="text-lg text-blue-800">Important Insurance Information</CardTitle>
      </CardHeader>
      <CardContent className="pt-4 space-y-3">
        {/* Essential Policy Details */}
        <div className="border rounded-md overflow-hidden">
          <button
            onClick={() => toggleSection("details")}
            className="w-full flex items-center justify-between p-3 text-left bg-gray-50 hover:bg-gray-100 transition-colors"
          >
            <div className="flex items-center">
              <Shield className="h-5 w-5 text-blue-600 mr-2" />
              <span className="font-medium">{selectedContent.details.title}</span>
            </div>
            {expandedSections.details ? (
              <ChevronUp className="h-5 w-5 text-gray-500" />
            ) : (
              <ChevronDown className="h-5 w-5 text-gray-500" />
            )}
          </button>
          {expandedSections.details && <div className="p-3 border-t">{selectedContent.details.content}</div>}
        </div>

        {/* Risk Information */}
        <div className="border rounded-md overflow-hidden">
          <button
            onClick={() => toggleSection("risks")}
            className="w-full flex items-center justify-between p-3 text-left bg-gray-50 hover:bg-gray-100 transition-colors"
          >
            <div className="flex items-center">
              <AlertTriangle className="h-5 w-5 text-amber-500 mr-2" />
              <span className="font-medium">{selectedContent.risks.title}</span>
            </div>
            {expandedSections.risks ? (
              <ChevronUp className="h-5 w-5 text-gray-500" />
            ) : (
              <ChevronDown className="h-5 w-5 text-gray-500" />
            )}
          </button>
          {expandedSections.risks && <div className="p-3 border-t">{selectedContent.risks.content}</div>}
        </div>

        {/* Insurance Overview */}
        <div className="border rounded-md overflow-hidden">
          <button
            onClick={() => toggleSection("overview")}
            className="w-full flex items-center justify-between p-3 text-left bg-gray-50 hover:bg-gray-100 transition-colors"
          >
            <div className="flex items-center">
              <Info className="h-5 w-5 text-blue-600 mr-2" />
              <span className="font-medium">{selectedContent.overview.title}</span>
            </div>
            {expandedSections.overview ? (
              <ChevronUp className="h-5 w-5 text-gray-500" />
            ) : (
              <ChevronDown className="h-5 w-5 text-gray-500" />
            )}
          </button>
          {expandedSections.overview && <div className="p-3 border-t">{selectedContent.overview.content}</div>}
        </div>
      </CardContent>
    </Card>
  )
}
