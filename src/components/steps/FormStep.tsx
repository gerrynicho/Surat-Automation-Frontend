"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { getKepengurusanList } from "@/services/api/useKepengurusan";
import { getLatestNomorSurat } from "@/services/api/useSpreadsheet";
import { previewSurat } from "@/services/api/useDocument";
import { previewSuratEdit } from "@/services/api/useArsip";
import { errorMessage } from "@/lib/errors";
import { kepengurusanCache } from "@/lib/kepengurusanCache";
import type {
	CreateSuratRequest,
	Participant,
	PreviewSuratResponse,
	SuratMetadataResponse,
} from "@/types/api";

const BULAN_OPTIONS = [
	"I", "II", "III", "IV", "V", "VI",
	"VII", "VIII", "IX", "X", "XI", "XII",
];

const MONTH_NAME_TO_ROMAN: Record<string, string> = {
	januari: "I", februari: "II", maret: "III", april: "IV",
	mei: "V", juni: "VI", juli: "VII", agustus: "VIII",
	september: "IX", oktober: "X", november: "XI", desember: "XII",
};

const ROMAN_TO_MONTH_NAME: Record<string, string> = Object.fromEntries(
	Object.entries(MONTH_NAME_TO_ROMAN).map(([name, roman]) => [roman, name])
);

function detectMonthFromTanggal(tanggal: string): string | null {
	const lower = tanggal.toLowerCase();
	for (const [name, roman] of Object.entries(MONTH_NAME_TO_ROMAN)) {
		if (lower.includes(name)) return roman;
	}
	return null;
}

// ── Defaults for a new letter ───────────────────────────────────────────────
// Change these to change what the form starts with. Based on the 2026 arsip,
// where every surat izin used kode B (luar TPKB, masih di ITS).
const DEFAULTS = {
	kode: "B",
	tujuan: "Direktorat Kemahasiswaan",
	its: true,
};

const NAMA_BULAN = [
	"Januari", "Februari", "Maret", "April", "Mei", "Juni",
	"Juli", "Agustus", "September", "Oktober", "November", "Desember",
];
const NAMA_HARI = ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];

/** Today's date in Surabaya, written the way the letters write it. */
function today() {
	// en-CA formats as YYYY-MM-DD, which is easy to split.
	const [y, m, d] = new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Jakarta" })
		.format(new Date())
		.split("-")
		.map(Number);
	const hari = NAMA_HARI[new Date(Date.UTC(y, m - 1, d)).getUTCDay()];
	const tanggal = `${d} ${NAMA_BULAN[m - 1]} ${y}`;
	return { tanggal, hariTanggal: `${hari}, ${tanggal}`, bulan: BULAN_OPTIONS[m - 1] };
}

// "Perihal" and "Nama dokumen" fill themselves in from the kegiatan and the
// participants, following the naming used in the arsip, until the user edits them.
function firstNama(f: CreateSuratRequest): string {
	return f.participants[0]?.nama.trim() ?? "";
}

function autoPerihal(f: CreateSuratRequest): string {
	const nama = firstNama(f);
	const more = f.participants.filter((p) => p.nama.trim()).length > 1 ? " dkk." : "";
	return nama ? `Surat Izin Kegiatan -  ${nama}${more}` : "Surat Izin Kegiatan";
}

function autoNamaDokumen(f: CreateSuratRequest): string {
	const kegiatan = f.data.NAMAKEGIATAN.trim();
	return [kegiatan ? `Surat Izin ${kegiatan}` : "Surat Izin", firstNama(f)]
		.filter(Boolean)
		.join(" - ");
}

interface Props {
	/**
	 * Values to start from: the form the user came back from the review step
	 * with, or (when editing) the stored data of the letter.
	 */
	initialForm: CreateSuratRequest | null;
	/**
	 * Set when an existing letter is being edited. The kepengurusan is then
	 * fixed, and the preview keeps the running number of the letter.
	 */
	edit?: { nomor: number; nomorSurat: string };
	onSuccess: (form: CreateSuratRequest, preview: PreviewSuratResponse) => void;
}

const emptyParticipant = (): Participant => ({ nama: "", nrp: "", jurusan: "" });

