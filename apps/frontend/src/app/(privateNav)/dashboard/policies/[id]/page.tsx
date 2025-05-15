import PoliciesIdPage from "@/views/dashboard/policies/PoliciesIdPage";
import { getWalletAddress } from "@/app/api/auth/[...nextauth]/auth";

export default async function PoliciesPage() {
  const walletAddress = await getWalletAddress();
  if (!walletAddress) {
    return <div>Wallet address not found</div>;
  }
  return <PoliciesIdPage walletAddress={walletAddress} />;
}
