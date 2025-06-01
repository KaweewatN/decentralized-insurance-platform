import ClaimSubmissionPage from "@/views/dashboard/claims/ClaimSubmissionPage";
import { getWalletAddress } from "@/app/api/auth/[...nextauth]/auth";

export default async function SubmitClaimPage() {
  const walletAddress = await getWalletAddress();
  return <ClaimSubmissionPage walletAddress={walletAddress} />;
}
