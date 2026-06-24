"use server";

import { get } from "./main/call";
import { ENDPOINTS } from "./main/endpoint";
import type { KepengurusanListResponse } from "@/types/api";

export async function getKepengurusanList() {
	return get<KepengurusanListResponse>(ENDPOINTS.kepengurusan);
}
