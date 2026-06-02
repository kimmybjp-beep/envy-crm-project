import Link from "next/link";
import Image from "next/image";
import { BarChart3, Database, Gift, QrCode, ShieldCheck, Store } from "lucide-react";
import { signOutAction } from "@/app/actions/auth";

const ruby = "#a9001f";
const deepRuby = "#650013";
const charcoal = "#151313";
const champagne = "#d9b76f";

export function AdminShell({
  children,
  title,
  subtitle
}: {
  children: React.ReactNode;
  title: string;
  subtitle?: string;
}) {
  return (
    <main style={{
      minHeight: "100vh",
      background: "linear-gradient(180deg, #b50022 0 210px, #fff1f4 210px 100%)",
      color: charcoal,
      fontFamily: "Arial, Helvetica, sans-serif"
    }}>
      <header style={{ color: "white" }}>
        <div style={{
          maxWidth: 1180,
          margin: "0 auto",
          padding: "18px 20px 0"
        }}>
          <div style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 16
          }}>
            <div>
              <div style={{ fontSize: 12, fontWeight: 900, letterSpacing: 2, textTransform: "uppercase", opacity: 0.82 }}>
                ENVY Back Office
              </div>
              <h1 style={{ margin: "4px 0 0", fontSize: 36, lineHeight: 1, fontWeight: 950 }}>
                {title}
              </h1>
              {subtitle ? <p style={{ margin: "8px 0 0", color: "rgba(255,255,255,.76)", fontSize: 14 }}>{subtitle}</p> : null}
            </div>
            <nav style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              padding: 6,
              borderRadius: 999,
              background: "rgba(255,255,255,.12)",
              border: "1px solid rgba(255,255,255,.2)"
            }}>
              <AdminNav href="/admin" icon={<Store size={16} />} label="Stores" />
              <AdminNav href="/admin/dashboard" icon={<BarChart3 size={16} />} label="Dashboard" />
              <AdminNav href="/admin/rewards" icon={<Gift size={16} />} label="Rewards" />
              <AdminNav href="/admin/database" icon={<Database size={16} />} label="Data" />
              <AdminNav href="/admin/qr-generator" icon={<QrCode size={16} />} label="QR" />
              <form action={signOutAction}>
                <button style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 7,
                  border: "1px solid rgba(255,255,255,.26)",
                  background: "rgba(0,0,0,.16)",
                  color: "white",
                  borderRadius: 999,
                  padding: "10px 14px",
                  fontWeight: 800,
                  cursor: "pointer"
                }}>
                  <ShieldCheck size={16} /> Logout
                </button>
              </form>
            </nav>
          </div>

          <div style={{
            marginTop: 18,
            position: "relative",
            overflow: "hidden",
            borderRadius: 30,
            minHeight: 190,
            padding: 28,
            background: `linear-gradient(135deg, ${deepRuby}, ${ruby} 62%, #df1238)`,
            border: "1px solid rgba(255,255,255,.22)",
            boxShadow: "0 28px 80px rgba(101,0,19,.28)"
          }}>
            <div style={{
              position: "absolute",
              right: -10,
              top: -42,
              width: 330,
              opacity: 0.7
            }}>
              <Image src="/envy-apple.svg" alt="ENVY apple" width={360} height={280} priority />
            </div>
            <div style={{ position: "relative", zIndex: 1 }}>
              <span style={{
                display: "inline-flex",
                borderRadius: 999,
                padding: "8px 14px",
                background: "rgba(255,255,255,.13)",
                border: "1px solid rgba(255,255,255,.2)",
                fontSize: 12,
                fontWeight: 900,
                letterSpacing: 1.5,
                textTransform: "uppercase"
              }}>
                Admin Control
              </span>
              <p style={{ margin: "22px 0 0", fontFamily: "Georgia, serif", fontSize: 62, lineHeight: 0.88, fontWeight: 900 }}>
                envy
              </p>
              <p style={{ margin: "10px 0 0", maxWidth: 360, fontSize: 18, fontWeight: 800, color: "rgba(255,255,255,.9)" }}>
                store approvals, QR batches, and field communication
              </p>
            </div>
          </div>
        </div>
      </header>
      <section style={{ maxWidth: 1180, margin: "0 auto", padding: "24px 20px 56px" }}>
        {children}
      </section>
    </main>
  );
}

function AdminNav({ href, icon, label }: { href: string; icon: React.ReactNode; label: string }) {
  return (
    <Link href={href} style={{
      display: "inline-flex",
      alignItems: "center",
      gap: 7,
      color: "white",
      textDecoration: "none",
      borderRadius: 999,
      padding: "10px 14px",
      background: "rgba(255,255,255,.14)",
      fontWeight: 900
    }}>
      {icon}
      {label}
    </Link>
  );
}

export const adminUi = {
  ruby,
  deepRuby,
  charcoal,
  champagne,
  panel: {
    background: "rgba(255,255,255,.96)",
    border: "1px solid rgba(101,0,19,.12)",
    borderRadius: 24,
    boxShadow: "0 20px 70px rgba(101,0,19,.13)"
  },
  button: {
    border: 0,
    borderRadius: 16,
    background: ruby,
    color: "white",
    padding: "13px 18px",
    fontWeight: 900,
    cursor: "pointer",
    boxShadow: "0 14px 34px rgba(169,0,31,.2)"
  },
  input: {
    width: "100%",
    border: "1px solid rgba(101,0,19,.18)",
    borderRadius: 14,
    padding: "13px 14px",
    fontSize: 15,
    outline: "none",
    background: "white"
  }
};
