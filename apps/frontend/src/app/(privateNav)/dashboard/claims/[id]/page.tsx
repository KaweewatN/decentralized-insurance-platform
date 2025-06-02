import ClaimByIdPage from "@/views/dashboard/claims/ClaimByIdPage";
import { getWalletAddress } from "@/app/api/auth/[...nextauth]/auth";

interface ClaimByPolicyIdProps {
  params: {
    id: string;
  };
}

export default async function ClaimById({ params }: ClaimByPolicyIdProps) {
  const walletAddress = await getWalletAddress();
  if (!walletAddress) {
    return <div>Error: Wallet address not found.</div>;
  }
  const policyId = params.id; // Extract the claim ID from URL params
  return <ClaimByIdPage walletAddress={walletAddress} claimId={policyId} />;
}
