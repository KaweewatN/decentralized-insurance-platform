import type { Metadata } from "next"
import { getPendingClaims } from "@/lib/admin-utils"
import { ClaimReviewCard } from "@/components/admin/claim-review-card"

export const metadata: Metadata = {
  title: "Claims Processing - ChainSure Admin",
  description: "Review and process insurance claims",
}

export default async function ClaimsPage() {
  const claims = await getPendingClaims()

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Claims Processing</h1>
        <p className="text-muted-foreground">Review and process insurance claims</p>
      </div>

      {claims.length === 0 ? (
        <div className="text-center p-12 border rounded-md bg-muted">
          <p className="text-lg font-medium">No claims pending review</p>
          <p className="text-muted-foreground">All claims have been processed</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {claims.map((claim) => (
            <ClaimReviewCard key={claim.id} claim={claim} />
          ))}
        </div>
      )}
    </div>
  )
}
