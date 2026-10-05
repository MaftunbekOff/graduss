import type { Campaign, Channel, Chat, Comment, Message, Post, User } from '$lib/types';

// "Eng uzun matn" sinov rejimi: har bir matn maydoni ruxsat etilgan chegaragacha cho'ziladi.
// Maqsad: dizayn uzun ism, uzun username, bo'shliqsiz uzun so'z va uzun havolalarda buzilmasligini ko'rish.
// Yoqish: /feed?uzun=1  O'chirish: ?uzun=0  (faqat demo rejim; haqiqiy ma'lumotga tegmaydi)

/** Matnni n belgigacha cho'zadi (o'z so'zlarini takrorlab). */
function fill(s: string, n: number) {
	if (!s || s.length >= n) return s;
	const words = s.split(/\s+/);
	let out = s;
	for (let i = 0; out.length < n; i++) out += ' ' + words[i % words.length];
	return out.slice(0, n).trim();
}
/** Bo'shliqsiz uzun satr (username, havola kabi). */
function glue(s: string, n: number) {
	const base = s.replace(/[^a-z0-9]/gi, '') || 'uzun';
	let out = '';
	while (out.length < n) out += base;
	return out.slice(0, n);
}
/** Har uchinchi matnga bo'shliqsiz uzun havola qo'shadi. */
const withLink = (s: string, i: number) => (i % 3 === 0 ? `${s} https://example.uz/${glue('havola', 90)}` : s);

export function stretchData<T extends { users: User[]; channels: Channel[]; posts: Post[]; comments: Comment[]; chats: Chat[]; messages: Message[]; campaigns: Campaign[] }>(d: T): T {
	const out = structuredClone(d);
	out.users.forEach((u, i) => {
		if (i === 0) return; // "men" ni o'zgartirmaymiz: kirish va sozlamalar buzilmasin
		u.name = fill(u.name, 60);
		u.username = glue(u.username, 30);
		u.bio = fill(u.bio, 300);
		u.location = fill(u.location, 60);
		if (u.website) u.website = 'https://' + glue('veb', 70) + '.uz';
		if (u.telegram) u.telegram = glue(u.telegram, 32);
		if (u.music) u.music = { ...u.music, title: fill(u.music.title, 60), artist: fill(u.music.artist, 60) };
	});
	out.channels.forEach((c) => {
		c.name = fill(c.name, 60);
		c.handle = glue(c.handle, 30);
		c.description = fill(c.description, 300);
		c.categories?.forEach((k) => (k.name = fill(k.name, 30)));
	});
	out.posts.forEach((p, i) => (p.content = withLink(fill(p.content, 700), i)));
	out.comments.forEach((c, i) => (c.content = withLink(fill(c.content, 400), i)));
	out.messages.forEach((m, i) => {
		if (m.content) m.content = withLink(fill(m.content, 300), i);
	});
	out.chats.forEach((c) => {
		if (c.title) c.title = fill(c.title, 60);
	});
	out.campaigns.forEach((c) => {
		c.title = fill(c.title, 120);
		c.summary = fill(c.summary, 400);
		c.milestones.forEach((m) => (m.title = fill(m.title, 60)));
	});
	return out;
}
