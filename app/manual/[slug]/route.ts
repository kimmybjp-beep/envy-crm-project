import { readFile } from "node:fs/promises";
import path from "node:path";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

const manualFiles: Record<string, string> = {
  store: "user-manual.html",
  register: "new-store-registration-guide.html",
  admin: "admin-user-manual.html"
};

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const fileName = manualFiles[slug];

  if (!fileName) notFound();

  const html = await readFile(
    path.join(process.cwd(), "docs", fileName),
    "utf8"
  );

  return new Response(html, {
    headers: {
      "Content-Type": "text/html; charset=utf-8"
    }
  });
}
