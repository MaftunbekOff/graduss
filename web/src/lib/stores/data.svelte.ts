import { untrack } from 'svelte';
import { browser } from '$app/environment';
import { API_ON, apiCall, flushQueue, hooks, newId, sync } from '$lib/api';
import { toastStore } from '$lib/stores/toast.svelte';
import type { CampaignComment, AppNotification, Campaign, CampaignPhase, Channel, ChannelEvent, Chat, Comment, Message, Poll, Post, Sector, User } from '$lib/types';
import { posts as initialPosts } from '$lib/mock/posts';
import { comments as initialComments } from '$lib/mock/comments';
import { campaignComments as initialCampaignComments } from '$lib/mock/campaignComments';
import { extractTags } from '$lib/hashtag';
import { chats as initialChats, messages as initialMessages, chatReadSeed } from '$lib/mock/chats';
import { channels as initialChannels } from '$lib/mock/channels';
import { notifications as initialNotifications } from '$lib/mock/notifications';
import { users as initialUsers } from '$lib/mock/users';
import { stretchData } from '$lib/mock/stress';
import { campaigns as initialCampaigns } from '$lib/mock/campaigns';
import { events as initialEvents } from '$lib/mock/events';

// "Eng uzun matn" sinov rejimi (?uzun=1 yoqadi, ?uzun=0 o'chiradi): alohida saqlash kaliti, haqiqiy demo ma'lumotga tegmaydi.
const STRESS =
	!API_ON &&
	browser &&
	(() => {
		try {
			const q = new URLSearchParams(location.search).get('uzun');
			if (q === '1') sessionStorage.setItem('graduss-stress', '1');
			if (q === '0') sessionStorage.removeItem('graduss-stress');
			return sessionStorage.getItem('graduss-stress') === '1';
		} catch {
			return false;
		}
	})();
const STORAGE_KEY = STRESS ? 'graduss-stress-v1' : 'graduss-data-v2';
const MAX_PINS = 3;
const MAX_CATEGORIES = 8;
const MAX_UPCOMING_EVENTS = 5;
const EVENT_REMIND_MS = 60 * 60_000; // tadbirdan 1 soat oldin eslatma
const EVENT_SHOWN_MS = 2 * 3_600_000; // boshlangandan 2 soat keyin kartadan yo'qoladi
const DRAFT_KEY = 'graduss-composer-draft';

interface Persisted {
	posts: Post[];
	comments: Comment[];
	chats: Chat[];
	messages: Message[];
	channels: typeof initialChannels;
	notifications: AppNotification[];
	users: User[];
	campaigns: Campaign[];
	bookmarkedIds: string[];
	chatReads: Record<string, string>;
	chatPrefs: Record<string, ChatPrefs>;
	peerReads: Record<string, string>;
	campaignComments: CampaignComment[];
	events: ChannelEvent[];
}

/** Suhbat ro'yxatidagi shaxsiy sozlamalar (faqat qurilmada). */
export interface ChatPrefs {
	unread?: boolean;
	pinnedAt?: string;
	muted?: boolean;
	archived?: boolean;
}

function loadPersisted(): Partial<Persisted> {
	if (!browser) return {};
	try {
		const raw = localStorage.getItem(STORAGE_KEY);
		return raw ? JSON.parse(raw) : {};
	} catch {
		return {};
	}
}

const persisted: Partial<Persisted> = API_ON ? {} : loadPersisted();
const seed = <T>(initial: T[]): T[] => (API_ON ? [] : structuredClone(initial));
const S = (() => {
	const base = { users: initialUsers, channels: initialChannels, posts: initialPosts, comments: initialComments, chats: initialChats, messages: initialMessages, campaigns: initialCampaigns };
	return STRESS ? stretchData(base) : base;
})();

let posts = $state<Post[]>(persisted.posts ?? seed(S.posts));
let comments = $state<Comment[]>(persisted.comments ?? seed(S.comments));
let chats = $state<Chat[]>(persisted.chats ?? seed(S.chats));
let messages = $state<Message[]>(persisted.messages ?? seed(S.messages));
let channels = $state(persisted.channels ?? seed(S.channels));
let notifications = $state<AppNotification[]>(
	persisted.notifications ?? seed(initialNotifications)
);
// Eski saqlangan demo foydalanuvchilarga yangi mock maydonlar (tug'ilgan kun, telefon) bir marta qo'shiladi.
function withContacts(list: User[]): User[] {
	if (API_ON || !browser) return list;
	const once = (key: string) => {
		try {
			if (localStorage.getItem(key)) return false;
			localStorage.setItem(key, '1');
			return true;
		} catch {
			return false;
		}
	};
	const contacts = once('graduss-contacts-seeded');
	const hours = once('graduss-hours-seeded');
	for (const u of list) {
		const m = initialUsers.find((x) => x.id === u.id);
		if (!m) continue;
		if (contacts) {
			u.birthDate ??= m.birthDate;
			u.phone ??= m.phone;
			u.showPhone ??= m.showPhone;
		}
		if (hours) u.workHours ??= m.workHours;
	}
	return list;
}
let users = $state<User[]>(persisted.users ? withContacts(persisted.users) : seed(S.users));
let campaigns = $state<Campaign[]>(persisted.campaigns ?? seed(S.campaigns));
let bookmarkedIds = $state<string[]>(persisted.bookmarkedIds ?? []);
let events = $state<ChannelEvent[]>(persisted.events ?? (API_ON ? [] : structuredClone(initialEvents)));

// Joriy vaqt (reaktiv): rejalashtirilgan postlar vaqti kelganda o'zi chop etiladi, tadbir eslatmalari shu yerdan tekshiriladi.
let nowTick = $state(Date.now());
const isLive = (p: Post) => !p.isDraft && (!p.scheduledAt || new Date(p.scheduledAt).getTime() <= nowTick);
let campaignComments = $state<CampaignComment[]>(persisted.campaignComments ?? seed(initialCampaignComments));
// Suhbat qachon o'qilgani (o'qilmaganlar belgisi uchun). API rejimda hozircha faqat mahalliy.
let chatReads = $state<Record<string, string>>(persisted.chatReads ?? (API_ON ? {} : { ...chatReadSeed }));

