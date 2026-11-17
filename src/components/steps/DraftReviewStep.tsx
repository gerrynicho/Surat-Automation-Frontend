"use client";

import Link from "next/link";
import { useState } from "react";
import { finalizeSurat } from "@/services/api/useDocument";
import { updateSurat } from "@/services/api/useArsip";
import { errorMessage } from "@/lib/errors";
import type {
	CreateSuratRequest,
	FinalizeSuratResponse,
	PreviewSuratResponse,
} from "@/types/api";

interface Props {
	form: CreateSuratRequest;
	preview: PreviewSuratResponse;
	/** Blob URL of the preview PDF. */
	pdfUrl: string;
	/**
	 * Set when an existing letter is being edited: approving then replaces that
	 * letter instead of registering a new number. `nomorSurat` is the number it
	 * had before the edit.
	 */
	edit?: { nomor: number; nomorSurat: string };
	onApprove: (result: FinalizeSuratResponse) => void;
	onReject: () => void;
}

export default function DraftReviewStep({
	form,
	preview,
	pdfUrl,
	edit,
	onApprove,
	onReject,
}: Props) {
	const [saving, setSaving] = useState(false);
	const [error, setError] = useState("");

	async function handleApprove() {
		setError("");
		setSaving(true);
		const res = edit ? await updateSurat(edit.nomor, form) : await finalizeSurat(form);
		setSaving(false);
		if (res.OK) {
			onApprove(res.Kind as FinalizeSuratResponse);
		} else {
			setError(errorMessage(res.Kind, "Gagal menyimpan surat. Coba lagi."));
		}
	}

	const nomorChanged = Boolean(edit) && edit?.nomorSurat !== preview.nomor_surat;

	return (
		<div className="flex flex-col gap-6">
			<div>
				<p className="text-sm font-medium text-gray-500 mb-1">
					{edit ? "Nomor surat" : "Perkiraan nomor surat"}
				</p>
				<p className="font-mono text-lg font-semibold text-gray-900">
					{preview.nomor_surat}
				</p>
				{edit ? (
					<p className="mt-1 text-xs text-gray-500">
						{nomorChanged
							? `Kode surat diganti, jadi nomornya berubah dari ${edit.nomorSurat}. Nomor urutnya tetap. `
							: "Nomor surat tidak berubah. "}
						Perubahan belum disimpan. Surat yang lama baru diganti setelah kamu menekan
						&ldquo;Simpan perubahan&rdquo;.
					</p>
				) : (
					<p className="mt-1 text-xs text-gray-500">
						Surat ini belum disimpan. Nomor baru dicatat setelah kamu menekan
						&ldquo;Surat sudah benar&rdquo;.
					</p>
				)}
			</div>

			{preview.warnings.length > 0 && (
				<div className="rounded-lg border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-900">
					<p className="mb-1 font-medium">
						{preview.blocked
							? "Surat belum bisa disimpan:"
							: "Perlu diperhatikan:"}
					</p>
					<ul className="list-disc pl-5">
						{preview.warnings.map((w) => (
							<li key={w}>{w}</li>
						))}
					</ul>
					<Link
						href="/kepengurusan"
						className="mt-2 inline-block font-medium underline"
					>
						Lengkapi di Kelola Kepengurusan
					</Link>
				</div>
			)}

			<div>
				<div className="mb-2 flex items-center justify-between gap-3">
					<p className="text-sm font-medium text-gray-500">
						Periksa isi surat di bawah ini
					</p>
					<a
						href={pdfUrl}
						target="_blank"
						rel="noopener noreferrer"
						className="shrink-0 text-sm text-gray-700 underline hover:text-gray-900"
					>
						Buka di tab baru ↗
					</a>
				</div>
				{/* The fragment asks the browser's PDF viewer to hide its page sidebar and fit the width. */}
				<iframe
					src={`${pdfUrl}#navpanes=0&view=FitH`}
					title="Pratinjau surat"
					className="h-[70vh] w-full rounded-lg border border-gray-300 bg-gray-100"
				/>
			</div>

			{error && (
				<p role="alert" className="text-sm text-red-600">
					{error}
				</p>
			)}

			<div className="flex flex-col gap-3 sm:flex-row">
				<button
					onClick={handleApprove}
					disabled={saving || preview.blocked}
					className="flex-1 rounded-lg bg-gray-900 px-4 py-2.5 text-sm font-medium text-white disabled:opacity-50"
				>
					{saving
						? "Menyimpan surat..."
						: edit
							? "Simpan perubahan ✓"
							: "Surat sudah benar, simpan ✓"}
				</button>
				<button
					onClick={onReject}
					disabled={saving}
					className="flex-1 rounded-lg border border-gray-300 px-4 py-2.5 text-sm font-medium text-gray-700 hover:border-gray-500 disabled:opacity-50"
				>
					Perbaiki isian
				</button>
			</div>
		</div>
	);
}
