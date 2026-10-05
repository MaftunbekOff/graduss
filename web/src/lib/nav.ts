// Telefonda qaysi sahifalarda yuqori/pastki panel yashirinishi (sahifaning o'zida sarlavhasi va yozish maydoni bor).
const CHAT_DETAIL = /^\/chats\/[^/]+/;
const CHANNEL_DETAIL = /^\/channels\/[^/]+/;
const POST_DETAIL = /^\/post\/[^/]+/;
const CAMPAIGN_DETAIL = /^\/campaigns\/[^/]+/;
const TAG_PAGE = /^\/tags\/[^/]+/;

/** Yuqori panel (logo, qidiruv, bildirishnoma) yashirinadigan sahifalar. */
export const hideTopBar = (path: string) =>
	CHAT_DETAIL.test(path) ||
	CHANNEL_DETAIL.test(path) ||
	POST_DETAIL.test(path) ||
	CAMPAIGN_DETAIL.test(path) ||
	TAG_PAGE.test(path) ||
	path === '/search' ||
	path === '/settings';

/** Pastki panel yashirinadigan sahifalar (izoh/xabar yozish paytida to'sqinlik qilmasin). */
export const hideBottomNav = (path: string) => CHAT_DETAIL.test(path) || POST_DETAIL.test(path) || CAMPAIGN_DETAIL.test(path);

/**
 * Qaysi bo'lim faol hisoblanadi (pastki/yon panel belgisi, kompyuter paneli nomi).
 * Kanal ichiga Bosh sahifa yoki Qidiruvdan kirilgan bo'lsa, o'sha bo'lim faol qoladi, "Kanallar" emas.
 */
export function navSection(path: string, from: string): string {
	if (CHANNEL_DETAIL.test(path)) {
		if (from === '/feed' || from.startsWith('/feed/')) return '/feed';
		if (from === '/search') return '/search';
	}
	return path;
}

/** Ichki (batafsil) sahifalar: Esc bosilganda orqaga qaytiladi. */
export const isDetailPage = (path: string) =>
	CHAT_DETAIL.test(path) || CHANNEL_DETAIL.test(path) || POST_DETAIL.test(path) || CAMPAIGN_DETAIL.test(path) || TAG_PAGE.test(path) || /^\/profile\/[^/]+/.test(path) || path === '/settings' || path === '/notifications' || path === '/search';
