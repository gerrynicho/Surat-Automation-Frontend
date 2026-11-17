import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import PageShell from "@/components/PageShell";
import SuratDetail from "@/components/arsip/SuratDetail";
import { firstParam, parseNomor } from "@/lib/arsip";
import { hasApiKey } from "@/lib/hasApiKey";

export const metadata: Metadata = {
  title: "Lihat Surat — TPKB Surat Generator",
};

export default async function Page({
  params,
  searchParams,
}: {
  params: Promise<{ nomor: string }>;
  searchParams: Promise<{ k?: string | string[] }>;
}) {
  const nomor = parseNomor((await params).nomor);
  if (nomor === null) notFound();
  // The number only means something inside one kepengurusan.
  const kepengurusan = firstParam((await searchParams).k);
  if (!kepengurusan) redirect("/arsip");

  return (
    <PageShell title="Lihat Surat" hasKey={await hasApiKey()}>
      <SuratDetail kepengurusan={kepengurusan} nomor={nomor} />
    </PageShell>
  );
}
