import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import SuratFormFlow from "@/components/SuratFormFlow";
import { firstParam, parseNomor } from "@/lib/arsip";
import { hasApiKey } from "@/lib/hasApiKey";

export const metadata: Metadata = {
  title: "Ubah Surat — TPKB Surat Generator",
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
  const kepengurusan = firstParam((await searchParams).k);
  if (!kepengurusan) redirect("/arsip");

  return <SuratFormFlow hasKey={await hasApiKey()} edit={{ kepengurusan, nomor }} />;
}
