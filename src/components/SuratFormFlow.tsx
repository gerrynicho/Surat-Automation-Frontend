"use client";

import { useEffect, useState } from "react";
import { ENV } from "@/configs/environment";
import ApiKeyModal from "./ApiKeyModal";
import FormStep from "./steps/FormStep";
import DraftReviewStep from "./steps/DraftReviewStep";
import SuccessStep from "./steps/SuccessStep";
import type { CreateSuratResponse, ExportPDFResponse } from "@/types/api";

type Step = "FORM" | "DRAFT_REVIEW" | "SUCCESS";

function hasApiKeyCookie(): boolean {
	if (typeof document === "undefined") return false;
	const key = ENV.TOKEN_KEY.split("/").at(-1) ?? ENV.TOKEN_KEY;
	return document.cookie.split(";").some((c) => c.trim().startsWith(key + "=") || c.trim().includes(ENV.TOKEN_KEY));
}

export default function SuratFormFlow() {
	const [showModal, setShowModal] = useState(false);
	const [step, setStep] = useState<Step>("FORM");
	const [createResult, setCreateResult] = useState<CreateSuratResponse | null>(null);
	const [pdfResult, setPdfResult] = useState<ExportPDFResponse | null>(null);
	const [namaKepengurusan, setNamaKepengurusan] = useState("");

	// Show modal if no API key cookie on first render
	useEffect(() => {
		setShowModal(!hasApiKeyCookie());
	}, []);

	function reset() {
		setStep("FORM");
		setCreateResult(null);
		setPdfResult(null);
		setNamaKepengurusan("");
	}

	const STEP_LABELS: Record<Step, string> = {
		FORM: "Buat Surat",
		DRAFT_REVIEW: "Tinjau Dokumen",
		SUCCESS: "Selesai",
	};

	return (
		<>
			{showModal && <ApiKeyModal onSuccess={() => setShowModal(false)} />}

			<div className="w-full max-w-2xl rounded-2xl bg-white p-8 shadow-sm border border-gray-100">
				{/* Header */}
				<div className="mb-6">
					<h1 className="text-xl font-semibold text-gray-900">
						{STEP_LABELS[step]}
					</h1>
					<div className="mt-3 flex gap-2">
						{(["FORM", "DRAFT_REVIEW", "SUCCESS"] as Step[]).map((s, i) => (
							<div
								key={s}
								className={`h-1 flex-1 rounded-full ${
									i <= (["FORM", "DRAFT_REVIEW", "SUCCESS"] as Step[]).indexOf(step)
										? "bg-gray-900"
										: "bg-gray-200"
								}`}
							/>
						))}
					</div>
				</div>

				{step === "FORM" && (
					<FormStep
						onSuccess={(result) => {
							setCreateResult(result);
							setStep("DRAFT_REVIEW");
						}}
						onKepengurusanChange={setNamaKepengurusan}
					/>
				)}

				{step === "DRAFT_REVIEW" && createResult && (
					<DraftReviewStep
						result={createResult}
						namaKepengurusan={namaKepengurusan}
						onApprove={(pdf) => {
							setPdfResult(pdf);
							setStep("SUCCESS");
						}}
						onReject={reset}
					/>
				)}

				{step === "SUCCESS" && pdfResult && (
					<SuccessStep pdf={pdfResult} onReset={reset} />
				)}
			</div>
		</>
	);
}
