"use client";

import { useState, useEffect } from "react";
import PolicyFilters from "./components/policy-filters";
import PolicyCard from "./components/policy-card";
import EmptyPolicies from "./components/empty-policies";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { PolicyCardProps } from "./types/policies.types";
import mapApiPolicyToCard from "./utils/mapApiPolicyToCard";

export default function PoliciesPage({
  walletAddress,
}: {
  walletAddress: string;
}) {
  const [policies, setPolicies] = useState<PolicyCardProps[]>([]);
  const [filteredPolicies, setFilteredPolicies] = useState<PolicyCardProps[]>(
    []
  );
  const [currentPage, setCurrentPage] = useState(1);
  const policiesPerPage = 4;

  useEffect(() => {
    fetch(
      `http://localhost:3001/api/user/policy?walletAddress=${walletAddress}`
    )
      .then((res) => res.json())
      .then((data) => {
        const mapped = Array.isArray(data) ? data.map(mapApiPolicyToCard) : [];
        setPolicies(mapped);
        setFilteredPolicies(mapped);
      })
      .catch(() => {
        setPolicies([]);
        setFilteredPolicies([]);
      });
  }, []);

  // Filter policies based on selected filters
  const handleFilterChange = (filters: {
    status: string;
    type: string;
    sort: string;
  }) => {
    let result = [...policies];

    // Filter by status
    if (filters.status !== "all") {
      result = result.filter((policy) => policy.status === filters.status);
    }

    // Filter by type
    if (filters.type !== "all") {
      result = result.filter((policy) => policy.type === filters.type);
    }

    // Sort policies
    if (filters.sort === "purchase-date") {
      result = result.sort((a, b) => String(a.id).localeCompare(String(b.id)));
    } else if (filters.sort === "expiry-date") {
      result = result.sort((a, b) =>
        String(a.endDate).localeCompare(String(b.endDate))
      );
    } else if (filters.sort === "policy-id") {
      result = result.sort((a, b) => Number(a.id) - Number(b.id));
    }
    setFilteredPolicies(result);
    setCurrentPage(1); // Reset to first page when filters change
  };

  // Calculate pagination
  const indexOfLastPolicy = currentPage * policiesPerPage;
  const indexOfFirstPolicy = indexOfLastPolicy - policiesPerPage;
  const currentPolicies = filteredPolicies.slice(
    indexOfFirstPolicy,
    indexOfLastPolicy
  );
  const totalPages = Math.ceil(filteredPolicies.length / policiesPerPage);

  return (
    <>
      <main className="container px-4 py-8 mx-auto bg-[#F4F6F8]">
        <h1 className="mb-6 text-3xl font-bold text-[#212529]">
          My Insurance Policies
        </h1>

        <PolicyFilters onFilterChange={handleFilterChange} />

        <div className="space-y-6">
          {currentPolicies.length > 0 ? (
            currentPolicies.map((policy) => (
              <PolicyCard key={policy.id} {...policy} />
            ))
          ) : (
            <EmptyPolicies />
          )}
        </div>

        {filteredPolicies.length > policiesPerPage && (
          <Pagination className="mt-8">
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    if (currentPage > 1) setCurrentPage(currentPage - 1);
                  }}
                  className={
                    currentPage === 1 ? "pointer-events-none opacity-50" : ""
                  }
                />
              </PaginationItem>

              {Array.from({ length: totalPages }).map((_, index) => {
                const pageNumber = index + 1;
                if (
                  pageNumber === 1 ||
                  pageNumber === totalPages ||
                  pageNumber === currentPage ||
                  pageNumber === currentPage - 1 ||
                  pageNumber === currentPage + 1
                ) {
                  return (
                    <PaginationItem key={pageNumber}>
                      <PaginationLink
                        href="#"
                        isActive={pageNumber === currentPage}
                        onClick={(e) => {
                          e.preventDefault();
                          setCurrentPage(pageNumber);
                        }}
                      >
                        {pageNumber}
                      </PaginationLink>
                    </PaginationItem>
                  );
                }
                if (
                  (pageNumber === 2 && currentPage > 3) ||
                  (pageNumber === totalPages - 1 &&
                    currentPage < totalPages - 2)
                ) {
                  return (
                    <PaginationItem key={pageNumber}>
                      <PaginationEllipsis />
                    </PaginationItem>
                  );
                }
                return null;
              })}

              <PaginationItem>
                <PaginationNext
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    if (currentPage < totalPages)
                      setCurrentPage(currentPage + 1);
                  }}
                  className={
                    currentPage === totalPages
                      ? "pointer-events-none opacity-50"
                      : ""
                  }
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        )}
      </main>
    </>
  );
}
