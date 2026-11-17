"use server";

import { post } from "./main/call";
import { ENDPOINTS } from "./main/endpoint";
import type {
	CreateSuratRequest,
	FinalizeSuratResponse,
	PreviewSuratResponse,
} from "@/types/api";

/** Builds the letter as a PDF for review. Nothing is saved yet. */
export async function previewSurat(body: CreateSuratRequest) {
	return post<PreviewSuratResponse>(
		ENDPOINTS.suratPreview,
		body as unknown as Record<string, unknown>,
	);
}

/** Registers the nomor surat and saves the final PDF to Google Drive. */
export async function finalizeSurat(body: CreateSuratRequest) {
	return post<FinalizeSuratResponse>(
		ENDPOINTS.suratFinalize,
		body as unknown as Record<string, unknown>,
	);
}
