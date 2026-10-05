// #teg va @eslatma uchun umumiy qoidalar.
export const TAG_CHARS = '\\p{L}\\p{N}_';
const TAG_RE = new RegExp(`(?:^|\\s)#([${TAG_CHARS}]+)`, 'gu');

/** Matndagi #teglar (kichik harfda, takrorsiz). */
export function extractTags(content: string): string[] {
	const out = new Set<string>();
	for (const m of content.matchAll(TAG_RE)) out.add(m[1].toLowerCase());
	return [...out];
}

export const tagHref = (tag: string) => `/tags/${encodeURIComponent(tag.toLowerCase())}`;
