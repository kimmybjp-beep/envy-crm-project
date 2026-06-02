import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { SalesShell } from "@/components/sales-shell";
import { ScanSimulator } from "@/components/scan-simulator";
import { getSupabaseClient } from "@/lib/supabase";
import type { Store } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function ScanPage() {
  const cookieStore = await cookies();
  const storeId = cookieStore.get("envy_store_id")?.value;

  if (!storeId) redirect("/login");

  const supabase = getSupabaseClient();
  const { data: store } = await supabase
    .from("stores")
    .select("*")
    .eq("id", storeId)
    .eq("status", "APPROVED")
    .single<Store>();

  if (!store) redirect("/login?message=not-approved");

  return (
    <SalesShell
      title="Reward QR Scan"
      subtitle="Upload saved QR images from your phone to collect points"
    >
      <ScanSimulator stores={[store]} />
    </SalesShell>
  );
}
