"use client";

import { useState } from "react";
import { exportPDF } from "@/services/api/useDocument";
import type { CreateSuratResponse, ExportPDFResponse } from "@/types/api";

interface Props {
	result: CreateSuratResponse;
	namaKepengurusan: string;
	onApprove: (pdf: ExportPDFResponse) => void;
	onReject: () => void;
}

export default function DraftReviewStep({
	result,
	namaKepengurusan,
	onApprove,
	onReject,
}: Props) {
	const [exporting, setExporting] = useState(false);
	const [error, setError] = useState("");

	async function handleApprove() {
		setError("");
		setExporting(true);
		const res = await exportPDF({
			nama_kepengurusan: namaKepengurusan,
			nama_file: result.doc_name,
		});
		setExporting(false);
		if (res.OK) {
			onApprove(res.Kind as ExportPDFResponse);
		} else {
			const kind = res.Kind as { Message?: string; error?: string };
			setError(kind.Message || kind.error || "Gagal mengekspor PDF.");
		}
	}

	return (
		<div className="flex flex-col gap-6">
			<div>
				<p className="text-sm font-medium text-gray-500 mb-1">Nomor surat</p>
				<p className="font-mono text-lg font-semibold text-gray-900">
					{result.nomor_surat}
				</p>
			</div>

			<div>
				<p className="text-sm font-medium text-gray-500 mb-2">
					Tinjau dokumen sebelum mengekspor
				</p>
				<a
					href={result.doc_url}
					target="_blank"
					rel="noopener noreferrer"
					className="inline-flex items-center gap-1.5 rounded-lg border border-gray-300 px-4 py-2.5 text-sm text-gray-700 hover:border-gray-500 hover:text-gray-900"
				>
					<span>Buka draft di Google Docs</span>
					<span className="text-gray-400">↗</span>
				</a>
				<p className="mt-1.5 text-xs text-gray-400">
					Kamu bisa mengedit dokumen sebelum menyetujuinya.
				</p>
			</div>

			{error && <p className="text-sm text-red-600">{error}</p>}

			<div className="flex gap-3">
				<button
					onClick={handleApprove}
					disabled={exporting}
					className="flex-1 rounded-lg bg-gray-900 px-4 py-2.5 text-sm font-medium text-white disabled:opacity-50"
				>
					{exporting ? "Mengekspor..." : "Dokumen sudah sesuai ✓"}
				</button>
				<button
					onClick={onReject}
					disabled={exporting}
					className="flex-1 rounded-lg border border-gray-300 px-4 py-2.5 text-sm font-medium text-gray-700 hover:border-gray-500 disabled:opacity-50"
				>
					Buat ulang ✗
				</button>
			</div>
		</div>
	);
}
