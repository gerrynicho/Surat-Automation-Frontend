"use server";

import { get, upload } from "./main/call";
import { ENDPOINTS } from "./main/endpoint";
import type {
	KepengurusanDetailResponse,
	KepengurusanListResponse,
	SaveKepengurusanResponse,
} from "@/types/api";

export async function getKepengurusanList() {
	return get<KepengurusanListResponse>(ENDPOINTS.kepengurusan);
}

export async function getKepengurusanDetail(nama: string) {
	return get<KepengurusanDetailResponse>(ENDPOINTS.kepengurusanDetail, { nama });
}

/**
 * Creates or updates a kepengurusan.
 * Fields: nama, jabatan, ketua_nama, ketua_nrp, is_new ("true"/"false"),
 * and optional image files ttd, header, footer, stempel.
 */
export async function saveKepengurusan(formData: FormData) {
	return upload<SaveKepengurusanResponse>(ENDPOINTS.kepengurusan, formData);
}
