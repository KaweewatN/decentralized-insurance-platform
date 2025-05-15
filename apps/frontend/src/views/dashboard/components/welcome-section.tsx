import { Wallet } from "lucide-react";

interface WelcomeSectionProps {
  walletAddress?: string;
}

export default function WelcomeSection({ walletAddress }: WelcomeSectionProps) {
  // Function to shorten wallet address
  const shortenAddress = (address?: string) => {
    if (!address || address.length < 10) return address || "Not connected";
    return `${address}`;
  };

  return (
    <div className="mb-8">
      <h1 className="text-3xl font-bold text-[#212529]">
        Welcome back to ChainSure
      </h1>
      <div className="flex items-center mt-2 text-gray-600">
        <Wallet className="w-4 h-4 mr-2" />
        <span className="text-sm">
          Connected Wallet: {shortenAddress(walletAddress)}
        </span>
      </div>
    </div>
  );
}
