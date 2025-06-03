"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Shield,
  X,
  Sparkles,
  User,
  File as FileIcon,
  Activity,
  Heart,
  Users,
  Upload,
  Calendar,
  Phone,
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
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

// Zod schema for validation
const formSchema = z.object({
  user_address: z.string().min(1, "User address is required"),
  fullName: z.string().min(2, "Full name is required"),
  dateOfBirth: z.string().min(1, "Date of birth is required"),
  phoneNumber: z.string().min(10, "Valid phone number is required"),
  occupation: z.string().min(1, "Occupation is required"),
  annualIncome: z.string().min(1, "Annual income is required"),
  preExistingConditions: z.string().optional(),
  smokingStatus: z.enum(["NEVER", "FORMER", "CURRENT"], {
    required_error: "Smoking status is required",
  }),
  alcoholConsumption: z.enum(["NONE", "LIGHT", "MODERATE", "HEAVY"], {
    required_error: "Alcohol consumption is required",
  }),
  exerciseFrequency: z.enum(["NONE", "LIGHT", "MODERATE", "HEAVY"], {
    required_error: "Exercise frequency is required",
  }),
  coverageTier: z.enum(["500000", "1000000", "2000000"], {
    required_error: "Please select a coverage tier",
  }),
  beneficiaryName: z.string().min(2, "Beneficiary name is required"),
  beneficiaryRelation: z.string().min(1, "Beneficiary relation is required"),
  fileUpload: z
    .instanceof(File)
    .refine(
      (file) =>
        file.type === "application/pdf" ||
        file.type === "image/png" ||
        file.type === "image/jpeg" ||
        file.type === "image/jpg",
      "Only PDF or PNG files are allowed"
    ),
});

type FormValues = z.infer<typeof formSchema>;

// Mock data for premium calculation
const mockPremiumRates = {
  "500000": { baseRate: 15000, ethRate: 0.45 },
  "1000000": { baseRate: 28000, ethRate: 0.84 },
  "2000000": { baseRate: 52000, ethRate: 1.56 },
};

const mockEthRate = 33333; // 1 ETH = 33,333 THB

