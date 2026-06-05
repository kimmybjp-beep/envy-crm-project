import { redirect } from "next/navigation";

export default async function ScanCodePage({
  params
}: {
  params: Promise<{ code: string }>;
}) {
  const { code } = await params;

  redirect(`/scan?code=${encodeURIComponent(code)}`);
}
