import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { getClaim } from "@/lib/admin-utils"
import { ClaimDetail } from "@/components/admin/claim-detail"

interface ClaimDetailPageProps {
  params: {
    id: string
  }
}

export async function generateMetadata({ params }: ClaimDetailPageProps): Promise<Metadata> {
  const claim = await getClaim(params.id)

  if (!claim) {
    return {
      title: "Claim Not Found - ChainSure Admin",
    }
  }

  return {
    title: `${claim.type} Claim Review - ChainSure Admin`,
    description: `Review claim for policy ${claim.policyId}`,
  }
}

export default async function ClaimDetailPage({ params }: ClaimDetailPageProps) {
  const claim = await getClaim(params.id)

  if (!claim) {
    notFound()
  }

  return <ClaimDetail claim={claim} />
}
