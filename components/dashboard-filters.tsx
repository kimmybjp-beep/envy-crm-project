"use client";

import type { CSSProperties } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Filter } from "lucide-react";
import { adminUi } from "@/components/admin-shell";
import type { StoreTier } from "@/lib/types";

export type DashboardPeriod = "all" | "day" | "week" | "month";
export type DashboardTierFilter = "ALL" | StoreTier;

const periodOptions: { value: DashboardPeriod; label: string }[] = [
  { value: "all", label: "All time" },
  { value: "day", label: "By day" },
  { value: "week", label: "By week" },
  { value: "month", label: "By month" }
];

const tierOptions: { value: DashboardTierFilter; label: string }[] = [
  { value: "ALL", label: "All tiers" },
  { value: "UNASSIGNED", label: "Unassigned" },
  { value: "DISTRIBUTOR", label: "Distributor" },
  { value: "TIER2", label: "Tier 2" },
  { value: "TIER3", label: "Tier 3" }
];

export function DashboardFilters({
  period,
  tier
}: {
  period: DashboardPeriod;
  tier: DashboardTierFilter;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();

  function updateFilter(key: "period" | "tier", value: string) {
    const params = new URLSearchParams(searchParams.toString());
    params.set(key, value);
    params.delete("message");
    router.push(`/admin/dashboard?${params.toString()}`);
  }

  return (
    <section style={{ ...adminUi.panel, padding: 18, marginBottom: 18 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16, flexWrap: "wrap" }}>
        <div>
          <p style={{ margin: 0, color: adminUi.ruby, fontWeight: 950, letterSpacing: 1.2, textTransform: "uppercase", display: "inline-flex", alignItems: "center", gap: 8 }}>
            <Filter size={17} /> Dashboard filters
          </p>
          <p style={{ margin: "5px 0 0", color: "rgba(21,19,19,.58)" }}>
            Filter activity cards, scans, rewards, and store tables by period and tier.
          </p>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(2,minmax(190px,1fr))", gap: 12, minWidth: 360 }}>
          <label>
            <span style={labelStyle}>Period</span>
            <select value={period} onChange={(event) => updateFilter("period", event.target.value)} style={selectStyle}>
              {periodOptions.map((option) => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </select>
          </label>
          <label>
            <span style={labelStyle}>Tier</span>
            <select value={tier} onChange={(event) => updateFilter("tier", event.target.value)} style={selectStyle}>
              {tierOptions.map((option) => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </select>
          </label>
        </div>
      </div>
    </section>
  );
}

const labelStyle: CSSProperties = {
  display: "block",
  marginBottom: 7,
  color: "rgba(21,19,19,.6)",
  fontSize: 12,
  fontWeight: 950,
  letterSpacing: 0.6,
  textTransform: "uppercase"
};

const selectStyle: CSSProperties = {
  width: "100%",
  minHeight: 48,
  borderRadius: 16,
  border: "1px solid rgba(101,0,19,.14)",
  background: "linear-gradient(135deg,#fff,#fff7f8)",
  color: adminUi.charcoal,
  fontWeight: 900,
  padding: "0 14px",
  outline: "none"
};
