"use client";

import Link from "next/link";
import { arsipHref, suratHref } from "@/lib/arsip";
import type { FinalizeSuratResponse } from "@/types/api";

interface Props {
	result: FinalizeSuratResponse;
	/** Kepengurusan the letter belongs to, for the links to Arsip Surat. */
	kepengurusan: string;
	/** Running number of the letter that was edited. Leave out for a new letter. */
	editedNomor?: number;
	onReset: () => void;
}

const secondaryCls =
	"inline-flex items-center gap-1.5 rounded-lg border border-gray-300 px-4 py-2.5 text-sm text-gray-700 hover:border-gray-500 hover:text-gray-900";

export default function SuccessStep({ result, kepengurusan, editedNomor, onReset }: Props) {
	const edited = editedNomor !== undefined;

	return (
		<div className="flex flex-col items-center gap-6 py-4 text-center">
			<div className="flex h-14 w-14 items-center justify-center rounded-full bg-green-100 text-2xl">
				✓
			</div>

			<div>
				<h2 className="text-lg font-semibold text-gray-900">
					{edited ? "Perubahan surat berhasil disimpan!" : "Surat berhasil disimpan!"}
				</h2>
				<p className="mt-2 text-sm text-gray-500">Nomor surat</p>
				<p className="font-mono text-lg font-semibold text-gray-900">
					{result.nomor_surat}
				</p>
				<p className="mt-2 text-sm text-gray-500">{result.file_name}</p>
			</div>

			<p className="max-w-sm text-sm text-gray-500">
				{edited
					? "Baris surat ini di spreadsheet arsip sudah diperbarui. PDF yang baru ada di folder “Berkas Keluar”, dan PDF yang lama dipindahkan ke Sampah Google Drive."
					: "Nomor surat sudah tercatat di spreadsheet arsip, dan PDF-nya ada di folder “Berkas Keluar”."}
			</p>

			<div className="flex flex-col items-center gap-3 sm:flex-row sm:flex-wrap sm:justify-center">
				<a href={result.url} target="_blank" rel="noopener noreferrer" className={secondaryCls}>
					<span>Lihat PDF di Google Drive</span>
					<span className="text-gray-400">↗</span>
				</a>
				<Link
					href={edited ? suratHref(kepengurusan, editedNomor) : arsipHref(kepengurusan)}
					className={secondaryCls}
				>
					{edited ? "Lihat surat" : "Lihat di Arsip Surat"}
				</Link>
			</div>

			{edited ? (
				<Link
					href={arsipHref(kepengurusan)}
					className="rounded-lg bg-gray-900 px-6 py-2.5 text-sm font-medium text-white"
				>
					Kembali ke Arsip Surat
				</Link>
			) : (
				<button
					onClick={onReset}
					className="rounded-lg bg-gray-900 px-6 py-2.5 text-sm font-medium text-white"
				>
					Buat Surat Baru
				</button>
			)}
		</div>
	);
}
