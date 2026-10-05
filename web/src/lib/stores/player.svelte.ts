// Umumiy ijro (Telegram kabi): ovozli va doira video xabar bitta global element orqali ijro etiladi,
// shuning uchun boshqa sahifaga o'tilsa ham davom etadi va yuqoridagi mini-pleyer (MiniPlayer) orqali boshqariladi.

export interface Track {
	id: string; // xabar id
	kind: 'voice' | 'video';
	src: string;
	title: string; // yuboruvchi ismi
	chatId: string;
	duration: number;
}

let current = $state<Track | null>(null);
let playing = $state(false);
let time = $state(0);
let total = $state(0);
let rate = $state(1);
let el = $state.raw<HTMLMediaElement | null>(null);

function release() {
	if (el) {
		el.onplay = el.onpause = el.ontimeupdate = el.onloadedmetadata = el.onended = null;
		el.pause();
		el.removeAttribute('src');
		el.load();
	}
	el = null;
}

function close() {
	release();
	current = null;
	playing = false;
	time = 0;
	total = 0;
}

function start(track: Track, at = 0) {
	release();
	const m: HTMLMediaElement = track.kind === 'video' ? document.createElement('video') : new Audio();
	if (m instanceof HTMLVideoElement) m.playsInline = true;
	m.preload = 'auto';
	m.src = track.src;
	m.playbackRate = rate;
	m.onplay = () => (playing = true);
	m.onpause = () => (playing = false);
	m.ontimeupdate = () => (time = m.currentTime);
	m.onloadedmetadata = () => {
		if (Number.isFinite(m.duration) && m.duration > 0) total = m.duration;
	};
	m.onended = () => close();
	current = track;
	time = at;
	total = track.duration;
	el = m;
	if (at > 0) m.currentTime = at;
	void m.play().catch(() => (playing = false));
}

export const player = {
	get current() {
		return current;
	},
	get playing() {
		return playing;
	},
	get time() {
		return time;
	},
	get total() {
		return total;
	},
	get rate() {
		return rate;
	},
	/** Video xabar uchun: ijro etilayotgan video element (komponent o'z ichiga joylaydi). */
	get el() {
		return el;
	},
	isCurrent(id: string) {
		return current?.id === id;
	},
	play(track: Track, at = 0) {
		start(track, at);
	},
	toggle() {
		if (!el) return;
		if (el.paused) void el.play();
		else el.pause();
	},
	seek(seconds: number) {
		if (!el) return;
		el.currentTime = Math.max(0, seconds);
		time = el.currentTime;
	},
	cycleRate() {
		rate = rate === 1 ? 1.5 : rate === 1.5 ? 2 : 1;
		if (el) el.playbackRate = rate;
	},
	close
};
