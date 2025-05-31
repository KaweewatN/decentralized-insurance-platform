import { Button } from "@/components/ui/button";
import { FileX } from "lucide-react";
import Link from "next/link";

export default function EmptyPolicies() {
  return (
    <div className="flex flex-col items-center justify-center p-10 text-center bg-white rounded-lg shadow-sm">
      <FileX className="w-16 h-16 mb-4 text-gray-300" />
      <h3 className="mb-2 text-xl font-semibold text-[#212529]">
        No Policies Found
      </h3>
      <p className="mb-6 text-gray-500">
        You don't have any insurance policies matching these criteria.
      </p>
      <Button className="bg-[#28A745] hover:bg-[#218838] text-white" asChild>
        <Link href="/dashboard#insurance-products">
          Explore Insurance Products
        </Link>
      </Button>
    </div>
  );
}
