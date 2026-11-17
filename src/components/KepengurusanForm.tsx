"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
	getKepengurusanDetail,
	getKepengurusanList,
	saveKepengurusan,
} from "@/services/api/useKepengurusan";
import { errorMessage } from "@/lib/errors";
import { kepengurusanCache } from "@/lib/kepengurusanCache";
import type {
	ImageSlot,
	KepengurusanDetailResponse,
	KepengurusanImage,
	SaveKepengurusanResponse,
} from "@/types/api";

const NEW = "__new__";
const MAX_IMAGE_BYTES = 4 * 1024 * 1024;

const IMAGE_FIELDS: { slot: ImageSlot; label: string; hint: string }[] = [
	{
		slot: "ttd",
		label: "Tanda tangan Ketua",
		hint: "Foto atau scan tanda tangan dengan latar putih atau transparan.",
	},
	{
		slot: "header",
		label: "Kop surat (header)",
		hint: "Satu gambar selebar kertas. Ditempel di bagian paling atas setiap halaman.",
	},
	{
		slot: "footer",
		label: "Footer",
		hint: "Opsional. Satu gambar selebar kertas, ditempel di bagian paling bawah setiap halaman.",
	},
	{
		slot: "stempel",
		label: "Stempel",
		hint: "Opsional. Kalau dikosongkan, stempel TPKB bersama yang dipakai.",
	},
];

type Images = Record<ImageSlot, KepengurusanImage | null>;
type Picked = Partial<Record<ImageSlot, { file: File; url: string }>>;

const NO_IMAGES: Images = { ttd: null, header: null, footer: null, stempel: null };

