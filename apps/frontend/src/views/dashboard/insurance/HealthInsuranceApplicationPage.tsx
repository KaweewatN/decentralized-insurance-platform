import { HealthDetailsForm } from "./health/components/health-details-form";

export default function HealthInsuranceApplicationPage({
  walletAddress,
}: {
  walletAddress: string;
}) {
  return (
    <>
      <main className="container px-4 py-8 mx-auto bg-[#F4F6F8]">
        <div className="max-w-3xl mx-auto">
          <HealthDetailsForm walletAddress={walletAddress} />
        </div>
      </main>
    </>
  );
}
