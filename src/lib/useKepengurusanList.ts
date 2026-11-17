"use client";

import { useEffect, useState } from "react";
import { getKepengurusanList } from "@/services/api/useKepengurusan";
import { errorMessage } from "@/lib/errors";
import { kepengurusanCache } from "@/lib/kepengurusanCache";
import type { KepengurusanListResponse } from "@/types/api";

/** The kepengurusan names, fetched once per page load (see `kepengurusanCache`). */
export function useKepengurusanList() {
	const [list, setList] = useState<string[]>(kepengurusanCache.get() ?? []);
	const [loading, setLoading] = useState(kepengurusanCache.get() === null);
	const [error, setError] = useState("");

	useEffect(() => {
		if (kepengurusanCache.get() !== null) return;
		getKepengurusanList().then((res) => {
			if (res.OK) {
				const names = (res.Kind as KepengurusanListResponse).kepengurusan;
				kepengurusanCache.set(names);
				setList(names);
			} else {
				setError(errorMessage(res.Kind, "Daftar kepengurusan gagal dimuat. Muat ulang halaman ini."));
			}
			setLoading(false);
		});
	}, []);

	return { list, loading, error };
}
