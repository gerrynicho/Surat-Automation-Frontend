"use server";

import axios from "axios";
import { cookies } from "next/headers";
import { ENV } from "@/configs/environment";
import { ENDPOINTS } from "./main/endpoint";

export async function verifyAndSetApiKey(
	key: string,
): Promise<{ ok: boolean }> {
	try {
		await axios.get(ENDPOINTS.ping, {
			headers: { "X-API-Key": key },
		});
		const cookieStore = await cookies();
		cookieStore.set(ENV.TOKEN_KEY, key, { path: "/" });
		return { ok: true };
	} catch {
		return { ok: false };
	}
}

export async function clearApiKey(): Promise<void> {
	const cookieStore = await cookies();
	cookieStore.delete(ENV.TOKEN_KEY);
}
