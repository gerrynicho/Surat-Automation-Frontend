"use client";

import { useEffect, useState } from "react";
import { getKepengurusanList } from "@/services/api/useKepengurusan";
import { getLatestNomorSurat } from "@/services/api/useSpreadsheet";
import { createSurat } from "@/services/api/useDocument";
import type {
	CreateSuratRequest,
	CreateSuratResponse,
	Participant,
	SuratMetadataResponse,
} from "@/types/api";

const BULAN_OPTIONS = [
	"I", "II", "III", "IV", "V", "VI",
	"VII", "VIII", "IX", "X", "XI", "XII",
];

interface Props {
	onSuccess: (result: CreateSuratResponse) => void;
	onKepengurusanChange: (name: string) => void;
}

const emptyParticipant = (): Participant => ({ nama: "", nrp: "", jurusan: "" });

export default function FormStep({ onSuccess, onKepengurusanChange }: Props) {
	const [kepengurusanList, setKepengurusanList] = useState<string[]>([]);
	const [latestSurat, setLatestSurat] = useState<SuratMetadataResponse | null>(null);
	const [loadingLatest, setLoadingLatest] = useState(false);
	const [submitting, setSubmitting] = useState(false);
	const [error, setError] = useState("");

	const [form, setForm] = useState<CreateSuratRequest>({
		nama_kepengurusan: "",
		new_name: "",
		metadata: { bulan: "", tanggal_pengajuan: "", perihal: "", kode: "" },
		data: {
			TUJUAN: "",
			ITSORNO: false,
			NAMAKEGIATAN: "",
			HARITANGGAL: "",
			ACARAYANGMINTAIZIN: "",
		},
		participants: [emptyParticipant()],
	});

	useEffect(() => {
		getKepengurusanList().then((res) => {
			if (res.OK) {
				setKepengurusanList((res.Kind as { kepengurusan: string[] }).kepengurusan);
			}
		});
	}, []);

	async function handleKepengurusanChange(name: string) {
		setForm((f) => ({ ...f, nama_kepengurusan: name }));
		onKepengurusanChange(name);
		setLatestSurat(null);
		if (!name) return;
		setLoadingLatest(true);
		const res = await getLatestNomorSurat(name);
		setLoadingLatest(false);
		if (res.OK) setLatestSurat(res.Kind as SuratMetadataResponse);
	}

	function setMeta(field: string, value: string) {
		setForm((f) => ({ ...f, metadata: { ...f.metadata, [field]: value } }));
	}

	function setData(field: string, value: string | boolean) {
		setForm((f) => ({ ...f, data: { ...f.data, [field]: value } }));
	}

	function setParticipant(index: number, field: keyof Participant, value: string) {
		setForm((f) => {
			const participants = [...f.participants];
			participants[index] = { ...participants[index], [field]: value };
			return { ...f, participants };
		});
	}

	function addParticipant() {
		setForm((f) => ({ ...f, participants: [...f.participants, emptyParticipant()] }));
	}

	function removeParticipant(index: number) {
		if (form.participants.length === 1) return;
		setForm((f) => ({
			...f,
			participants: f.participants.filter((_, i) => i !== index),
		}));
	}

	async function handleSubmit(e: React.FormEvent) {
		e.preventDefault();
		setError("");
		setSubmitting(true);
		const res = await createSurat(form);
		setSubmitting(false);
		if (res.OK) {
			onSuccess(res.Kind as CreateSuratResponse);
		} else {
			const kind = res.Kind as { Message?: string; error?: string };
			setError(kind.Message || kind.error || "Terjadi kesalahan.");
		}
	}

	return (
		<form onSubmit={handleSubmit} className="flex flex-col gap-6">
			{/* Kepengurusan */}
			<div className="flex flex-col gap-1.5">
				<label className="text-sm font-medium text-gray-700">Kepengurusan</label>
				<select
					value={form.nama_kepengurusan}
					onChange={(e) => handleKepengurusanChange(e.target.value)}
					required
					className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm text-gray-900 outline-none focus:border-gray-700 focus:ring-1 focus:ring-gray-700"
				>
					<option value="">— Pilih kepengurusan —</option>
					{kepengurusanList.map((k) => (
						<option key={k} value={k}>{k}</option>
					))}
				</select>
			</div>

			{/* Latest surat preview */}
			{loadingLatest && (
				<p className="text-sm text-gray-400">Memuat nomor surat terakhir...</p>
			)}
			{latestSurat && (
				<div className="rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-600">
					<p className="mb-1 font-medium text-gray-800">Surat terakhir</p>
					<p>Nomor: <span className="font-mono font-semibold text-gray-900">{latestSurat.legal}</span></p>
					<p>Perihal: {latestSurat.perihal}</p>
					<p>Tanggal: {latestSurat.tgl}</p>
				</div>
			)}

			{/* Only show the rest of the form once a kepengurusan is selected */}
			{form.nama_kepengurusan && (
				<>
					<Field label="Nama dokumen (new_name)">
						<input
							type="text"
							value={form.new_name}
							onChange={(e) => setForm((f) => ({ ...f, new_name: e.target.value }))}
							required
							placeholder="cth. Surat Izin Baksos - Kevin Hartanto"
							className={inputCls}
						/>
					</Field>

					<div className="grid grid-cols-2 gap-4">
						<Field label="Bulan">
							<select
								value={form.metadata.bulan}
								onChange={(e) => setMeta("bulan", e.target.value)}
								required
								className={inputCls}
							>
								<option value="">—</option>
								{BULAN_OPTIONS.map((b) => (
									<option key={b} value={b}>{b}</option>
								))}
							</select>
						</Field>
						<Field label="Kode surat">
							<input
								type="text"
								value={form.metadata.kode}
								onChange={(e) => setMeta("kode", e.target.value.toUpperCase())}
								required
								maxLength={3}
								placeholder="A"
								className={inputCls}
							/>
						</Field>
					</div>

					<Field label="Tanggal pengajuan">
						<input
							type="text"
							value={form.metadata.tanggal_pengajuan}
							onChange={(e) => setMeta("tanggal_pengajuan", e.target.value)}
							required
							placeholder="23 Juni 2026"
							className={inputCls}
						/>
					</Field>

					<Field label="Perihal">
						<input
							type="text"
							value={form.metadata.perihal}
							onChange={(e) => setMeta("perihal", e.target.value)}
							required
							placeholder="Surat Izin Kegiatan Bakti Sosial TPKB ITS"
							className={inputCls}
						/>
					</Field>

					<Field label="Tujuan surat">
						<input
							type="text"
							value={form.data.TUJUAN}
							onChange={(e) => setData("TUJUAN", e.target.value)}
							required
							placeholder="Wakil Rektor Bidang Kemahasiswaan"
							className={inputCls}
						/>
					</Field>

					<Field label="Ditujukan ke">
						<div className="flex items-center gap-3">
							<label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
								<input
									type="checkbox"
									checked={form.data.ITSORNO}
									onChange={(e) => setData("ITSORNO", e.target.checked)}
									className="h-4 w-4 rounded"
								/>
								ITS (Institut Teknologi Sepuluh Nopember)
							</label>
						</div>
						<p className="mt-1 text-xs text-gray-400">
							{form.data.ITSORNO ? "Institut Teknologi Sepuluh Nopember" : "Di tempat"}
						</p>
					</Field>

					<Field label="Nama kegiatan">
						<input
							type="text"
							value={form.data.NAMAKEGIATAN}
							onChange={(e) => setData("NAMAKEGIATAN", e.target.value)}
							required
							placeholder="Bakti Sosial TPKB ITS 2026"
							className={inputCls}
						/>
					</Field>

					<Field label="Hari / tanggal kegiatan">
						<input
							type="text"
							value={form.data.HARITANGGAL}
							onChange={(e) => setData("HARITANGGAL", e.target.value)}
							required
							placeholder="Senin, 29 Juni 2026"
							className={inputCls}
						/>
					</Field>

					<Field label="Acara yang minta izin">
						<input
							type="text"
							value={form.data.ACARAYANGMINTAIZIN}
							onChange={(e) => setData("ACARAYANGMINTAIZIN", e.target.value)}
							required
							placeholder="Kelas Algoritma Lanjutan"
							className={inputCls}
						/>
					</Field>

					{/* Participants */}
					<div className="flex flex-col gap-3">
						<p className="text-sm font-medium text-gray-700">Peserta</p>
						{form.participants.map((p, i) => (
							<div key={i} className="grid grid-cols-[1fr_7rem_1fr_auto] gap-2">
								<input
									type="text"
									value={p.nama}
									onChange={(e) => setParticipant(i, "nama", e.target.value)}
									required
									placeholder="Nama"
									className={inputCls}
								/>
								<input
									type="text"
									value={p.nrp}
									onChange={(e) => setParticipant(i, "nrp", e.target.value)}
									required
									placeholder="NRP"
									className={inputCls}
								/>
								<input
									type="text"
									value={p.jurusan}
									onChange={(e) => setParticipant(i, "jurusan", e.target.value)}
									required
									placeholder="Jurusan"
									className={inputCls}
								/>
								<button
									type="button"
									onClick={() => removeParticipant(i)}
									disabled={form.participants.length === 1}
									className="rounded-lg border border-gray-300 px-2.5 text-gray-400 disabled:opacity-30 hover:text-red-500"
								>
									✕
								</button>
							</div>
						))}
						<button
							type="button"
							onClick={addParticipant}
							className="self-start rounded-lg border border-dashed border-gray-300 px-3 py-1.5 text-sm text-gray-500 hover:border-gray-500 hover:text-gray-700"
						>
							+ Tambah peserta
						</button>
					</div>

					{error && <p className="text-sm text-red-600">{error}</p>}

					<button
						type="submit"
						disabled={submitting}
						className="rounded-lg bg-gray-900 px-4 py-2.5 text-sm font-medium text-white disabled:opacity-50"
					>
						{submitting ? "Membuat dokumen..." : "Buat Surat"}
					</button>
				</>
			)}
		</form>
	);
}

const inputCls =
	"w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm text-gray-900 outline-none focus:border-gray-700 focus:ring-1 focus:ring-gray-700";

function Field({
	label,
	children,
}: {
	label: string;
	children: React.ReactNode;
}) {
	return (
		<div className="flex flex-col gap-1.5">
			<label className="text-sm font-medium text-gray-700">{label}</label>
			{children}
		</div>
	);
}
