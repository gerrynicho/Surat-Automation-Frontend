import type { Metadata } from "next";
import PageShell from "@/components/PageShell";
import KepengurusanForm from "@/components/KepengurusanForm";
import { hasApiKey } from "@/lib/hasApiKey";

export const metadata: Metadata = {
  title: "Kelola Kepengurusan — TPKB Surat Generator",
};

export default async function Page() {
  return (
    <PageShell title="Kelola Kepengurusan" hasKey={await hasApiKey()}>
      <KepengurusanForm />
    </PageShell>
  );
}
