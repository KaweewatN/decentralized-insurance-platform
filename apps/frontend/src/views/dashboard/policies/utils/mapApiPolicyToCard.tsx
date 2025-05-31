import { PolicyCardProps } from "../types/policies.types";

export default function mapApiPolicyToCard(policy: any): PolicyCardProps {
  // Map API fields to PolicyCardProps fields
  return {
    id: policy.id,
    type:
      policy.planTypeId === 1
        ? "health"
        : policy.planTypeId === 2
          ? "flight"
          : "rainfall", // Adjust as needed
    status: policy.status.toLowerCase().replace(/([a-z])([A-Z])/g, "$1-$2"), // e.g. "PendingPayment" -> "pending-payment"
    coverageDetail: `${policy.coverageAmount} ETH`,
    startDate: new Date(policy.coverageStartDate).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    }),
    endDate: new Date(policy.coverageEndDate).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    }),
    canClaim: policy.status === "Active",
    // Add other fields if needed for icons/buttons
    // You can pass through documentUrl, contractAddress, etc. if your PolicyCard uses them
  };
}
