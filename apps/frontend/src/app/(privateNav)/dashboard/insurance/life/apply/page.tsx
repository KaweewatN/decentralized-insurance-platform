import { LifeInsuranceApplicationPage } from "@/views/dashboard/insurance/LifeInsuranceApplicationPage";
import { getWalletAddress } from "@/app/api/auth/[...nextauth]/auth";

export default async function LifeInsuranceApplication() {
  const walletAddress = await getWalletAddress();
  if (!walletAddress) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold">Wallet Not Connected</h1>
          <p className="mt-4 text-gray-600">
            Please connect your wallet to access this page.
          </p>
        </div>
      </div>
    );
  }
  return <LifeInsuranceApplicationPage walletAddress={walletAddress} />;
}
