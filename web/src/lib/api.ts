// Backend bilan aloqa. VITE_API=1 bo'lsa (production) store serverga yozadi; aks holda demo rejim (faqat localStorage).
export const API_ON = import.meta.env.VITE_API === '1';

export function newId(): string {
	const c = globalThis.crypto;
	if (c?.randomUUID) return c.randomUUID();
	const b = new Uint8Array(16);
	c.getRandomValues(b);
	b[6] = (b[6] & 0x0f) | 0x40;
	b[8] = (b[8] & 0x3f) | 0x80;
	const h = [...b].map((x) => x.toString(16).padStart(2, '0')).join('');
	return `${h.slice(0, 8)}-${h.slice(8, 12)}-${h.slice(12, 16)}-${h.slice(16, 20)}-${h.slice(20)}`;
}

export interface ApiResult {
	ok: boolean;
	status: number;
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	data: any;
}

export async function apiCall(method: string, path: string, body?: unknown): Promise<ApiResult> {
	try {
		const res = await fetch(path, {
			method,
			credentials: 'same-origin',
			headers: body !== undefined ? { 'content-type': 'application/json' } : undefined,
			body: body !== undefined ? JSON.stringify(body) : undefined
		});
		let data = null;
		if (res.status !== 204) {
			try {
				data = await res.json();
			} catch {
				data = null;
			}
		}
		return { ok: res.ok, status: res.status, data };
	} catch {
		return { ok: false, status: 0, data: null };
	}
}

// Sessiya tugaganda / xatoda store bularni bog'laydi (dumaloq import bo'lmasligi uchun shu yerda).
export const hooks = {
	onUnauthorized: () => {},
	onError: (_message: string, _status: number) => {}
};

// Yozishlar ketma-ket bajariladi: "chat yarat" → "xabar yubor" tartibi buzilmaydi.
let queue: Promise<void> = Promise.resolve();

export function sync(method: string, path: string, body?: unknown, onOk?: (data: unknown) => void) {
	if (!API_ON) return;
	queue = queue.then(async () => {
		const r = await apiCall(method, path, body);
		if (r.ok) {
			onOk?.(r.data);
		} else if (r.status === 401) {
			hooks.onUnauthorized();
		} else {
			hooks.onError(r.data?.error ?? (r.status === 0 ? "Server bilan aloqa yo'q" : 'Xatolik yuz berdi'), r.status);
		}
	});
}

export function flushQueue() {
	return queue;
}
