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
import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { toastSuccess, toastError } from "./appToast";
// signin and signup
import { signIn, signOut, useSession } from "next-auth/react";
import apiService from "@/utils/apiService";
// form validation
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
// utils
import connectMetaMaskWallet from "@/utils/coonectMetaMaskWallet";

const signUpSchema = z.object({
  username: z.string().nonempty("Username is required"),
  fullName: z.string().nonempty("Full name is required"),
  age: z.number().min(1, "Age is required"),
  gender: z.string().nonempty("Gender is required"),
  occupation: z.string().nonempty("Occupation is required"),
  contactInfo: z.string().nonempty("Contact info is required"),
});

export default function SignInButton() {
  const [response, setResponse] = useState("");
  const [isPending, startTransition] = useTransition();
  const [tab, setTab] = useState("signin");
  const { data: session } = useSession() || {};
  const router = useRouter();

  const {
    register,
    handleSubmit,
    reset: resetForm,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(signUpSchema),
  });

  // Sign in with MetaMask
  const handleSignIn = async () => {
    const address = await connectMetaMaskWallet();
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

          // Wait a moment for session to update, then check role
          setTimeout(async () => {
            // Trigger session update
            await signIn("credentials", {
              redirect: false,
              walletAddress: address,
            });

            // Check updated session
            const updatedSession = await fetch("/api/auth/session").then(
              (res) => res.json()
            );

            if (updatedSession?.user?.role === "ADMIN") {
              router.push("/admin");
            } else {
              router.push("/dashboard");
            }
          }, 1000);
        } else {
          setResponse(res?.error || "Failed to sign in");
          toastError(res?.error || "Failed to sign in");
        }
      } catch (err) {
        setResponse("Failed to sign in");
        toastError("Failed to sign in");
      }
    });
  };

  // Sign up with MetaMask and create a new user
  const handleSignUp = async (data: any) => {
    const address = await connectMetaMaskWallet();
    console.log("address", address);
    console.log("data", data);
    if (!address) return;

    startTransition(async () => {
      try {
        const signUpData = {
          walletAddress: address,
          ...data,
          imageUrl: "",
        };

        const res = await apiService.post<any>(`/auth/signup`, signUpData);
        if (res) {
          setResponse("Sign up successful, Please sign in");
          toastSuccess("Sign up successful, Please sign in");
          resetForm();
        }
      } catch (err) {
        setResponse("Failed to sign up");
        toastError("Failed to sign up");
        resetForm();
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
            <span className="font-semibold">{session.user?.username}</span>
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
            <form onSubmit={handleSubmit(handleSignUp)} className="space-y-4">
              <div className="w-full mb-5 text-sm text-gray-500">
                ✨ Create your account by signing up with your MetaMask wallet.
              </div>

              {/* Form Fields */}
              <div className="space-y-2">
                <div>
                  <label htmlFor="username">Username</label>
                  <input
                    id="username"
                    type="text"
                    {...register("username")}
                    className="w-full px-3 py-2 border rounded"
                  />
                  {errors.username && (
                    <p className="text-red-500 text-sm">
                      {String(errors.username.message)}
                    </p>
                  )}
                </div>
                <div>
                  <label htmlFor="fullName">Full Name</label>
                  <input
                    id="fullName"
                    type="text"
                    {...register("fullName")}
                    className="w-full px-3 py-2 border rounded"
                  />
                  {errors.fullName && (
                    <p className="text-red-500 text-sm">
                      {String(errors.fullName.message)}
                    </p>
                  )}
                </div>
                <div>
                  <label htmlFor="age">Age</label>
                  <input
                    id="age"
                    type="number"
                    {...register("age", { valueAsNumber: true })}
                    className="w-full px-3 py-2 border rounded"
                  />
                  {errors.age && (
                    <p className="text-red-500 text-sm">
                      {String(errors.age.message)}
                    </p>
                  )}
                </div>
                <div>
                  <label htmlFor="gender">Gender</label>
                  <select
                    id="gender"
                    {...register("gender")}
                    className="w-full px-3 py-2 border rounded"
                  >
                    <option value="">Select Gender</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                  {errors.gender && (
                    <p className="text-red-500 text-sm">
                      {String(errors.gender.message)}
                    </p>
                  )}
                </div>
                <div>
                  <label htmlFor="occupation">Occupation</label>
                  <input
                    id="occupation"
                    type="text"
                    {...register("occupation")}
                    className="w-full px-3 py-2 border rounded"
                  />
                  {errors.occupation && (
                    <p className="text-red-500 text-sm">
                      {String(errors.occupation.message)}
                    </p>
                  )}
                </div>
                <div>
                  <label htmlFor="contactInfo">Contact Info</label>
                  <input
                    id="contactInfo"
                    type="text"
                    {...register("contactInfo")}
                    className="w-full px-3 py-2 border rounded"
                  />
                  {errors.contactInfo && (
                    <p className="text-red-500 text-sm">
                      {String(errors.contactInfo.message)}
                    </p>
                  )}
                </div>
              </div>

              {/* Submit Button */}
              <Button type="submit" disabled={isPending} className="w-full">
                <Image
                  src="/assets/icons/metamask-icon.png"
                  alt="MetaMask"
                  width={24}
                  height={24}
                  style={{ marginRight: 8 }}
                />
                {isPending ? "Signing Up..." : "Sign Up with MetaMask"}
              </Button>
            </form>
          </TabsContent>
        </Tabs>
        {response && (
          <div
            className={
              response == "Sign up successful, Please sign in"
                ? "text-green-600"
                : "text-red-500"
            }
          >
            {response}
          </div>
        )}
        <DialogClose asChild></DialogClose>
      </DialogContent>
    </Dialog>
  );
}