export default function KepengurusanForm() {
	const [list, setList] = useState<string[]>(kepengurusanCache.get() ?? []);
	const [loadingList, setLoadingList] = useState(kepengurusanCache.get() === null);

	const [selected, setSelected] = useState(NEW);
	const [loadingDetail, setLoadingDetail] = useState(false);
	const [current, setCurrent] = useState<Images>(NO_IMAGES);

	const [nama, setNama] = useState("");
	const [jabatan, setJabatan] = useState("");
	const [ketuaNama, setKetuaNama] = useState("");
	const [ketuaNrp, setKetuaNrp] = useState("");
	const [picked, setPicked] = useState<Picked>({});
	// Changing the key remounts the file inputs, which is how they are cleared.
	const [fileInputKey, setFileInputKey] = useState(0);

	const [saving, setSaving] = useState(false);
	const [error, setError] = useState("");
	const [saved, setSaved] = useState<SaveKepengurusanResponse | null>(null);

	const isNew = selected === NEW;

	useEffect(() => {
		if (kepengurusanCache.get() !== null) return;
		getKepengurusanList().then((res) => {
			if (res.OK) {
				const names = (res.Kind as { kepengurusan: string[] }).kepengurusan;
				kepengurusanCache.set(names);
				setList(names);
			} else {
				setError(errorMessage(res.Kind, "Daftar kepengurusan gagal dimuat. Muat ulang halaman ini."));
			}
			setLoadingList(false);
		});
	}, []);

	function clearPicked() {
		Object.values(picked).forEach((p) => p && URL.revokeObjectURL(p.url));
		setPicked({});
		setFileInputKey((k) => k + 1);
	}

	function applyDetail(detail: KepengurusanDetailResponse) {
		setJabatan(detail.config?.jabatan ?? "");
		setKetuaNama(detail.config?.ketua_nama ?? "");
		setKetuaNrp(detail.config?.ketua_nrp ?? "");
		setCurrent(detail.images);
	}

	async function loadDetail(name: string) {
		setLoadingDetail(true);
		const res = await getKepengurusanDetail(name);
		setLoadingDetail(false);
		if (res.OK) {
			applyDetail(res.Kind as KepengurusanDetailResponse);
		} else {
			setError(errorMessage(res.Kind, "Data kepengurusan gagal dimuat."));
		}
	}

	async function handleSelect(value: string) {
		setSelected(value);
		setError("");
		setSaved(null);
		clearPicked();
		setNama("");
		setJabatan("");
		setKetuaNama("");
		setKetuaNrp("");
		setCurrent(NO_IMAGES);
		if (value !== NEW) await loadDetail(value);
	}

	function handleFile(slot: ImageSlot, label: string, file: File | undefined) {
		setError("");
		const previous = picked[slot];
		if (previous) URL.revokeObjectURL(previous.url);

		if (!file) {
			setPicked((p) => ({ ...p, [slot]: undefined }));
			return;
		}
		if (!["image/png", "image/jpeg"].includes(file.type)) {
			setError(`${label}: gambar harus berformat PNG atau JPG.`);
			setPicked((p) => ({ ...p, [slot]: undefined }));
			return;
		}
		if (file.size > MAX_IMAGE_BYTES) {
			setError(`${label}: ukuran gambar maksimal 4 MB.`);
			setPicked((p) => ({ ...p, [slot]: undefined }));
			return;
		}
		setPicked((p) => ({ ...p, [slot]: { file, url: URL.createObjectURL(file) } }));
	}

	async function handleSubmit(e: React.FormEvent) {
		e.preventDefault();
		setError("");
		setSaved(null);

		const name = isNew ? nama.trim() : selected;
		if (isNew && list.includes(name)) {
			setError(`Kepengurusan "${name}" sudah ada. Pilih dari daftar di atas untuk mengubahnya.`);
			return;
		}
		if (isNew && !picked.ttd) {
			setError("Tanda tangan Ketua wajib diunggah untuk kepengurusan baru.");
			return;
		}

		const body = new FormData();
		body.set("nama", name);
		body.set("jabatan", jabatan.trim());
		body.set("ketua_nama", ketuaNama.trim());
		body.set("ketua_nrp", ketuaNrp.trim());
		body.set("is_new", isNew ? "true" : "false");
		for (const { slot } of IMAGE_FIELDS) {
			const p = picked[slot];
			if (p) body.set(slot, p.file);
		}

		setSaving(true);
		const res = await saveKepengurusan(body);
		setSaving(false);
		if (!res.OK) {
			setError(errorMessage(res.Kind, "Gagal menyimpan. Coba lagi."));
			return;
		}

		const result = res.Kind as SaveKepengurusanResponse;
		setSaved(result);
		clearPicked();
		if (result.created) {
			const names = [...list, result.nama];
			kepengurusanCache.set(names);
			setList(names);
			setSelected(result.nama);
			setNama("");
		}
		await loadDetail(result.nama);
	}

	return (
		<form onSubmit={handleSubmit} className="flex flex-col gap-6">
			<p className="text-sm text-gray-600">
				Di sini kamu membuat kepengurusan baru, atau mengganti Ketua, tanda
				tangan, kop surat, dan footer milik kepengurusan yang sudah ada.
			</p>

			<div className="flex flex-col gap-1.5">
				<label htmlFor="kepengurusan" className="text-sm font-medium text-gray-700">
					Kepengurusan
				</label>
				{loadingList ? (
					<div className="w-full rounded-lg border border-gray-200 bg-gray-100 px-3 py-2.5 animate-pulse">
						<div className="h-4 w-48 rounded bg-gray-300" />
					</div>
				) : (
					<select
						id="kepengurusan"
						value={selected}
						onChange={(e) => handleSelect(e.target.value)}
						disabled={saving}
						className={inputCls}
					>
						<option value={NEW}>+ Buat kepengurusan baru</option>
						{list.map((k) => (
							<option key={k} value={k}>
								Ubah: {k}
							</option>
						))}
					</select>
				)}
			</div>

			{saved && (
				<div role="status" className="rounded-lg border border-green-300 bg-green-50 px-4 py-3 text-sm text-green-900">
					<p className="font-medium">
						{saved.created
							? `Kepengurusan "${saved.nama}" berhasil dibuat.`
							: `Perubahan untuk "${saved.nama}" tersimpan.`}
					</p>
					<p className="mt-1">
						{saved.created
							? "Folder, spreadsheet arsip, dan folder Berkas Keluar sudah dibuatkan di Google Drive. "
							: "Surat berikutnya langsung memakai data baru ini. "}
						<Link href="/" className="font-medium underline">
							Buat surat sekarang
						</Link>
					</p>
				</div>
			)}

			{loadingDetail ? (
				<p className="text-sm text-gray-400">Memuat data kepengurusan...</p>
			) : (
				<>
					{isNew && (
						<Field
							id="nama"
							label="Nama kepengurusan"
							hint="Menjadi nama folder di Google Drive dan pilihan saat membuat surat."
						>
							<input
								id="nama"
								type="text"
								value={nama}
								onChange={(e) => setNama(e.target.value)}
								required
								placeholder="cth. TPKB ITS 2026"
								className={inputCls}
							/>
						</Field>
					)}

					<Field
						id="jabatan"
						label="Jabatan penanda tangan"
						hint="Ditulis di bawah “Hormat kami,” pada surat."
					>
						<input
							id="jabatan"
							type="text"
							value={jabatan}
							onChange={(e) => setJabatan(e.target.value)}
							required
							placeholder="cth. Ketua TPKB ITS 2026"
							className={inputCls}
						/>
					</Field>

					<div className="grid gap-4 sm:grid-cols-2">
						<Field id="ketua_nama" label="Nama Ketua">
							<input
								id="ketua_nama"
								type="text"
								value={ketuaNama}
								onChange={(e) => setKetuaNama(e.target.value)}
								required
								placeholder="Nama lengkap"
								className={inputCls}
							/>
						</Field>
						<Field id="ketua_nrp" label="NRP Ketua">
							<input
								id="ketua_nrp"
								type="text"
								inputMode="numeric"
								value={ketuaNrp}
								onChange={(e) => setKetuaNrp(e.target.value)}
								required
								placeholder="cth. 5025231042"
								className={inputCls}
							/>
						</Field>
					</div>

					<div className="flex flex-col gap-4">
						<div>
							<p className="text-sm font-medium text-gray-700">Gambar</p>
							<p className="text-xs text-gray-500">
								PNG atau JPG, maksimal 4 MB per gambar.
								{!isNew && " Kosongkan yang tidak ingin diganti."}
							</p>
						</div>
						{IMAGE_FIELDS.map(({ slot, label, hint }) => {
							const now = current[slot];
							const next = picked[slot];
							const required = isNew && slot === "ttd";
							return (
								<div key={slot} className="rounded-lg border border-gray-200 p-3">
									<label htmlFor={`img-${slot}`} className="text-sm font-medium text-gray-700">
										{label}
										{required && <span className="text-red-600"> (wajib)</span>}
									</label>
									<p className="mb-2 text-xs text-gray-500">{hint}</p>

									{(next || now) && (
										<div className="mb-2 flex items-center gap-3">
											{/* eslint-disable-next-line @next/next/no-img-element -- blob/data URLs, not optimisable */}
											<img
												src={next ? next.url : now!.data_url}
												alt={`${label} ${next ? "yang baru dipilih" : "saat ini"}`}
												className="max-h-20 max-w-[60%] rounded border border-gray-200 bg-white object-contain"
											/>
											<p className="text-xs text-gray-500">
												{next
													? "Gambar baru. Belum tersimpan."
													: now!.source === "default"
														? "Sedang memakai gambar bersama TPKB."
														: "Gambar yang sedang dipakai."}
											</p>
										</div>
									)}
									{!next && !now && !isNew && (
										<p className="mb-2 text-xs text-amber-700">Belum ada gambar.</p>
									)}

									<input
										key={`${slot}-${fileInputKey}`}
										id={`img-${slot}`}
										type="file"
										accept="image/png,image/jpeg"
										onChange={(e) => handleFile(slot, label, e.target.files?.[0])}
										className="block w-full text-sm text-gray-700 file:mr-3 file:rounded-lg file:border file:border-gray-300 file:bg-white file:px-3 file:py-1.5 file:text-sm file:text-gray-700"
									/>
								</div>
							);
						})}
					</div>

					{error && (
						<p role="alert" className="text-sm text-red-600">
							{error}
						</p>
					)}

					<button
						type="submit"
						disabled={saving}
						className="rounded-lg bg-gray-900 px-4 py-2.5 text-sm font-medium text-white disabled:opacity-50"
					>
						{saving
							? "Menyimpan... (bisa sampai 1 menit)"
							: isNew
								? "Buat Kepengurusan"
								: "Simpan Perubahan"}
					</button>
				</>
			)}
		</form>
	);
}

const inputCls =
	"w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm text-gray-900 outline-none focus:border-gray-700 focus:ring-1 focus:ring-gray-700";

function Field({
	id,
	label,
	hint,
	children,
}: {
	id: string;
	label: string;
	hint?: string;
	children: React.ReactNode;
}) {
	return (
		<div className="flex flex-col gap-1.5">
			<label htmlFor={id} className="text-sm font-medium text-gray-700">
				{label}
			</label>
			{children}
			{hint && <p className="text-xs text-gray-500">{hint}</p>}
		</div>
	);
}
