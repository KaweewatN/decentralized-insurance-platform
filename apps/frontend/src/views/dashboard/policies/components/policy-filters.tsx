"use client";

import { useState } from "react";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface PolicyFiltersProps {
  onFilterChange: (filters: {
    status: string;
    type: string;
    sort: string;
  }) => void;
}

export default function PolicyFilters({ onFilterChange }: PolicyFiltersProps) {
  const [filters, setFilters] = useState({
    status: "all",
    type: "all",
    sort: "purchase-date",
  });

  const handleFilterChange = (key: string, value: string) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  return (
    <div className="flex flex-col gap-4 mb-6 md:flex-row md:items-center">
      <div className="w-full md:w-auto">
        <Select
          value={filters.status}
          onValueChange={(value) => handleFilterChange("status", value)}
        >
          <SelectTrigger className="w-full md:w-[180px] bg-white">
            <SelectValue placeholder="Filter by Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectLabel>Filter by Status</SelectLabel>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="expired">Expired</SelectItem>
              <SelectItem value="pending-payment">Pending Payment</SelectItem>
              <SelectItem value="claimed">Claimed</SelectItem>
            </SelectGroup>
          </SelectContent>
        </Select>
      </div>

      <div className="w-full md:w-auto">
        <Select
          value={filters.type}
          onValueChange={(value) => handleFilterChange("type", value)}
        >
          <SelectTrigger className="w-full md:w-[180px] bg-white">
            <SelectValue placeholder="Filter by Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectLabel>Filter by Type</SelectLabel>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="health">Manual Health</SelectItem>
              <SelectItem value="flight">Flight Delay</SelectItem>
              <SelectItem value="rainfall">Rainfall</SelectItem>
            </SelectGroup>
          </SelectContent>
        </Select>
      </div>

      <div className="w-full md:w-auto md:ml-auto">
        <Select
          value={filters.sort}
          onValueChange={(value) => handleFilterChange("sort", value)}
        >
          <SelectTrigger className="w-full md:w-[180px] bg-white">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectLabel>Sort by</SelectLabel>
              <SelectItem value="purchase-date">Purchase Date</SelectItem>
              <SelectItem value="expiry-date">Expiry Date</SelectItem>
              <SelectItem value="policy-id">Policy ID</SelectItem>
            </SelectGroup>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
