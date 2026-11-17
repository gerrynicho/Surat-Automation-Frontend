"use server";

import { del, get, post, put, type Res } from "./main/call";
import { ENDPOINTS } from "./main/endpoint";
import type {
	CreateSuratRequest,
	DeleteSuratResponse,
	FinalizeSuratResponse,
	PreviewSuratResponse,
	SuratDetailResponse,
	SuratListResponse,
} from "@/types/api";

/**
 * URL of one letter. `nomor` ends up in the path and a server action can be
 * called with anything, so only a positive integer is accepted.
 */
function suratUrl(nomor: number): string | null {
	return Number.isInteger(nomor) && nomor > 0 ? `${ENDPOINTS.surat}/${nomor}` : null;
}

function invalidNomor<T>(): Res<T> {
	return { OK: false, StatusCode: 400, Kind: { Message: "Nomor surat tidak valid." } };
}

/** Every letter in the arsip of a kepengurusan, newest first. */
export async function listSurat(nama_kepengurusan: string) {
	return get<SuratListResponse>(ENDPOINTS.surat, { nama_kepengurusan });
}

/** One letter with the data it was built from and its PDF. */
export async function getSurat(nama_kepengurusan: string, nomor: number) {
	const url = suratUrl(nomor);
	if (!url) return invalidNomor<SuratDetailResponse>();
	return get<SuratDetailResponse>(url, { nama_kepengurusan });
}

/** Builds an edited letter as a PDF for review, with the number it already has. Nothing is saved. */
export async function previewSuratEdit(nomor: number, body: CreateSuratRequest) {
	const url = suratUrl(nomor);
	if (!url) return invalidNomor<PreviewSuratResponse>();
	return post<PreviewSuratResponse>(`${url}/preview`, body as unknown as Record<string, unknown>);
}

/** Replaces an existing letter: same running number, new PDF, updated arsip row. */
export async function updateSurat(nomor: number, body: CreateSuratRequest) {
	const url = suratUrl(nomor);
	if (!url) return invalidNomor<FinalizeSuratResponse>();
	return put<FinalizeSuratResponse>(url, body as unknown as Record<string, unknown>);
}

/** Deletes a letter. The latest one frees its number; older ones are marked as cancelled. */
export async function deleteSurat(nama_kepengurusan: string, nomor: number) {
	const url = suratUrl(nomor);
	if (!url) return invalidNomor<DeleteSuratResponse>();
	return del<DeleteSuratResponse>(url, { nama_kepengurusan });
}
