import { AuthorManageBookFormScreen } from "@/features/pagepal/screens/AuthorManageBookFormScreen";

export default async function AuthorEditBookPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <AuthorManageBookFormScreen bookId={id} />;
}
