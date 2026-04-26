import LegacyWorkspaceLayout from "@/legacy/assignment-generator/LegacyWorkspaceLayout";

export default function LegacyLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <LegacyWorkspaceLayout>{children}</LegacyWorkspaceLayout>;
}
