"use client";

import type { FinalizeSuratResponse } from "@/types/api";

interface Props {
	result: FinalizeSuratResponse;
	onReset: () => void;
}

export default function SuccessStep({ result, onReset }: Props) {
	return (
		<div className="flex flex-col items-center gap-6 py-4 text-center">
			<div className="flex h-14 w-14 items-center justify-center rounded-full bg-green-100 text-2xl">
				✓
			</div>

			<div>
				<h2 className="text-lg font-semibold text-gray-900">
					Surat berhasil disimpan!
				</h2>
				<p className="mt-2 text-sm text-gray-500">Nomor surat</p>
				<p className="font-mono text-lg font-semibold text-gray-900">
					{result.nomor_surat}
				</p>
				<p className="mt-2 text-sm text-gray-500">{result.file_name}</p>
			</div>

			<p className="max-w-sm text-sm text-gray-500">
				Nomor surat sudah tercatat di spreadsheet arsip, dan PDF-nya ada di
				folder &ldquo;Berkas Keluar&rdquo;.
			</p>

			<a
				href={result.url}
				target="_blank"
				rel="noopener noreferrer"
				className="inline-flex items-center gap-1.5 rounded-lg border border-gray-300 px-4 py-2.5 text-sm text-gray-700 hover:border-gray-500 hover:text-gray-900"
			>
				<span>Lihat PDF di Google Drive</span>
				<span className="text-gray-400">↗</span>
			</a>

			<button
				onClick={onReset}
				className="rounded-lg bg-gray-900 px-6 py-2.5 text-sm font-medium text-white"
			>
				Buat Surat Baru
			</button>
		</div>
	);
}
