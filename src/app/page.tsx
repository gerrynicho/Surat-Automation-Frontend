import SuratFormFlow from "@/components/SuratFormFlow";
import { hasApiKey } from "@/lib/hasApiKey";

export default async function Page() {
  return <SuratFormFlow hasKey={await hasApiKey()} />;
}
