import { AdminApplicationDetailScreen } from "@/components/screens/AdminApplicationDetailScreen";

export default async function AdminApplicationDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <AdminApplicationDetailScreen applicationId={id} />;
}
