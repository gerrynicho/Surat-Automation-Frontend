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

export interface CreateSuratResponse {
	success: boolean;
	nomor_surat: string;
	doc_name: string;
	doc_url: string;
}

export interface ExportPDFResponse {
	success: boolean;
	file_name: string;
	url: string;
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

export interface FileActionRequest {
	nama_kepengurusan: string;
	nama_file: string;
}
