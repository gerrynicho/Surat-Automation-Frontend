"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import PageShell from "./PageShell";
import FormStep from "./steps/FormStep";
import DraftReviewStep from "./steps/DraftReviewStep";
import SuccessStep from "./steps/SuccessStep";
import { getSurat } from "@/services/api/useArsip";
import { arsipHref, suratHref } from "@/lib/arsip";
import { errorMessage } from "@/lib/errors";
import { pdfBlobUrl } from "@/lib/pdf";
import type {
	CreateSuratRequest,
	FinalizeSuratResponse,
	PreviewSuratResponse,
	SuratDetailResponse,
} from "@/types/api";

type Step = "FORM" | "DRAFT_REVIEW" | "SUCCESS";
const STEPS: Step[] = ["FORM", "DRAFT_REVIEW", "SUCCESS"];

const STEP_LABELS: Record<Step, string> = {
	FORM: "Buat Surat",
	DRAFT_REVIEW: "Tinjau Surat",
	SUCCESS: "Selesai",
};
const EDIT_STEP_LABELS: Record<Step, string> = {
	FORM: "Ubah Surat",
	DRAFT_REVIEW: "Tinjau Perubahan",
	SUCCESS: "Selesai",
};

interface Props {
	hasKey: boolean;
	/**
	 * Edit an existing letter instead of making a new one: the form starts from
	 * the stored data, and saving replaces the letter while keeping its number.
	 */
	edit?: { kepengurusan: string; nomor: number };
}

export default function SuratFormFlow({ hasKey, edit }: Props) {
	const [step, setStep] = useState<Step>("FORM");
	// Kept while reviewing, so "Perbaiki isian" returns to a filled-in form.
	// When editing, it starts as the stored data of the letter.
	const [form, setForm] = useState<CreateSuratRequest | null>(null);
	// Editing only: the number the letter had when it was opened.
	const [originalNomorSurat, setOriginalNomorSurat] = useState("");
	const [preview, setPreview] = useState<PreviewSuratResponse | null>(null);
	const [pdfUrl, setPdfUrl] = useState<string | null>(null);
	const [finalResult, setFinalResult] = useState<FinalizeSuratResponse | null>(null);

	function dropPreview() {
		if (pdfUrl) URL.revokeObjectURL(pdfUrl);
		setPdfUrl(null);
		setPreview(null);
	}

	function backToForm() {
		dropPreview();
		setStep("FORM");
	}

	function startOver() {
		dropPreview();
		setForm(null);
		setFinalResult(null);
		setStep("FORM");
	}

	const labels = edit ? EDIT_STEP_LABELS : STEP_LABELS;
	// Editing: the form cannot be shown until the letter has been fetched.
	const waitingForSurat = Boolean(edit) && form === null;

	return (
		<PageShell title={labels[step]} hasKey={hasKey}>
			<div className="-mt-3 mb-6 flex gap-2">
				{STEPS.map((s, i) => (
					<div
						key={s}
						className={`h-1 flex-1 rounded-full ${
							i <= STEPS.indexOf(step) ? "bg-gray-900" : "bg-gray-200"
						}`}
					/>
				))}
			</div>

			{step === "FORM" && edit && waitingForSurat && (
				<EditLoader
					kepengurusan={edit.kepengurusan}
					nomor={edit.nomor}
					onLoaded={(surat, stored) => {
						setOriginalNomorSurat(surat.nomor_surat);
						setForm(stored);
					}}
				/>
			)}

			{step === "FORM" && !waitingForSurat && (
				<FormStep
					initialForm={form}
					edit={edit ? { nomor: edit.nomor, nomorSurat: originalNomorSurat } : undefined}
					onSuccess={(submitted, result) => {
						setForm(submitted);
						setPreview(result);
						setPdfUrl(pdfBlobUrl(result.pdf_base64));
						setStep("DRAFT_REVIEW");
					}}
				/>
			)}

			{step === "DRAFT_REVIEW" && form && preview && pdfUrl && (
				<DraftReviewStep
					form={form}
					preview={preview}
					pdfUrl={pdfUrl}
					edit={edit ? { nomor: edit.nomor, nomorSurat: originalNomorSurat } : undefined}
					onApprove={(result) => {
						dropPreview();
						setFinalResult(result);
						setStep("SUCCESS");
					}}
					onReject={backToForm}
				/>
			)}

			{step === "SUCCESS" && finalResult && form && (
				<SuccessStep
					result={finalResult}
					kepengurusan={form.nama_kepengurusan}
					editedNomor={edit?.nomor}
					onReset={startOver}
				/>
			)}
		</PageShell>
	);
}

/** Fetches the letter to edit. Lives inside PageShell, so it only runs once the password is in. */
function EditLoader({
	kepengurusan,
	nomor,
	onLoaded,
}: {
	kepengurusan: string;
	nomor: number;
	onLoaded: (surat: SuratDetailResponse, stored: CreateSuratRequest) => void;
}) {
	const [error, setError] = useState("");

	useEffect(() => {
		let stale = false;
		getSurat(kepengurusan, nomor).then((res) => {
			if (stale) return;
			if (!res.OK) {
				setError(errorMessage(res.Kind, "Surat gagal dimuat. Coba lagi."));
				return;
			}
			const surat = res.Kind as SuratDetailResponse;
			if (surat.status === "dibatalkan") {
				setError("Surat ini sudah dibatalkan, jadi tidak bisa diubah.");
			} else if (!surat.editable || !surat.form) {
				setError(
					"Data surat ini tidak tersimpan di aplikasi, jadi tidak bisa diubah dari sini. Ubah langsung di spreadsheet arsip.",
				);
			} else {
				onLoaded(surat, surat.form);
			}
		});
		return () => {
			stale = true;
		};
		// onLoaded is recreated on every render of the parent; the letter is fetched once.
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [kepengurusan, nomor]);

	if (error) {
		return (
			<div className="flex flex-col items-start gap-3 text-sm">
				<p role="alert" className="text-red-600">{error}</p>
				<div className="flex flex-wrap gap-3">
					<Link href={suratHref(kepengurusan, nomor)} className="underline hover:text-gray-900">
						Lihat surat
					</Link>
					<Link href={arsipHref(kepengurusan)} className="underline hover:text-gray-900">
						Kembali ke Arsip Surat
					</Link>
				</div>
			</div>
		);
	}

	return (
		<div role="status" aria-label="Memuat surat" className="flex flex-col gap-3">
			{[0, 1, 2, 3].map((i) => (
				<div key={i} className="h-10 animate-pulse rounded-lg bg-gray-100" />
			))}
		</div>
	);
}
