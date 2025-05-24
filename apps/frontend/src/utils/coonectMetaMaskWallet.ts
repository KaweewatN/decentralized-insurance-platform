import { ethers } from "ethers";
import { toastError } from "src/components/core/common/appToast";

const connectMetaMaskWallet = async (): Promise<string | null> => {
  if (!window.ethereum) {
    toastError("MetaMask is not installed! Please install it to continue.");
    return null;
  }

  try {
    // Initialize the provider
    const provider = new ethers.BrowserProvider(window.ethereum);

    // Clear any cached permissions to force fresh account selection
    try {
      // Request permissions first to trigger account selection UI
      await window.ethereum.request({
        method: "wallet_requestPermissions",
        params: [{ eth_accounts: {} }],
      });
    } catch (permissionError) {
      console.log(
        "Wallet permissions request failed or not supported:",
        permissionError
      );
    }

    // Now request accounts - this should open the wallet interface
    const accounts = await window.ethereum.request({
      method: "eth_requestAccounts",
    });

    if (!accounts || accounts.length === 0) {
      toastError(
        "No account selected. Please select an account from your wallet."
      );
      return null;
    }

    const address = ethers.getAddress(accounts[0]);

    return address;
  } catch (err: any) {
    console.error("Error connecting wallet:", err);

    // Enhanced error handling
    switch (err.code) {
      case 4001:
        toastError(
          "Connection request was rejected. Please approve the connection in your wallet."
        );
        break;
      case -32002:
        toastError(
          "Connection request is already pending. Please check your wallet and complete the process."
        );
        break;
      case 4100:
        toastError("Please unlock your wallet and try again.");
        break;
      case -32603:
        toastError(
          "Internal error occurred. Please refresh the page and try again."
        );
        break;
      default:
        toastError(
          err?.message || "Failed to connect wallet. Please try again."
        );
    }
    return null;
  }
};

export default connectMetaMaskWallet;
