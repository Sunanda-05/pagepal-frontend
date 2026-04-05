import { BookReviewsScreen } from "@/features/pagepal/screens/BookReviewsScreen";

export default async function BookReviewsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <BookReviewsScreen bookId={id} />;
}
