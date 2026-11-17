import { ENV } from "@/configs/environment";

const BASE = ENV.URI.BASE_URL;

export const ENDPOINTS = {
	ping: `${BASE}/ping`,
	kepengurusan: `${BASE}/kepengurusan`,
	kepengurusanDetail: `${BASE}/kepengurusan/detail`,
	suratLatest: `${BASE}/surat/latest`,
	suratPreview: `${BASE}/surat/preview`,
	suratFinalize: `${BASE}/surat/finalize`,
};
