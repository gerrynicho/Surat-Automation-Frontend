// The kepengurusan list rarely changes, so it is fetched once per page load.
// "Kelola Kepengurusan" clears it after creating a new one.
let cached: string[] | null = null;

export const kepengurusanCache = {
	get: (): string[] | null => cached,
	set: (list: string[]) => {
		cached = list;
	},
	clear: () => {
		cached = null;
	},
};
