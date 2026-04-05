import { CollectionCreateEditScreen } from "@/components/screens/CollectionCreateEditScreen";

export default async function EditCollectionPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <CollectionCreateEditScreen collectionId={id} />;
}
