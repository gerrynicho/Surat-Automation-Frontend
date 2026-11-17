"use client";

import { useState } from "react";
import PageShell from "./PageShell";
import FormStep from "./steps/FormStep";
import DraftReviewStep from "./steps/DraftReviewStep";
import SuccessStep from "./steps/SuccessStep";
import type {
	CreateSuratRequest,
	FinalizeSuratResponse,
	PreviewSuratResponse,
} from "@/types/api";

type Step = "FORM" | "DRAFT_REVIEW" | "SUCCESS";
const STEPS: Step[] = ["FORM", "DRAFT_REVIEW", "SUCCESS"];

const STEP_LABELS: Record<Step, string> = {
	FORM: "Buat Surat",
	DRAFT_REVIEW: "Tinjau Surat",
	SUCCESS: "Selesai",
};

function pdfBlobUrl(base64: string): string {
	const bytes = Uint8Array.from(atob(base64), (c) => c.charCodeAt(0));
	return URL.createObjectURL(new Blob([bytes], { type: "application/pdf" }));
}

export default function SuratFormFlow({ hasKey }: { hasKey: boolean }) {
	const [step, setStep] = useState<Step>("FORM");
	// Kept while reviewing, so "Perbaiki isian" returns to a filled-in form.
	const [form, setForm] = useState<CreateSuratRequest | null>(null);
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

	return (
		<PageShell title={STEP_LABELS[step]} hasKey={hasKey}>
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

			{step === "FORM" && (
				<FormStep
					initialForm={form}
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
					onApprove={(result) => {
						dropPreview();
						setFinalResult(result);
						setStep("SUCCESS");
					}}
					onReject={backToForm}
				/>
			)}

			{step === "SUCCESS" && finalResult && (
				<SuccessStep result={finalResult} onReset={startOver} />
			)}
		</PageShell>
	);
}
