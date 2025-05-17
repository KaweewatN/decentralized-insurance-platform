import { PolicyDetailsProps } from "@/views/dashboard/policies/types/policies.types";

export default function mapApiPolicyToDetails(policy: any): PolicyDetailsProps {
  // Dynamically determine policy type from available fields
  let type: "health" | "flight" | "rainfall" = "health";
  const typeValue =
    policy.type ||
    policy.planType ||
    policy.plan_type ||
    policy.planTypeName ||
    policy.planTypeId ||
    "";
  const typeStr =
    typeof typeValue === "string"
      ? typeValue.toLowerCase()
      : typeValue?.toString();

  if (typeStr === "flight" || typeStr === "2") type = "flight";
  else if (typeStr === "rainfall" || typeStr === "3") type = "rainfall";
  else if (typeStr === "health" || typeStr === "1") type = "health";

  // Normalize status
  let status: PolicyDetailsProps["status"] = "active";
  const statusValue = (policy.status || "").toString().toLowerCase();
  if (statusValue === "pendingpayment" || statusValue === "pending-payment")
    status = "pending-payment";
  else if (statusValue === "expired") status = "expired";
  else if (statusValue === "claimed") status = "claimed";
  else if (statusValue === "active") status = "active";

  // Format dates
  const startDate =
    policy.coverageStartDate || policy.startDate
      ? new Date(
          policy.coverageStartDate || policy.startDate
        ).toLocaleDateString("en-US", {
          month: "long",
          day: "numeric",
          year: "numeric",
        })
      : "";
  const endDate =
    policy.coverageEndDate || policy.endDate
      ? new Date(policy.coverageEndDate || policy.endDate).toLocaleDateString(
          "en-US",
          {
            month: "long",
            day: "numeric",
            year: "numeric",
          }
        )
      : "";

  // Coverage detail
  let coverageDetail = "";
  if (type === "health") coverageDetail = "Medical expenses coverage";
  else if (type === "flight") coverageDetail = "Flight delay compensation";
  else if (type === "rainfall") coverageDetail = "Rainfall shortage protection";

  // Policyholder info
  const policyHolder = {
    name:
      policy.user?.fullName ||
      policy.policyHolder?.name ||
      policy.holderName ||
      "",
    walletAddress:
      policy.walletAddress ||
      policy.policyHolder?.walletAddress ||
      policy.holderWalletAddress ||
      "",
  };

  // Blockchain info
  const blockchain = {
    contractAddress:
      policy.contractAddress || policy.blockchain?.contractAddress || "",
    network: policy.blockchain?.network || "Sepolia Testnet",
    transactionHash:
      policy.transactionHash || policy.blockchain?.transactionHash || "",
  };

  // Claims history
  const claimHistory =
    Array.isArray(policy.claimHistory) && policy.claimHistory.length > 0
      ? policy.claimHistory.map((claim: any) => ({
          id: claim.id?.toString() || "",
          date: claim.date || "",
          amount: claim.amount || "",
          status: claim.status || "pending",
        }))
      : [];

  // Document URL
  const documentUrl = policy.documentUrl || "";

  // Premium and coverage amount formatting
  const premium =
    typeof policy.premium === "number"
      ? `$${policy.premium}`
      : policy.premium || "";
  const coverageAmount =
    typeof policy.coverageAmount === "number"
      ? `$${policy.coverageAmount}`
      : policy.coverageAmount || "";
  const sumAssured =
    typeof policy.sumAssured === "number"
      ? `$${policy.sumAssured}`
      : policy.sumAssured || "";

  return {
    id: policy.id?.toString() || "",
    type,
    status,
    coverageDetail,
    startDate,
    endDate,
    premium,
    sumAssured,
    coverageAmount,
    policyHolder,
    blockchain,
    canClaim: status === "active",
    claimHistory,
    documentUrl,
  };
}
