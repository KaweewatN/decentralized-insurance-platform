import AccountPage from "@/views/dashboard/account/accountPage";
import { getWalletAddressAndAccessToken } from "@/app/api/auth/[...nextauth]/auth";

export default async function Page() {
  const WalletAddressAndAccessToken = await getWalletAddressAndAccessToken();
  if (!WalletAddressAndAccessToken) {
    return (
      <div className="flex items-center justify-center h-screen">
        <h1 className="text-2xl font-bold text-gray-800">
          Please sign in to view your account.
        </h1>
      </div>
    );
  }
  return (
    <>
      <AccountPage
        walletAddress={WalletAddressAndAccessToken?.walletAddress}
        accessToken={WalletAddressAndAccessToken?.accessToken}
      />
    </>
  );
}
