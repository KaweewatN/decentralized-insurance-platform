import HealthInsuranceApplicationPage from "@/views/dashboard/insurance/HealthInsuranceApplicationPage";
import { getWalletAddress } from "@/app/api/auth/[...nextauth]/auth";

export default async function HealthInsuranceApplication() {
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
  return (
    <>
      <HealthInsuranceApplicationPage walletAddress={walletAddress} />
    </>
  );
}
