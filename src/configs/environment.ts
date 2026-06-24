export const ENV = {
	MODE: process.env.NEXT_PUBLIC_RUN_MODE || "development",
	TOKEN_KEY: process.env.NEXT_PUBLIC_TOKEN_KEY || "@example/token",
	REFRESH_TOKEN_KEY: process.env.NEXT_PUBLIC_REFRESH_TOKEN_KEY || "@example/refresh-token",
	URI: {
		BASE_URL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000",
	},
};