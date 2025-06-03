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
  MapPin,
  Calendar,
  Phone,
  Wheat,
  CloudRain,
  Upload,
  TreePine,
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
  phoneNumber: z.string().min(10, "Valid phone number is required"),
  farmLocation: z.string().min(3, "Farm location is required"),
  farmSize: z.string().min(1, "Farm size is required"),
  cropType: z.enum(
    ["RICE", "CORN", "SUGARCANE", "CASSAVA", "FRUIT", "VEGETABLES"],
    {
      required_error: "Crop type is required",
    }
  ),
  plantingDate: z.string().min(1, "Planting date is required"),
  harvestDate: z.string().min(1, "Expected harvest date is required"),
  farmingExperience: z.enum(
    ["BEGINNER", "INTERMEDIATE", "EXPERIENCED", "EXPERT"],
    {
      required_error: "Farming experience is required",
    }
  ),
  irrigationSystem: z.enum(["NONE", "BASIC", "ADVANCED", "AUTOMATED"], {
    required_error: "Irrigation system is required",
  }),
  coverageTier: z.enum(["50000", "100000", "200000"], {
    required_error: "Please select a coverage tier",
  }),
  rainfallThreshold: z.string().min(1, "Rainfall threshold is required"),
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
  "50000": { baseRate: 2500, ethRate: 0.075 },
  "100000": { baseRate: 4800, ethRate: 0.144 },
  "200000": { baseRate: 9200, ethRate: 0.276 },
};

const mockEthRate = 33333; // 1 ETH = 33,333 THB

