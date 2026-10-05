import { browser } from '$app/environment';

// Ilova ichida boshqa sahifadan kelinganmi va qaysi sahifadan (orqaga tugmasi va faol bo'lim shunga qarab).
// Sahifa yangilanganda (F5) ham eslab qolinadi: sessionStorage'da "qaysi sahifa <- qayerdan" saqlanadi.
const KEY = 'graduss-nav';

function restore(): { canBack: boolean; from: string } {
	if (!browser) return { canBack: false, from: '' };
	try {
		const s = JSON.parse(sessionStorage.getItem(KEY) ?? 'null') as { to: string; from: string } | null;
		if (s && s.to === location.pathname) return { canBack: true, from: s.from };
	} catch {
		/* sessionStorage yo'q */
	}
	return { canBack: false, from: '' };
}

export const navHist = $state(restore());

export function rememberNav(from: string, to: string) {
	navHist.canBack = true;
	navHist.from = from;
	try {
		sessionStorage.setItem(KEY, JSON.stringify({ to, from }));
	} catch {
		/* sessionStorage yo'q */
	}
}
