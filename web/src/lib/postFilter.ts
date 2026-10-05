import type { Post } from '$lib/types';

// Postlarni turi bo'yicha filtrlash: "Postlar" tabini bosganda ochiladigan ro'yxat.
export type BuiltInFilter = 'all' | 'image' | 'video' | 'link' | 'gif';
/** 'all' | 'image' | ... yoki 'cat:<kategoriya id>' (kanal egasi yaratgan kategoriya). */
export type PostFilter = BuiltInFilter | `cat:${string}`;

export const BUILTIN_FILTERS: { id: BuiltInFilter; label: string; empty: string }[] = [
	{ id: 'all', label: 'Hammasi', empty: "Hali postlar yo'q" },
	{ id: 'image', label: 'Rasmlar', empty: "Hali rasm yo'q" },
	{ id: 'video', label: 'Videolar', empty: "Hali video yo'q" },
	{ id: 'link', label: 'Linklar', empty: "Hali link yo'q" },
	{ id: 'gif', label: 'GIFlar', empty: "Hali GIF yo'q" }
];

const URL_RE = /https?:\/\/[^\s]+/i;

export const isGif = (url?: string) => !!url && /\.gif(\?|#|$)/i.test(url);
export const hasLink = (content: string) => URL_RE.test(content);

/** Matndagi birinchi havola (gap oxiridagi tinish belgilarisiz) yoki undefined. */
export function firstLink(content: string): string | undefined {
	const m = content.match(/https?:\/\/[^\s]+/i);
	return m ? m[0].replace(/[.,;:!?)\]]+$/, '') : undefined;
}

export function matchesFilter(post: Post, filter: PostFilter): boolean {
	switch (filter) {
		case 'all':
			return true;
		case 'image':
			return !!post.mediaUrl && !isGif(post.mediaUrl);
		case 'gif':
			return isGif(post.mediaUrl);
		case 'video':
			return !!post.videoUrl;
		case 'link':
			return hasLink(post.content);
		default:
			return filter.startsWith('cat:') && post.categoryId === filter.slice(4);
	}
}

// Saralash ("Sort by"): faqat ochiq ko'rsatkichlar bo'yicha; like/reyting yo'q.
export type PostSort = 'new' | 'old' | 'views' | 'comments';
export const SORTS: { id: PostSort; label: string }[] = [
	{ id: 'new', label: 'Yangilari birinchi' },
	{ id: 'old', label: 'Eskilari birinchi' },
	{ id: 'views', label: "Ko'p ko'rilgan" },
	{ id: 'comments', label: "Ko'p izohlangan" }
];

const time = (p: Post) => new Date(p.createdAt).getTime();

export function sortPosts(posts: Post[], sort: PostSort): Post[] {
	const list = [...posts];
	switch (sort) {
		case 'old':
			return list.sort((a, b) => time(a) - time(b));
		case 'views':
			return list.sort((a, b) => b.views - a.views || time(b) - time(a));
		case 'comments':
			return list.sort((a, b) => b.comments - a.comments || time(b) - time(a));
		default:
			return list.sort((a, b) => time(b) - time(a));
	}
}
