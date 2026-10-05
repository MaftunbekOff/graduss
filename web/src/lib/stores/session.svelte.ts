import { browser } from '$app/environment';
import { API_ON, apiCall, hooks } from '$lib/api';
import { data } from '$lib/stores/data.svelte';

const STORAGE_KEY = 'session';

let loggedIn = $state(readInitial());
// API rejimda sessiya holati serverdan aniqlanmaguncha `ready` = false (sahifa miltillamasligi uchun).
let ready = $state(!API_ON);

function readInitial(): boolean {
	if (API_ON || !browser) return false;
	return localStorage.getItem(STORAGE_KEY) === 'true';
}

function clearLocal() {
	data.reset();
	loggedIn = false;
}

hooks.onUnauthorized = clearLocal;

export interface RegisterFields {
	name: string;
	username: string;
	email: string;
	password: string;
	sector?: string;
}

export const session = {
	get loggedIn() {
		return loggedIn;
	},
	get ready() {
		return ready;
	},
	get user() {
		return data.currentUser;
	},
	// API rejimda ilova ochilganda bir marta: cookie bo'yicha holatni yuklaydi.
	async init() {
		if (!API_ON || ready) return;
		loggedIn = await data.load();
		ready = true;
	},
	// Demo rejim.
	login() {
		loggedIn = true;
		if (browser) localStorage.setItem(STORAGE_KEY, 'true');
	},
	// Xato matnini qaytaradi, muvaffaqiyatda null.
	async apiLogin(identifier: string, password: string): Promise<string | null> {
		const r = await apiCall('POST', '/api/auth/login', { identifier, password });
		if (!r.ok) {
			return r.status === 401 ? "Foydalanuvchi nomi yoki parol noto'g'ri" : (r.data?.error ?? 'Xatolik yuz berdi');
		}
		loggedIn = await data.load();
		return loggedIn ? null : "Ma'lumotni yuklab bo'lmadi";
	},
	async apiRegister(fields: RegisterFields): Promise<string | null> {
		const r = await apiCall('POST', '/api/auth/register', fields);
		if (!r.ok) return r.data?.error ?? 'Xatolik yuz berdi';
		loggedIn = await data.load();
		return loggedIn ? null : "Ma'lumotni yuklab bo'lmadi";
	},
	async logout() {
		if (API_ON) await apiCall('POST', '/api/auth/logout');
		clearLocal();
		if (browser && !API_ON) localStorage.removeItem(STORAGE_KEY);
	}
};
