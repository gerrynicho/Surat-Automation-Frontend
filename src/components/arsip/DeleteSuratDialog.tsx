"use client";

import { useState } from "react";
import { deleteSurat } from "@/services/api/useArsip";
import { errorMessage } from "@/lib/errors";
import type { DeleteSuratResponse, SuratListItem } from "@/types/api";

interface Props {
	kepengurusan: string;
	surat: SuratListItem;
	onDeleted: (result: DeleteSuratResponse) => void;
	onCancel: () => void;
}

/** What happened to the number, for the notice shown after a letter is deleted. */
export function deletedMessage(result: DeleteSuratResponse): string {
	return result.mode === "removed"
		? `Surat ${result.nomor_surat} dihapus. Nomornya akan dipakai lagi oleh surat berikutnya.`
		: `Surat ${result.nomor_surat} dibatalkan. Nomornya tetap tercatat di arsip dan tidak dipakai lagi.`;
}

/** Asks before deleting a letter, and says what will happen to its number. */
export default function DeleteSuratDialog({ kepengurusan, surat, onDeleted, onCancel }: Props) {
	const [deleting, setDeleting] = useState(false);
	const [error, setError] = useState("");

	async function handleDelete() {
		setError("");
		setDeleting(true);
		const res = await deleteSurat(kepengurusan, surat.nomor);
		if (res.OK) {
			onDeleted(res.Kind as DeleteSuratResponse);
		} else {
			setDeleting(false);
			setError(errorMessage(res.Kind, "Surat gagal dihapus. Coba lagi."));
		}
	}

	return (
		<div
			role="dialog"
			aria-modal="true"
			aria-labelledby="hapus-surat-judul"
			className="fixed inset-0 z-40 flex items-center justify-center bg-black/50 p-4"
		>
			<div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
				<h2 id="hapus-surat-judul" className="text-lg font-semibold text-gray-900">
					Hapus surat ini?
				</h2>
				<p className="mt-2 font-mono text-sm font-semibold text-gray-900">{surat.nomor_surat}</p>
				<p className="text-sm text-gray-600">{surat.perihal}</p>

				<ul className="mt-4 flex list-disc flex-col gap-1.5 pl-5 text-sm text-gray-700">
					<li>
						PDF-nya dipindahkan ke Sampah Google Drive. Dari sana masih bisa dipulihkan
						selama 30 hari.
					</li>
					{surat.is_latest ? (
						<li>
							Ini surat terakhir di arsip, jadi barisnya dikosongkan dan nomornya{" "}
							<strong>dipakai lagi</strong> oleh surat berikutnya.
						</li>
					) : (
						<li>
							Barisnya tetap ada di spreadsheet arsip dengan tanda{" "}
							<strong>[DIBATALKAN]</strong>, supaya nomornya tidak dipakai surat lain.
						</li>
					)}
					<li>Isi surat tidak bisa diubah lagi dari aplikasi.</li>
				</ul>

				{error && (
					<p role="alert" className="mt-4 text-sm text-red-600">
						{error}
					</p>
				)}

				<div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
					<button
						type="button"
						onClick={onCancel}
						disabled={deleting}
						autoFocus
						className="rounded-lg border border-gray-300 px-4 py-2.5 text-sm font-medium text-gray-700 hover:border-gray-500 disabled:opacity-50"
					>
						Batal
					</button>
					<button
						type="button"
						onClick={handleDelete}
						disabled={deleting}
						className="rounded-lg bg-red-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50"
					>
						{deleting ? "Menghapus..." : "Ya, hapus surat"}
					</button>
				</div>
			</div>
		</div>
	);
}
