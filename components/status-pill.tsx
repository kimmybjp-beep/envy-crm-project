import type { StoreStatus } from "@/lib/types";

const styles: Record<StoreStatus, string> = {
  PENDING_APPROVAL: "bg-champagne/20 text-ruby-900 ring-champagne/40",
  APPROVED: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  REJECTED: "bg-red-50 text-red-700 ring-red-200"
};

export function StatusPill({ status }: { status: StoreStatus }) {
  return (
    <span className={`rounded-full px-3 py-1 text-xs font-semibold ring-1 ${styles[status]}`}>
      {status.replaceAll("_", " ")}
    </span>
  );
}
