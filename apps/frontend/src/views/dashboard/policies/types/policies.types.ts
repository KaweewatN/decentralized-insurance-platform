export interface PolicyCardProps {
  id: string;
  type: "health" | "flight" | "rainfall";
  status:
    | "active"
    | "expired"
    | "pending-payment"
    | "claimed"
    | "payout-processed";
  coverageDetail: string;
  startDate: string;
  endDate: string;
  canClaim: boolean;
}

export interface PolicyDetailsProps {
  id: string;
  type: "health" | "flight" | "rainfall";
  status: "active" | "expired" | "pending-payment" | "claimed";
  coverageDetail: string;
  startDate: string;
  endDate: string;
  premium: string;
  coverageAmount: string;
  sumAssured: string;
  policyHolder: {
    name: string;
    walletAddress: string;
  };
  blockchain: {
    contractAddress: string;
    network: string;
    transactionHash: string;
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
