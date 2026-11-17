"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { getSurat } from "@/services/api/useArsip";
import { arsipHref, formatUpdatedAt, suratEditHref } from "@/lib/arsip";
import { errorMessage } from "@/lib/errors";
import { pdfBlobUrl } from "@/lib/pdf";
import type { SuratDetailResponse } from "@/types/api";
import DeleteSuratDialog from "./DeleteSuratDialog";
import StatusBadge, { READ_ONLY_REASON } from "./StatusBadge";

interface Props {
	kepengurusan: string;
	/** Running number of the letter (column NO. of the arsip). */
	nomor: number;
}

const buttonCls =
	"rounded-lg border border-gray-300 px-4 py-2.5 text-center text-sm font-medium text-gray-700 hover:border-gray-500";

/** One letter: its arsip row, the data it was built from, and the PDF. */
export default function SuratDetail({ kepengurusan, nomor }: Props) {
	const router = useRouter();
	const [surat, setSurat] = useState<SuratDetailResponse | null>(null);
	const [pdfUrl, setPdfUrl] = useState<string | null>(null);
	const [error, setError] = useState("");
	const [confirmDelete, setConfirmDelete] = useState(false);

	useEffect(() => {
		let stale = false;
		let url: string | null = null;
		getSurat(kepengurusan, nomor).then((res) => {
			if (stale) return;
			if (res.OK) {
				const detail = res.Kind as SuratDetailResponse;
				if (detail.pdf_base64) url = pdfBlobUrl(detail.pdf_base64);
				setSurat(detail);
				setPdfUrl(url);
			} else {
				setError(errorMessage(res.Kind, "Surat gagal dimuat. Coba lagi."));
			}
		});
		return () => {
			stale = true;
			if (url) URL.revokeObjectURL(url);
		};
	}, [kepengurusan, nomor]);

	const back = (
		<Link href={arsipHref(kepengurusan)} className="self-start text-sm text-gray-600 underline hover:text-gray-900">
			← Kembali ke Arsip Surat
		</Link>
	);

	if (error) {
		return (
			<div className="flex flex-col gap-4">
				{back}
				<p role="alert" className="text-sm text-red-600">{error}</p>
			</div>
		);
	}

	if (!surat) {
		return (
			<div className="flex flex-col gap-4">
				{back}
				<div role="status" aria-label="Memuat surat" className="flex flex-col gap-3">
					<div className="h-6 w-56 animate-pulse rounded bg-gray-100" />
					<div className="h-24 animate-pulse rounded-lg bg-gray-100" />
					<div className="h-64 animate-pulse rounded-lg bg-gray-100" />
				</div>
			</div>
		);
	}

	const form = surat.form;
	const updatedAt = formatUpdatedAt(surat.updated_at);

	return (
		<div className="flex flex-col gap-6">
			{back}

			<div>
				<div className="flex flex-wrap items-center gap-2">
					<p className={`font-mono text-lg font-semibold ${surat.status === "dibatalkan" ? "text-gray-400 line-through" : "text-gray-900"}`}>
						{surat.nomor_surat || "—"}
					</p>
					<StatusBadge surat={surat} />
				</div>
				<p className="mt-1 text-sm text-gray-500">{kepengurusan}</p>
			</div>

			{surat.status === "dibatalkan" && (
				<p className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
					Surat ini sudah dibatalkan. Barisnya tetap ada di arsip supaya nomornya tidak
					dipakai surat lain.
				</p>
			)}
			{surat.status === "aktif" && !surat.editable && (
				<p className="rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-600">
					{READ_ONLY_REASON} Kalau perlu diubah, ubah langsung di spreadsheet arsip.
				</p>
			)}

			{(surat.editable || surat.url) && (
				<div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
					{surat.editable && (
						<Link href={suratEditHref(kepengurusan, nomor)} className="rounded-lg bg-gray-900 px-4 py-2.5 text-center text-sm font-medium text-white">
							Edit surat
						</Link>
					)}
					{surat.url && (
						<a href={surat.url} target="_blank" rel="noopener noreferrer" className={buttonCls}>
							Buka di Google Drive ↗
						</a>
					)}
					{surat.editable && (
						<button
							type="button"
							onClick={() => setConfirmDelete(true)}
							className={`${buttonCls} hover:border-red-400 hover:text-red-600`}
						>
							Hapus surat
						</button>
					)}
				</div>
			)}

			<section className="flex flex-col gap-2">
				<h2 className="text-sm font-semibold text-gray-900">Catatan arsip</h2>
				<dl className="grid grid-cols-1 gap-x-6 gap-y-2 text-sm sm:grid-cols-[11rem_1fr]">
					<Row label="Tanggal pengajuan" value={surat.tanggal} />
					<Row label="Perihal" value={surat.perihal} />
					<Row label="Bulan / kode" value={[surat.bulan, surat.kode].filter(Boolean).join(" / ")} />
					{surat.file_name && <Row label="Nama file" value={surat.file_name} />}
					{updatedAt && <Row label="Terakhir disimpan" value={updatedAt} />}
				</dl>
			</section>

			{form && (
				<section className="flex flex-col gap-2">
					<h2 className="text-sm font-semibold text-gray-900">Isi surat</h2>
					<dl className="grid grid-cols-1 gap-x-6 gap-y-2 text-sm sm:grid-cols-[11rem_1fr]">
						<Row label="Tujuan surat" value={form.data.TUJUAN} />
						<Row label="Ditujukan ke" value={form.data.ITSORNO ? "Institut Teknologi Sepuluh Nopember" : "Di tempat"} />
						<Row label="Nama kegiatan" value={form.data.NAMAKEGIATAN} />
						<Row label="Hari / tanggal kegiatan" value={form.data.HARITANGGAL} />
						<Row label="Acara yang minta izin" value={form.data.ACARAYANGMINTAIZIN} />
					</dl>

					<h3 className="mt-2 text-sm font-medium text-gray-700">
						Peserta ({form.participants.length})
					</h3>
					<div className="overflow-x-auto">
						<table className="w-full text-left text-sm text-gray-700">
							<thead className="border-b border-gray-200 text-xs uppercase tracking-wide text-gray-500">
								<tr>
									<th scope="col" className="w-10 py-2 pr-3 font-medium">No.</th>
									<th scope="col" className="py-2 pr-3 font-medium">Nama</th>
									<th scope="col" className="py-2 pr-3 font-medium">NRP</th>
									<th scope="col" className="py-2 font-medium">Jurusan</th>
								</tr>
							</thead>
							<tbody className="divide-y divide-gray-100">
								{form.participants.map((p, i) => (
									<tr key={i}>
										<td className="py-2 pr-3 text-gray-500">{i + 1}</td>
										<td className="py-2 pr-3">{p.nama}</td>
										<td className="py-2 pr-3 font-mono">{p.nrp}</td>
										<td className="py-2">{p.jurusan}</td>
									</tr>
								))}
							</tbody>
						</table>
					</div>
				</section>
			)}

			{form && (
				<section className="flex flex-col gap-2">
					<div className="flex items-center justify-between gap-3">
						<h2 className="text-sm font-semibold text-gray-900">PDF surat</h2>
						{pdfUrl && (
							<a
								href={pdfUrl}
								target="_blank"
								rel="noopener noreferrer"
								className="shrink-0 text-sm text-gray-700 underline hover:text-gray-900"
							>
								Buka di tab baru ↗
							</a>
						)}
					</div>
					{pdfUrl ? (
						<iframe
							src={`${pdfUrl}#navpanes=0&view=FitH`}
							title={`PDF surat ${surat.nomor_surat}`}
							className="h-[70vh] w-full rounded-lg border border-gray-300 bg-gray-100"
						/>
					) : (
						<p className="rounded-lg border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-900">
							PDF surat ini tidak ada lagi di folder “Berkas Keluar” (mungkin dipindahkan
							atau dihapus di Google Drive).
							{surat.editable && " Tekan Edit surat lalu simpan untuk membuat PDF-nya lagi."}
						</p>
					)}
				</section>
			)}

			{confirmDelete && (
				<DeleteSuratDialog
					kepengurusan={kepengurusan}
					surat={surat}
					onCancel={() => setConfirmDelete(false)}
					onDeleted={() => router.push(arsipHref(kepengurusan))}
				/>
			)}
		</div>
	);
}

function Row({ label, value }: { label: string; value: string }) {
	return (
		<>
			<dt className="text-gray-500">{label}</dt>
			<dd className="mb-1 text-gray-900 sm:mb-0">{value || "—"}</dd>
		</>
	);
}
