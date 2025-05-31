import WelcomeSection from "./components/welcome-section";
import SummaryCardsSection from "./components/summary-cards-section";
import InsuranceProductsSection from "./components/insurance-products-section";

export default function DashboardPage({
  walletAddress,
}: {
  walletAddress: string;
}) {
  return (
    <>
      <main className="container px-4 py-8 mx-auto bg-[#F4F6F8]">
        <WelcomeSection walletAddress={walletAddress} />
        <SummaryCardsSection />
        <InsuranceProductsSection />
      </main>
    </>
  );
}
