// @username va kanal manzili (@handle) qoidalari. Qabul qilinadi: kun.uz, kunuz, kun-uz, kun24.uz
// Qabul qilinmaydi: kun_uz (pastki chiziq), 123uz (raqam bilan boshlanadi), kun__uz / kun..uz / kun.-uz (ketma-ket ajratgich).
export const HANDLE_MIN = 3;
export const HANDLE_MAX = 30;
export const HANDLE_HINT = 'Kichik lotin harf, raqam, nuqta yoki defis. Misol: kun.uz, kunuz, kun-uz';

const RESERVED = new Set([
	'admin', 'administrator', 'root', 'support', 'help', 'api', 'www', 'graduss', 'official',
	'settings', 'login', 'register', 'search', 'feed', 'chats', 'channels', 'notifications',
	'profile', 'post', 'posts', 'null', 'undefined'
]);

/** Yozish paytida: kichik harfga o'tkazadi, bo'shliqlarni olib tashlaydi (qolgan xatolar ko'rsatiladi). */
export const sanitizeHandleInput = (s: string) => s.toLowerCase().replace(/\s+/g, '').slice(0, HANDLE_MAX);

/** Yozish paytida faqat aniq xatolarni ko'rsatadi (qisqa/oxiri nuqta bo'lgan hali tugallanmagan nomga tegmaydi). */
export function liveHandleError(raw: string): string | undefined {
	const s = raw.toLowerCase();
	if (!s) return undefined;
	if (!/^[a-z0-9.-]+$/.test(s)) return validateHandle(s) ?? undefined;
	if (!/^[a-z]/.test(s)) return 'Harf bilan boshlanishi kerak (raqam bilan emas)';
	if (/[.-]{2,}/.test(s)) return 'Nuqta va defis ketma-ket kelmasin (kun..uz, kun.-uz mumkin emas)';
	return undefined;
}

/** Xato matni yoki null (to'g'ri). */
export function validateHandle(raw: string): string | null {
	const s = raw.trim().toLowerCase();
	if (s.length < HANDLE_MIN) return `Kamida ${HANDLE_MIN} belgi kiriting`;
	if (s.length > HANDLE_MAX) return `Ko'pi bilan ${HANDLE_MAX} belgi`;
	if (!/^[a-z0-9.-]+$/.test(s)) return "Faqat kichik lotin harf, raqam, nuqta (.) va defis (-) mumkin, pastki chiziq (_) mumkin emas";
	if (!/^[a-z]/.test(s)) return "Harf bilan boshlanishi kerak (raqam bilan emas)";
	if (!/[a-z0-9]$/.test(s)) return "Harf yoki raqam bilan tugashi kerak";
	if (/[.-]{2,}/.test(s)) return "Nuqta va defis ketma-ket kelmasin (kun..uz, kun.-uz mumkin emas)";
	if (RESERVED.has(s.replace(/[.-]/g, ''))) return "Bu nom band qilingan";
	return null;
}
