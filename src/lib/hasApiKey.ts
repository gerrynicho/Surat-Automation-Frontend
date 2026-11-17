import { cookies } from "next/headers";
import { ENV } from "@/configs/environment";

/** Server-side check for the password cookie, so pages know whether to show the prompt. */
export async function hasApiKey(): Promise<boolean> {
	return Boolean((await cookies()).get(ENV.TOKEN_KEY)?.value);
}
