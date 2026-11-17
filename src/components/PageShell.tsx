"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import ApiKeyModal from "./ApiKeyModal";

const NAV = [
	{ href: "/", label: "Buat Surat" },
	{ href: "/kepengurusan", label: "Kelola Kepengurusan" },
	{ href: "/panduan", label: "Panduan" },
];

interface Props {
	title: string;
	/**
	 * Whether the password cookie is already set, read on the server by the page
	 * (see `hasApiKey`). Leave it out on pages that do not call the API.
	 */
	hasKey?: boolean;
	children: React.ReactNode;
}

/** Navigation, page card and (when needed) the password prompt shared by every page. */
export default function PageShell({ title, hasKey = true, children }: Props) {
	const pathname = usePathname();
	const [unlocked, setUnlocked] = useState(hasKey);

	return (
		<main className="min-h-screen bg-gray-50 flex flex-col items-center p-4 sm:p-6">
			{!unlocked && <ApiKeyModal onSuccess={() => setUnlocked(true)} />}

			<nav className="mb-4 flex w-full max-w-2xl flex-wrap gap-2">
				{NAV.map((item) => {
					const active = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
					return (
						<Link
							key={item.href}
							href={item.href}
							aria-current={active ? "page" : undefined}
							className={`rounded-lg px-3 py-2 text-sm font-medium ${
								active
									? "bg-gray-900 text-white"
									: "border border-gray-300 bg-white text-gray-700 hover:border-gray-500"
							}`}
						>
							{item.label}
						</Link>
					);
				})}
			</nav>

			<div className="w-full max-w-2xl rounded-2xl bg-white p-4 sm:p-8 shadow-sm border border-gray-100">
				<h1 className="mb-6 text-xl font-semibold text-gray-900">{title}</h1>
				{/* Nothing that calls the API is mounted until the password is in. */}
				{unlocked && children}
			</div>
		</main>
	);
}
