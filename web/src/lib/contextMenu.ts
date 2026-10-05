import type { Action } from 'svelte/action';

interface Opts {
	onopen: (x: number, y: number) => void;
	/** Menyu ochilmasin (masalan, tanlash rejimida). */
	disabled?: boolean;
	/** Shu selektorga mos ichki elementlarda brauzerning o'z menyusi qoladi. */
	ignore?: string;
}

/** Sichqonchaning o'ng tugmasi yoki sensorli ekranda bosib turish (iOS contextmenu yubormaydi) menyuni ochadi. */
export const contextMenu: Action<HTMLElement, Opts> = (node, initial) => {
	let opts = initial;
	let timer: ReturnType<typeof setTimeout> | undefined;
	let start = { x: 0, y: 0 };
	const skip = (t: EventTarget | null) => opts.disabled || (!!opts.ignore && !!(t as HTMLElement).closest(opts.ignore));

	const onContext = (e: MouseEvent) => {
		if (skip(e.target)) return;
		e.preventDefault();
		clearTimeout(timer);
		opts.onopen(e.clientX, e.clientY);
	};
	const down = (e: PointerEvent) => {
		if (e.pointerType === 'mouse' || skip(e.target)) return;
		start = { x: e.clientX, y: e.clientY };
		clearTimeout(timer);
		timer = setTimeout(() => {
			// Qo'yib yuborilgach havola/tugma bosilgan hisoblanmasin.
			node.addEventListener('click', (ev) => ev.preventDefault(), { capture: true, once: true });
			opts.onopen(start.x, start.y);
		}, 450);
	};
	const move = (e: PointerEvent) => {
		if (Math.hypot(e.clientX - start.x, e.clientY - start.y) > 8) clearTimeout(timer);
	};
	const cancel = () => clearTimeout(timer);

	node.addEventListener('contextmenu', onContext);
	node.addEventListener('pointerdown', down);
	node.addEventListener('pointermove', move);
	node.addEventListener('pointerup', cancel);
	node.addEventListener('pointercancel', cancel);
	return {
		update: (o) => (opts = o),
		destroy() {
			clearTimeout(timer);
			node.removeEventListener('contextmenu', onContext);
			node.removeEventListener('pointerdown', down);
			node.removeEventListener('pointermove', move);
			node.removeEventListener('pointerup', cancel);
			node.removeEventListener('pointercancel', cancel);
		}
	};
};
