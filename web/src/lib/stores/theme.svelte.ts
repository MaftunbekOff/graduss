import { browser } from '$app/environment';

const STORAGE_KEY = 'theme';

type ThemeChoice = 'light' | 'dark' | 'system';

function readInitial(): ThemeChoice {
	if (!browser) return 'system';
	const stored = localStorage.getItem(STORAGE_KEY);
	return stored === 'light' || stored === 'dark' ? stored : 'system';
}

let choice = $state<ThemeChoice>(readInitial());

function apply(next: ThemeChoice) {
	if (!browser) return;
	const dark =
		next === 'dark' || (next === 'system' && matchMedia('(prefers-color-scheme: dark)').matches);
	document.documentElement.classList.toggle('dark', dark);
}

apply(choice);

export const theme = {
	get choice() {
		return choice;
	},
	get isDark() {
		return browser && document.documentElement.classList.contains('dark');
	},
	set(next: ThemeChoice) {
		choice = next;
		if (browser) {
			if (next === 'system') localStorage.removeItem(STORAGE_KEY);
			else localStorage.setItem(STORAGE_KEY, next);
		}
		apply(next);
	},
	toggle() {
		this.set(this.isDark ? 'light' : 'dark');
	}
};
