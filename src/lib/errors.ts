/**
 * Pulls a readable message out of a failed API response.
 *
 * The FastAPI backend reports errors as `{ detail: "..." }`; older shapes
 * (`Message`, `error`) are still accepted. `fallback` is only used when the
 * response carries no message at all.
 */
export function errorMessage(kind: unknown, fallback: string): string {
	if (typeof kind === "string" && kind.trim()) return kind;
	if (!kind || typeof kind !== "object") return fallback;

	const body = kind as { detail?: unknown; Message?: unknown; error?: unknown };

	if (typeof body.detail === "string" && body.detail.trim()) return body.detail;
	if (Array.isArray(body.detail)) {
		const parts = body.detail
			.map((d) => (d && typeof d === "object" && "msg" in d ? String(d.msg) : ""))
			.filter(Boolean);
		if (parts.length > 0) return parts.join("; ");
	}
	if (typeof body.Message === "string" && body.Message.trim()) return body.Message;
	if (typeof body.error === "string" && body.error.trim()) return body.error;

	return fallback;
}
