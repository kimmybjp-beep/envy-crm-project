import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Apple ENVY CRM",
  description: "Secure CRM and multi-tier scan tracking for Apple ENVY"
};

export default function RootLayout({
  children
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
