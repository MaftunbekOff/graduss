import { page } from '$app/state';

/**
 * Sahifadan chiqib ketayotganda (yangi sahifa hali chizilmagan paytda) eski sahifa yangi manzil bo'yicha
 * qayta chizilib, bir lahza boshqa bo'lim ko'rinib qolmasligi uchun: qiymat faqat shu bo'limda yangilanadi.
 */
export function stableParam<T>(prefix: string, read: () => T) {
	let v = $state.raw(read());
	$effect.pre(() => {
		if (page.url.pathname.startsWith(prefix)) v = read();
	});
	return {
		get value() {
			return v;
		}
	};
}
