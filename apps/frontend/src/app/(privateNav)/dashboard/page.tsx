import DashboardPage from "@/views/dashboard/Dashboard";
import { getWalletAddress } from "@/app/api/auth/[...nextauth]/auth";

export default async function Dashboard() {
  const walletAddress = await getWalletAddress();
  if (!walletAddress) {
    return <div>Wallet address not found</div>;
  }
  return (
    <>
      <DashboardPage walletAddress={walletAddress} />
    </>
  );
}
