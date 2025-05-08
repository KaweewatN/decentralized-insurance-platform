"use client";

import { useState, useTransition } from "react";
import { ethers } from "ethers";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import { Badge } from "@/components/ui/badge";
import { toastSuccess, toastError } from "./appToast";
import { signIn, signOut, useSession } from "next-auth/react";

export default function SignInButton() {
  const [walletAddress, setWalletAddress] = useState("");
  const [response, setResponse] = useState("");
  const [isPending, startTransition] = useTransition();
  const [tab, setTab] = useState("signin");
  const { data: session } = useSession() || {};

  const connectWallet = async () => {
    if (!window.ethereum) {
      alert("MetaMask is not installed!");
      return null;
    }
    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const accounts = await provider.send("eth_requestAccounts", []);
      const address = ethers.getAddress(accounts[0]);
      setWalletAddress(address);
      return address;
    } catch (err) {
      toastError("Failed to connect wallet");
      return null;
    }
  };

  const handleSignIn = async () => {
    const address = await connectWallet();
    if (!address) return;

    startTransition(async () => {
      try {
        const res = await signIn("credentials", {
          redirect: false,
          walletAddress: address,
        });

        if (res?.ok) {
          setResponse("Sign in successful");
          toastSuccess("Sign in successful");
        } else {
          setResponse(res?.error || "Failed to sign in");
          toastError(res?.error || "Failed to sign in");
        }
      } catch (err) {
        setResponse("Failed to sign in");
      }
    });
  };

  if (session) {
    return (
      <HoverCard>
        <HoverCardTrigger asChild className="cursor-pointer">
          <Avatar>
            <AvatarImage
              src="/assets/icons/user-avatar.png"
              alt={session.user?.username || "User"}
            />
            <AvatarFallback>
              {session.user?.username?.[0]?.toUpperCase() || "U"}
            </AvatarFallback>
          </Avatar>
        </HoverCardTrigger>
        <HoverCardContent className="max-w-48 mr-5">
          <div className="flex flex-col gap-2">
            <span className="font-semibold ">{session.user?.username}</span>
            <p className="text-sm text-slate-500">
              Name:{" "}
              <span className="font-medium text-black">
                {session.user?.fullName}
              </span>
            </p>
            <span className="text-sm text-slate-500">
              Role:{" "}
              <Badge className="bg-blue-500">
                {session.user?.role.toLowerCase()}
              </Badge>
            </span>
            <button
              onClick={() => signOut()}
              className="mt-2 rounded bg-red-500 px-3 py-1 text-white text-sm font-medium hover:bg-red-600 transition"
            >
              Logout
            </button>
          </div>
        </HoverCardContent>
      </HoverCard>
    );
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button>
          <Image
            src="/assets/icons/metamask-icon.png"
            alt="MetaMask"
            width={24}
            height={24}
            style={{ marginRight: 8 }}
          />
          Connect wallet
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Connect Wallet</DialogTitle>
        </DialogHeader>
        <Tabs value={tab} onValueChange={setTab} className="w-full">
          <TabsList className="mb-4 w-full">
            <TabsTrigger value="signin" className="w-1/2">
              Sign In
            </TabsTrigger>
            <TabsTrigger value="signup" className="w-1/2">
              Sign Up
            </TabsTrigger>
          </TabsList>
          <TabsContent value="signin">
            <div className="w-full mb-5 text-sm text-gray-500">
              🔓 Unlock the full potential of our decentralized insurance
              platform by signing in with your MetaMask wallet.
            </div>
            <Button
              onClick={handleSignIn}
              disabled={isPending}
              className="w-full"
            >
              <Image
                src="/assets/icons/metamask-icon.png"
                alt="MetaMask"
                width={24}
                height={24}
                style={{ marginRight: 8 }}
              />
              {isPending ? "Signing In..." : "Sign In with MetaMask"}
            </Button>
          </TabsContent>
          <TabsContent value="signup">
            {/* Implement sign up logic if needed */}
            <Button disabled className="w-full">
              <Image
                src="/assets/icons/metamask-icon.png"
                alt="MetaMask"
                width={24}
                height={24}
                style={{ marginRight: 8 }}
              />
              Sign Up with MetaMask (Not implemented)
            </Button>
          </TabsContent>
        </Tabs>
        {response && (
          <div style={{ marginTop: 16, color: "red" }}>{response}</div>
        )}
        <DialogClose asChild></DialogClose>
      </DialogContent>
    </Dialog>
  );
}
