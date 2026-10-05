import type { Sector } from '$lib/sectors';

export type { Sector };

/** Haftalik ish vaqti: 7 ta kun (0 = dushanba ... 6 = yakshanba); null = dam olish kuni. Vaqt Toshkent vaqti bilan, "HH:MM". */
export interface WorkHours {
	days: ({ from: string; to: string } | null)[];
}

export interface User {
	id: string;
	username: string;
	name: string;
	avatar: string;
	sector: Sector;
	bio: string;
	location: string;
	joined: string;
	banner?: string;
	website?: string;
	telegram?: string;
	isVerified?: boolean;
	/** Tug'ilgan kun (YYYY-MM-DD), ixtiyoriy. */
	birthDate?: string;
	/** Telefon raqam (+998XXXXXXXXX), ixtiyoriy. */
	phone?: string;
	/** Raqam boshqalarga ko'rinsinmi (egasi o'zi doim ko'radi). */
	showPhone?: boolean;
	/** Ish vaqti (Telegramdagi Business hours kabi), ixtiyoriy. */
	workHours?: WorkHours;
	portfolio?: PortfolioItem[];
	/** Profil qo'shig'i (ixtiyoriy). */
	music?: { title: string; artist: string; url: string };
}

export interface PortfolioItem {
	id: string;
	title: string;
	description: string;
	url?: string;
}

export interface PollOption {
	id: string;
	text: string;
	votes: string[]; // array of userIds who voted for this option
}

export interface Poll {
	id: string;
	question: string;
	options: PollOption[];
}

export interface Post {
	id: string;
	authorId: string;
	content: string;
	createdAt: string;
	editedAt?: string;
	/** Kanal egasi postni kanal tepasiga qadagan vaqt (faqat kanal postlari). */
	pinnedAt?: string;
	/** Rejalashtirilgan chop etish vaqti: shu vaqtgacha post faqat muallifga (Qoralama va rejalar oynasida) ko'rinadi. */
	scheduledAt?: string;
	/** Qoralama: chop etilmagan, faqat muallifga ko'rinadi. */
	isDraft?: boolean;
	/** Kanal egasi yaratgan kategoriya (Channel.categories dagi id). */
	categoryId?: string;
	comments: number;
	views: number;
	channelId?: string;
	mediaUrl?: string;
	/** Video havolasi (mp4/webm). Kanal sahifasidagi "Videolar" tabi shu bilan filtrlanadi. */
	videoUrl?: string;
	audioUrl?: string;
	audioDuration?: number; // in seconds
	poll?: Poll;
}

export interface Comment {
	id: string;
	postId: string;
	authorId: string;
	content: string;
	createdAt: string;
}

export interface Message {
	id: string;
	chatId: string;
	senderId: string;
	content: string;
	/** Yuborilgan rasm (data URL yoki https havola). Matn bo'sh bo'lishi mumkin. */
	imageUrl?: string;
	/** Stiker (katta emoji); xabar matnsiz, pufaksiz ko'rsatiladi. */
	sticker?: string;
	/** Albom: bir nechta rasm (imageUrl = birinchisi). Bitta rasmda yo'q. */
	images?: string[];
	/** Rasm(lar) bosilgunча xiralashtirilgan. */
	spoiler?: boolean;
	/** Izoh (content) mediadan tepada ko'rsatiladi. */
	captionUp?: boolean;
	/** Biriktirilgan fayl (demo: data URL, kichik hajm). */
	file?: { name: string; size: number; url: string };
	/** Ovozli xabar (demo: data URL). */
	audio?: { url: string; duration: number };
	/** Doira video xabar (demo: data URL). */
	video?: { url: string; duration: number };
	/** Suhbatdagi so'rovnoma. */
	poll?: Poll;
	/** Javob berilgan xabar (shu suhbatdagi Message.id). */
	replyToId?: string;
	/** Boshqa suhbatdan uzatilgan xabar: asl yuboruvchi ismi. */
	forwardedFrom?: string;
	editedAt?: string;
	/** Suhbatda qadalgan vaqt. */
	pinnedAt?: string;
	createdAt: string;
}

/** Kampaniya muhokamasi (donorlar va a'zolar fikri). */
export interface CampaignComment {
	id: string;
	campaignId: string;
	authorId: string;
	content: string;
	createdAt: string;
}

export interface Chat {
	id: string;
	participantIds: string[];
	isGroup: boolean;
	title?: string;
}

export interface Category {
	id: string;
	name: string;
}

export interface Channel {
	id: string;
	name: string;
	handle: string;
	avatar: string;
	description: string;
	/** A'zolar soni: faqat kanal egasiga ko'rsatiladi (boshqalarga hech qayerda ko'rinmaydi). */
	memberCount: number;
	joined: boolean;
	ownerId: string;
	/** Kanal egasi xohlasa o'zini egasi sifatida ko'rsatadi (standart: ko'rsatilmaydi). */
	showOwner?: boolean;
	/** Muqova gradienti (Tailwind klasslari); egasi tanlaydi. */
	banner?: string;
	/** Kanal egasi yaratgan kategoriyalar ("Postlar" tabidagi ro'yxatda ko'rinadi). */
	categories?: Category[];
	sector?: Sector;
}

/** Kanal tadbiri (vebinar, uchrashuv): kanal sahifasida, a'zolar eslatma qo'yadi. */
export interface ChannelEvent {
	id: string;
	channelId: string;
	title: string;
	description?: string;
	startsAt: string;
	/** Qo'shilish havolasi (http/https), ixtiyoriy. */
	link?: string;
	createdAt: string;
	/** Eslatma qo'ygan foydalanuvchilar; soni faqat kanal egasiga ko'rinadi. */
	reminderIds: string[];
}

export type MilestoneStatus = 'locked' | 'voting' | 'released';

export interface Milestone {
	id: string;
	title: string;
	percent: number; // share of the goal released when this milestone is approved
	status: MilestoneStatus;
	report?: string; // owner's proof of completion, submitted when voting opens
	approvals: string[]; // backer userIds who approved
}

export interface Pledge {
	id: string;
	userId: string;
	amount: number; // so'm
	createdAt: string;
}

export interface Campaign {
	id: string;
	channelId: string;
	title: string;
	summary: string;
	goal: number; // so'm
	deadline: string;
	createdAt: string;
	milestones: Milestone[];
	pledges: Pledge[];
}

// active: collecting; funded: goal met at deadline (milestone phase); failed: goal missed, all pledges refunded
export type CampaignPhase = 'active' | 'funded' | 'failed';

export type NotificationType = 'comment' | 'channel' | 'mention' | 'event';

export interface AppNotification {
	id: string;
	type: NotificationType;
	actorId: string;
	postId?: string;
	channelId?: string;
	/** 'event' turi: tadbir (ChannelEvent.id). */
	eventId?: string;
	createdAt: string;
	read: boolean;
}

export type ToastType = 'success' | 'info' | 'error';

export interface ToastMessage {
	id: string;
	message: string;
	type?: ToastType;
}

export type AccentColor = 'indigo' | 'emerald' | 'amber' | 'rose' | 'cyan';


