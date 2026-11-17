import type { Metadata } from "next";
import PageShell from "@/components/PageShell";
import ArsipDashboard from "@/components/arsip/ArsipDashboard";
import { firstParam } from "@/lib/arsip";
import { hasApiKey } from "@/lib/hasApiKey";

export const metadata: Metadata = {
  title: "Arsip Surat — TPKB Surat Generator",
};

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ k?: string | string[] }>;
}) {
  const kepengurusan = firstParam((await searchParams).k);
  return (
    <PageShell title="Arsip Surat" hasKey={await hasApiKey()} wide>
      <ArsipDashboard initialKepengurusan={kepengurusan} />
    </PageShell>
  );
}