export function RainfallInsuranceApplicaitionPage({
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
      phoneNumber: "",
      farmLocation: "",
      farmSize: "",
      cropType: "RICE",
      plantingDate: "",
      harvestDate: "",
      farmingExperience: "INTERMEDIATE",
      irrigationSystem: "BASIC",
      coverageTier: "100000",
      rainfallThreshold: "",
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
      sessionStorage.setItem("rainfallPolicyDraft", JSON.stringify(submission));

      setTimeout(() => {
        router.push("/dashboard/insurance/rainfall/apply/review-policy");
      }, 3000);
    } catch (error) {
      console.error("Error submitting rainfall policy:", error);
      alert("Failed to submit policy. Please check your input and try again.");
    }
  };

  return (
    <Card className="w-full container mx-auto mt-10 max-w-3xl">
      <CardHeader>
        <CardTitle className="text-2xl font-bold text-[#212529]">
          Rainfall Insurance Policy
        </CardTitle>
        <CardDescription className="text-[#6B7280]">
          Protect your crops and farming income against rainfall-related risks
          with weather-based insurance coverage.
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

              {/* Farm Information */}
              <div className="space-y-4">
                <h2 className="text-xl font-semibold text-[#212529]">
                  Farm Information
                </h2>
                <p className="text-sm text-gray-600">
                  Provide details about your farming operation for accurate risk
                  assessment.
                </p>

                <FormField
                  control={form.control}
                  name="farmLocation"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-red-500" />
                        Farm Location
                      </FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          placeholder="e.g., Chiang Mai, Pathum Thani, Nakhon Ratchasima"
                          className="focus:ring-2 focus:ring-blue-500"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="farmSize"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Farm Size (Rai)</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          placeholder="e.g., 10"
                          type="number"
                          min="0.1"
                          step="0.1"
                          className="focus:ring-2 focus:ring-blue-500"
                        />
                      </FormControl>
                      <p className="text-xs text-gray-500">
                        Enter your farm size in Thai Rai (1 Rai = 1,600 sq
                        meters)
                      </p>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="cropType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-base font-medium">
                        Primary Crop Type
                      </FormLabel>
                      <FormControl>
                        <RadioGroup
                          value={field.value}
                          onValueChange={field.onChange}
                          className="space-y-3"
                        >
                          <div
                            className={`relative flex items-start p-4 rounded-lg border ${
                              field.value === "RICE"
                                ? "border-green-500 bg-green-50"
                                : "border-gray-200"
                            }`}
                          >
                            <div className="flex items-center h-5">
                              <RadioGroupItem
                                value="RICE"
                                id="rice"
                                className="border-green-500"
                              />
                            </div>
                            <div className="ml-3 text-sm">
                              <Label
                                htmlFor="rice"
                                className="font-medium text-gray-900 cursor-pointer"
                              >
                                Rice
                              </Label>
                              <p className="text-xs text-gray-500 mt-1">
                                Water-dependent crop, high rainfall sensitivity
                              </p>
                            </div>
                          </div>
                          <div
                            className={`relative flex items-start p-4 rounded-lg border ${
                              field.value === "CORN"
                                ? "border-yellow-500 bg-yellow-50"
                                : "border-gray-200"
                            }`}
                          >
                            <div className="flex items-center h-5">
                              <RadioGroupItem
                                value="CORN"
                                id="corn"
                                className="border-yellow-500"
                              />
                            </div>
                            <div className="ml-3 text-sm">
                              <Label
                                htmlFor="corn"
                                className="font-medium text-gray-900 cursor-pointer"
                              >
                                Corn
                              </Label>
                              <p className="text-xs text-gray-500 mt-1">
                                Moderate rainfall sensitivity, drought
                                vulnerable
                              </p>
                            </div>
                          </div>
                          <div
                            className={`relative flex items-start p-4 rounded-lg border ${
                              field.value === "SUGARCANE"
                                ? "border-purple-500 bg-purple-50"
                                : "border-gray-200"
                            }`}
                          >
                            <div className="flex items-center h-5">
                              <RadioGroupItem
                                value="SUGARCANE"
                                id="sugarcane"
                                className="border-purple-500"
                              />
                            </div>
                            <div className="ml-3 text-sm">
                              <Label
                                htmlFor="sugarcane"
                                className="font-medium text-gray-900 cursor-pointer"
                              >
                                Sugarcane
                              </Label>
                              <p className="text-xs text-gray-500 mt-1">
                                Long-term crop, sensitive to prolonged drought
                              </p>
                            </div>
                          </div>
                          <div
                            className={`relative flex items-start p-4 rounded-lg border ${
                              field.value === "CASSAVA"
                                ? "border-orange-500 bg-orange-50"
                                : "border-gray-200"
                            }`}
                          >
                            <div className="flex items-center h-5">
                              <RadioGroupItem
                                value="CASSAVA"
                                id="cassava"
                                className="border-orange-500"
                              />
                            </div>
                            <div className="ml-3 text-sm">
                              <Label
                                htmlFor="cassava"
                                className="font-medium text-gray-900 cursor-pointer"
                              >
                                Cassava
                              </Label>
                              <p className="text-xs text-gray-500 mt-1">
                                Drought-resistant but sensitive to excessive
                                rainfall
                              </p>
                            </div>
                          </div>
                          <div
                            className={`relative flex items-start p-4 rounded-lg border ${
                              field.value === "FRUIT"
                                ? "border-pink-500 bg-pink-50"
                                : "border-gray-200"
                            }`}
                          >
                            <div className="flex items-center h-5">
                              <RadioGroupItem
                                value="FRUIT"
                                id="fruit"
                                className="border-pink-500"
                              />
                            </div>
                            <div className="ml-3 text-sm">
                              <Label
                                htmlFor="fruit"
                                className="font-medium text-gray-900 cursor-pointer"
                              >
                                Fruits
                              </Label>
                              <p className="text-xs text-gray-500 mt-1">
                                Various fruits, rainfall affects quality and
                                yield
                              </p>
                            </div>
                          </div>
                          <div
                            className={`relative flex items-start p-4 rounded-lg border ${
                              field.value === "VEGETABLES"
                                ? "border-emerald-500 bg-emerald-50"
                                : "border-gray-200"
                            }`}
                          >
                            <div className="flex items-center h-5">
                              <RadioGroupItem
                                value="VEGETABLES"
                                id="vegetables"
                                className="border-emerald-500"
                              />
                            </div>
                            <div className="ml-3 text-sm">
                              <Label
                                htmlFor="vegetables"
                                className="font-medium text-gray-900 cursor-pointer"
                              >
                                Vegetables
                              </Label>
                              <p className="text-xs text-gray-500 mt-1">
                                Short-cycle crops, highly sensitive to weather
                                changes
                              </p>
                            </div>
                          </div>
                        </RadioGroup>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="plantingDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-blue-500" />
                          Planting Date
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
                    name="harvestDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-2">
                          <Wheat className="h-4 w-4 text-amber-500" />
                          Expected Harvest Date
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
                </div>
              </div>

              {/* Farming Experience & Infrastructure */}
              <div className="space-y-4">
                <h2 className="text-xl font-semibold text-[#212529]">
                  Farming Experience & Infrastructure
                </h2>
                <p className="text-sm text-gray-600">
                  Your farming experience and infrastructure help us assess risk
                  and determine appropriate coverage.
                </p>

                <FormField
                  control={form.control}
                  name="farmingExperience"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-base font-medium">
                        Farming Experience Level
                      </FormLabel>
                      <FormControl>
                        <RadioGroup
                          value={field.value}
                          onValueChange={field.onChange}
                          className="space-y-3"
                        >
                          <div
                            className={`relative flex items-start p-4 rounded-lg border ${
                              field.value === "BEGINNER"
                                ? "border-red-500 bg-red-50"
                                : "border-gray-200"
                            }`}
                          >
                            <div className="flex items-center h-5">
                              <RadioGroupItem
                                value="BEGINNER"
                                id="beginner"
                                className="border-red-500"
                              />
                            </div>
                            <div className="ml-3 text-sm">
                              <Label
                                htmlFor="beginner"
                                className="font-medium text-gray-900 cursor-pointer"
                              >
                                Beginner (0-2 years)
                              </Label>
                              <p className="text-xs text-gray-500 mt-1">
                                New to farming, learning the basics
                              </p>
                            </div>
                          </div>
                          <div
                            className={`relative flex items-start p-4 rounded-lg border ${
                              field.value === "INTERMEDIATE"
                                ? "border-yellow-500 bg-yellow-50"
                                : "border-gray-200"
                            }`}
                          >
                            <div className="flex items-center h-5">
                              <RadioGroupItem
                                value="INTERMEDIATE"
                                id="intermediate"
                                className="border-yellow-500"
                              />
                            </div>
                            <div className="ml-3 text-sm">
                              <Label
                                htmlFor="intermediate"
                                className="font-medium text-gray-900 cursor-pointer"
                              >
                                Intermediate (3-7 years)
                              </Label>
                              <p className="text-xs text-gray-500 mt-1">
                                Some experience with crop management
                              </p>
                            </div>
                          </div>
                          <div
                            className={`relative flex items-start p-4 rounded-lg border ${
                              field.value === "EXPERIENCED"
                                ? "border-blue-500 bg-blue-50"
                                : "border-gray-200"
                            }`}
                          >
                            <div className="flex items-center h-5">
                              <RadioGroupItem
                                value="EXPERIENCED"
                                id="experienced"
                                className="border-blue-500"
                              />
                            </div>
                            <div className="ml-3 text-sm">
                              <Label
                                htmlFor="experienced"
                                className="font-medium text-gray-900 cursor-pointer"
                              >
                                Experienced (8-15 years)
                              </Label>
                              <p className="text-xs text-gray-500 mt-1">
                                Well-versed in farming techniques and risk
                                management
                              </p>
                            </div>
                          </div>
                          <div
                            className={`relative flex items-start p-4 rounded-lg border ${
                              field.value === "EXPERT"
                                ? "border-green-500 bg-green-50"
                                : "border-gray-200"
                            }`}
                          >
                            <div className="flex items-center h-5">
                              <RadioGroupItem
                                value="EXPERT"
                                id="expert"
                                className="border-green-500"
                              />
                            </div>
                            <div className="ml-3 text-sm">
                              <Label
                                htmlFor="expert"
                                className="font-medium text-gray-900 cursor-pointer"
                              >
                                Expert (15+ years)
                              </Label>
                              <p className="text-xs text-gray-500 mt-1">
                                Extensive experience with advanced farming
                                methods
                              </p>
                            </div>
                          </div>
                        </RadioGroup>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="irrigationSystem"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-base font-medium">
                        Irrigation System
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
                                id="no-irrigation"
                                className="border-red-500"
                              />
                            </div>
                            <div className="ml-3 text-sm">
                              <Label
                                htmlFor="no-irrigation"
                                className="font-medium text-gray-900 cursor-pointer"
                              >
                                No Irrigation System
                              </Label>
                              <p className="text-xs text-gray-500 mt-1">
                                Completely dependent on rainfall
                              </p>
                            </div>
                          </div>
                          <div
                            className={`relative flex items-start p-4 rounded-lg border ${
                              field.value === "BASIC"
                                ? "border-orange-500 bg-orange-50"
                                : "border-gray-200"
                            }`}
                          >
                            <div className="flex items-center h-5">
                              <RadioGroupItem
                                value="BASIC"
                                id="basic-irrigation"
                                className="border-orange-500"
                              />
                            </div>
                            <div className="ml-3 text-sm">
                              <Label
                                htmlFor="basic-irrigation"
                                className="font-medium text-gray-900 cursor-pointer"
                              >
                                Basic Irrigation
                              </Label>
                              <p className="text-xs text-gray-500 mt-1">
                                Simple water channels or manual watering
                              </p>
                            </div>
                          </div>
                          <div
                            className={`relative flex items-start p-4 rounded-lg border ${
                              field.value === "ADVANCED"
                                ? "border-blue-500 bg-blue-50"
                                : "border-gray-200"
                            }`}
                          >
                            <div className="flex items-center h-5">
                              <RadioGroupItem
                                value="ADVANCED"
                                id="advanced-irrigation"
                                className="border-blue-500"
                              />
                            </div>
                            <div className="ml-3 text-sm">
                              <Label
                                htmlFor="advanced-irrigation"
                                className="font-medium text-gray-900 cursor-pointer"
                              >
                                Advanced Irrigation
                              </Label>
                              <p className="text-xs text-gray-500 mt-1">
                                Sprinkler or drip irrigation systems
                              </p>
                            </div>
                          </div>
                          <div
                            className={`relative flex items-start p-4 rounded-lg border ${
                              field.value === "AUTOMATED"
                                ? "border-green-500 bg-green-50"
                                : "border-gray-200"
                            }`}
                          >
                            <div className="flex items-center h-5">
                              <RadioGroupItem
                                value="AUTOMATED"
                                id="automated-irrigation"
                                className="border-green-500"
                              />
                            </div>
                            <div className="ml-3 text-sm">
                              <Label
                                htmlFor="automated-irrigation"
                                className="font-medium text-gray-900 cursor-pointer"
                              >
                                Automated System
                              </Label>
                              <p className="text-xs text-gray-500 mt-1">
                                Smart irrigation with sensors and automation
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
                  Select your desired rainfall insurance coverage amount to
                  protect against weather-related crop losses.
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
                              field.value === "50000"
                                ? "border-blue-500 bg-blue-50"
                                : "border-gray-200"
                            }`}
                          >
                            <div className="flex items-center h-5">
                              <RadioGroupItem
                                value="50000"
                                id="50000"
                                className="border-blue-500"
                              />
                            </div>
                            <div className="ml-3 text-sm">
                              <Label
                                htmlFor="50000"
                                className="font-medium text-gray-900 cursor-pointer"
                              >
                                Basic Weather Coverage
                              </Label>
                              <p className="text-gray-500">
                                50,000 THB maximum payout
                              </p>
                              <p className="text-xs text-gray-500 mt-1">
                                Essential protection for small farms and basic
                                crop loss coverage.
                              </p>
                            </div>
                          </div>
                          <div
                            className={`relative flex items-start p-4 rounded-lg border ${
                              field.value === "100000"
                                ? "border-blue-500 bg-blue-50"
                                : "border-gray-200"
                            }`}
                          >
                            <div className="flex items-center h-5">
                              <RadioGroupItem
                                value="100000"
                                id="100000"
                                className="border-blue-500"
                              />
                            </div>
                            <div className="ml-3 text-sm">
                              <Label
                                htmlFor="100000"
                                className="font-medium text-gray-900 cursor-pointer"
                              >
                                Standard Weather Coverage
                              </Label>
                              <p className="text-gray-500">
                                100,000 THB maximum payout
                              </p>
                              <p className="text-xs text-gray-500 mt-1">
                                Comprehensive protection for medium-sized farms
                                and income replacement.
                              </p>
                            </div>
                          </div>
                          <div
                            className={`relative flex items-start p-4 rounded-lg border ${
                              field.value === "200000"
                                ? "border-blue-500 bg-blue-50"
                                : "border-gray-200"
                            }`}
                          >
                            <div className="flex items-center h-5">
                              <RadioGroupItem
                                value="200000"
                                id="200000"
                                className="border-blue-500"
                              />
                            </div>
                            <div className="ml-3 text-sm">
                              <Label
                                htmlFor="200000"
                                className="font-medium text-gray-900 cursor-pointer"
                              >
                                Premium Weather Coverage
                              </Label>
                              <p className="text-gray-500">
                                200,000 THB maximum payout
                              </p>
                              <p className="text-xs text-gray-500 mt-1">
                                Maximum protection for large farms and
                                commercial agricultural operations.
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

              {/* Weather Parameters */}
              <div className="space-y-4">
                <h2 className="text-xl font-semibold text-[#212529]">
                  Weather Parameters
                </h2>
                <p className="text-sm text-gray-600">
                  Set the rainfall threshold that will trigger insurance payouts
                  for your crops.
                </p>

                <FormField
                  control={form.control}
                  name="rainfallThreshold"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <CloudRain className="h-4 w-4 text-blue-500" />
                        Rainfall Threshold (mm per month)
                      </FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          placeholder="e.g., 50 (below this triggers payout)"
                          type="number"
                          min="0"
                          className="focus:ring-2 focus:ring-blue-500"
                        />
                      </FormControl>
                      <p className="text-xs text-gray-500">
                        Insurance payouts trigger when monthly rainfall falls
                        below this threshold
                      </p>
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

              {/* Documentation */}
              <div className="space-y-4">
                <h2 className="text-xl font-semibold text-[#212529]">
                  Supporting Documentation
                </h2>
                <p className="text-sm text-gray-600">
                  Upload land ownership documents, crop certificates, or other
                  farming-related files.
                </p>
                <FormField
                  control={form.control}
                  name="fileUpload"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <Upload className="h-4 w-4 text-blue-500" />
                        Upload Farm Documentation
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
              onClick={() => sessionStorage.removeItem("rainfallPolicyDraft")}
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
