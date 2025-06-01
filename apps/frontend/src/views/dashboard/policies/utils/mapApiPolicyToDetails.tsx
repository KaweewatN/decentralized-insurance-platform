import { PolicyDetailsProps } from "@/views/dashboard/policies/types/policies.types";

export default function mapApiPolicyToDetails(policy: any): PolicyDetailsProps {
  // Dynamically determine policy type from available fields
  let type: "health" | "flight" | "rainfall" | "life" = "health";
  const typeValue =
    policy.type ||
    policy.planType ||
    policy.plan_type ||
    policy.planTypeName ||
    policy.planTypeId ||
    "";

  // Handle planTypeId mapping
  if (policy.planTypeId === 1 || typeValue === "1") type = "health";
  else if (policy.planTypeId === 2 || typeValue === "2") type = "flight";
  else if (policy.planTypeId === 3 || typeValue === "3") type = "rainfall";
  else if (policy.planTypeId === 4 || typeValue === "4") type = "life";
  else {
    const typeStr =
      typeof typeValue === "string"
        ? typeValue.toLowerCase()
        : typeValue?.toString();

    if (typeStr === "flight") type = "flight";
    else if (typeStr === "rainfall") type = "rainfall";
    else if (typeStr === "life") type = "life";
    else if (typeStr === "health") type = "health";
  }

  // Normalize status
  let status: PolicyDetailsProps["status"] = "active";
  const statusValue = (policy.status || "").toString().toLowerCase();
  if (statusValue === "pendingpayment" || statusValue === "pending-payment")
    status = "pending-payment";
  else if (statusValue === "expired") status = "expired";
  else if (statusValue === "claimed") status = "claimed";
  else if (statusValue === "rejected") status = "rejected";
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
  else if (type === "life") coverageDetail = "Life insurance protection";

  // Policyholder info
  const policyHolder = {
    name:
      policy.user?.fullName ||
      policy.policyHolder?.name ||
      policy.holderName ||
      "",
    walletAddress:
      policy.walletAddress ||
      policy.user?.walletAddress ||
      policy.policyHolder?.walletAddress ||
      policy.holderWalletAddress ||
      "",
  };

  // Blockchain info
  const blockchain = {
    contractAddress:
      policy.contractAddress || policy.blockchain?.contractAddress || "",
    network: policy.blockchain?.network || "Sepolia Testnet",
    purchaseTransactionHash:
      policy.purchaseTransactionHash ||
      policy.contractCreationHash ||
      policy.blockchain?.purchaseTransactionHash ||
      "",
  };

  // Claims history
  const claimHistory =
    Array.isArray(policy.claims) && policy.claims.length > 0
      ? policy.claims.map((claim: any) => ({
          id: claim.id?.toString() || "",
          date: claim.date || claim.createdAt || "",
          amount: claim.amount || "",
          status: claim.status || "pending",
        }))
      : Array.isArray(policy.claimHistory) && policy.claimHistory.length > 0
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
      : typeof policy.premium === "string" && policy.premium
        ? `$${policy.premium}`
        : policy.premium || "";

  const coverageAmount =
    typeof policy.coverageAmount === "number"
      ? `$${policy.coverageAmount}`
      : typeof policy.coverageAmount === "string" && policy.coverageAmount
        ? `$${policy.coverageAmount}`
        : policy.coverageAmount || "";

  const totalPremium =
    typeof policy.totalPremium === "number"
      ? `$${policy.totalPremium}`
      : typeof policy.totalPremium === "string" && policy.totalPremium
        ? `$${policy.totalPremium}`
        : policy.totalPremium || "";

  return {
    id: policy.id?.toString() || "",
    type,
    status,
    coverageDetail,
    startDate,
    endDate,
    premium,
    totalPremium,
    coverageAmount,
    policyHolder,
    blockchain,
    canClaim: status === "active",
    claimHistory,
    documentUrl,
  };
}
