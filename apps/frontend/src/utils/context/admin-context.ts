"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  type ReactNode,
} from "react";
import { useRouter, usePathname } from "next/navigation";
import { isAdminWallet } from "@/libs/admin-utils";

interface AdminContextType {
  isAdmin: boolean;
  walletAddress: string | null;
  loading: boolean;
  logout: () => void;
}

const AdminContext = createContext<AdminContextType>({
  isAdmin: false,
  walletAddress: null,
  loading: true,
  logout: () => {},
});

export const useAdmin = () => useContext(AdminContext);

export function AdminProvider({ children }: { children: ReactNode }) {
  const [isAdmin, setIsAdmin] = useState(false);
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const checkAdminStatus = async () => {
      // Skip auth check for login page
      if (pathname === "/admin/login") {
        setLoading(false);
        return;
      }

      const storedWallet = sessionStorage.getItem("adminWallet");

      if (!storedWallet) {
        setIsAdmin(false);
        setLoading(false);
        router.push("/access");
        return;
      }

      try {
        const adminStatus = await isAdminWallet(storedWallet);
        setIsAdmin(adminStatus);
        setWalletAddress(storedWallet);

        if (!adminStatus) {
          router.push("/access");
        }
      } catch (error) {
        console.error("Error checking admin status:", error);
        setIsAdmin(false);
        router.push("/access");
      } finally {
        setLoading(false);
      }
    };

    checkAdminStatus();
  }, [pathname, router]);

  const logout = () => {
    sessionStorage.removeItem("adminWallet");
    setIsAdmin(false);
    setWalletAddress(null);
    router.push("/access");
  };

  return React.createElement(
    AdminContext.Provider,
    { value: { isAdmin, walletAddress, loading, logout } },
    children
  );
}
