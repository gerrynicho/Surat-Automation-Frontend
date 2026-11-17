"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { listSurat } from "@/services/api/useArsip";
import { arsipHref, suratEditHref, suratHref } from "@/lib/arsip";
import { errorMessage } from "@/lib/errors";
import { useKepengurusanList } from "@/lib/useKepengurusanList";
import type { SuratListItem, SuratListResponse } from "@/types/api";
import DeleteSuratDialog, { deletedMessage } from "./DeleteSuratDialog";
import StatusBadge from "./StatusBadge";

interface Props {
	/** Kepengurusan from the URL (`?k=`), so a link or the back button returns to the same list. */
	initialKepengurusan: string;
}

const inputCls =
	"w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm text-gray-900 outline-none focus:border-gray-700 focus:ring-1 focus:ring-gray-700";

function matches(surat: SuratListItem, query: string): boolean {
	const needle = query.trim().toLowerCase();
	if (!needle) return true;
	return [surat.nomor_surat, surat.perihal, surat.tanggal, surat.file_name]
		.some((text) => text.toLowerCase().includes(needle));
}

/** Every letter of one kepengurusan, with view, edit and delete. */
export default function ArsipDashboard({ initialKepengurusan }: Props) {
	const router = useRouter();
	const { list: kepengurusanList, loading: loadingList, error: listError } = useKepengurusanList();

	const [kepengurusan, setKepengurusan] = useState(initialKepengurusan);
	const [surat, setSurat] = useState<SuratListItem[] | null>(null);
	const [loading, setLoading] = useState(Boolean(initialKepengurusan));
	const [error, setError] = useState("");
	const [notice, setNotice] = useState("");
	const [query, setQuery] = useState("");
	const [toDelete, setToDelete] = useState<SuratListItem | null>(null);
	// Bumped to fetch the same kepengurusan again (after a delete, or "Coba lagi").
	const [reloadCount, setReloadCount] = useState(0);

	useEffect(() => {
		if (!kepengurusan) return;
		let stale = false;
		listSurat(kepengurusan).then((res) => {
			if (stale) return;
			setLoading(false);
			if (res.OK) {
				setSurat((res.Kind as SuratListResponse).surat);
			} else {
				setError(errorMessage(res.Kind, "Daftar surat gagal dimuat. Coba lagi."));
			}
		});
		return () => {
			stale = true;
		};
	}, [kepengurusan, reloadCount]);

	function selectKepengurusan(name: string) {
		setKepengurusan(name);
		setSurat(null);
		setError("");
		setNotice("");
		setQuery("");
		setLoading(Boolean(name));
		router.replace(arsipHref(name), { scroll: false });
	}

	function reload() {
		setError("");
		setLoading(true);
		setReloadCount((n) => n + 1);
	}

	const shown = (surat ?? []).filter((s) => matches(s, query));

	return (
		<div className="flex flex-col gap-6">
			<div className="flex flex-col gap-3 sm:flex-row sm:items-end">
				<div className="flex flex-1 flex-col gap-1.5">
					<label htmlFor="arsip-kepengurusan" className="text-sm font-medium text-gray-700">
						Kepengurusan
					</label>
					{loadingList ? (
						<div className="w-full animate-pulse rounded-lg border border-gray-200 bg-gray-100 px-3 py-2.5">
							<div className="h-4 w-48 rounded bg-gray-300" />
						</div>
					) : (
						<select
							id="arsip-kepengurusan"
							value={kepengurusan}
							onChange={(e) => selectKepengurusan(e.target.value)}
							className={inputCls}
						>
							<option value="">— Pilih kepengurusan —</option>
							{kepengurusanList.map((k) => (
								<option key={k} value={k}>{k}</option>
							))}
						</select>
					)}
				</div>
				<Link
					href="/"
					className="rounded-lg bg-gray-900 px-4 py-2.5 text-center text-sm font-medium text-white"
				>
					+ Buat surat baru
				</Link>
			</div>
			{listError && <p role="alert" className="-mt-3 text-sm text-red-600">{listError}</p>}

			{notice && (
				<div role="status" className="rounded-lg border border-green-300 bg-green-50 px-4 py-3 text-sm text-green-900">
					{notice}
				</div>
			)}

			{!kepengurusan && (
				<p className="text-sm text-gray-500">
					Pilih kepengurusan untuk melihat surat-suratnya.
				</p>
			)}

			{kepengurusan && loading && (
				<div role="status" aria-label="Memuat daftar surat" className="flex flex-col gap-2">
					{[0, 1, 2].map((i) => (
						<div key={i} className="h-12 animate-pulse rounded-lg bg-gray-100" />
					))}
				</div>
			)}

			{kepengurusan && !loading && error && (
				<div role="alert" className="flex flex-col items-start gap-2 text-sm">
					<p className="text-red-600">{error}</p>
					<button
						type="button"
						onClick={reload}
						className="rounded-lg border border-gray-300 px-3 py-1.5 text-gray-700 hover:border-gray-500"
					>
						Coba lagi
					</button>
				</div>
			)}

			{kepengurusan && !loading && !error && surat && surat.length === 0 && (
				<p className="text-sm text-gray-500">
					Belum ada surat di arsip kepengurusan ini.{" "}
					<Link href="/" className="underline hover:text-gray-800">Buat surat pertama</Link>.
				</p>
			)}

			{kepengurusan && !loading && !error && surat && surat.length > 0 && (
				<>
					<div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
						<input
							type="search"
							value={query}
							onChange={(e) => setQuery(e.target.value)}
							placeholder="Cari nomor, perihal, atau tanggal"
							aria-label="Cari surat"
							className={`${inputCls} sm:max-w-xs`}
						/>
						<p className="text-sm text-gray-500">
							{query.trim() ? `${shown.length} dari ${surat.length} surat` : `${surat.length} surat`}
						</p>
					</div>

					{shown.length === 0 ? (
						<p className="text-sm text-gray-500">Tidak ada surat yang cocok dengan pencarian.</p>
					) : (
						<>
							{/* Desktop: table */}
							<div className="hidden overflow-x-auto md:block">
								<table className="w-full text-left text-sm">
									<thead className="border-b border-gray-200 text-xs uppercase tracking-wide text-gray-500">
										<tr>
											<th scope="col" className="py-2 pr-4 font-medium">Nomor surat</th>
											<th scope="col" className="py-2 pr-4 font-medium">Tanggal</th>
											<th scope="col" className="py-2 pr-4 font-medium">Perihal</th>
											<th scope="col" className="py-2 font-medium"><span className="sr-only">Aksi</span></th>
										</tr>
									</thead>
									<tbody className="divide-y divide-gray-100">
										{shown.map((s) => (
											<tr key={`${s.nomor}-${s.nomor_surat}`} className={s.status === "dibatalkan" ? "text-gray-400" : "text-gray-700"}>
												<td className="py-3 pr-4 align-top">
													<span className={`whitespace-nowrap font-mono font-semibold ${s.status === "dibatalkan" ? "line-through" : "text-gray-900"}`}>
														{s.nomor_surat || "—"}
													</span>
												</td>
												<td className="whitespace-nowrap py-3 pr-4 align-top">{s.tanggal || "—"}</td>
												<td className="py-3 pr-4 align-top">
													<div className="flex flex-wrap items-center gap-2">
														<span>{s.perihal || "—"}</span>
														<StatusBadge surat={s} />
													</div>
												</td>
												<td className="py-3 align-top">
													<RowActions kepengurusan={kepengurusan} surat={s} onDelete={() => setToDelete(s)} />
												</td>
											</tr>
										))}
									</tbody>
								</table>
							</div>

							{/* Phone: one card per letter */}
							<ul className="flex flex-col gap-3 md:hidden">
								{shown.map((s) => (
									<li key={`${s.nomor}-${s.nomor_surat}`} className="rounded-lg border border-gray-200 p-3">
										<div className="flex flex-wrap items-center gap-2">
											<span className={`font-mono text-sm font-semibold ${s.status === "dibatalkan" ? "text-gray-400 line-through" : "text-gray-900"}`}>
												{s.nomor_surat || "—"}
											</span>
											<StatusBadge surat={s} />
										</div>
										<p className="mt-1 text-sm text-gray-700">{s.perihal || "—"}</p>
										<p className="text-xs text-gray-500">{s.tanggal}</p>
										<div className="mt-3">
											<RowActions kepengurusan={kepengurusan} surat={s} onDelete={() => setToDelete(s)} />
										</div>
									</li>
								))}
							</ul>
						</>
					)}
				</>
			)}

			{toDelete && (
				<DeleteSuratDialog
					kepengurusan={kepengurusan}
					surat={toDelete}
					onCancel={() => setToDelete(null)}
					onDeleted={(result) => {
						setToDelete(null);
						setNotice(deletedMessage(result));
						reload();
					}}
				/>
			)}
		</div>
	);
}

const actionCls =
	"rounded-lg border border-gray-300 px-2.5 py-1.5 text-xs font-medium text-gray-700 hover:border-gray-500";

/** Lihat for every numbered row; Edit and Hapus only for letters the app has the data of. */
function RowActions({
	kepengurusan,
	surat,
	onDelete,
}: {
	kepengurusan: string;
	surat: SuratListItem;
	onDelete: () => void;
}) {
	if (surat.nomor < 1) return null;
	return (
		<div className="flex flex-wrap gap-2 md:justify-end">
			<Link href={suratHref(kepengurusan, surat.nomor)} className={actionCls}>
				Lihat
			</Link>
			{surat.editable && (
				<>
					<Link href={suratEditHref(kepengurusan, surat.nomor)} className={actionCls}>
						Edit
					</Link>
					<button
						type="button"
						onClick={onDelete}
						className={`${actionCls} hover:border-red-400 hover:text-red-600`}
					>
						Hapus
					</button>
				</>
			)}
		</div>
	);
}
