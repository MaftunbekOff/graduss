import { browser } from '$app/environment';
import type { AccentColor } from '$lib/types';

const ACCENT_KEY = 'graduss-theme-accent';

function loadAccent(): AccentColor {
	if (!browser) return 'indigo';
	try {
		const val = localStorage.getItem(ACCENT_KEY) as AccentColor;
		return val && ['indigo', 'emerald', 'amber', 'rose', 'cyan'].includes(val) ? val : 'indigo';
	} catch {
		return 'indigo';
	}
}

let currentAccent = $state<AccentColor>(loadAccent());

function applyAccent(color: AccentColor) {
	if (!browser) return;
	document.documentElement.setAttribute('data-accent', color);
	try {
		localStorage.setItem(ACCENT_KEY, color);
	} catch {}
}

if (browser) {
	applyAccent(currentAccent);
}

export const accentStore = {
	get current() {
		return currentAccent;
	},
	setAccent(color: AccentColor) {
		currentAccent = color;
		applyAccent(color);
	}
};
