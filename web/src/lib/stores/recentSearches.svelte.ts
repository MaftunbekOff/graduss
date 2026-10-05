import { browser } from '$app/environment';

// Oxirgi qidiruvlar (faqat shu qurilmada, brauzerda saqlanadi). Eng yangisi birinchi, eng ko'pi MAX ta.
const KEY = 'graduss-recent-searches';
const MAX = 8;

function load(): string[] {
	if (!browser) return [];
	try {
		const v = JSON.parse(localStorage.getItem(KEY) ?? '[]');
		return Array.isArray(v) ? v.filter((x) => typeof x === 'string').slice(0, MAX) : [];
	} catch {
		return [];
	}
}

let list = $state<string[]>(load());

function save() {
	try {
		localStorage.setItem(KEY, JSON.stringify(list));
	} catch {}
}

export const recentSearches = {
	get list() {
		return list;
	},
	add(q: string) {
		const t = q.trim().replace(/\s+/g, ' ');
		if (t.length < 2) return;
		list = [t, ...list.filter((x) => x.toLowerCase() !== t.toLowerCase())].slice(0, MAX);
		save();
	},
	remove(q: string) {
		list = list.filter((x) => x !== q);
		save();
	},
	clear() {
		list = [];
		save();
	}
};