export function LifeInsuranceApplicationPage({
  walletAddress,
}: {
  walletAddress: string;
}) {
  const router = useRouter();

  const [premium, setPremium] = useState<number | null>(null);
  const [premiumEth, setPremiumEth] = useState<string | null>(null);
  const [bahtToEthRate] = useState<number>(mockEthRate);
  const [calculating, setCalculating] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      user_address: walletAddress,
      fullName: "",
      dateOfBirth: "",
      phoneNumber: "",
      occupation: "",
      annualIncome: "",
      preExistingConditions: "",
      smokingStatus: "NEVER",
      alcoholConsumption: "LIGHT",
      exerciseFrequency: "MODERATE",
      coverageTier: "1000000",
      beneficiaryName: "",
      beneficiaryRelation: "",
      fileUpload: undefined,
    },
  });

  const isSubmitting = form.formState.isSubmitting;

  // Calculate premium when coverageTier changes
  useEffect(() => {
    const calculatePremium = async () => {
      setCalculating(true);
      try {
        const coverageTier = form.watch("coverageTier");
        if (!coverageTier) {
          setPremium(null);
          setPremiumEth(null);
          setCalculating(false);
          return;
        }

        // Simulate API delay
        await new Promise((resolve) => setTimeout(resolve, 500));

        const rates =
          mockPremiumRates[coverageTier as keyof typeof mockPremiumRates];
        const calculatedPremium = rates.baseRate;
        const calculatedPremiumEth = rates.ethRate;

        setPremium(calculatedPremium);
        setPremiumEth(calculatedPremiumEth.toString());
      } catch (error) {
        setPremium(null);
        setPremiumEth(null);
      } finally {
        setCalculating(false);
      }
    };

    calculatePremium();
  }, [form.watch("coverageTier")]);

  const onSubmit = async (data: FormValues) => {
    try {
      let fileUploadBase64: string | undefined = undefined;
      if (data.fileUpload) {
        const reader = new FileReader();
        const file = data.fileUpload;

        // Convert file to Base64
        fileUploadBase64 = await new Promise<string>((resolve, reject) => {
          reader.onload = () => resolve(reader.result as string);
          reader.onerror = () => reject("Failed to read file");
          reader.readAsDataURL(file);
        });
      }

      const submission = {
        ...data,
        fileUpload: fileUploadBase64,
        sumAssured: parseInt(data.coverageTier),
        premium,
        premiumEth: Number(premiumEth),
        sumAssuredEth: parseInt(data.coverageTier) / bahtToEthRate,
      };

      // Store the submission object in sessionStorage
      sessionStorage.setItem("lifePolicyDraft", JSON.stringify(submission));

      setTimeout(() => {
        router.push("/dashboard/insurance/life/apply/review-policy");
      }, 3000);
    } catch (error) {
      console.error("Error submitting life policy:", error);
      alert("Failed to submit policy. Please check your input and try again.");
    }
  };

  return (
    <Card className="w-full container mx-auto mt-10 max-w-3xl">
      <CardHeader>
        <CardTitle className="text-2xl font-bold text-[#212529]">
          Life Insurance Policy
        </CardTitle>
        <CardDescription className="text-[#6B7280]">
          Secure your family's financial future with comprehensive life
          insurance coverage.
        </CardDescription>
      </CardHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <CardContent className="p-6">
            <div className="space-y-8">
              {/* Personal Information */}
              <div className="space-y-4">
                <h2 className="text-xl font-semibold text-[#212529]">
                  Personal Information
                </h2>
                <p className="text-sm text-gray-600">
                  Please provide your personal details for policy
                  identification.
                </p>

                <FormField
                  control={form.control}
                  name="user_address"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Wallet Address</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input
                            {...field}
                            disabled
                            className="pl-10 bg-gray-50"
                          />
                          <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="fullName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Full Name</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          placeholder="Enter your full legal name"
                          className="focus:ring-2 focus:ring-blue-500"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="dateOfBirth"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-blue-500" />
                        Date of Birth
                      </FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          type="date"
                          className="focus:ring-2 focus:ring-blue-500"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="phoneNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <Phone className="h-4 w-4 text-green-500" />
                        Phone Number
                      </FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          placeholder="e.g., +66 12 345 6789"
                          className="focus:ring-2 focus:ring-blue-500"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Employment Information */}
              <div className="space-y-4">
                <h2 className="text-xl font-semibold text-[#212529]">
                  Employment Information
                </h2>
                <p className="text-sm text-gray-600">
                  Your employment details help us assess risk and determine
                  appropriate coverage.
                </p>

                <FormField
                  control={form.control}
                  name="occupation"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Occupation</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          placeholder="e.g., Software Engineer, Teacher, Doctor"
                          className="focus:ring-2 focus:ring-blue-500"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="annualIncome"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Annual Income (THB)</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          placeholder="e.g., 600000"
                          type="number"
                          className="focus:ring-2 focus:ring-blue-500"
                        />
                      </FormControl>
                      <p className="text-xs text-gray-500">
                        Your annual gross income in Thai Baht
                      </p>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Health Information */}
              <div className="space-y-4">
                <h2 className="text-xl font-semibold text-[#212529]">
                  Health Information
                </h2>
                <p className="text-sm text-gray-600">
                  Please provide accurate health information for proper risk
                  assessment.
                </p>

                <FormField
                  control={form.control}
                  name="preExistingConditions"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <Heart className="h-4 w-4 text-red-500" />
                        Pre-existing Medical Conditions
                      </FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          placeholder="e.g., Diabetes, Heart Disease (optional)"
                          className="focus:ring-2 focus:ring-blue-500"
                        />
                      </FormControl>
                      <p className="text-xs text-gray-500">
                        List any chronic conditions or ongoing medical
                        treatments
                      </p>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Lifestyle Information */}
              <div className="space-y-4">
                <h2 className="text-xl font-semibold text-[#212529]">
                  Lifestyle Information
                </h2>
                <p className="text-sm text-gray-600">
                  Your lifestyle choices help us assess health risks for life
                  insurance coverage.
                </p>

                {/* Smoking Status */}
                <FormField
                  control={form.control}
                  name="smokingStatus"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-base font-medium">
                        Smoking Status
                      </FormLabel>
                      <FormControl>
                        <RadioGroup
                          value={field.value}
                          onValueChange={field.onChange}
                          className="space-y-3"
                        >
                          <div
                            className={`relative flex items-start p-4 rounded-lg border ${
                              field.value === "NEVER"
                                ? "border-green-500 bg-green-50"
                                : "border-gray-200"
                            }`}
                          >
                            <div className="flex items-center h-5">
                              <RadioGroupItem
                                value="NEVER"
                                id="never-smoke"
                                className="border-green-500"
                              />
                            </div>
                            <div className="ml-3 text-sm">
                              <Label
                                htmlFor="never-smoke"
                                className="font-medium text-gray-900 cursor-pointer"
                              >
                                Never Smoked
                              </Label>
                              <p className="text-xs text-gray-500 mt-1">
                                Lower risk premium rates
                              </p>
                            </div>
                          </div>
                          <div
                            className={`relative flex items-start p-4 rounded-lg border ${
                              field.value === "FORMER"
                                ? "border-yellow-500 bg-yellow-50"
                                : "border-gray-200"
                            }`}
                          >
                            <div className="flex items-center h-5">
                              <RadioGroupItem
                                value="FORMER"
                                id="former-smoke"
                                className="border-yellow-500"
                              />
                            </div>
                            <div className="ml-3 text-sm">
                              <Label
                                htmlFor="former-smoke"
                                className="font-medium text-gray-900 cursor-pointer"
                              >
                                Former Smoker
                              </Label>
                              <p className="text-xs text-gray-500 mt-1">
                                Moderate risk assessment
                              </p>
                            </div>
                          </div>
                          <div
                            className={`relative flex items-start p-4 rounded-lg border ${
                              field.value === "CURRENT"
                                ? "border-red-500 bg-red-50"
                                : "border-gray-200"
                            }`}
                          >
                            <div className="flex items-center h-5">
                              <RadioGroupItem
                                value="CURRENT"
                                id="current-smoke"
                                className="border-red-500"
                              />
                            </div>
                            <div className="ml-3 text-sm">
                              <Label
                                htmlFor="current-smoke"
                                className="font-medium text-gray-900 cursor-pointer"
                              >
                                Current Smoker
                              </Label>
                              <p className="text-xs text-gray-500 mt-1">
                                Higher risk may affect premium rates
                              </p>
                            </div>
                          </div>
                        </RadioGroup>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Alcohol Consumption */}
                <FormField
                  control={form.control}
                  name="alcoholConsumption"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-base font-medium">
                        Alcohol Consumption
                      </FormLabel>
                      <FormControl>
                        <RadioGroup
                          value={field.value}
                          onValueChange={field.onChange}
                          className="space-y-3"
                        >
                          <div
                            className={`relative flex items-start p-4 rounded-lg border ${
                              field.value === "NONE"
                                ? "border-green-500 bg-green-50"
                                : "border-gray-200"
                            }`}
                          >
                            <div className="flex items-center h-5">
                              <RadioGroupItem
                                value="NONE"
                                id="no-alcohol"
                                className="border-green-500"
                              />
                            </div>
                            <div className="ml-3 text-sm">
                              <Label
                                htmlFor="no-alcohol"
                                className="font-medium text-gray-900 cursor-pointer"
                              >
                                None
                              </Label>
                              <p className="text-xs text-gray-500 mt-1">
                                No alcohol consumption
                              </p>
                            </div>
                          </div>
                          <div
                            className={`relative flex items-start p-4 rounded-lg border ${
                              field.value === "LIGHT"
                                ? "border-blue-500 bg-blue-50"
                                : "border-gray-200"
                            }`}
                          >
                            <div className="flex items-center h-5">
                              <RadioGroupItem
                                value="LIGHT"
                                id="light-alcohol"
                                className="border-blue-500"
                              />
                            </div>
                            <div className="ml-3 text-sm">
                              <Label
                                htmlFor="light-alcohol"
                                className="font-medium text-gray-900 cursor-pointer"
                              >
                                Light
                              </Label>
                              <p className="text-xs text-gray-500 mt-1">
                                Occasional social drinking
                              </p>
                            </div>
                          </div>
                          <div
                            className={`relative flex items-start p-4 rounded-lg border ${
                              field.value === "MODERATE"
                                ? "border-yellow-500 bg-yellow-50"
                                : "border-gray-200"
                            }`}
                          >
                            <div className="flex items-center h-5">
                              <RadioGroupItem
                                value="MODERATE"
                                id="moderate-alcohol"
                                className="border-yellow-500"
                              />
                            </div>
                            <div className="ml-3 text-sm">
                              <Label
                                htmlFor="moderate-alcohol"
                                className="font-medium text-gray-900 cursor-pointer"
                              >
                                Moderate
                              </Label>
                              <p className="text-xs text-gray-500 mt-1">
                                Regular but controlled consumption
                              </p>
                            </div>
                          </div>
                          <div
                            className={`relative flex items-start p-4 rounded-lg border ${
                              field.value === "HEAVY"
                                ? "border-red-500 bg-red-50"
                                : "border-gray-200"
                            }`}
                          >
                            <div className="flex items-center h-5">
                              <RadioGroupItem
                                value="HEAVY"
                                id="heavy-alcohol"
                                className="border-red-500"
                              />
                            </div>
                            <div className="ml-3 text-sm">
                              <Label
                                htmlFor="heavy-alcohol"
                                className="font-medium text-gray-900 cursor-pointer"
                              >
                                Heavy
                              </Label>
                              <p className="text-xs text-gray-500 mt-1">
                                Frequent consumption that may affect health
                              </p>
                            </div>
                          </div>
                        </RadioGroup>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Exercise Frequency */}
                <FormField
                  control={form.control}
                  name="exerciseFrequency"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-base font-medium">
                        Exercise Frequency
                      </FormLabel>
                      <FormControl>
                        <RadioGroup
                          value={field.value}
                          onValueChange={field.onChange}
                          className="space-y-3"
                        >
                          <div
                            className={`relative flex items-start p-4 rounded-lg border ${
                              field.value === "NONE"
                                ? "border-red-500 bg-red-50"
                                : "border-gray-200"
                            }`}
                          >
                            <div className="flex items-center h-5">
                              <RadioGroupItem
                                value="NONE"
                                id="no-exercise"
                                className="border-red-500"
                              />
                            </div>
                            <div className="ml-3 text-sm">
                              <Label
                                htmlFor="no-exercise"
                                className="font-medium text-gray-900 cursor-pointer"
                              >
                                None
                              </Label>
                              <p className="text-xs text-gray-500 mt-1">
                                No regular exercise routine
                              </p>
                            </div>
                          </div>
                          <div
                            className={`relative flex items-start p-4 rounded-lg border ${
                              field.value === "LIGHT"
                                ? "border-orange-500 bg-orange-50"
                                : "border-gray-200"
                            }`}
                          >
                            <div className="flex items-center h-5">
                              <RadioGroupItem
                                value="LIGHT"
                                id="light-exercise"
                                className="border-orange-500"
                              />
                            </div>
                            <div className="ml-3 text-sm">
                              <Label
                                htmlFor="light-exercise"
                                className="font-medium text-gray-900 cursor-pointer"
                              >
                                Light
                              </Label>
                              <p className="text-xs text-gray-500 mt-1">
                                Light exercise 1-2 times per week
                              </p>
                            </div>
                          </div>
                          <div
                            className={`relative flex items-start p-4 rounded-lg border ${
                              field.value === "MODERATE"
                                ? "border-blue-500 bg-blue-50"
                                : "border-gray-200"
                            }`}
                          >
                            <div className="flex items-center h-5">
                              <RadioGroupItem
                                value="MODERATE"
                                id="moderate-exercise"
                                className="border-blue-500"
                              />
                            </div>
                            <div className="ml-3 text-sm">
                              <Label
                                htmlFor="moderate-exercise"
                                className="font-medium text-gray-900 cursor-pointer"
                              >
                                Moderate
                              </Label>
                              <p className="text-xs text-gray-500 mt-1">
                                Regular exercise 3-4 times per week
                              </p>
                            </div>
                          </div>
                          <div
                            className={`relative flex items-start p-4 rounded-lg border ${
                              field.value === "HEAVY"
                                ? "border-green-500 bg-green-50"
                                : "border-gray-200"
                            }`}
                          >
                            <div className="flex items-center h-5">
                              <RadioGroupItem
                                value="HEAVY"
                                id="heavy-exercise"
                                className="border-green-500"
                              />
                            </div>
                            <div className="ml-3 text-sm">
                              <Label
                                htmlFor="heavy-exercise"
                                className="font-medium text-gray-900 cursor-pointer"
                              >
                                Heavy
                              </Label>
                              <p className="text-xs text-gray-500 mt-1">
                                Intensive exercise 5+ times per week
                              </p>
                            </div>
                          </div>
                        </RadioGroup>
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
                  Select your desired life insurance coverage amount. This will
                  be paid to your beneficiaries.
                </p>
                <FormField
                  control={form.control}
                  name="coverageTier"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <RadioGroup
                          value={field.value}
                          onValueChange={field.onChange}
                          className="space-y-3"
                        >
                          <div
                            className={`relative flex items-start p-4 rounded-lg border ${
                              field.value === "500000"
                                ? "border-blue-500 bg-blue-50"
                                : "border-gray-200"
                            }`}
                          >
                            <div className="flex items-center h-5">
                              <RadioGroupItem
                                value="500000"
                                id="500000"
                                className="border-blue-500"
                              />
                            </div>
                            <div className="ml-3 text-sm">
                              <Label
                                htmlFor="500000"
                                className="font-medium text-gray-900 cursor-pointer"
                              >
                                Basic Life Coverage
                              </Label>
                              <p className="text-gray-500">
                                500,000 THB death benefit
                              </p>
                              <p className="text-xs text-gray-500 mt-1">
                                Essential protection for basic family needs and
                                final expenses.
                              </p>
                            </div>
                          </div>
                          <div
                            className={`relative flex items-start p-4 rounded-lg border ${
                              field.value === "1000000"
                                ? "border-blue-500 bg-blue-50"
                                : "border-gray-200"
                            }`}
                          >
                            <div className="flex items-center h-5">
                              <RadioGroupItem
                                value="1000000"
                                id="1000000"
                                className="border-blue-500"
                              />
                            </div>
                            <div className="ml-3 text-sm">
                              <Label
                                htmlFor="1000000"
                                className="font-medium text-gray-900 cursor-pointer"
                              >
                                Standard Life Coverage
                              </Label>
                              <p className="text-gray-500">
                                1,000,000 THB death benefit
                              </p>
                              <p className="text-xs text-gray-500 mt-1">
                                Comprehensive protection for family income
                                replacement and debt coverage.
                              </p>
                            </div>
                          </div>
                          <div
                            className={`relative flex items-start p-4 rounded-lg border ${
                              field.value === "2000000"
                                ? "border-blue-500 bg-blue-50"
                                : "border-gray-200"
                            }`}
                          >
                            <div className="flex items-center h-5">
                              <RadioGroupItem
                                value="2000000"
                                id="2000000"
                                className="border-blue-500"
                              />
                            </div>
                            <div className="ml-3 text-sm">
                              <Label
                                htmlFor="2000000"
                                className="font-medium text-gray-900 cursor-pointer"
                              >
                                Premium Life Coverage
                              </Label>
                              <p className="text-gray-500">
                                2,000,000 THB death benefit
                              </p>
                              <p className="text-xs text-gray-500 mt-1">
                                Maximum protection for estate planning and
                                long-term family security.
                              </p>
                            </div>
                          </div>
                        </RadioGroup>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Coverage Summary */}
              <div className="bg-blue-50 p-4 rounded-md border border-blue-200">
                <div className="flex items-center">
                  <Shield className="h-5 w-5 text-blue-500 mr-3" />
                  <div>
                    <p className="text-sm font-medium text-blue-800">
                      Selected Coverage
                    </p>
                    <p className="text-lg font-semibold text-blue-900">
                      {form.watch("coverageTier")
                        ? `${parseInt(form.watch("coverageTier")).toLocaleString()} THB`
                        : "Please select a coverage tier"}
                    </p>
                    <p className="text-sm text-blue-700 mt-1">
                      {calculating
                        ? "Calculating premium..."
                        : typeof premium === "number"
                          ? `Annual Premium: ${premium.toLocaleString()} THB (${premiumEth} ETH)`
                          : "Premium will be calculated automatically"}
                    </p>
                  </div>
                </div>
              </div>

              {/* Beneficiary Information */}
              <div className="space-y-4">
                <h2 className="text-xl font-semibold text-[#212529]">
                  Beneficiary Information
                </h2>
                <p className="text-sm text-gray-600">
                  Designate who will receive the death benefit from your life
                  insurance policy.
                </p>

                <FormField
                  control={form.control}
                  name="beneficiaryName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <Users className="h-4 w-4 text-purple-500" />
                        Beneficiary Full Name
                      </FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          placeholder="Enter beneficiary's full legal name"
                          className="focus:ring-2 focus:ring-blue-500"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="beneficiaryRelation"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Relationship to Beneficiary</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          placeholder="e.g., Spouse, Child, Parent, Sibling"
                          className="focus:ring-2 focus:ring-blue-500"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Documentation */}
              <div className="space-y-4">
                <h2 className="text-xl font-semibold text-[#212529]">
                  Supporting Documentation
                </h2>
                <p className="text-sm text-gray-600">
                  Upload medical records, identity documents, or other
                  supporting files.
                </p>
                <FormField
                  control={form.control}
                  name="fileUpload"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <Upload className="h-4 w-4 text-blue-500" />
                        Upload Supporting Documents
                      </FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input
                            type="file"
                            accept=".pdf,.png,.jpg,.jpeg"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              field.onChange(file || undefined);
                            }}
                            className="pl-10 cursor-pointer focus:ring-2 focus:ring-blue-500 text-center file:mr-4 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                          />
                          <FileIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                        </div>
                      </FormControl>
                      <p className="text-xs text-gray-500">
                        Accepted formats: PDF, PNG, JPG, JPEG. Max file size:
                        10MB
                      </p>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex justify-between p-6 pt-0 border-t">
            <Button
              variant="outline"
              type="button"
              onClick={() => sessionStorage.removeItem("lifePolicyDraft")}
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
