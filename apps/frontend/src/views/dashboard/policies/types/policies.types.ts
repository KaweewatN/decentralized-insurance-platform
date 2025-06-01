export interface PolicyCardProps {
  id: string;
  type: "health" | "flight" | "rainfall" | "life";
  status: "active" | "expired" | "pending-payment" | "claimed" | "rejected";
  coverageDetail: string;
  startDate: string;
  endDate: string;
  canClaim: boolean;
}

export interface PolicyDetailsProps {
  id: string;
  type: "health" | "flight" | "rainfall" | "life";
  status: "active" | "expired" | "pending-payment" | "claimed" | "rejected";
  coverageDetail: string;
  startDate: string;
  endDate: string;
  premium: string;
  coverageAmount: string;
  totalPremium: string;
  policyHolder: {
    name: string;
    walletAddress: string;
  };
  blockchain: {
    contractAddress: string;
    network: string;
    purchaseTransactionHash: string;
    contractCreationHash?: string;
  };
  canClaim: boolean;
  claimHistory?: Array<{
    id: string;
    date: string;
    amount: string;
    status: string;
  }>;
  documentUrl?: string;
}
