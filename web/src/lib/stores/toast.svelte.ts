import type { ToastMessage, ToastType } from '$lib/types';

let toasts = $state<ToastMessage[]>([]);
let nextId = 1;

export function showToast(message: string, type: ToastType = 'info', durationMs = 3500) {
	const id = `t_${nextId++}`;
	const item: ToastMessage = { id, message, type };
	toasts = [...toasts, item];

	setTimeout(() => {
		removeToast(id);
	}, durationMs);
}

export function removeToast(id: string) {
	toasts = toasts.filter((t) => t.id !== id);
}

export const toastStore = {
	get toasts() {
		return toasts;
	},
	show: showToast,
	remove: removeToast
};