let chatPrefs = $state<Record<string, ChatPrefs>>(persisted.chatPrefs ?? {});
// Suhbatdoshlar (kamida bittasi) suhbatni qachongacha o'qigani: mening xabarlarimdagi ikkinchi "ptichka" uchun.
// Demo rejimda suhbatdosh xabarni bir necha soniyada "o'qiydi" (setTimeout); API rejimda server beradi (bootstrap `peerReads`).
let peerReads = $state<Record<string, string>>(persisted.peerReads ?? {});
if (browser && !API_ON) {
	// Sahifa qayta ochilganda: 10 soniyadan eski xabarlarim o'qilgan hisoblanadi.
	const cutoff = new Date(Date.now() - 10_000).toISOString();
	for (const m of messages) {
		if (m.senderId === users[0]?.id && m.createdAt <= cutoff && (peerReads[m.chatId] ?? '') < m.createdAt) peerReads[m.chatId] = m.createdAt;
	}
}

if (browser && !API_ON) {
	$effect.root(() => {
		$effect(() => {
			const snapshot: Persisted = {
				posts: $state.snapshot(posts),
				comments: $state.snapshot(comments),
				chats: $state.snapshot(chats),
				messages: $state.snapshot(messages),
				channels: $state.snapshot(channels),
				notifications: $state.snapshot(notifications),
				users: $state.snapshot(users),
				campaigns: $state.snapshot(campaigns),
				bookmarkedIds: $state.snapshot(bookmarkedIds),
				chatReads: $state.snapshot(chatReads),
				chatPrefs: $state.snapshot(chatPrefs),
				peerReads: $state.snapshot(peerReads),
				campaignComments: $state.snapshot(campaignComments),
				events: $state.snapshot(events)
			};
			try {
				localStorage.setItem(STORAGE_KEY, JSON.stringify(snapshot));
			} catch {
				// storage full or unavailable — skip persistence silently
			}
		});
	});
}


// Eslatma qo'ygan tadbir 1 soat ichida boshlansa, bir marta bildirishnoma beradi.
function checkEventReminders() {
	const me = users[0]?.id;
	if (!me) return;
	for (const e of events) {
		const left = new Date(e.startsAt).getTime() - nowTick;
		if (left <= 0 || left > EVENT_REMIND_MS || !e.reminderIds.includes(me)) continue;
		if (notifications.some((n) => n.eventId === e.id)) continue;
		const channel = channels.find((c) => c.id === e.channelId);
		notifications.push({ id: newId(), type: 'event', actorId: channel?.ownerId ?? me, channelId: e.channelId, eventId: e.id, createdAt: new Date(nowTick).toISOString(), read: false });
	}
}

if (browser && !API_ON) {
	$effect.root(() => {
		setInterval(() => {
			nowTick = Date.now();
			checkEventReminders();
		}, 15_000);
		$effect(() => {
			// Eslatma qo'yilganda yoki sahifa ochilganda darhol tekshiramiz.
			events.length;
			untrack(checkEventReminders);
		});
	});
}

