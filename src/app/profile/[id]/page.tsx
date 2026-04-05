import { ProfilePublicScreen } from "@/components/screens/ProfilePublicScreen";

export default async function ProfilePublicPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <ProfilePublicScreen userId={id} />;
}
