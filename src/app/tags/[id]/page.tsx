import { TagBooksScreen } from "@/components/screens/TagBooksScreen";

export default async function TagPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <TagBooksScreen tagId={id} />;
}
