import { AuthorProfileScreen } from "@/components/screens/AuthorProfileScreen";

export default async function AuthorProfilePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <AuthorProfileScreen authorId={id} />;
}
