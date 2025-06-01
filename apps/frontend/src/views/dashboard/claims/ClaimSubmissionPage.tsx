"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Upload,
  FileText,
  ImageIcon,
  CheckCircle,
  Wallet,
  Shield,
  Calendar,
  File,
  AlertTriangle,
  Clock,
  User,
  X,
  Image,
  Loader2,
  Info,
} from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { toastError, toastSuccess } from "@/components/core/common/appToast";

const claimFormSchema = z.object({
  walletAddress: z.string().min(1, "Wallet address is required"),
  subject: z.string().min(1, "Subject is required"),
  incidentDate: z.string().min(1, "Incident date is required"),
  incidentDescription: z
    .string()
    .min(10, "Description must be at least 10 characters")
    .max(500, "Description must be less than 500 characters"),
  document: z
    .object({
      name: z.string(),
      base64: z.string(),
      type: z.string(),
      size: z.number(),
    })
    .refine((doc) => doc !== undefined, "Supporting document is required"),
});

type ClaimFormData = z.infer<typeof claimFormSchema>;

export default function ClaimSubmissionPage({
  walletAddress,
}: {
  walletAddress: string;
}) {
  const searchParams = useSearchParams();
  const policyId = searchParams.get("policyId");
  const planType = searchParams.get("planType");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<
    "idle" | "success" | "error"
  >("idle");
  const [dragActive, setDragActive] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const form = useForm<ClaimFormData>({
    resolver: zodResolver(claimFormSchema),
    defaultValues: {
      walletAddress: walletAddress,
      subject: "",
      incidentDate: "",
      incidentDescription: "",
      document: undefined,
    },
  });

  useEffect(() => {
    form.setValue("walletAddress", walletAddress);
  }, [walletAddress, form]);

  const convertFileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        const result = reader.result as string;
        resolve(result);
      };
      reader.onerror = (error) => reject(error);
    });
  };
  const sanitizeFilename = (filename: string): string => {
    return filename
      .replace(/[^\w\s.-]/g, "") // Remove special characters except word chars, spaces, dots, and hyphens
      .replace(/\s+/g, "_") // Replace spaces with underscores
      .replace(/_{2,}/g, "_") // Replace multiple underscores with single underscore
      .replace(/^_+|_+$/g, "") // Remove leading/trailing underscores
      .toLowerCase(); // Convert to lowercase for consistency
  };

  const handleFileUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return;

    const file = files[0];
    const validTypes = [
      "application/pdf",
      "image/jpeg",
      "image/png",
      "image/jpg",
    ];

    if (!validTypes.includes(file.type)) {
      alert("Please upload a valid file type (PDF, JPG, PNG)");
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      alert("File size must be less than 10MB");
      return;
    }

    try {
      setUploadProgress(0);
      const dataUrl = await convertFileToBase64(file);
      setUploadProgress(100);

      const sanitizedFilename = sanitizeFilename(file.name);

      form.setValue("document", {
        name: sanitizedFilename,
        base64: dataUrl,
        type: file.type,
        size: file.size,
      });
    } catch (error) {
      console.error("Error converting file to base64:", error);
      alert("Error processing file. Please try again.");
    }
  };

  const removeFile = () => {
    form.setValue("document", undefined);
    setUploadProgress(0);
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    handleFileUpload(e.dataTransfer.files);
  };

  const onSubmit = async (data: ClaimFormData) => {
    setIsSubmitting(true);
    setSubmitStatus("idle");

    try {
      const submitData = {
        policyId: policyId || "",
        planType: planType || "",
        ...data,
      };

      const response = await fetch(
        "http://localhost:3001/api/user/claim/submit",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(submitData),
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      console.log("Claim submitted successfully:", result);

      setSubmitStatus("success");
      toastSuccess(
        "Your claim has been submitted successfully! You will receive updates on your claim status."
      );
      form.reset();
    } catch (error) {
      console.error("Error submitting claim:", error);
      setSubmitStatus("error");
      toastError(
        "Failed to submit claim. Please try again or contact support."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const getFileIcon = (type: string) => {
    if (type.includes("pdf")) return <File className="h-5 w-5 text-red-500" />;
    if (type.includes("image"))
      return <ImageIcon className="h-5 w-5 text-blue-500" />;
    return <FileText className="h-5 w-5 text-gray-500" />;
  };

  const getCompletionPercentage = () => {
    const watchedValues = form.watch();
    const fields = [
      watchedValues.subject,
      watchedValues.incidentDate,
      watchedValues.incidentDescription,
      watchedValues.document,
    ];
    const completed = fields.filter((field) => field && field !== "").length;
    return Math.round((completed / fields.length) * 100);
  };

  const documentValue = form.watch("document");
  const incidentDescriptionValue = form.watch("incidentDescription");

  return (
    <div className="container mx-auto py-8 min-h-screen">
      <div className="max-w-2xl mx-auto">
        {/* Header Section */}
        <div className="mb-8 text-center">
          <div className="flex items-center justify-center mb-4">
            <div className="bg-blue-600 p-3 rounded-full">
              <Shield className="h-8 w-8 text-white" />
            </div>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Submit Insurance Claim
          </h1>
          <p className="text-gray-600">
            Complete the form below to submit your claim for review
          </p>
          <div className="flex items-center justify-center mt-4 space-x-4 text-sm text-gray-500">
            <div className="flex items-center">
              <Shield className="h-4 w-4 mr-1" />
              Policy: {policyId}
            </div>
            <div className="flex items-center">
              <Clock className="h-4 w-4 mr-1" />
              Est. 5-10 minutes
            </div>
          </div>
        </div>

        {/* Progress Indicator */}
        <Card className="mb-6 border-blue-200 bg-gradient-to-r from-blue-50 to-indigo-50">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">
                Form Completion
              </span>
              <span className="text-sm text-blue-600 font-semibold">
                {getCompletionPercentage()}%
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-gradient-to-r from-blue-500 to-indigo-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${getCompletionPercentage()}%` }}
              />
            </div>
          </CardContent>
        </Card>

        {/* Status Alerts */}
        {submitStatus === "success" && (
          <Alert className="mb-6 border-green-200 bg-gradient-to-r from-green-50 to-emerald-50 shadow-lg">
            <CheckCircle className="h-5 w-5 text-green-600" />
            <AlertDescription className="text-green-800 font-medium">
              🎉 Your claim has been submitted successfully! You will receive
              updates on your claim status.
            </AlertDescription>
          </Alert>
        )}

        {submitStatus === "error" && (
          <Alert className="mb-6 border-red-200 bg-gradient-to-r from-red-50 to-pink-50 shadow-lg">
            <AlertTriangle className="h-5 w-5 text-red-600" />
            <AlertDescription className="text-red-800 font-medium">
              ❌ Failed to submit claim. Please try again or contact support.
            </AlertDescription>
          </Alert>
        )}

        <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
          <CardHeader className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-t-lg">
            <CardTitle className="flex items-center text-xl">
              <FileText className="h-6 w-6 mr-2" />
              Claim Information
            </CardTitle>
            <CardDescription className="text-blue-100">
              Please provide all required information and supporting document
              for your claim.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-6"
              >
                {/* Wallet Address */}
                <FormField
                  control={form.control}
                  name="walletAddress"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center text-sm font-medium">
                        <Wallet className="h-4 w-4 mr-2 text-blue-600" />
                        Wallet Address
                      </FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          disabled
                          className="font-mono text-sm bg-gray-50 border-gray-200"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Plan Type */}
                <div className="space-y-2">
                  <Label
                    htmlFor="planType"
                    className="flex items-center text-sm font-medium"
                  >
                    <Shield className="h-4 w-4 mr-2 text-green-600" />
                    Plan Type
                  </Label>
                  <Input
                    id="planType"
                    value={planType || ""}
                    disabled
                    className="font-mono text-sm bg-gray-50 border-gray-200"
                  />
                </div>

                {/* Subject */}
                <FormField
                  control={form.control}
                  name="subject"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center text-sm font-medium">
                        <User className="h-4 w-4 mr-2 text-purple-600" />
                        Subject *
                      </FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          placeholder="Brief description of your claim"
                          className="focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Incident Date */}
                <FormField
                  control={form.control}
                  name="incidentDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center text-sm font-medium">
                        <Calendar className="h-4 w-4 mr-2 text-orange-600" />
                        Incident Date *
                      </FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          type="date"
                          className="focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Incident Description */}
                <FormField
                  control={form.control}
                  name="incidentDescription"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center text-sm font-medium">
                        <FileText className="h-4 w-4 mr-2 text-indigo-600" />
                        Incident Description *
                      </FormLabel>
                      <FormControl>
                        <Textarea
                          {...field}
                          placeholder="Please describe the incident in detail..."
                          rows={4}
                          className="focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none"
                        />
                      </FormControl>
                      <FormDescription className="text-xs text-gray-500 flex items-center">
                        <Info className="h-3 w-3 mr-1" />
                        {incidentDescriptionValue?.length || 0}/500 characters
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Document Upload */}
                <FormField
                  control={form.control}
                  name="document"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center text-sm font-medium">
                        <Upload className="h-4 w-4 mr-2 text-blue-600" />
                        Supporting Document *
                      </FormLabel>
                      <FormControl>
                        <div
                          className={`border-2 border-dashed rounded-xl p-8 text-center transition-all duration-300 ${
                            dragActive
                              ? "border-blue-400 bg-gradient-to-br from-blue-50 to-indigo-100 scale-105"
                              : "border-gray-300 hover:border-gray-400"
                          }`}
                          onDragEnter={handleDrag}
                          onDragLeave={handleDrag}
                          onDragOver={handleDrag}
                          onDrop={handleDrop}
                        >
                          <div className="space-y-4">
                            <div className="mx-auto w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center">
                              <Upload className="h-8 w-8 text-white" />
                            </div>
                            <div>
                              <p className="text-lg font-medium text-gray-700 mb-2">
                                Drop your file here
                              </p>
                              <p className="text-sm text-gray-600 mb-4">
                                or{" "}
                                <label className="text-blue-600 hover:text-blue-700 cursor-pointer font-medium underline">
                                  browse to upload
                                  <input
                                    type="file"
                                    accept=".pdf,.jpg,.jpeg,.png"
                                    onChange={(e) =>
                                      handleFileUpload(e.target.files)
                                    }
                                    className="hidden"
                                  />
                                </label>
                              </p>
                              <div className="flex items-center justify-center space-x-4 text-xs text-gray-500">
                                <span className="flex items-center">
                                  <File className="h-4 w-4 mr-1" />
                                  PDF
                                </span>
                                <span className="flex items-center">
                                  <ImageIcon className="h-4 w-4 mr-1" />
                                  JPG/PNG
                                </span>
                                <span>Max 10MB</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </FormControl>

                      {/* Uploaded File */}
                      {documentValue && (
                        <div className="mt-4">
                          <div className="flex items-center justify-between p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border border-green-200">
                            <div className="flex items-center space-x-3">
                              {getFileIcon(documentValue.type)}
                              <div>
                                <span className="text-sm font-medium text-gray-800">
                                  {documentValue.name}
                                </span>
                                <p className="text-xs text-gray-500">
                                  {(documentValue.size / 1024 / 1024).toFixed(
                                    2
                                  )}{" "}
                                  MB
                                </p>
                              </div>
                            </div>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={removeFile}
                              className="text-red-600 hover:text-red-700 hover:bg-red-50"
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      )}
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Submit Button */}
                <div className="pt-4">
                  <Button
                    type="submit"
                    className="w-full h-12 text-lg font-medium bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 transform disabled:opacity-50 disabled:scale-100"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                        Submitting Claim...
                      </>
                    ) : (
                      <>
                        <CheckCircle className="h-5 w-5 mr-2" />
                        Submit Claim
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>

        {/* Footer Info */}
        <Card className="mt-6 bg-gradient-to-r from-gray-50 to-blue-50 border-gray-200">
          <CardContent className="pt-6">
            <div className="flex items-start space-x-3">
              <Info className="h-5 w-5 text-blue-600 mt-0.5" />
              <div className="text-sm text-gray-600">
                <p className="font-medium mb-1">Important Information:</p>
                <ul className="list-disc list-inside space-y-1 text-xs">
                  <li>All fields marked with * are required</li>
                  <li>
                    Ensure all information is accurate for faster processing
                  </li>
                  <li>
                    Claims are typically reviewed within 3-5 business days
                  </li>
                  <li>You'll receive email updates on your claim status</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
