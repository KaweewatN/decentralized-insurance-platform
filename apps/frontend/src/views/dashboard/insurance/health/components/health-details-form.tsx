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
import axios from "axios";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

// Zod schema for validation
const formSchema = z.object({
  user_address: z.string().min(1, "User address is required"),
  preExistingConditions: z.string().optional(),
  bmi: z
    .string()
    .regex(/^\d+(\.\d{1,2})?$/, "BMI must be a valid decimal number")
    .optional(),
  smokingStatus: z.enum(["NEVER", "FORMER", "CURRENT"], {
    required_error: "Smoking status is required",
  }),
  exerciseFrequency: z.enum(["NONE", "LIGHT", "MODERATE", "HEAVY"], {
    required_error: "Exercise frequency is required",
  }),
  coverageTier: z.enum(["100000", "200000", "300000"], {
    required_error: "Please select a coverage tier",
  }),
  expectedNumber: z.string().min(1, "Expected number is required"),
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

export function HealthDetailsForm({
  walletAddress,
}: {
  walletAddress: string;
}) {
  const router = useRouter();
  const backendURL =
    process.env.NODE_ENV === "production"
      ? process.env.NEXT_PUBLIC_BACKEND_URL
      : "http://localhost:3001/api";

  const [premium, setPremium] = useState<number | null>(null);
  const [premiumEth, setPremiumEth] = useState<string | null>(null);
  const [bahtToEthRate, setBahtToEthRate] = useState<number>(0);
  const [calculating, setCalculating] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      user_address: walletAddress,
      preExistingConditions: "",
      bmi: "",
      smokingStatus: "NEVER",
      exerciseFrequency: "MODERATE",
      coverageTier: "200000",
      expectedNumber: "",
      fileUpload: undefined,
    },
  });

  const isSubmitting = form.formState.isSubmitting;

  // Calculate premium when coverageTier or walletAddress changes
  useEffect(() => {
    const calculatePremium = async () => {
      setCalculating(true);
      try {
        const sumAssured = parseInt(form.watch("coverageTier"));
        const walletAddr = form.watch("user_address");
        if (!walletAddr || !sumAssured) {
          setPremium(null);
          setPremiumEth(null);
          setBahtToEthRate(0);
          setCalculating(false);
          return;
        }
        const res = await axios.post(`${backendURL}/health/calculate-premium`, {
          walletAddress: walletAddr,
          sumAssured,
        });
        setPremium(res.data.premiumThb);
        setPremiumEth(res.data.premiumEth);
        setBahtToEthRate(res.data.exchangeRate);
      } catch (error) {
        setPremium(null);
        setPremiumEth(null);
        setBahtToEthRate(0);
      } finally {
        setCalculating(false);
      }
    };

    calculatePremium();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form.watch("coverageTier"), form.watch("user_address")]);

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
        fileUpload: fileUploadBase64, // Store the file as a Base64 string
        sumAssured: parseInt(data.coverageTier),
        premium,
        premiumEth: Number(premiumEth),
        sumAssuredEth: parseInt(data.coverageTier) / bahtToEthRate,
      };

      // Store the submission object in sessionStorage
      sessionStorage.setItem("healthPolicyDraft", JSON.stringify(submission));

      setTimeout(() => {
        router.push("/dashboard/insurance/health/apply/review-policy");
      }, 3000);
    } catch (error) {
      console.error("Error submitting health policy:", error);
      alert("Failed to submit policy. Please check your input and try again.");
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-2xl font-bold text-[#212529]">
          Health Insurance Policy
        </CardTitle>
        <CardDescription className="text-[#6B7280]">
          Provide your health details to create a personalized insurance policy.
        </CardDescription>
      </CardHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <CardContent className="p-6">
            <div className="space-y-8">
              {/* User Address */}
              <div className="space-y-4">
                <h2 className="text-xl font-semibold text-[#212529]">
                  Account Information
                </h2>
                <p className="text-sm text-gray-600">
                  Your wallet address will be used to identify your policy.
                </p>
                <FormField
                  control={form.control}
                  name="user_address"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>User Address</FormLabel>
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
              </div>

              {/* Health Information */}
              <div className="space-y-4">
                <h2 className="text-xl font-semibold text-[#212529]">
                  Health Information
                </h2>
                <p className="text-sm text-gray-600">
                  Please provide accurate health information to ensure proper
                  coverage assessment.
                </p>

                {/* Pre-existing Conditions */}
                <FormField
                  control={form.control}
                  name="preExistingConditions"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <Heart className="h-4 w-4 text-red-500" />
                        Pre-existing Conditions
                      </FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          placeholder="e.g., Diabetes, Hypertension (optional)"
                          className="focus:ring-2 focus:ring-blue-500"
                        />
                      </FormControl>
                      <p className="text-xs text-gray-500">
                        List any chronic conditions or ongoing medical
                        treatments. This helps us provide accurate coverage.
                      </p>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* BMI */}
                <FormField
                  control={form.control}
                  name="bmi"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <Activity className="h-4 w-4 text-green-500" />
                        BMI (Body Mass Index)
                      </FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          placeholder="e.g., 22.5"
                          inputMode="decimal"
                          className="focus:ring-2 focus:ring-blue-500"
                        />
                      </FormControl>
                      <p className="text-xs text-gray-500">
                        Enter your BMI value. You can calculate it using: weight
                        (kg) ÷ height² (m²)
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
                  Your lifestyle choices help us assess health risks and
                  determine appropriate premiums.
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
                                id="never"
                                className="border-green-500"
                              />
                            </div>
                            <div className="ml-3 text-sm">
                              <Label
                                htmlFor="never"
                                className="font-medium text-gray-900 cursor-pointer"
                              >
                                Never Smoked
                              </Label>
                              <p className="text-xs text-gray-500 mt-1">
                                Lower health risks and premium rates
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
                                id="former"
                                className="border-yellow-500"
                              />
                            </div>
                            <div className="ml-3 text-sm">
                              <Label
                                htmlFor="former"
                                className="font-medium text-gray-900 cursor-pointer"
                              >
                                Former Smoker
                              </Label>
                              <p className="text-xs text-gray-500 mt-1">
                                Quit smoking, some risk remains
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
                                id="current"
                                className="border-red-500"
                              />
                            </div>
                            <div className="ml-3 text-sm">
                              <Label
                                htmlFor="current"
                                className="font-medium text-gray-900 cursor-pointer"
                              >
                                Current Smoker
                              </Label>
                              <p className="text-xs text-gray-500 mt-1">
                                Higher health risks may affect premium rates
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
                                id="none"
                                className="border-red-500"
                              />
                            </div>
                            <div className="ml-3 text-sm">
                              <Label
                                htmlFor="none"
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
                                id="light"
                                className="border-orange-500"
                              />
                            </div>
                            <div className="ml-3 text-sm">
                              <Label
                                htmlFor="light"
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
                                id="moderate"
                                className="border-blue-500"
                              />
                            </div>
                            <div className="ml-3 text-sm">
                              <Label
                                htmlFor="moderate"
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
                                id="heavy"
                                className="border-green-500"
                              />
                            </div>
                            <div className="ml-3 text-sm">
                              <Label
                                htmlFor="heavy"
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

              {/* Documentation */}
              <div className="space-y-4">
                <h2 className="text-xl font-semibold text-[#212529]">
                  Supporting Documentation
                </h2>
                <p className="text-sm text-gray-600">
                  Upload medical records or health certificates to support your
                  application.
                </p>
                <FormField
                  control={form.control}
                  name="fileUpload"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <Upload className="h-4 w-4 text-blue-500" />
                        Upload Medical Documents
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

              {/* Coverage Options */}
              <div className="space-y-4">
                <h2 className="text-xl font-semibold text-[#212529]">
                  Coverage Options
                </h2>
                <p className="text-sm text-gray-600">
                  Select your desired coverage tier. Higher tiers provide larger
                  payouts for medical claims.
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
                                Essential Coverage Plan
                              </Label>
                              <p className="text-gray-500">
                                100,000 THB maximum annual benefit
                              </p>
                              <p className="text-xs text-gray-500 mt-1">
                                Designed for individuals seeking basic medical
                                protection for outpatient care and minor
                                treatments.
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
                                Standard Coverage Plan
                              </Label>
                              <p className="text-gray-500">
                                200,000 THB maximum annual benefit
                              </p>
                              <p className="text-xs text-gray-500 mt-1">
                                Ideal for families and individuals requiring
                                balanced coverage for inpatient and outpatient
                                care.
                              </p>
                            </div>
                          </div>
                          <div
                            className={`relative flex items-start p-4 rounded-lg border ${
                              field.value === "300000"
                                ? "border-blue-500 bg-blue-50"
                                : "border-gray-200"
                            }`}
                          >
                            <div className="flex items-center h-5">
                              <RadioGroupItem
                                value="300000"
                                id="300000"
                                className="border-blue-500"
                              />
                            </div>
                            <div className="ml-3 text-sm">
                              <Label
                                htmlFor="300000"
                                className="font-medium text-gray-900 cursor-pointer"
                              >
                                Premium Coverage Plan
                              </Label>
                              <p className="text-gray-500">
                                300,000 THB maximum annual benefit
                              </p>
                              <p className="text-xs text-gray-500 mt-1">
                                Comprehensive coverage for specialist
                                treatments, surgeries, and advanced medical
                                care.
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
                          ? `Estimated Premium: ${premium.toLocaleString()} THB`
                          : "Premium will be calculated automatically"}
                    </p>
                  </div>
                </div>
              </div>

              {/* Additional Information */}
              <div className="space-y-4">
                <h2 className="text-xl font-semibold text-[#212529]">
                  Additional Information
                </h2>
                <p className="text-sm text-gray-600">
                  Provide any additional information that may be relevant to
                  your health insurance application.
                </p>
                <FormField
                  control={form.control}
                  name="expectedNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <Users className="h-4 w-4 text-purple-500" />
                        Expected Number of Dependents
                      </FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          placeholder="Enter number of family members to be covered"
                          type="number"
                          min="0"
                          className="focus:ring-2 focus:ring-blue-500"
                        />
                      </FormControl>
                      <p className="text-xs text-gray-500">
                        Number of additional family members you plan to add to
                        this policy
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
              onClick={() => sessionStorage.removeItem("healthPolicyDraft")}
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
