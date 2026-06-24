import { ENV } from "@/configs/environment";

const BASE = ENV.URI.BASE_URL;

export const ENDPOINTS = {
	ping: `${BASE}/ping`,
	kepengurusan: `${BASE}/kepengurusan`,
	suratLatest: `${BASE}/surat/latest`,
	suratCreate: `${BASE}/surat/create`,
	suratExportPDF: `${BASE}/surat/export-pdf`,
};
