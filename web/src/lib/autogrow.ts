import type { Action } from 'svelte/action';

/** Textarea balandligini matnga moslaydi (field-sizing hamma brauzerda yo'q). `max` px dan keyin ichida aylantiriladi. */
export const autogrow: Action<HTMLTextAreaElement, void> = (node) => {
	const fit = () => {
		node.style.height = 'auto';
		node.style.height = `${node.scrollHeight}px`;
	};
	node.addEventListener('input', fit);
	// Qiymat dastur orqali o'zgarganda (yuborilgach tozalash, emoji qo'shish) ham moslash.
	const id = setInterval(() => {
		if (node.dataset.h !== String(node.value.length)) {
			node.dataset.h = String(node.value.length);
			fit();
		}
	}, 100);
	fit();
	return { destroy: () => { node.removeEventListener('input', fit); clearInterval(id); } };
};

/** Enter = yuborish, Shift+Enter = yangi qator (IME yozish paytida emas). */
export function enterToSend(e: KeyboardEvent, send: () => void) {
	if (e.key !== 'Enter' || e.shiftKey || e.isComposing) return;
	e.preventDefault();
	send();
}

/** Emojini kursor o'rniga qo'shadi; yangi qiymatni qaytaradi va kursorni emoji ortiga qo'yadi. */
export function insertAtCaret(el: HTMLTextAreaElement | undefined, value: string, text: string) {
	const a = el?.selectionStart ?? value.length;
	const b = el?.selectionEnd ?? value.length;
	const next = value.slice(0, a) + text + value.slice(b);
	const caret = a + text.length;
	queueMicrotask(() => {
		el?.focus();
		el?.setSelectionRange(caret, caret);
	});
	return next;
}
