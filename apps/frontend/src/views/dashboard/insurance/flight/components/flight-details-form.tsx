"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Plane,
  PlaneTakeoff,
  PlaneLanding,
  Shield,
  X,
  Sparkles,
  User,
  Landmark,
  Globe,
  Calendar,
  Clock,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import axios from "axios";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import apiService from "@/utils/apiService";

// Zod schema for validation
const formSchema = z.object({
  user_address: z.string().min(1, "User address is required"),
  airline: z.string().min(1, "Airline is required"),
  flightNumber: z.string().min(2, "Flight number is required"),
  depAirport: z.string().length(3, "Departure airport code must be 3 letters"),
  arrAirport: z.string().length(3, "Arrival airport code must be 3 letters"),
  depTime: z.string().min(1, "Departure time is required"),
  flightDate: z.string().min(1, "Flight date is required"),
  depCountry: z.string().length(2, "Departure country code must be 2 letters"),
  arrCountry: z.string().length(2, "Arrival country code must be 2 letters"),
  coverageTier: z.enum(["tier1", "tier2", "tier3"], {
    required_error: "Please select a coverage tier",
  }),
  coverageAmount: z.number().min(0.1).max(0.5),
  numPersons: z.number().min(1, "At least 1 person"),
});

type FormValues = z.infer<typeof formSchema>;

const tierToAmount: Record<string, number> = {
  tier1: 0.1,
  tier2: 0.25,
  tier3: 0.5,
};

