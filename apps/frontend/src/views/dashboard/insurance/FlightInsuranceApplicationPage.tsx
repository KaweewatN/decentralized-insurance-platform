import { FlightDetailsForm } from "@/views/dashboard/insurance/flight/components/flight-details-form";

export default function FlightInsuranceApplicationPage({
  walletAddress,
}: {
  walletAddress: string;
}) {
  return (
    <>
      <main className="container px-4 py-8 mx-auto bg-[#F4F6F8]">
        <div className="max-w-3xl mx-auto">
          <FlightDetailsForm walletAddress={walletAddress} />
        </div>
      </main>
    </>
  );
}
