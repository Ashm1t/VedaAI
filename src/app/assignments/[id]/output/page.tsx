import { redirect } from "next/navigation";

export default async function OutputPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  redirect(`/legacy/assignments/${id}/output`);
}