export function FlightDetailsForm({
  walletAddress,
}: {
  walletAddress: string;
}) {
  const router = useRouter();
  const backendURL =
    process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3001/api";
  const [ethToThb, setEthToThb] = useState<number | null>(null);

  // Store both premiumPerPerson and totalPremium
  const [premium, setPremium] = useState<{
    premiumPerPerson: number | null;
    totalPremium: number | null;
    probability: number | null;
  }>({ premiumPerPerson: null, totalPremium: null, probability: null });

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      user_address: walletAddress,
      airline: "",
      flightNumber: "",
      depAirport: "",
      arrAirport: "",
      depTime: "",
      flightDate: "",
      depCountry: "",
      arrCountry: "",
      coverageTier: "tier2",
      coverageAmount: 0.25,
      numPersons: undefined,
    },
  });

  const isSubmitting = form.formState.isSubmitting;

  // Fetch ETH to THB rate
  useEffect(() => {
    const fetchRate = async () => {
      try {
        const data = await apiService.get(`${backendURL}/price/eththb`);
        setEthToThb((data as any)?.ethToThb);
      } catch (error) {
        console.error("Error fetching ETH to THB rate:", error);
      }
    };
    fetchRate();
  }, []);

  // Sync coverageAmount with coverageTier
  useEffect(() => {
    const subscription = form.watch((values, { name }) => {
      if (name === "coverageTier" && values.coverageTier) {
        const amount = tierToAmount[values.coverageTier];
        if (amount !== form.getValues("coverageAmount")) {
          form.setValue("coverageAmount", amount);
        }
      }
    });
    return () => subscription.unsubscribe();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form]);

  // Remove auto premium calculation here

  const onSubmit = async (data: FormValues) => {
    try {
      // Calculate premium only on submit
      const estimateRes = await axios.get(
        `${backendURL}/flight-insurance/estimate-premium`,
        {
          params: {
            airline: data.airline,
            depAirport: data.depAirport,
            arrAirport: data.arrAirport,
            depTime: data.depTime,
            flightDate: data.flightDate,
            depCountry: data.depCountry,
            arrCountry: data.arrCountry,
            coverageAmount: data.coverageAmount,
            numPersons: data.numPersons,
          },
        }
      );
      setPremium({
        premiumPerPerson: estimateRes.data.premiumPerPerson,
        totalPremium: estimateRes.data.totalPremium,
        probability: estimateRes.data.probability,
      });

      // Include premiumPerPerson and totalPremium in submission
      const submission = {
        ...data,
        premiumPerPerson: estimateRes.data.premiumPerPerson,
        totalPremium: estimateRes.data.totalPremium,
        probability: estimateRes.data.probability,
      };

      // Store in localStorage
      localStorage.setItem("flightPolicyDraft", JSON.stringify(submission));

      setTimeout(() => {
        router.push("/dashboard/insurance/flight/apply/review-policy");
      }, 3000);
    } catch (err) {
      setPremium({
        premiumPerPerson: null,
        totalPremium: null,
        probability: null,
      });
      alert(
        "Failed to estimate premium. Please check your input and try again."
      );
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-2xl font-bold text-[#212529]">
          Flight Delay Insurance
        </CardTitle>
        <CardDescription className="text-[#6B7280]">
          Protect yourself against flight delays. Receive automatic payouts if
          your flight is delayed by more than 3 hours.
        </CardDescription>
      </CardHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <CardContent className="p-6">
            <div className="space-y-6">
              {/* Flight Information */}
              <div className="space-y-4">
                <h2 className="text-xl font-semibold text-[#212529]">
                  Flight Information
                </h2>
                {/* User Address */}
                <FormField
                  control={form.control}
                  name="user_address"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>User Address</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input {...field} disabled className="pl-10" />
                          <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                {/* Airline */}
                <FormField
                  control={form.control}
                  name="airline"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Airline</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input
                            {...field}
                            placeholder="e.g., Thai Airways"
                            className="pl-10"
                          />
                          <Landmark className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                {/* Flight Number */}
                <FormField
                  control={form.control}
                  name="flightNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Flight Number</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input
                            {...field}
                            placeholder="e.g., TG635"
                            className="pl-10"
                          />
                          <Plane className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                {/* Flight Date */}
                <FormField
                  control={form.control}
                  name="flightDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Flight Date</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input {...field} type="date" className="pl-10" />
                          <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                {/* Departure Time */}
                <FormField
                  control={form.control}
                  name="depTime"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Departure Time</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input {...field} type="time" className="pl-10" />
                          <Clock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                {/* Airports */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="depAirport"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Departure Airport</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Input
                              {...field}
                              placeholder="e.g., BKK"
                              className="pl-10"
                            />
                            <PlaneTakeoff className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="arrAirport"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Arrival Airport</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Input
                              {...field}
                              placeholder="e.g., NRT"
                              className="pl-10"
                            />
                            <PlaneLanding className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                {/* Countries */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="depCountry"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Departure Country</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Input
                              {...field}
                              placeholder="e.g., TH"
                              className="pl-10"
                            />
                            <Globe className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="arrCountry"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Arrival Country</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Input
                              {...field}
                              placeholder="e.g., JP"
                              className="pl-10"
                            />
                            <Globe className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                {/* Number of Persons */}
                <FormField
                  control={form.control}
                  name="numPersons"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Number of Persons</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input
                            {...field}
                            type="number"
                            min={1}
                            max={10}
                            step={1}
                            required
                            inputMode="numeric"
                            pattern="[0-9]*"
                            className="pl-10"
                            value={field.value === undefined ? "" : field.value}
                            onChange={(e) =>
                              field.onChange(
                                e.target.value === ""
                                  ? undefined
                                  : Number(e.target.value)
                              )
                            }
                          />
                          <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              {/* Coverage Options */}
              <div className="space-y-4">
                <h2 className="text-xl font-semibold text-[#212529]">
                  Coverage Options
                </h2>
                <p className="text-sm text-gray-600">
                  Select your desired coverage tier. Higher tiers provide larger
                  payouts in case of flight delays.
                </p>
                <FormField
                  control={form.control}
                  name="coverageTier"
                  render={({ field }) => (
                    <RadioGroup
                      value={field.value}
                      onValueChange={field.onChange}
                      className="space-y-3"
                    >
                      <div
                        className={`relative flex items-start p-4 rounded-lg border ${
                          field.value === "tier1"
                            ? "border-blue-500 bg-blue-50"
                            : "border-gray-200"
                        }`}
                      >
                        <div className="flex items-center h-5">
                          <RadioGroupItem
                            value="tier1"
                            id="tier1"
                            className="border-blue-500"
                          />
                        </div>
                        <div className="ml-3 text-sm">
                          <Label
                            htmlFor="tier1"
                            className="font-medium text-gray-900 cursor-pointer"
                          >
                            Basic Coverage
                          </Label>
                          <p className="text-gray-500">
                            0.1 ETH payout (
                            {ethToThb !== null
                              ? `${(0.1 * ethToThb).toLocaleString()} THB`
                              : "N/A"}
                            )
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            Recommended for short domestic flights with low risk
                            of delay.
                          </p>
                        </div>
                      </div>
                      <div
                        className={`relative flex items-start p-4 rounded-lg border ${
                          field.value === "tier2"
                            ? "border-blue-500 bg-blue-50"
                            : "border-gray-200"
                        }`}
                      >
                        <div className="flex items-center h-5">
                          <RadioGroupItem
                            value="tier2"
                            id="tier2"
                            className="border-blue-500"
                          />
                        </div>
                        <div className="ml-3 text-sm">
                          <Label
                            htmlFor="tier2"
                            className="font-medium text-gray-900 cursor-pointer"
                          >
                            Standard Coverage
                          </Label>
                          <p className="text-gray-500">
                            0.25 ETH payout (
                            {ethToThb !== null
                              ? `${(0.25 * ethToThb).toLocaleString()} THB`
                              : "N/A"}
                            )
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            Recommended for most flights, balancing cost and
                            coverage.
                          </p>
                        </div>
                      </div>
                      <div
                        className={`relative flex items-start p-4 rounded-lg border ${
                          field.value === "tier3"
                            ? "border-blue-500 bg-blue-50"
                            : "border-gray-200"
                        }`}
                      >
                        <div className="flex items-center h-5">
                          <RadioGroupItem
                            value="tier3"
                            id="tier3"
                            className="border-blue-500"
                          />
                        </div>
                        <div className="ml-3 text-sm">
                          <Label
                            htmlFor="tier3"
                            className="font-medium text-gray-900 cursor-pointer"
                          >
                            Premium Coverage
                          </Label>
                          <p className="text-gray-500">
                            0.5 ETH payout (
                            {ethToThb !== null
                              ? `${(0.5 * ethToThb).toLocaleString()} THB`
                              : "N/A"}
                            )
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            Recommended for international flights or travel
                            during peak seasons with higher delay risk.
                          </p>
                        </div>
                      </div>
                    </RadioGroup>
                  )}
                />
              </div>
              {/* Coverage Amount Slider (read-only, reflects tier) */}
              <div className="mt-6 space-y-4">
                <Label htmlFor="coverageAmount">Coverage Amount</Label>
                <div className="pt-2 px-2">
                  <Slider
                    id="coverageAmount"
                    min={0.1}
                    max={0.5}
                    step={0.05}
                    value={[form.watch("coverageAmount")]}
                    disabled
                    className="opacity-70"
                  />
                </div>
                <div className="flex justify-between text-sm text-gray-500 px-2">
                  <span>0.1 ETH</span>
                  <span>0.5 ETH</span>
                </div>
                <div className="bg-blue-50 p-4 rounded-md border border-blue-200">
                  <div className="flex items-center">
                    <Shield className="h-5 w-5 text-blue-500 mr-3" />
                    <div>
                      <p className="text-sm font-medium text-blue-800">
                        Selected Coverage
                      </p>
                      <p className="text-lg font-semibold text-blue-900">
                        {form.watch("coverageAmount")} ETH
                        <span className="text-sm font-normal text-blue-700 ml-3">
                          {ethToThb !== null && (
                            <>
                              ≈{" "}
                              {(
                                form.watch("coverageAmount") * ethToThb
                              ).toLocaleString()}{" "}
                              THB
                            </>
                          )}
                        </span>
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              {/* Premium display after calculation */}
              {premium.premiumPerPerson !== null &&
                premium.totalPremium !== null && (
                  <div className="bg-green-50 p-4 rounded-md border border-green-200 mt-6">
                    <div className="flex items-center">
                      <Shield className="h-5 w-5 text-green-500 mr-3" />
                      <div>
                        <p className="text-sm font-medium text-green-800">
                          Estimated Premium
                        </p>
                        <p className="text-lg font-semibold text-green-900">
                          {premium.premiumPerPerson} ETH per person
                          <span className="text-sm font-normal text-green-700 ml-3">
                            {ethToThb !== null && (
                              <>
                                ≈{" "}
                                {(
                                  premium.premiumPerPerson * ethToThb
                                ).toLocaleString()}{" "}
                                THB
                              </>
                            )}
                          </span>
                        </p>
                        <p className="text-sm text-green-700">
                          Total: {premium.totalPremium} ETH
                          <span className="ml-3">
                            {ethToThb !== null && (
                              <>
                                ≈{" "}
                                {(
                                  premium.totalPremium * ethToThb
                                ).toLocaleString()}{" "}
                                THB
                              </>
                            )}
                          </span>
                        </p>
                      </div>
                    </div>
                  </div>
                )}
            </div>
          </CardContent>
          <CardFooter className="flex justify-between p-6 pt-0 border-t">
            <Button
              variant="outline"
              type="button"
              onClick={() => localStorage.removeItem("flightPolicyDraft")}
              asChild
            >
              <Link href="/dashboard">
                <X className="mr-2 h-4 w-4" />
                Cancel
              </Link>
            </Button>
            <Button
              type="submit"
              className="bg-[#28A745] hover:bg-[#218838] text-white"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <span className="mr-2">Processing...</span>
                  <svg
                    className="animate-spin h-4 w-4 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                </>
              ) : (
                <>
                  Review Policy
                  <Sparkles className="ml-2 h-4 w-4" />
                </>
              )}
            </Button>
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
}
