import { BookDetailScreen } from "@/features/pagepal/screens/BookDetailScreen";

export default async function BookDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <BookDetailScreen bookId={id} />;
}
