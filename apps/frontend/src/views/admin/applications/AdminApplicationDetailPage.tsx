import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getApplication } from "@/libs/admin-utils";
import { ApplicationDetail } from "../components/application-detail";

interface ApplicationDetailPageProps {
  params: {
    id: string;
  };
}

export async function generateMetadata({
  params,
}: ApplicationDetailPageProps): Promise<Metadata> {
  const application = await getApplication(params.id);

  if (!application) {
    return {
      title: "Application Not Found - ChainSure Admin",
    };
  }

  return {
    title: `${application.type} Application Review - ChainSure Admin`,
    description: `Review insurance application from ${application.userWallet}`,
  };
}

export default async function AdminApplicationDetailPage({
  params,
}: ApplicationDetailPageProps) {
  const application = await getApplication(params.id);

  if (!application) {
    notFound();
  }

  return <ApplicationDetail application={application as any} />;
}
