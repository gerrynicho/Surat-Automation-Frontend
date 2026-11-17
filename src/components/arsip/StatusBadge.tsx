import type { SuratListItem } from "@/types/api";

/** Why a letter that is not cancelled still cannot be changed from the app. */
export const READ_ONLY_REASON =
	"Data surat ini tidak tersimpan di aplikasi (dibuat sebelum ada Arsip Surat, atau diisi langsung di spreadsheet), jadi hanya bisa dilihat.";

const BADGE = "inline-block whitespace-nowrap rounded-full border px-2 py-0.5 text-xs font-medium";

/** "Dibatalkan", "Hanya lihat", or nothing for a normal letter. */
export default function StatusBadge({ surat }: { surat: SuratListItem }) {
	if (surat.status === "dibatalkan") {
		return <span className={`${BADGE} border-red-200 bg-red-50 text-red-700`}>Dibatalkan</span>;
	}
	if (!surat.editable) {
		return (
			<span title={READ_ONLY_REASON} className={`${BADGE} border-gray-200 bg-gray-50 text-gray-600`}>
				Hanya lihat
			</span>
		);
	}
	return null;
}