export const data = {
	get posts() {
		return posts.filter(isLive);
	},
	get comments() {
		return comments;
	},
	get chats() {
		return chats;
	},
	get messages() {
		return messages;
	},
	get channels() {
		return channels;
	},
	get campaigns() {
		return campaigns;
	},
	get notifications() {
		return notifications;
	},
	get unreadCount() {
		return notifications.filter((n) => !n.read).length;
	},
	get users() {
		return users;
	},
	get currentUser() {
		return users[0];
	},
	// Serverdan to'liq holatni yuklaydi (API rejim). Kutilayotgan yozishlar tugagach olinadi.
	async load(): Promise<boolean> {
		if (!API_ON) return true;
		await flushQueue();
		const r = await apiCall('GET', '/api/bootstrap');
		if (!r.ok) return false;
		const d = r.data;
		users = d.users;
		channels = d.channels;
		posts = d.posts;
		comments = d.comments;
		chats = d.chats;
		messages = d.messages;
		notifications = d.notifications;
		campaigns = d.campaigns;
		bookmarkedIds = d.bookmarkedIds;
		peerReads = d.peerReads ?? {};
		return true;
	},

	reset() {
		users = [];
		channels = [];
		posts = [];
		comments = [];
		chats = [];
		messages = [];
		chatReads = {};
		chatPrefs = {};
		peerReads = {};
		campaignComments = [];
		events = [];
		notifications = [];
		campaigns = [];
		bookmarkedIds = [];
	},

	getUser(id: string) {
		return users.find((u) => u.id === id);
	},

	getUserByUsername(username: string) {
		return users.find((u) => u.username === username);
	},

	isUsernameTaken(username: string) {
		return users.slice(1).some((u) => u.username.toLowerCase() === username.toLowerCase());
	},

	// Demo rejim: ro'yxatdan o'tish haqiqatan YANGI, bo'sh profil yaratadi (kanal, post, saqlangan yo'q) — yo'l-yo'riq shu holatni ko'rsatadi.
	registerDemoUser(fields: { name: string; username: string; sector: Sector }) {
		const colors = ['#2F855A', '#2B6CB0', '#B7791F', '#C53030', '#6B46C1', '#D53F8C', '#DD6B20', '#2C7A7B'];
		const user: User = {
			id: newId(),
			username: fields.username,
			name: fields.name,
			avatar: colors[fields.username.length % colors.length],
			sector: fields.sector,
			bio: '',
			location: '',
			joined: new Date().toISOString().slice(0, 10),
			banner: 'from-brand-600 to-indigo-900'
		};
		users = [user, ...users];
		for (const c of channels) c.joined = false;
		bookmarkedIds = [];
		notifications = [];
		chatReads = {};
		chatPrefs = {};
		peerReads = {};
	},

	updateProfile(fields: Partial<Pick<User, 'name' | 'username' | 'bio' | 'location' | 'avatar' | 'banner' | 'website' | 'telegram' | 'isVerified' | 'music' | 'birthDate' | 'phone' | 'showPhone' | 'workHours'>>) {
		Object.assign(users[0], fields);
		const { isVerified: _ignored, ...rest } = fields;
		// Bo'sh qiymat (undefined) serverda "tozalash" degani: sayt/telegram o'chirilishi uchun '' yuboriladi.
		for (const k of ['website', 'telegram', 'birthDate', 'phone'] as const) {
			if (k in fields && fields[k] === undefined) rest[k] = '';
		}
		if ('workHours' in fields && fields.workHours === undefined) (rest as Record<string, unknown>).workHours = null;
		sync('PATCH', '/api/me', rest);
	},

	addPortfolioItem(fields: { title: string; description: string; url?: string }) {
		const me = users[0];
		const item = {
			id: newId(),
			title: fields.title,
			description: fields.description,
			url: fields.url || undefined
		};
		me.portfolio = [...(me.portfolio ?? []), item];
		sync('POST', '/api/me/portfolio', item);
	},

	removePortfolioItem(id: string) {
		const me = users[0];
		me.portfolio = (me.portfolio ?? []).filter((i) => i.id !== id);
		sync('DELETE', `/api/me/portfolio/${id}`);
	},

	isBookmarked(postId: string) {
		return bookmarkedIds.includes(postId);
	},

	toggleBookmark(postId: string) {
		if (bookmarkedIds.includes(postId)) {
			bookmarkedIds = bookmarkedIds.filter((id) => id !== postId);
		} else {
			bookmarkedIds = [...bookmarkedIds, postId];
		}
		sync('POST', `/api/posts/${postId}/bookmark`, { on: bookmarkedIds.includes(postId) });
	},

	getBookmarkedPosts() {
		return bookmarkedIds
			.map((id) => posts.find((p) => p.id === id))
			.filter((p): p is Post => !!p && isLive(p));
	},

	createPost(
		content: string,
		channelId?: string,
		mediaUrl?: string,
		poll?: Poll,
		audioUrl?: string,
		audioDuration?: number,
		videoUrl?: string,
		categoryId?: string,
		opts?: { scheduledAt?: string; isDraft?: boolean }
	) {
		const post: Post = {
			id: newId(),
			authorId: users[0].id,
			content,
			createdAt: opts?.scheduledAt ?? new Date().toISOString(),
			scheduledAt: opts?.scheduledAt,
			isDraft: opts?.isDraft || undefined,
			comments: 0,
			views: 0,
			channelId,
			mediaUrl,
			videoUrl,
			categoryId,
			audioUrl,
			audioDuration,
			poll,
		};
		posts.unshift(post);
		sync('POST', '/api/posts', { id: post.id, content, channelId, mediaUrl, videoUrl, categoryId, poll, scheduledAt: opts?.scheduledAt, isDraft: opts?.isDraft });
		return post;
	},

	votePoll(postId: string, optionId: string) {
		const post = posts.find((p) => p.id === postId);
		if (!post || !post.poll) return;
		const me = users[0].id;
		
		// Remove previous vote if any in this poll
		for (const opt of post.poll.options) {
			opt.votes = opt.votes.filter((id) => id !== me);
		}

		// Add vote to target option
		const targetOpt = post.poll.options.find((o) => o.id === optionId);
		if (targetOpt) {
			targetOpt.votes.push(me);
			sync('POST', `/api/posts/${postId}/vote`, { optionId });
		}
	},

	saveDraft(content: string) {
		if (browser) {
			try {
				localStorage.setItem(DRAFT_KEY, content);
			} catch {}
		}
	},

	getDraft() {
		if (!browser) return '';
		try {
			return localStorage.getItem(DRAFT_KEY) ?? '';
		} catch {
			return '';
		}
	},

	clearDraft() {
		if (browser) {
			try {
				localStorage.removeItem(DRAFT_KEY);
			} catch {}
		}
	},

	updateChannel(
		channelId: string,
		fields: { name?: string; handle?: string; description?: string; showOwner?: boolean; avatar?: string; banner?: string }
	) {
		const channel = channels.find((c) => c.id === channelId);
		if (!channel || channel.ownerId !== users[0].id) return;
		if (fields.name) channel.name = fields.name;
		if (fields.handle) channel.handle = fields.handle;
		if (fields.description !== undefined) channel.description = fields.description;
		if (fields.showOwner !== undefined) channel.showOwner = fields.showOwner;
		if (fields.avatar) channel.avatar = fields.avatar;
		if (fields.banner) channel.banner = fields.banner;
		sync('PATCH', `/api/channels/${channelId}`, fields);
	},

	getPost(id: string) {
		return posts.find((p) => p.id === id && (isLive(p) || p.authorId === users[0].id));
	},

	incrementView(id: string) {
		const post = posts.find((p) => p.id === id);
		if (post) {
			post.views += 1;
			sync('POST', `/api/posts/${id}/view`);
		}
	},

	editPost(id: string, content: string) {
		const post = posts.find((p) => p.id === id);
		if (!post || post.authorId !== users[0].id) return;
		post.content = content;
		if (isLive(post)) post.editedAt = new Date().toISOString();
		sync('PATCH', `/api/posts/${id}`, { content });
	},

	deletePost(id: string) {
		posts = posts.filter((p) => p.id !== id);
		comments = comments.filter((c) => c.postId !== id);
		sync('DELETE', `/api/posts/${id}`);
	},

	// Foydalanuvchi profilida faqat shaxsiy postlar: kanal postlari kanal nomidan chiqadi.
	// #teg bo'yicha postlar (kichik/katta harf farqsiz).
	getPostsByTag(tag: string) {
		const t = tag.toLowerCase();
		return posts.filter((p) => isLive(p) && extractTags(p.content).includes(t));
	},

	// Yozayotganda @eslatma takliflari: username yoki ism boshlanishi bo'yicha, o'zim chiqarilmaydi.
	suggestUsers(query: string, limit = 5) {
		const q = query.toLowerCase();
		const me = users[0]?.id;
		const score = (u: User) => {
			const un = u.username.toLowerCase();
			if (!q) return 3;
			if (un.startsWith(q)) return 0;
			if (u.name.toLowerCase().split(/\s+/).some((w) => w.startsWith(q))) return 1;
			if (q.length >= 2 && un.includes(q)) return 2;
			return -1;
		};
		return users
			.filter((u) => u.id !== me && score(u) >= 0)
			.sort((a, b) => score(a) - score(b) || a.name.localeCompare(b.name))
			.slice(0, limit);
	},

	// #teg takliflari: postlarda eng ko'p uchraganlari avval.
	suggestTags(query: string, limit = 5) {
		const q = query.toLowerCase();
		const count = new Map<string, number>();
		for (const p of posts) if (isLive(p)) for (const t of extractTags(p.content)) count.set(t, (count.get(t) ?? 0) + 1);
		return [...count.entries()]
			.filter(([t]) => t.startsWith(q))
			.sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
			.slice(0, limit)
			.map(([t]) => t);
	},

	getPostsByAuthor(authorId: string) {
		return posts.filter((p) => p.authorId === authorId && !p.channelId && isLive(p));
	},

	// Post kimning nomidan ko'rinadi: kanal postida kanal (muallif ko'rsatilmaydi), aks holda foydalanuvchi.
	getPostSource(post: Post) {
		const ch = post.channelId ? channels.find((c) => c.id === post.channelId) : undefined;
		if (ch) {
			return { name: ch.name, handle: ch.handle, avatar: ch.avatar, sector: ch.sector, href: `/channels/${ch.id}`, isChannel: true };
		}
		const u = users.find((x) => x.id === post.authorId);
		if (!u) return undefined;
		return { name: u.name, handle: u.username, avatar: u.avatar, sector: u.sector, href: `/profile/${u.username}`, isChannel: false };
	},

	getPostsByChannel(channelId: string) {
		return posts.filter((p) => p.channelId === channelId && isLive(p));
	},

	// Kanal egasi postni qadaydi/qadashni olib tashlaydi (kanalda eng ko'pi bilan MAX_PINS ta). Natija: xabar matni.
	togglePin(postId: string): { ok: boolean; pinned?: boolean; error?: string } {
		const post = posts.find((p) => p.id === postId);
		const channel = post?.channelId ? channels.find((c) => c.id === post.channelId) : undefined;
		if (!post || !channel || channel.ownerId !== users[0].id) return { ok: false, error: 'Faqat kanal egasi qada oladi' };
		if (post.pinnedAt) {
			post.pinnedAt = undefined;
		} else {
			if (posts.filter((p) => p.channelId === channel.id && p.pinnedAt).length >= MAX_PINS) {
				return { ok: false, error: `Kanalda eng ko'pi bilan ${MAX_PINS} ta post qadash mumkin` };
			}
			post.pinnedAt = new Date().toISOString();
		}
		sync('POST', `/api/posts/${postId}/pin`, { on: !!post.pinnedAt });
		return { ok: true, pinned: !!post.pinnedAt };
	},

	// Kanal egasi o'ziga mos kategoriya yaratadi (kanalda eng ko'pi bilan MAX_CATEGORIES ta).
	addChannelCategory(channelId: string, rawName: string): { ok: boolean; error?: string } {
		const channel = channels.find((c) => c.id === channelId);
		if (!channel || channel.ownerId !== users[0].id) return { ok: false, error: 'Faqat kanal egasi yarata oladi' };
		const name = rawName.trim().replace(/\s+/g, ' ');
		if (!name) return { ok: false, error: 'Nom yozing' };
		if (name.length > 24) return { ok: false, error: "Nom 24 belgidan oshmasin" };
		const list = channel.categories ?? [];
		if (list.length >= MAX_CATEGORIES) return { ok: false, error: `Eng ko'pi bilan ${MAX_CATEGORIES} ta kategoriya` };
		if (list.some((c) => c.name.toLowerCase() === name.toLowerCase())) return { ok: false, error: 'Bunday kategoriya bor' };
		const cat = { id: newId(), name };
		channel.categories = [...list, cat];
		sync('POST', `/api/channels/${channelId}/categories`, cat);
		return { ok: true };
	},

	removeChannelCategory(channelId: string, categoryId: string) {
		const channel = channels.find((c) => c.id === channelId);
		if (!channel || channel.ownerId !== users[0].id) return;
		channel.categories = (channel.categories ?? []).filter((c) => c.id !== categoryId);
		for (const p of posts) if (p.channelId === channelId && p.categoryId === categoryId) p.categoryId = undefined;
		sync('DELETE', `/api/channels/${channelId}/categories/${categoryId}`);
	},

	canPin(post: Post) {
		const channel = post.channelId ? channels.find((c) => c.id === post.channelId) : undefined;
		return !!channel && channel.ownerId === users[0].id;
	},

	// Lenta: a'zo bo'lingan kanallar postlari va o'z postlarim.
	getFeed() {
		const me = users[0].id;
		const joined = new Set(channels.filter((c) => c.joined).map((c) => c.id));
		return posts.filter((p) => isLive(p) && (p.authorId === me || (p.channelId && joined.has(p.channelId))));
	},

	getCommentsByPost(postId: string) {
		return comments.filter((c) => c.postId === postId);
	},

	addComment(postId: string, content: string) {
		const comment: Comment = {
			id: newId(),
			postId,
			authorId: users[0].id,
			content,
			createdAt: new Date().toISOString()
		};
		comments.push(comment);
		const post = posts.find((p) => p.id === postId);
		if (post) post.comments += 1;
		sync('POST', `/api/posts/${postId}/comments`, { id: comment.id, content });
		return comment;
	},

	deleteComment(id: string) {
		const comment = comments.find((c) => c.id === id);
		if (!comment || comment.authorId !== users[0].id) return;
		comments = comments.filter((c) => c.id !== id);
		const post = posts.find((p) => p.id === comment.postId);
		if (post) post.comments = Math.max(0, post.comments - 1);
		sync('DELETE', `/api/comments/${id}`);
	},

	getChat(id: string) {
		return chats.find((c) => c.id === id);
	},

	getOrCreateChat(otherUserId: string): Chat {
		const me = users[0].id;
		const existing = chats.find(
			(c) => !c.isGroup && c.participantIds.includes(otherUserId) && c.participantIds.includes(me)
		);
		if (existing) return existing;
		const chat: Chat = {
			id: newId(),
			participantIds: [me, otherUserId],
			isGroup: false
		};
		chats.push(chat);
		sync('POST', '/api/chats', { id: chat.id, otherUserId }, (res) => {
			// Server allaqachon mavjud suhbatni qaytargan bo'lsa (boshqa qurilmada ochilgan), holatni moslaymiz.
			if ((res as { id?: string } | null)?.id !== chat.id) void data.load();
		});
		return chat;
	},

	// O'qilmagan xabarlar soni: boshqalarning, o'qilgan vaqtdan keyingilari.
	getUnreadCount(chatId: string) {
		const readAt = chatReads[chatId];
		const me = users[0].id;
		const n = messages.filter((m) => m.chatId === chatId && m.senderId !== me && (!readAt || m.createdAt > readAt)).length;
		return chatPrefs[chatId]?.unread ? Math.max(1, n) : n;
	},

	/** O'qilmagan xabari bor suhbatlar soni (pastki panel belgisi uchun). Ovozsiz va arxivdagilar sanalmaydi. */
	get unreadChats() {
		const me = users[0]?.id;
		return chats.filter((c) => c.participantIds.includes(me) && !chatPrefs[c.id]?.muted && !chatPrefs[c.id]?.archived && (c.isGroup || messages.some((m) => m.chatId === c.id)) && this.getUnreadCount(c.id) > 0).length;
	},

	markChatRead(chatId: string) {
		chatReads[chatId] = new Date().toISOString();
		untrack(() => {
			if (chatPrefs[chatId]?.unread) chatPrefs[chatId].unread = false;
		});
	},

	/** Mening xabarimni suhbatdosh o'qiganmi (ikkinchi ptichka). */
	isMessageRead(m: Message) {
		return (peerReads[m.chatId] ?? '') >= m.createdAt;
	},

	getChatPrefs(chatId: string): ChatPrefs {
		return chatPrefs[chatId] ?? {};
	},

	/** Suhbat sozlamasi (o'qilmagan / qadash / ovozsiz / arxiv) — hozircha faqat qurilmada. */
	toggleChatPref(chatId: string, key: 'unread' | 'pinned' | 'muted' | 'archived') {
		const p = (chatPrefs[chatId] ??= {});
		if (key === 'pinned') p.pinnedAt = p.pinnedAt ? undefined : new Date().toISOString();
		else p[key] = !p[key];
	},

	/** Suhbatni (xabarlari bilan) o'chiradi. */
	deleteChat(chatId: string) {
		chats = chats.filter((c) => c.id !== chatId);
		messages = messages.filter((m) => m.chatId !== chatId);
		delete chatPrefs[chatId];
		delete chatReads[chatId];
		sync('DELETE', `/api/chats/${chatId}`);
	},

	getChatMessages(chatId: string) {
		return messages.filter((m) => m.chatId === chatId);
	},

	getChatParticipants(chatId: string) {
		const chat = chats.find((c) => c.id === chatId);
		if (!chat) return [];
		return chat.participantIds
			.map((id) => users.find((u) => u.id === id))
			.filter((u): u is User => !!u);
	},

	// Xabar yozilmagan shaxsiy suhbat (profildan ochib, yozmay qaytilganda) mahalliy ro'yxatdan olib tashlanadi.
	discardEmptyChat(chatId: string) {
		const chat = chats.find((c) => c.id === chatId);
		if (!chat || chat.isGroup || messages.some((m) => m.chatId === chatId)) return;
		chats = chats.filter((c) => c.id !== chatId);
	},

	leaveChat(chatId: string) {
		const chat = chats.find((c) => c.id === chatId);
		if (!chat || !chat.isGroup) return;
		chat.participantIds = chat.participantIds.filter((id) => id !== users[0].id);
	},

	sendMessage(chatId: string, content: string, imageUrl?: string, extra?: { file?: Message['file']; poll?: Poll; audio?: Message['audio']; video?: Message['video']; replyToId?: string; forwardedFrom?: string; images?: string[]; spoiler?: boolean; captionUp?: boolean; sticker?: string }) {
		const message: Message = {
			id: newId(),
			chatId,
			senderId: users[0].id,
			content,
			imageUrl,
			file: extra?.file,
			poll: extra?.poll,
			audio: extra?.audio,
			video: extra?.video,
			replyToId: extra?.replyToId,
			forwardedFrom: extra?.forwardedFrom,
			images: extra?.images,
			sticker: extra?.sticker,
			spoiler: extra?.spoiler || undefined,
			captionUp: extra?.captionUp || undefined,
			createdAt: new Date().toISOString()
		};
		messages.push(message);
		if (!API_ON) {
			const group = chats.find((c) => c.id === chatId)?.isGroup;
			setTimeout(() => {
				if ((peerReads[chatId] ?? '') < message.createdAt) peerReads[chatId] = message.createdAt;
			}, group ? 6000 : 3500);
		}
		chatReads[chatId] = message.createdAt; // o'z xabarimdan keyin suhbat o'qilgan hisoblanadi
		sync('POST', `/api/chats/${chatId}/messages`, { id: message.id, content, imageUrl, file: extra?.file, poll: extra?.poll, audio: extra?.audio, video: extra?.video, replyToId: extra?.replyToId, forwardedFrom: extra?.forwardedFrom, images: extra?.images, sticker: extra?.sticker, spoiler: extra?.spoiler, captionUp: extra?.captionUp });
		return message;
	},

	voteMessagePoll(messageId: string, optionId: string) {
		const poll = messages.find((m) => m.id === messageId)?.poll;
		const target = poll?.options.find((o) => o.id === optionId);
		if (!poll || !target) return;
		const me = users[0].id;
		for (const opt of poll.options) opt.votes = opt.votes.filter((id) => id !== me);
		target.votes.push(me);
		sync('POST', `/api/messages/${messageId}/vote`, { optionId });
	},

	editMessage(id: string, content: string) {
		const message = messages.find((m) => m.id === id);
		const text = content.trim();
		if (!message || message.senderId !== users[0].id || !text || text === message.content) return;
		message.content = text;
		message.editedAt = new Date().toISOString();
		sync('PATCH', `/api/messages/${id}`, { content: text });
	},

	toggleMessagePin(id: string) {
		const message = messages.find((m) => m.id === id);
		if (!message) return;
		message.pinnedAt = message.pinnedAt ? undefined : new Date().toISOString();
		sync('POST', `/api/messages/${id}/pin`, { pinned: !!message.pinnedAt });
	},

	getPinnedMessages(chatId: string) {
		return messages.filter((m) => m.chatId === chatId && m.pinnedAt).sort((a, b) => (a.pinnedAt! < b.pinnedAt! ? 1 : -1));
	},

	/** Xabarlarni boshqa suhbatga uzatadi (asl tartibda). So'rovnoma ovozlarsiz nusxalanadi. */
	forwardMessages(ids: string[], chatId: string) {
		const src = messages.filter((m) => ids.includes(m.id)).sort((a, b) => (a.createdAt < b.createdAt ? -1 : 1));
		for (const m of src) {
			const from = m.forwardedFrom ?? this.getUser(m.senderId)?.name ?? "Noma'lum";
			this.sendMessage(chatId, m.content, m.imageUrl, {
				file: m.file,
				audio: m.audio,
				video: m.video,
				poll: m.poll && { id: newId(), question: m.poll.question, options: m.poll.options.map((o) => ({ id: newId(), text: o.text, votes: [] })) },
				images: m.images,
				sticker: m.sticker,
				spoiler: m.spoiler,
				captionUp: m.captionUp,
				forwardedFrom: from
			});
		}
		return src.length;
	},

	deleteMessages(ids: string[]) {
		for (const id of ids) this.deleteMessage(id);
	},

	deleteMessage(id: string) {
		const message = messages.find((m) => m.id === id);
		if (!message || message.senderId !== users[0].id) return;
		messages = messages.filter((m) => m.id !== id);
		sync('DELETE', `/api/messages/${id}`);
	},

	sharePostToChat(postId: string, chatId: string) {
		const post = posts.find((p) => p.id === postId);
		if (!post) return;
		const author = this.getPostSource(post);
		const excerpt = post.content.length > 80 ? `${post.content.slice(0, 80)}…` : post.content;
		const link = `${location.origin}/post/${postId}`;
		return this.sendMessage(chatId, `${author?.name ?? 'Post'}: "${excerpt}"\n${link}`);
	},

	// --- Qoralama va rejalashtirilgan postlar (faqat muallifga ko'rinadi) ---

	/** Mening chop etilmagan postlarim: qoralamalar va vaqti kelmagan rejalashtirilganlar. channelId bo'lmasa shaxsiy postlar. */
	getUnpublished(channelId?: string) {
		const me = users[0].id;
		return posts
			.filter((p) => p.authorId === me && !isLive(p) && (p.channelId ?? '') === (channelId ?? ''))
			.sort((a, b) => (a.scheduledAt ?? '9999').localeCompare(b.scheduledAt ?? '9999') || b.createdAt.localeCompare(a.createdAt));
	},

	/** Qoralamani yoki rejalashtirilgan postni hozir chop etadi. */
	publishNow(id: string) {
		const post = posts.find((p) => p.id === id);
		if (!post || post.authorId !== users[0].id || isLive(post)) return;
		post.isDraft = undefined;
		post.scheduledAt = undefined;
		post.createdAt = new Date().toISOString();
		sync('POST', `/api/posts/${id}/publish`);
	},

	/** Postga yangi chop etish vaqti beradi (null = qoralamaga qaytaradi). Vaqt kelajakda bo'lishi kerak. */
	reschedule(id: string, iso: string | null): boolean {
		const post = posts.find((p) => p.id === id);
		if (!post || post.authorId !== users[0].id || isLive(post)) return false;
		if (iso === null) {
			post.scheduledAt = undefined;
			post.isDraft = true;
		} else {
			if (new Date(iso).getTime() <= Date.now()) return false;
			post.scheduledAt = iso;
			post.createdAt = iso;
			post.isDraft = undefined;
		}
		sync('POST', `/api/posts/${id}/schedule`, { scheduledAt: iso });
		return true;
	},

	// --- Kanal tadbirlari ---

	/** Kanalning yaqinlashayotgan (yoki hozir boshlangan) tadbirlari, eng yaqini birinchi. */
	getEventsByChannel(channelId: string) {
		return events
			.filter((e) => e.channelId === channelId && new Date(e.startsAt).getTime() + EVENT_SHOWN_MS > nowTick)
			.sort((a, b) => a.startsAt.localeCompare(b.startsAt));
	},

	createEvent(channelId: string, f: { title: string; description?: string; startsAt: string; link?: string }): { ok: boolean; error?: string } {
		const channel = channels.find((c) => c.id === channelId);
		if (!channel || channel.ownerId !== users[0].id) return { ok: false, error: 'Faqat kanal egasi tadbir qo\'sha oladi' };
		const title = f.title.trim().replace(/\s+/g, ' ');
		const description = f.description?.trim() || undefined;
		const link = f.link?.trim() || undefined;
		if (!title) return { ok: false, error: 'Tadbir nomini yozing' };
		if (title.length > 80) return { ok: false, error: 'Nom 80 belgidan oshmasin' };
		if (description && description.length > 300) return { ok: false, error: 'Tavsif 300 belgidan oshmasin' };
		if (link && !/^https?:\/\/\S+$/i.test(link)) return { ok: false, error: 'Havola http:// yoki https:// bilan boshlansin' };
		const t = new Date(f.startsAt).getTime();
		if (Number.isNaN(t) || t <= Date.now()) return { ok: false, error: 'Boshlanish vaqti kelajakda bo\'lsin' };
		if (this.getEventsByChannel(channelId).length >= MAX_UPCOMING_EVENTS) return { ok: false, error: `Bir vaqtda eng ko'pi bilan ${MAX_UPCOMING_EVENTS} ta tadbir` };
		const event: ChannelEvent = { id: newId(), channelId, title, description, startsAt: new Date(t).toISOString(), link, createdAt: new Date().toISOString(), reminderIds: [] };
		events.push(event);
		sync('POST', `/api/channels/${channelId}/events`, { id: event.id, title, description, startsAt: event.startsAt, link });
		return { ok: true };
	},

	deleteEvent(id: string) {
		const e = events.find((x) => x.id === id);
		const channel = e && channels.find((c) => c.id === e.channelId);
		if (!e || !channel || channel.ownerId !== users[0].id) return;
		events = events.filter((x) => x.id !== id);
		sync('DELETE', `/api/events/${id}`);
	},

	getEvent(id: string) {
		return events.find((e) => e.id === id);
	},

	hasEventReminder(id: string) {
		return !!events.find((e) => e.id === id)?.reminderIds.includes(users[0].id);
	},

	/** A'zo (yoki egasi) tadbirga eslatma qo'yadi/olib tashlaydi; boshlanishiga 1 soat qolganda bildirishnoma keladi. */
	toggleEventReminder(id: string) {
		const e = events.find((x) => x.id === id);
		if (!e) return;
		const me = users[0].id;
		e.reminderIds = e.reminderIds.includes(me) ? e.reminderIds.filter((x) => x !== me) : [...e.reminderIds, me];
		sync('POST', `/api/events/${id}/remind`, { on: e.reminderIds.includes(me) });
		nowTick = Date.now();
		checkEventReminders();
	},

	// --- Kanal statistikasi (faqat egasi ko'radi) ---

	getChannelStats(channelId: string) {
		const list = posts.filter((p) => p.channelId === channelId && isLive(p));
		const views = list.reduce((s, p) => s + p.views, 0);
		const commentCount = list.reduce((s, p) => s + p.comments, 0);
		const pollVotes = list.reduce((s, p) => s + (p.poll?.options.reduce((a, o) => a + o.votes.length, 0) ?? 0), 0);
		const day = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
		const today = day(new Date());
		const perDay = Array.from({ length: 7 }, (_, i) => {
			const start = today - (6 - i) * 86_400_000;
			const d = new Date(start);
			return {
				label: ['Ya', 'Du', 'Se', 'Ch', 'Pa', 'Ju', 'Sh'][d.getDay()],
				posts: list.filter((p) => day(new Date(p.createdAt)) === start).length
			};
		});
		return {
			posts: list.length,
			views,
			comments: commentCount,
			pollVotes,
			avgViews: list.length ? Math.round(views / list.length) : 0,
			avgComments: list.length ? Math.round((commentCount / list.length) * 10) / 10 : 0,
			perDay,
			top: [...list].sort((a, b) => b.views - a.views).slice(0, 3),
			scheduled: this.getUnpublished(channelId).length
		};
	},

	getChannel(id: string) {
		return channels.find((c) => c.id === id);
	},

	isHandleTaken(handle: string) {
		return channels.some((c) => c.handle.toLowerCase() === handle.toLowerCase());
	},

	createChannel(fields: { name: string; handle: string; description: string; sector?: Sector }) {
		const channel: Channel = {
			id: newId(),
			name: fields.name,
			handle: fields.handle,
			avatar: users[0].avatar,
			description: fields.description,
			sector: fields.sector,
			joined: true,
			memberCount: 1,
			ownerId: users[0].id
		};
		channels.push(channel);
		sync('POST', '/api/channels', {
			id: channel.id,
			name: fields.name,
			handle: fields.handle,
			description: fields.description,
			sector: fields.sector
		});
		return channel;
	},

	// --- Kampaniyalar (kanal ichida, all-or-nothing + bosqichli to'lov) ---
	// Demo: haqiqiy pul harakati yo'q, faqat mantiq.

	// Kampaniya muhokamasi
	getCampaignComments(campaignId: string) {
		return campaignComments.filter((c) => c.campaignId === campaignId).sort((a, b) => a.createdAt.localeCompare(b.createdAt));
	},

	addCampaignComment(campaignId: string, content: string) {
		const text = content.trim();
		if (!text || !campaigns.some((c) => c.id === campaignId)) return;
		const c: CampaignComment = { id: newId(), campaignId, authorId: users[0].id, content: text, createdAt: new Date().toISOString() };
		campaignComments.push(c);
		sync('POST', `/api/campaigns/${campaignId}/comments`, { id: c.id, content: text });
	},

	deleteCampaignComment(id: string) {
		const c = campaignComments.find((x) => x.id === id);
		if (!c || c.authorId !== users[0].id) return;
		campaignComments = campaignComments.filter((x) => x.id !== id);
		sync('DELETE', `/api/campaign-comments/${id}`);
	},

	getCampaign(id: string) {
		return campaigns.find((c) => c.id === id);
	},

	getCampaignByChannel(channelId: string) {
		const list = campaigns.filter((c) => c.channelId === channelId);
		return list[list.length - 1];
	},

	getRaised(c: Campaign) {
		return c.pledges.reduce((sum, p) => sum + p.amount, 0);
	},

	getBackerIds(c: Campaign) {
		return [...new Set(c.pledges.map((p) => p.userId))];
	},

	getCampaignPhase(c: Campaign): CampaignPhase {
		if (Date.now() < new Date(c.deadline).getTime()) return 'active';
		return this.getRaised(c) >= c.goal ? 'funded' : 'failed';
	},

	getMyPledged(c: Campaign) {
		const me = users[0].id;
		return c.pledges.filter((p) => p.userId === me).reduce((sum, p) => sum + p.amount, 0);
	},

	// Birinchi hali tasdiqlanmagan bosqich; ketma-ket ishlaydi.
	getCurrentMilestone(c: Campaign) {
		return c.milestones.find((m) => m.status !== 'released');
	},

	getReleasedAmount(c: Campaign) {
		const percent = c.milestones.filter((m) => m.status === 'released').reduce((s, m) => s + m.percent, 0);
		return Math.round((this.getRaised(c) * percent) / 100);
	},

	canCreateCampaign(channelId: string) {
		const channel = channels.find((c) => c.id === channelId);
		if (!channel || channel.ownerId !== users[0].id) return false;
		const last = this.getCampaignByChannel(channelId);
		if (!last) return true;
		const phase = this.getCampaignPhase(last);
		if (phase === 'failed') return true;
		if (phase === 'funded') return last.milestones.every((m) => m.status === 'released');
		return false;
	},

	createCampaign(
		channelId: string,
		fields: {
			title: string;
			summary: string;
			goal: number;
			days: number;
			milestones: { title: string; percent: number }[];
		}
	) {
		if (!this.canCreateCampaign(channelId)) return;
		if (fields.goal <= 0 || fields.days < 1 || fields.milestones.length === 0) return;
		if (fields.milestones.reduce((s, m) => s + m.percent, 0) !== 100) return;
		const id = newId();
		const campaign: Campaign = {
			id,
			channelId,
			title: fields.title,
			summary: fields.summary,
			goal: fields.goal,
			deadline: new Date(Date.now() + fields.days * 86_400_000).toISOString(),
			createdAt: new Date().toISOString(),
			milestones: fields.milestones.map((m, i) => ({
				id: `m${i + 1}`,
				title: m.title,
				percent: m.percent,
				status: 'locked' as const,
				approvals: []
			})),
			pledges: []
		};
		campaigns.push(campaign);
		sync('POST', `/api/channels/${channelId}/campaigns`, {
			id: campaign.id,
			title: fields.title,
			summary: fields.summary,
			goal: fields.goal,
			days: fields.days,
			milestones: fields.milestones
		});
		return campaign;
	},

	pledge(campaignId: string, amount: number) {
		const c = campaigns.find((x) => x.id === campaignId);
		const channel = c && channels.find((ch) => ch.id === c.channelId);
		if (!c || !channel || channel.ownerId === users[0].id) return false;
		if (this.getCampaignPhase(c) !== 'active' || !Number.isInteger(amount) || amount < 1000) return false;
		c.pledges.push({
			id: newId(),
			userId: users[0].id,
			amount,
			createdAt: new Date().toISOString()
		});
		sync('POST', `/api/campaigns/${campaignId}/pledge`, {
			id: c.pledges[c.pledges.length - 1].id,
			amount
		});
		return true;
	},

	// Egasi joriy bosqich hisobotini yuboradi, ovoz berish ochiladi.
	submitMilestoneReport(campaignId: string, report: string) {
		const c = campaigns.find((x) => x.id === campaignId);
		const channel = c && channels.find((ch) => ch.id === c.channelId);
		if (!c || !channel || channel.ownerId !== users[0].id) return false;
		if (this.getCampaignPhase(c) !== 'funded' || !report.trim()) return false;
		const m = this.getCurrentMilestone(c);
		if (!m || m.status !== 'locked') return false;
		m.report = report.trim();
		m.status = 'voting';
		m.approvals = [];
		sync('POST', `/api/campaigns/${campaignId}/report`, { report: m.report });
		return true;
	},

	// Faqat donor; ko'pchilik (>50%) tasdiqlasa bosqich mablag'i egasiga ochiladi.
	approveMilestone(campaignId: string) {
		const c = campaigns.find((x) => x.id === campaignId);
		if (!c) return false;
		const me = users[0].id;
		const m = this.getCurrentMilestone(c);
		if (!m || m.status !== 'voting') return false;
		if (!this.getBackerIds(c).includes(me) || m.approvals.includes(me)) return false;
		m.approvals.push(me);
		if (m.approvals.length * 2 > this.getBackerIds(c).length) m.status = 'released';
		sync('POST', `/api/campaigns/${campaignId}/approve`);
		return true;
	},

	toggleJoin(channelId: string) {
		const channel = channels.find((c) => c.id === channelId);
		if (!channel) return;
		channel.joined = !channel.joined;
		channel.memberCount += channel.joined ? 1 : -1;
		sync('POST', `/api/channels/${channelId}/join`, { on: channel.joined });
	},

	markAllNotificationsRead() {
		for (const n of notifications) n.read = true;
		sync('POST', '/api/notifications/read-all');
	},

	getTrendingPosts(limit = 5) {
		return posts.filter(isLive)
			.sort((a, b) => b.views + b.comments * 3 - (a.views + a.comments * 3))
			.slice(0, limit);
	},

	getSuggestedUsers(limit = 5, sector?: string) {
		return users
			.filter((u) => u.id !== users[0].id)
			.filter((u) => !sector || u.sector === sector)
			.sort((a, b) => a.name.localeCompare(b.name))
			.slice(0, limit);
	},

	// Yangi foydalanuvchiga tavsiya: o'z sohasidagi kanallar birinchi, keyin qolganlari (nomi bo'yicha).
	hasPosted() {
		return posts.some((p) => p.authorId === users[0].id && isLive(p));
	},

	getRecommendedChannels(limit = 5) {
		const mySector = users[0].sector;
		return channels
			.filter((c) => !c.joined && c.ownerId !== users[0].id)
			.sort((a, b) => Number(b.sector === mySector) - Number(a.sector === mySector) || a.name.localeCompare(b.name))
			.slice(0, limit);
	},

	getPopularChannels(limit = 5, sector?: string) {
		return channels
			.filter((c) => !c.joined && (!sector || c.sector === sector))
			.sort((a, b) => a.name.localeCompare(b.name))
			.slice(0, limit);
	},

	// Muddati tugamagan kampaniyalar (yangilari oldinda), kanal sohasi bo'yicha filtr.
	getActiveCampaigns(sector?: string) {
		return campaigns
			.filter((c) => this.getCampaignPhase(c) === 'active')
			.filter((c) => !sector || channels.find((ch) => ch.id === c.channelId)?.sector === sector)
			.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
	},

	search(query: string) {
		const q = query.trim().toLowerCase();
		if (!q) return { users: [], posts: [], channels: [] };
		return {
			users: users.filter(
				(u) => u.name.toLowerCase().includes(q) || u.username.toLowerCase().includes(q)
			),
			posts: posts.filter((p) => isLive(p) && p.content.toLowerCase().includes(q)),
			channels: channels.filter(
				(c) => c.name.toLowerCase().includes(q) || c.handle.toLowerCase().includes(q)
			)
		};
	}
};

// Server rad etgan o'zgarish: sababini ko'rsatib, holatni serverdagi haqiqat bilan moslaymiz.
hooks.onError = (message) => {
	toastStore.show(message, 'error');
	void data.load();
};
