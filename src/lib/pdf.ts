/**
 * Turns a base64 PDF from the backend into a blob URL an <iframe> can show.
 * The caller owns the URL and must release it with `URL.revokeObjectURL`.
 */
export function pdfBlobUrl(base64: string): string {
	const bytes = Uint8Array.from(atob(base64), (c) => c.charCodeAt(0));
	return URL.createObjectURL(new Blob([bytes], { type: "application/pdf" }));
}
