import Cookies from "universal-cookie";
import { ENV } from "@/configs/environment";

const cookies = new Cookies();

export const getToken = (): string => cookies.get(ENV.TOKEN_KEY);

export const setToken = (token: string) => {
	cookies.set(ENV.TOKEN_KEY, token, { path: "/" });
};

export const removeToken = () => cookies.remove(ENV.TOKEN_KEY, { path: "/" });

export const getRefreshToken = (): string | undefined =>
	cookies.get(ENV.REFRESH_TOKEN_KEY);

export const setRefreshToken = (token: string) => {
	cookies.set(ENV.REFRESH_TOKEN_KEY, token, { path: "/" });
};

export const removeRefreshToken = () =>
	cookies.remove(ENV.REFRESH_TOKEN_KEY, { path: "/" });