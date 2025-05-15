import { PolicyDetailsProps } from "@/views/dashboard/policies/types/policies.types";

export default function mapApiPolicyToDetails(policy: any): PolicyDetailsProps {
  let type: "health" | "flight" | "rainfall" = "health";
  if (policy.planTypeId === 2) type = "flight";
  if (policy.planTypeId === 3) type = "rainfall";

  let status: PolicyDetailsProps["status"] = "active";
  if (policy.status === "PendingPayment") status = "pending-payment";
  else if (policy.status === "Expired") status = "expired";
  else if (policy.status === "Claimed") status = "claimed";
  else if (policy.status === "Active") status = "active";

  const startDate = new Date(policy.coverageStartDate).toLocaleDateString(
    "en-US",
    { month: "long", day: "numeric", year: "numeric" }
  );
  const endDate = new Date(policy.coverageEndDate).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  let coverageDetail = "";
  if (type === "health") coverageDetail = "Medical expenses coverage";
  else if (type === "flight") coverageDetail = "Flight delay compensation";
  else if (type === "rainfall") coverageDetail = "Rainfall shortage protection";

  return {
    id: `CS-POL-${policy.id.toString().padStart(5, "0")}`,
    type,
    status,
    coverageDetail,
    startDate,
    endDate,
    premium: `$${policy.premium}`,
    coverageAmount: `$${policy.coverageAmount}`,
    policyHolder: {
      name: `${policy.user.fullName}`,
      walletAddress: policy.walletAddress,
    },
    blockchain: {
      contractAddress: policy.contractAddress,
      network: "Sepolia Testnet",
      transactionHash: policy.transactionHash,
    },
    canClaim: status === "active",
    claimHistory: [],
    documentUrl: policy.documentUrl,
  };
}
