// Profil qo'shig'i: nom, ijrochi va havola. To'g'ridan-to'g'ri audio fayl bo'lsa profilda o'ynatiladi,
// boshqa havola (YouTube, Spotify va h.k.) bo'lsa "Tinglash" tugmasi uni yangi oynada ochadi.
export interface ProfileMusic {
	title: string;
	artist: string;
	url: string;
}

export const MUSIC_TITLE_MAX = 60;
export const MUSIC_ARTIST_MAX = 60;

export const isDirectAudio = (url: string) => /\.(mp3|ogg|oga|wav|m4a|aac|opus|webm)(\?|#|$)/i.test(url);

/** Xato matni yoki null. Mahalliy namuna fayllari (/demo/...) ham qabul qilinadi. */
export function validateMusic(m: { title: string; artist: string; url: string }): string | null {
	if (!m.title.trim()) return "Qo'shiq nomini yozing";
	if (m.title.trim().length > MUSIC_TITLE_MAX) return `Nom ${MUSIC_TITLE_MAX} belgidan oshmasin`;
	if (m.artist.trim().length > MUSIC_ARTIST_MAX) return `Ijrochi ${MUSIC_ARTIST_MAX} belgidan oshmasin`;
	const u = m.url.trim();
	if (!u) return "Havolani kiriting (audio fayl yoki qo'shiq havolasi)";
	if (!(/^https?:\/\/\S+$/i.test(u) || /^\/demo\/[\w.-]+$/.test(u))) return "Havola https:// bilan boshlanishi kerak";
	return null;
}
