"use client";

import { Badge } from "@/components/ui/badge";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  AlertCircle,
  Bell,
  Copy,
  ExternalLink,
  Key,
  LogOut,
  Mail,
  Shield,
  Wallet,
  Coins,
} from "lucide-react";

export default function AccountPage() {
  const { data: session } = useSession();
  const [copied, setCopied] = useState(false);
  const [walletAddress, setWalletAddress] = useState(
    "0xc724B6892AAbC09e5f4e053717c4F37e32484a08"
  );
  const [ethBalance, setEthBalance] = useState<string | null>(null);
  const [ethPriceThb, setEthPriceThb] = useState<number | null>(null);
  const [profile, setProfile] = useState<any>(null); // <-- Add profile state

  useEffect(() => {
    const fetchBalance = async () => {
      try {
        const res = await fetch(`http://localhost:3001/api/wallet/balance`, {
          headers: {
            "wallet-address": walletAddress,
            Authorization: session
              ? `Bearer ${session?.user?.accessToken}`
              : "",
          },
        });
        if (!res.ok) throw new Error("Failed to fetch wallet balance");
        const data = await res.json();
        if (data.status === "success") {
          setEthBalance(data.data.balance.ether.value.toString());
          console.log(data.data.balance.ether.value.toString());
        } else {
          setEthBalance(null);
        }
      } catch (err) {
        console.error("Fetch error:", err);
        setEthBalance(null);
      }
    };
    fetchBalance();
  }, [walletAddress, session]);

  // Fetch ETH price in THB
  useEffect(() => {
    const fetchEthPrice = async () => {
      try {
        const res = await fetch("http://localhost:3001/api/price/eththb");
        if (!res.ok) throw new Error("Failed to fetch ETH price");
        const data = await res.json();
        setEthPriceThb(Number(data.ethToThb));
      } catch (err) {
        console.error("Fetch error:", err);
        setEthPriceThb(null);
      }
    };
    fetchEthPrice();
  }, []);

  // Fetch user profile
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await fetch(
          `http://localhost:3001/api/user/profile?walletAddress=${walletAddress}`
        );
        if (!res.ok) throw new Error("Failed to fetch profile");
        const data = await res.json();
        setProfile(data);
      } catch (err) {
        console.error("Fetch error:", err);
        setProfile(null);
      }
    };
    fetchProfile();
  }, [walletAddress]);

  // Copy wallet address to clipboard
  const copyToClipboard = () => {
    navigator.clipboard.writeText(walletAddress);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <>
      <main className="container px-4 py-8 mx-auto">
        <div className="max-w-4xl mx-auto">
          <div className="mb-6">
            <h1 className="text-3xl font-bold">Account Settings</h1>
            <p className="text-gray-600 mt-1">
              Manage your account preferences and blockchain wallet
            </p>
          </div>

          <Tabs defaultValue="profile" className="space-y-6">
            <TabsList className="grid w-full grid-cols-4 lg:w-auto lg:inline-grid">
              <TabsTrigger value="profile">Profile</TabsTrigger>
              <TabsTrigger value="wallet">Wallet</TabsTrigger>
              <TabsTrigger value="security">Security</TabsTrigger>
              <TabsTrigger value="notifications">Notifications</TabsTrigger>
            </TabsList>

            <TabsContent value="profile" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Personal Information</CardTitle>
                  <CardDescription>
                    Update your personal details
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-center w-full mb-10">
                    <Avatar className="w-28 h-28">
                      <AvatarImage
                        src={profile?.avatarUrl || ""}
                        alt={profile?.fullName || "Avatar"}
                      />
                      <AvatarFallback className="bg-gray-200 text-gray-700">
                        {profile?.fullName
                          ? profile.fullName.charAt(0).toUpperCase()
                          : walletAddress.charAt(2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 ">
                    <div className="space-y-2">
                      <Label htmlFor="name">Full Name</Label>
                      <Input
                        id="name"
                        defaultValue={profile?.fullName || ""}
                        placeholder="Full Name"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="username">Username</Label>
                      <Input
                        id="username"
                        disabled
                        defaultValue={profile?.username || ""}
                        placeholder="Username"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="age">Age</Label>
                      <Input
                        id="age"
                        type="number"
                        defaultValue={profile?.age || ""}
                        placeholder="Age"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="gender">Gender</Label>
                      <Input
                        id="gender"
                        defaultValue={profile?.gender || ""}
                        placeholder="Gender"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="occupation">Occupation</Label>
                      <Input
                        id="occupation"
                        defaultValue={profile?.occupation || ""}
                        placeholder="Occupation"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="contact">Contact Info</Label>
                      <Input
                        id="contact"
                        defaultValue={profile?.contactInfo || ""}
                        placeholder="Contact Info"
                      />
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="flex justify-end gap-2">
                  <Button variant="outline">Cancel</Button>
                  <Button>Save Changes</Button>
                </CardFooter>
              </Card>
            </TabsContent>

            <TabsContent value="wallet" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Connected Wallet</CardTitle>
                  <CardDescription>
                    Manage your blockchain wallet connection
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-4 bg-blue-50 rounded-lg border border-blue-100">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                        <Wallet className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <p className="font-medium">MetaMask</p>
                        <div className="flex items-center mt-1">
                          <p className="text-sm font-mono text-gray-500">
                            {walletAddress}
                          </p>
                          <button
                            onClick={copyToClipboard}
                            className="ml-2 text-gray-400 hover:text-gray-600 focus:outline-none"
                            title="Copy address"
                          >
                            <Copy className="h-4 w-4" />
                          </button>
                          {copied && (
                            <span className="ml-2 text-xs text-green-600">
                              Copied!
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="border-blue-200 text-blue-700 hover:bg-blue-50"
                        asChild
                      >
                        <a
                          href={`https://sepolia.etherscan.io/address/${walletAddress}`}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <ExternalLink className="mr-1 h-3 w-3" />
                          View on Etherscan
                        </a>
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="border-red-200 text-red-700 hover:bg-red-50"
                      >
                        Disconnect
                      </Button>
                    </div>
                  </div>

                  <div>
                    <h3 className="font-semibold mb-3">Wallet Balance</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="p-4 bg-gray-50 rounded-lg border">
                        <div className="flex items-center justify-between">
                          <p className="text-sm text-gray-500 mb-1">
                            <Coins className="inline h-4 w-4 mr-1 font-bold text-violet-700" />
                            ETH Balance
                          </p>
                          <span className="text-xs text-green-600">
                            1 ETH ={" "}
                            {ethPriceThb !== null
                              ? ethPriceThb.toLocaleString("en-US", {
                                  maximumFractionDigits: 2,
                                })
                              : "Loading..."}{" "}
                            THB
                          </span>
                        </div>

                        <div className="flex items-center gap-x-5 mt-2">
                          <p className="text-2xl font-bold">
                            {ethBalance !== null
                              ? `${Number(ethBalance).toFixed(6)} ETH`
                              : "Loading..."}
                          </p>

                          {ethBalance !== null && ethPriceThb !== null && (
                            <p className="text-sm text-gray-500">
                              ≈{" "}
                              {(
                                Number(ethBalance) * ethPriceThb
                              ).toLocaleString("en-US", {
                                maximumFractionDigits: 2,
                              })}{" "}
                              THB
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="font-semibold mb-3">Recent Transactions</h3>
                    <div className="space-y-3">
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-3 border rounded-md">
                        <div>
                          <p className="font-medium">Policy Purchase</p>
                          <p className="text-sm text-gray-500">May 15, 2025</p>
                        </div>
                        <div className="mt-2 sm:mt-0 flex items-center gap-2">
                          <p className="font-medium text-red-600">-0.015 ETH</p>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 px-2"
                            asChild
                          >
                            <a href="#" onClick={(e) => e.preventDefault()}>
                              <ExternalLink className="h-3 w-3" />
                            </a>
                          </Button>
                        </div>
                      </div>
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-3 border rounded-md">
                        <div>
                          <p className="font-medium">Claim Payout</p>
                          <p className="text-sm text-gray-500">
                            April 28, 2025
                          </p>
                        </div>
                        <div className="mt-2 sm:mt-0 flex items-center gap-2">
                          <p className="font-medium text-green-600">
                            +0.05 ETH
                          </p>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 px-2"
                            asChild
                          >
                            <a href="#" onClick={(e) => e.preventDefault()}>
                              <ExternalLink className="h-3 w-3" />
                            </a>
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button variant="outline" className="w-full" asChild>
                    <a href="#" onClick={(e) => e.preventDefault()}>
                      View All Transactions
                    </a>
                  </Button>
                </CardFooter>
              </Card>
            </TabsContent>

            <TabsContent value="security" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Security Settings</CardTitle>
                  <CardDescription>
                    Manage your account security
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <h3 className="font-semibold">Change Password</h3>
                    <div className="grid grid-cols-1 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="current-password">
                          Current Password
                        </Label>
                        <Input id="current-password" type="password" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="new-password">New Password</Label>
                        <Input id="new-password" type="password" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="confirm-password">
                          Confirm New Password
                        </Label>
                        <Input id="confirm-password" type="password" />
                      </div>
                    </div>
                    <Button>Update Password</Button>
                  </div>

                  <Separator />

                  <div className="space-y-4">
                    <h3 className="font-semibold">Two-Factor Authentication</h3>
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <p className="text-base font-medium">Enable 2FA</p>
                        <p className="text-sm text-gray-500">
                          Add an extra layer of security to your account
                        </p>
                      </div>
                      <Switch />
                    </div>
                    <Button
                      variant="outline"
                      className="flex items-center gap-2"
                    >
                      <Key className="h-4 w-4" />
                      Setup Authenticator App
                    </Button>
                  </div>

                  <Separator />

                  <div className="space-y-4">
                    <h3 className="font-semibold">Session Management</h3>
                    <div className="space-y-3">
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-3 bg-gray-50 rounded-md border">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
                            <Shield className="h-4 w-4 text-green-600" />
                          </div>
                          <div>
                            <p className="font-medium">Current Session</p>
                            <p className="text-xs text-gray-500">
                              Chrome on Windows • IP: 192.168.1.1
                            </p>
                          </div>
                        </div>
                        <Badge className="mt-2 sm:mt-0 bg-green-100 text-green-800 hover:bg-green-100">
                          Active
                        </Badge>
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      className="text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700"
                    >
                      <LogOut className="mr-2 h-4 w-4" />
                      Sign Out All Devices
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Wallet Security</CardTitle>
                  <CardDescription>
                    Manage your blockchain wallet security
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Alert className="bg-amber-50 border-amber-200">
                    <AlertCircle className="h-4 w-4 text-amber-800" />
                    <AlertDescription className="text-amber-800">
                      Remember to keep your wallet recovery phrase in a safe
                      place. ChainSure never stores your private keys.
                    </AlertDescription>
                  </Alert>
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <p className="text-base font-medium">
                        Transaction Signing
                      </p>
                      <p className="text-sm text-gray-500">
                        Require wallet signature for all transactions
                      </p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <p className="text-base font-medium">Spending Limit</p>
                      <p className="text-sm text-gray-500">
                        Set a daily spending limit for your wallet
                      </p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="notifications" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Notification Preferences</CardTitle>
                  <CardDescription>
                    Manage how you receive notifications
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <h3 className="font-semibold">Email Notifications</h3>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Mail className="h-5 w-5 text-gray-400" />
                          <p>Policy Updates</p>
                        </div>
                        <Switch defaultChecked />
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Mail className="h-5 w-5 text-gray-400" />
                          <p>Claim Status Changes</p>
                        </div>
                        <Switch defaultChecked />
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Mail className="h-5 w-5 text-gray-400" />
                          <p>Payment Confirmations</p>
                        </div>
                        <Switch defaultChecked />
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Mail className="h-5 w-5 text-gray-400" />
                          <p>Marketing & Promotions</p>
                        </div>
                        <Switch />
                      </div>
                    </div>
                  </div>

                  <Separator />

                  <div className="space-y-4">
                    <h3 className="font-semibold">Blockchain Notifications</h3>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Bell className="h-5 w-5 text-gray-400" />
                          <p>Smart Contract Events</p>
                        </div>
                        <Switch defaultChecked />
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Bell className="h-5 w-5 text-gray-400" />
                          <p>Oracle Data Updates</p>
                        </div>
                        <Switch defaultChecked />
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Bell className="h-5 w-5 text-gray-400" />
                          <p>Automatic Claim Payouts</p>
                        </div>
                        <Switch defaultChecked />
                      </div>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="flex justify-end gap-2">
                  <Button variant="outline">Reset to Default</Button>
                  <Button>Save Preferences</Button>
                </CardFooter>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </>
  );
}
