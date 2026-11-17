// Responses
export interface KepengurusanListResponse {
	kepengurusan: string[];
}

export interface SuratMetadataResponse {
	nomor: number;
	bulan: string;
	tgl: string;
	perihal: string;
	kode: string;
	legal: string;
	position: number;
}

export interface PreviewSuratResponse {
	/** Predicted number. Nothing is saved until the letter is finalized. */
	nomor_surat: string;
	pdf_base64: string;
	warnings: string[];
	/** True when the letter cannot be finalized yet (Ketua data, TTD or stempel missing). */
	blocked: boolean;
}

/** Returned when a new letter is finalized and when an existing one is edited. */
export interface FinalizeSuratResponse {
	success: boolean;
	/** Running number (column NO. of the arsip). Arsip Surat addresses a letter by it. */
	nomor?: number | null;
	nomor_surat: string;
	file_name: string;
	url: string;
}

/** One row of the arsip, as Arsip Surat lists it. */
export interface SuratListItem {
	/** 0 when the arsip row has no valid number: such a row can only be looked at. */
	nomor: number;
	nomor_surat: string;
	bulan: string;
	tanggal: string;
	perihal: string;
	kode: string;
	status: "aktif" | "dibatalkan";
	/**
	 * False for letters the app has no data of (made before Arsip Surat existed,
	 * or typed into the spreadsheet by hand) and for cancelled ones.
	 */
	editable: boolean;
	/** True for the last row of the arsip: deleting it frees its number. */
	is_latest: boolean;
	file_name: string;
	url: string;
	/** ISO timestamp, empty when the app has no data of the letter. */
	updated_at: string;
}

export interface SuratListResponse {
	surat: SuratListItem[];
}

export interface SuratDetailResponse extends SuratListItem {
	/** The data the letter was built from; null when the app does not have it. */
	form: CreateSuratRequest | null;
	/** null when the PDF is no longer in Berkas Keluar. */
	pdf_base64: string | null;
}

export interface DeleteSuratResponse {
	success: boolean;
	nomor: number;
	nomor_surat: string;
	/**
	 * "removed": it was the latest letter, so its number is free again.
	 * "cancelled": the arsip row is kept and marked, so the number stays taken.
	 */
	mode: "removed" | "cancelled";
}

export interface KetuaConfig {
	jabatan: string;
	ketua_nama: string;
	ketua_nrp: string;
}

export type ImageSlot = "ttd" | "header" | "footer" | "stempel";

export interface KepengurusanImage {
	/** "own" = set for this kepengurusan, "default" = shared fallback */
	source: "own" | "default";
	data_url: string;
}

export interface KepengurusanDetailResponse {
	nama: string;
	config: KetuaConfig | null;
	images: Record<ImageSlot, KepengurusanImage | null>;
}

export interface SaveKepengurusanResponse {
	success: boolean;
	nama: string;
	created: boolean;
}

// Request bodies
export interface Participant {
	nama: string;
	nrp: string;
	jurusan: string;
}

export interface CreateSuratRequest {
	nama_kepengurusan: string;
	new_name: string;
	metadata: {
		bulan: string;
		tanggal_pengajuan: string;
		perihal: string;
		kode: string;
	};
	data: {
		TUJUAN: string;
		ITSORNO: boolean;
		NAMAKEGIATAN: string;
		HARITANGGAL: string;
		ACARAYANGMINTAIZIN: string;
	};
	participants: Participant[];
}
