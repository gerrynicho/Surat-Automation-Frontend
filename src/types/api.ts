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

export interface FinalizeSuratResponse {
	success: boolean;
	nomor_surat: string;
	file_name: string;
	url: string;
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
