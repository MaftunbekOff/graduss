import { browser } from '$app/environment';
import { data } from '$lib/stores/data.svelte';

// Birinchi marta kirgan foydalanuvchi uchun 3 qadamli yo'l-yo'riq. Qadamlar avtomatik belgilanadi.
const KEY = 'graduss-onboarding';
const MIN_CHANNELS = 3;

let dismissed = $state(read());

function read(): boolean {
	if (!browser) return true;
	try {
		return localStorage.getItem(KEY) === 'dismissed';
	} catch {
		return true;
	}
}

export const onboarding = {
	minChannels: MIN_CHANNELS,
	get profileDone() {
		const me = data.currentUser;
		return !!me?.bio?.trim() && !!me?.location?.trim();
	},
	get joinedCount() {
		return data.channels.filter((c) => c.joined).length;
	},
	get channelsDone() {
		return this.joinedCount >= MIN_CHANNELS;
	},
	get postDone() {
		return data.hasPosted();
	},
	get doneCount() {
		return Number(this.profileDone) + Number(this.channelsDone) + Number(this.postDone);
	},
	get allDone() {
		return this.doneCount === 3;
	},
	/** Yo'l-yo'riq ko'rinishi: yopilmagan va hammasi bajarilmagan. */
	get visible() {
		return !dismissed && !this.allDone;
	},
	dismiss() {
		dismissed = true;
		try {
			localStorage.setItem(KEY, 'dismissed');
		} catch {}
	},
	/** Demo: yangi ro'yxatdan o'tishda qaytadan boshlash. */
	reset() {
		dismissed = false;
		try {
			localStorage.removeItem(KEY);
		} catch {}
	}
};
