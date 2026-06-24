"use server";

import { post } from "./main/call";
import { ENDPOINTS } from "./main/endpoint";
import type {
	CreateSuratRequest,
	CreateSuratResponse,
	FileActionRequest,
	ExportPDFResponse,
} from "@/types/api";

export async function createSurat(body: CreateSuratRequest) {
	return post<CreateSuratResponse>(
		ENDPOINTS.suratCreate,
		body as unknown as Record<string, unknown>,
	);
}

export async function exportPDF(body: FileActionRequest) {
	return post<ExportPDFResponse>(
		ENDPOINTS.suratExportPDF,
		body as unknown as Record<string, unknown>,
	);
}
