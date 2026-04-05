import { CollectionDetailScreen } from "@/features/pagepal/screens/CollectionDetailScreen";

export default async function CollectionDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <CollectionDetailScreen collectionId={id} />;
}
