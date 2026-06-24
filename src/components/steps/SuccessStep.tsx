"use client";

import type { ExportPDFResponse } from "@/types/api";

interface Props {
	pdf: ExportPDFResponse;
	onReset: () => void;
}

export default function SuccessStep({ pdf, onReset }: Props) {
	return (
		<div className="flex flex-col items-center gap-6 py-4 text-center">
			<div className="flex h-14 w-14 items-center justify-center rounded-full bg-green-100 text-2xl">
				✓
			</div>

			<div>
				<h2 className="text-lg font-semibold text-gray-900">
					Surat berhasil diekspor!
				</h2>
				<p className="mt-1 text-sm text-gray-500">{pdf.file_name}</p>
			</div>

			<a
				href={pdf.url}
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
