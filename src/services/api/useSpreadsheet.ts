"use server";

import { get } from "./main/call";
import { ENDPOINTS } from "./main/endpoint";
import type { SuratMetadataResponse } from "@/types/api";

export async function getLatestNomorSurat(nama_kepengurusan: string) {
	return get<SuratMetadataResponse>(ENDPOINTS.suratLatest, {
		nama_kepengurusan,
	});
}