const emptyForm = (): CreateSuratRequest => {
	const now = today();
	return {
		nama_kepengurusan: "",
		new_name: "",
		metadata: { bulan: now.bulan, tanggal_pengajuan: now.tanggal, perihal: "", kode: DEFAULTS.kode },
		data: {
			TUJUAN: DEFAULTS.tujuan,
			ITSORNO: DEFAULTS.its,
			NAMAKEGIATAN: "",
			HARITANGGAL: now.hariTanggal,
			ACARAYANGMINTAIZIN: "",
		},
		participants: [emptyParticipant()],
	};
};

export default function FormStep({ initialForm, edit, onSuccess }: Props) {
	const editing = Boolean(edit);
	const [kepengurusanList, setKepengurusanList] = useState<string[]>(kepengurusanCache.get() ?? []);
	const [loadingKepengurusan, setLoadingKepengurusan] = useState(kepengurusanCache.get() === null);
	const [listError, setListError] = useState("");
	const [latestSurat, setLatestSurat] = useState<SuratMetadataResponse | null>(null);
	// The latest surat only matters for a new letter, which gets the number after it.
	const [loadingLatest, setLoadingLatest] = useState(Boolean(initialForm?.nama_kepengurusan) && !editing);
	const [submitting, setSubmitting] = useState(false);
	const [error, setError] = useState("");
	const [bulanError, setBulanError] = useState("");

	const [form, setForm] = useState<CreateSuratRequest>(() => initialForm ?? emptyForm());
	// While true, the field follows the kegiatan and participants. Typing in it turns this off.
	// Coming back from review, a value that still matches the automatic one stays automatic.
	const [autoNama, setAutoNama] = useState(() => !initialForm || initialForm.new_name === autoNamaDokumen(initialForm));
	const [autoPer, setAutoPer] = useState(() => !initialForm || initialForm.metadata.perihal === autoPerihal(initialForm));

	const namaDokumen = autoNama ? autoNamaDokumen(form) : form.new_name;
	const perihal = autoPer ? autoPerihal(form) : form.metadata.perihal;

	useEffect(() => {
		// The picker is not shown while editing, so the list is not needed.
		if (editing || kepengurusanCache.get() !== null) return;
		getKepengurusanList().then((res) => {
			if (res.OK) {
				const list = (res.Kind as { kepengurusan: string[] }).kepengurusan;
				kepengurusanCache.set(list);
				setKepengurusanList(list);
			} else {
				setListError(errorMessage(res.Kind, "Daftar kepengurusan gagal dimuat. Muat ulang halaman ini."));
			}
			setLoadingKepengurusan(false);
		});
	}, [editing]);

	// Coming back from the review step: show the latest surat for the kept kepengurusan again.
	const initialKepengurusan = initialForm?.nama_kepengurusan ?? "";
	useEffect(() => {
		if (!initialKepengurusan || editing) return;
		getLatestNomorSurat(initialKepengurusan).then((res) => {
			setLoadingLatest(false);
			if (res.OK) setLatestSurat(res.Kind as SuratMetadataResponse);
		});
	}, [initialKepengurusan, editing]);

	async function handleKepengurusanChange(name: string) {
		setForm((f) => ({ ...f, nama_kepengurusan: name }));
		setLatestSurat(null);
		if (!name) return;
		setLoadingLatest(true);
		const res = await getLatestNomorSurat(name);
		setLoadingLatest(false);
		if (res.OK) setLatestSurat(res.Kind as SuratMetadataResponse);
	}

	function setMeta(field: string, value: string) {
		setForm((f) => {
			const next = { ...f, metadata: { ...f.metadata, [field]: value } };
			if (field === "tanggal_pengajuan") {
				const detected = detectMonthFromTanggal(value);
				if (detected) {
					next.metadata.bulan = detected;
					setBulanError("");
				}
			}
			if (field === "bulan") {
				const detected = detectMonthFromTanggal(f.metadata.tanggal_pengajuan);
				if (detected && detected !== value) {
					const expected = ROMAN_TO_MONTH_NAME[detected];
					setBulanError(`Bulan tidak sesuai dengan tanggal pengajuan (seharusnya ${value === "" ? "—" : value} → ${expected})`);
				} else {
					setBulanError("");
				}
			}
			return next;
		});
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
		const detected = detectMonthFromTanggal(form.metadata.tanggal_pengajuan);
		if (detected && form.metadata.bulan && detected !== form.metadata.bulan) {
			const expected = ROMAN_TO_MONTH_NAME[detected];
			setBulanError(`Bulan tidak sesuai — tanggal pengajuan mengandung "${expected}" tapi bulan dipilih ${form.metadata.bulan}`);
			return;
		}
		const toSend: CreateSuratRequest = {
			...form,
			new_name: namaDokumen,
			metadata: { ...form.metadata, perihal },
		};
		setSubmitting(true);
		const res = edit ? await previewSuratEdit(edit.nomor, toSend) : await previewSurat(toSend);
		setSubmitting(false);
		if (res.OK) {
			onSuccess(toSend, res.Kind as PreviewSuratResponse);
		} else {
			setError(errorMessage(res.Kind, "Surat gagal dibuat. Coba lagi."));
		}
	}

	return (
		<form onSubmit={handleSubmit} className="flex flex-col gap-6">
			{/* Kepengurusan */}
			<div className="flex flex-col gap-1.5">
				<label className="text-sm font-medium text-gray-700">Kepengurusan</label>
				{edit ? (
					<>
						<p className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm text-gray-900">
							{form.nama_kepengurusan}
						</p>
						<div className="mt-1.5 rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-600">
							<p>
								Mengubah surat{" "}
								<span className="font-mono font-semibold text-gray-900">{edit.nomorSurat}</span>
							</p>
							<p className="mt-1 text-xs text-gray-500">
								Nomor urut dan kepengurusannya tetap. Kalau kode surat diganti, hanya huruf
								kode di nomor surat yang ikut berubah.
							</p>
						</div>
					</>
				) : loadingKepengurusan ? (
					<div className="w-full rounded-lg border border-gray-200 bg-gray-100 px-3 py-2.5 animate-pulse">
						<div className="h-4 w-48 rounded bg-gray-300" />
					</div>
				) : (
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
				)}
				{listError && <p className="text-sm text-red-600">{listError}</p>}
				{!edit && (
					<p className="text-xs text-gray-500">
						Kepengurusanmu belum ada di daftar?{" "}
						<Link href="/kepengurusan" className="underline hover:text-gray-800">
							Buat di Kelola Kepengurusan
						</Link>
						. Bingung cara mengisinya?{" "}
						<Link href="/panduan" className="underline hover:text-gray-800">
							Baca Panduan
						</Link>
						.
					</p>
				)}
			</div>

			{/* Latest surat preview */}
			{loadingLatest && (
				<p className="text-sm text-gray-400">Memuat nomor surat terakhir...</p>
			)}
			{latestSurat && (
				<div className="rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-600">
					<p className="mb-1 font-medium text-gray-800">Surat terakhir</p>
					{latestSurat.legal ? (
						<>
							<p>Nomor: <span className="font-mono font-semibold text-gray-900">{latestSurat.legal}</span></p>
							<p>Perihal: {latestSurat.perihal}</p>
							<p>Tanggal: {latestSurat.tgl}</p>
						</>
					) : (
						<p>Belum ada surat. Surat pertama akan bernomor 001.</p>
					)}
				</div>
			)}

			{/* Only show the rest of the form once a kepengurusan is selected */}
			{form.nama_kepengurusan && (
				<>
					<Field label="Nama dokumen" hint="Menjadi nama file PDF di Google Drive.">
						<input
							type="text"
							value={namaDokumen}
							onChange={(e) => {
								setAutoNama(false);
								setForm((f) => ({ ...f, new_name: e.target.value }));
							}}
							required
							placeholder="cth. Surat Izin Baksos - Kevin Hartanto"
							className={inputCls}
						/>
						<AutoNote auto={autoNama} onReset={() => setAutoNama(true)} />
					</Field>

					<div className="grid grid-cols-2 gap-4">
						<Field label="Bulan" hint="Bulan pengajuan dalam angka Romawi. Terisi sendiri dari tanggal pengajuan.">
							<select
								value={form.metadata.bulan}
								onChange={(e) => setMeta("bulan", e.target.value)}
								required
								className={`${inputCls}${bulanError ? " border-red-400 focus:border-red-500 focus:ring-red-500" : ""}`}
							>
								<option value="">—</option>
								{BULAN_OPTIONS.map((b) => (
									<option key={b} value={b}>{b}</option>
								))}
							</select>
							{bulanError && <p className="text-xs text-red-500">{bulanError}</p>}
						</Field>
						<Field label="Kode surat" hint="A = tujuan internal TPKB, B = luar TPKB tapi masih ITS, C = luar ITS.">
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

					<Field label="Tanggal pengajuan" hint="Tanggal surat, ditulis lengkap. Muncul di kanan atas surat.">
						<input
							type="text"
							value={form.metadata.tanggal_pengajuan}
							onChange={(e) => setMeta("tanggal_pengajuan", e.target.value)}
							required
							placeholder="23 Juni 2026"
							className={inputCls}
						/>
					</Field>

					<Field label="Perihal" hint="Keterangan surat untuk catatan arsip di spreadsheet. Tidak dicetak di surat.">
						<input
							type="text"
							value={perihal}
							onChange={(e) => {
								setAutoPer(false);
								setMeta("perihal", e.target.value);
							}}
							required
							placeholder="Surat Izin Kegiatan Kevin Hartanto"
							className={inputCls}
						/>
						<AutoNote auto={autoPer} onReset={() => setAutoPer(true)} />
					</Field>

					<Field label="Tujuan surat" hint="Jabatan atau nama penerima, ditulis setelah &ldquo;Yth.&rdquo;">
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
						<p className="mt-1 text-xs text-gray-500">
							Baris di bawah nama penerima akan tertulis:{" "}
							<span className="font-medium">
								{form.data.ITSORNO ? "Institut Teknologi Sepuluh Nopember" : "Di tempat"}
							</span>
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

					<Field
						label="Hari / tanggal kegiatan"
						hint={edit ? undefined : "Terisi hari ini sebagai contoh. Ganti dengan hari dan tanggal kegiatan."}
					>
						<input
							type="text"
							value={form.data.HARITANGGAL}
							onChange={(e) => setData("HARITANGGAL", e.target.value)}
							required
							placeholder="Senin, 29 Juni 2026"
							className={inputCls}
						/>
					</Field>

					<Field label="Acara yang minta izin" hint="Kelas atau acara yang tidak bisa dihadiri peserta.">

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
							<div key={i} className="grid grid-cols-[1fr_auto] gap-2 sm:grid-cols-[1fr_7rem_1fr_auto]">
								<div className="flex flex-col gap-2 sm:contents">
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
								</div>
								<button
									type="button"
									onClick={() => removeParticipant(i)}
									disabled={form.participants.length === 1}
									className="self-start rounded-lg border border-gray-300 px-2.5 py-2.5 text-gray-400 disabled:opacity-30 hover:text-red-500"
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

					{error && <p role="alert" className="text-sm text-red-600">{error}</p>}

					<button
						type="submit"
						disabled={submitting}
						className="rounded-lg bg-gray-900 px-4 py-2.5 text-sm font-medium text-white disabled:opacity-50"
					>
						{submitting ? "Menyusun surat..." : "Lihat Pratinjau Surat"}
					</button>
					<p className="-mt-3 text-xs text-gray-500">
						{edit
							? "Perubahan belum disimpan di langkah ini. Kamu bisa memeriksa suratnya dulu."
							: "Belum ada yang disimpan di langkah ini. Kamu bisa memeriksa suratnya dulu."}
					</p>
				</>
			)}
		</form>
	);
}

/** Says whether an automatic field is still automatic, with a way back after editing it. */
function AutoNote({ auto, onReset }: { auto: boolean; onReset: () => void }) {
	if (auto) {
		return (
			<p className="text-xs text-gray-500">
				Terisi otomatis dari nama kegiatan dan peserta. Boleh diubah.
			</p>
		);
	}
	return (
		<button
			type="button"
			onClick={onReset}
			className="self-start text-xs text-gray-500 underline hover:text-gray-800"
		>
			Isi otomatis lagi
		</button>
	);
}

const inputCls =
	"w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm text-gray-900 outline-none focus:border-gray-700 focus:ring-1 focus:ring-gray-700";

function Field({
	label,
	hint,
	children,
}: {
	label: string;
	hint?: string;
	children: React.ReactNode;
}) {
	return (
		<div className="flex flex-col gap-1.5">
			<label className="text-sm font-medium text-gray-700">{label}</label>
			{children}
			{hint && <p className="text-xs text-gray-500">{hint}</p>}
		</div>
	);
}
