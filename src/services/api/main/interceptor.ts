import axios from "axios";
import { ENV } from "@/configs/environment";

const baseURL = ENV.URI.BASE_URL;
const isServer = typeof window === "undefined";

const api = axios.create({
	baseURL,
	headers: {
		"Content-Type": "application/json",
	},
});

api.interceptors.request.use(async (config) => {
	let token: string | undefined;

	if (isServer) {
		const { cookies } = await import("next/headers");
		token = (await cookies()).get(ENV.TOKEN_KEY)?.value;
	} else {
		const Cookies = (await import("universal-cookie")).default;
		token = new Cookies().get(ENV.TOKEN_KEY);
	}

	if (token) {
		config.headers["X-API-Key"] = token;
	}

	return config;
});

api.interceptors.response.use(
	(response) => response,
	async (error) => {
		if (error.response?.status === 401) {
			if (isServer) {
				const { cookies } = await import("next/headers");
				(await cookies()).delete(ENV.TOKEN_KEY);
			} else {
				const Cookies = (await import("universal-cookie")).default;
				new Cookies().remove(ENV.TOKEN_KEY, { path: "/" });
			}
		}
		return Promise.reject(error);
	},
);

export default api;
