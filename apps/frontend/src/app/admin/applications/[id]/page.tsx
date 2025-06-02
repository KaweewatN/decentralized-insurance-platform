import AdminApplicationDetailPage from "@/views/admin/applications/AdminApplicationDetailPage";

export default async function AdminApplicationPage({
  params,
}: {
  params: { id: string };
}) {
  return <AdminApplicationDetailPage params={params.id} />;
}
