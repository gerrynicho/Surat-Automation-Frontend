"use client";

import { useState } from "react";
import { verifyAndSetApiKey } from "@/services/api/auth";

interface Props {
	onSuccess: () => void;
}

export default function ApiKeyModal({ onSuccess }: Props) {
	const [key, setKey] = useState("");
	const [error, setError] = useState("");
	const [loading, setLoading] = useState(false);

	async function handleSubmit(e: React.FormEvent) {
		e.preventDefault();
		if (!key.trim()) return;
		setLoading(true);
		setError("");
		const result = await verifyAndSetApiKey(key.trim());
		setLoading(false);
		if (result.ok) {
			onSuccess();
		} else {
			setError("API key tidak valid. Periksa kembali dan coba lagi.");
		}
	}

	return (
		<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
			<div className="w-full max-w-sm rounded-2xl bg-white p-8 shadow-xl">
				<h1 className="mb-1 text-xl font-semibold text-gray-900">TPKB ITS</h1>
				<p className="mb-6 text-sm text-gray-500">
					Masukkan password untuk mengakses sistem.
				</p>
				<form onSubmit={handleSubmit} className="flex flex-col gap-4">
					<input
						type="text"
						value={key}
						onChange={(e) => setKey(e.target.value)}
						placeholder="Password"
						autoFocus
						className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm outline-none focus:border-gray-700 focus:ring-1 focus:ring-gray-700"
					/>
					{error && <p className="text-sm text-red-600">{error}</p>}
					<button
						type="submit"
						disabled={loading || !key.trim()}
						className="rounded-lg bg-gray-900 px-4 py-2.5 text-sm font-medium text-white disabled:opacity-50"
					>
						{loading ? "Memverifikasi..." : "Masuk"}
					</button>
				</form>
			</div>
		</div>
	);
}
