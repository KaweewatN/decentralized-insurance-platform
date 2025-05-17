import PoliciesPage from "@/views/dashboard/policies/PoliciesPage";
import { getWalletAddress } from "@/app/api/auth/[...nextauth]/auth";

export default async function Policies() {
  const walletAddress = await getWalletAddress();
  if (!walletAddress) {
    return <div>Wallet address not found</div>;
  }
  return (
    <>
      <PoliciesPage walletAddress={walletAddress} />
    </>
  );
}
