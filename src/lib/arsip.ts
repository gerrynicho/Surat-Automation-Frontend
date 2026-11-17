// Links and URL parsing for the Arsip Surat pages. No React here, so both
// server pages and client components can use it.
//
//   /arsip?k=<kepengurusan>                 list
//   /arsip/<nomor>?k=<kepengurusan>         one letter
//   /arsip/<nomor>/edit?k=<kepengurusan>    edit it
//
// <nomor> is the running number (column NO. of the arsip), which is only unique
// inside one kepengurusan. That is why every link carries `k`.

export function arsipHref(kepengurusan: string): string {
	return kepengurusan ? `/arsip?k=${encodeURIComponent(kepengurusan)}` : "/arsip";
}

export function suratHref(kepengurusan: string, nomor: number): string {
	return `/arsip/${nomor}?k=${encodeURIComponent(kepengurusan)}`;
}

export function suratEditHref(kepengurusan: string, nomor: number): string {
	return `/arsip/${nomor}/edit?k=${encodeURIComponent(kepengurusan)}`;
}

/** A search parameter may arrive more than once; the first value is the one used. */
export function firstParam(value: string | string[] | undefined): string {
	return (Array.isArray(value) ? value[0] : value) ?? "";
}

/** The `[nomor]` route segment as a positive integer, or null if it is anything else. */
export function parseNomor(segment: string): number | null {
	if (!/^\d{1,9}$/.test(segment)) return null;
	const nomor = Number(segment);
	return nomor > 0 ? nomor : null;
}

const UPDATED_AT_FORMAT = new Intl.DateTimeFormat("id-ID", {
	dateStyle: "medium",
	timeStyle: "short",
	timeZone: "Asia/Jakarta",
});

/** "2026-06-23T03:10:00.000Z" → "23 Jun 2026, 10.10". Empty or unreadable input gives "". */
export function formatUpdatedAt(iso: string): string {
	const date = new Date(iso);
	if (!iso || Number.isNaN(date.getTime())) return "";
	return UPDATED_AT_FORMAT.format(date);
}
