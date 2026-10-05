const UNITS: [Intl.RelativeTimeFormatUnit, number][] = [
	['year', 31536000],
	['month', 2592000],
	['week', 604800],
	['day', 86400],
	['hour', 3600],
	['minute', 60]
];

const rtf = new Intl.RelativeTimeFormat('uz', { numeric: 'auto' });

const labels: Record<string, (n: number) => string> = {
	year: (n) => `${n} yil oldin`,
	month: (n) => `${n} oy oldin`,
	week: (n) => `${n} hafta oldin`,
	day: (n) => `${n} kun oldin`,
	hour: (n) => `${n} soat oldin`,
	minute: (n) => `${n} daqiqa oldin`
};

export function timeAgo(iso: string): string {
	const seconds = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
	if (seconds < 60) return 'hozirgina';
	for (const [unit, secondsInUnit] of UNITS) {
		const value = Math.floor(seconds / secondsInUnit);
		if (value >= 1) return labels[unit](value);
	}
	return 'hozirgina';
}

const MONTHS = [
	'yanvar',
	'fevral',
	'mart',
	'aprel',
	'may',
	'iyun',
	'iyul',
	'avgust',
	'sentyabr',
	'oktyabr',
	'noyabr',
	'dekabr'
];

export function formatJoinDate(iso: string): string {
	const d = new Date(iso);
	return `${MONTHS[d.getMonth()]} ${d.getFullYear()}-yildan beri`;
}

/** "1990-05-14" -> "14 may 1990" */
export function formatBirthDate(iso: string): string {
	const [y, m, d] = iso.split('-').map(Number);
	return `${d} ${MONTHS[m - 1]} ${y}`;
}

/** Telefonni +998 XX XXX XX XX ko'rinishida qaytaradi; noto'g'ri bo'lsa null. */
export function normalizePhone(raw: string): string | null {
	let d = raw.replace(/\D/g, '');
	if (d.length === 9) d = '998' + d;
	return /^998\d{9}$/.test(d) ? '+' + d : null;
}

export function formatPhone(p: string): string {
	return p.replace(/^\+998(\d{2})(\d{3})(\d{2})(\d{2})$/, '+998 $1 $2 $3 $4');
}

export function formatCount(n: number): string {
	if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1).replace(/\.0$/, '')} mln`;
	if (n >= 1_000) return `${(n / 1_000).toFixed(1).replace(/\.0$/, '')} ming`;
	return `${n}`;
}

export function formatSum(n: number): string {
	return `${Math.round(n).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ')} so'm`;
}

export function daysLeft(iso: string): number {
	return Math.max(0, Math.ceil((new Date(iso).getTime() - Date.now()) / 86_400_000));
}

export const WEEKDAYS = ['Dushanba', 'Seshanba', 'Chorshanba', 'Payshanba', 'Juma', 'Shanba', 'Yakshanba'];
const WD_SHORT = ['Du', 'Se', 'Chor', 'Pay', 'Ju', 'Sha', 'Yak'];

/** Toshkent vaqti bo'yicha hozirgi hafta kuni (0 = dushanba) va daqiqa. */
function tashkentNow(now: Date) {
	const parts = new Intl.DateTimeFormat('en-GB', { timeZone: 'Asia/Tashkent', weekday: 'short', hour: '2-digit', minute: '2-digit', hour12: false }).formatToParts(now);
	const get = (t: string) => parts.find((p) => p.type === t)?.value ?? '';
	const day = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].indexOf(get('weekday'));
	return { day, min: (Number(get('hour')) % 24) * 60 + Number(get('minute')) };
}
const toMin = (hhmm: string) => Number(hhmm.slice(0, 2)) * 60 + Number(hhmm.slice(3, 5));

/** Hozir ochiqmi va qisqa matn: "Ochiq · 18:00 gacha" / "Yopiq · ertaga 09:00 da ochiladi". */
export function workStatus(days: ({ from: string; to: string } | null)[], now = new Date()): { open: boolean; text: string } {
	const { day, min } = tashkentNow(now);
	const today = days[day];
	if (today && min >= toMin(today.from) && min < toMin(today.to)) return { open: true, text: `Ochiq · ${today.to} gacha` };
	if (today && min < toMin(today.from)) return { open: false, text: `Yopiq · ${today.from} da ochiladi` };
	for (let i = 1; i <= 7; i++) {
		const d = (day + i) % 7;
		const h = days[d];
		if (h) return { open: false, text: `Yopiq · ${i === 1 ? 'ertaga' : WEEKDAYS[d]} ${h.from} da ochiladi` };
	}
	return { open: false, text: 'Yopiq' };
}

export const defaultWorkDays = (): ({ from: string; to: string } | null)[] => [0, 1, 2, 3, 4, 5, 6].map((i) => (i < 5 ? { from: '09:00', to: '18:00' } : null));
export { WD_SHORT };

/** Bugungi hafta kuni indeksi (Toshkent vaqti, 0 = dushanba). */
export const todayIndex = (now = new Date()) => tashkentNow(now).day;

/** Soat:daqiqa (mahalliy vaqt), masalan 14:05. */
export function clockTime(iso: string): string {
	const d = new Date(iso);
	return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
}

/** Sana va vaqt (mahalliy): "3 oktyabr, 15:00". */
export function formatDateTime(iso: string): string {
	const d = new Date(iso);
	return `${d.getDate()} ${MONTHS[d.getMonth()]}, ${clockTime(iso)}`;
}

/** `<input type="datetime-local">` qiymati (mahalliy vaqt) uchun: "2026-10-03T15:00". */
export function toLocalInput(d: Date): string {
	const p = (n: number) => String(n).padStart(2, '0');
	return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}T${p(d.getHours())}:${p(d.getMinutes())}`;
}
