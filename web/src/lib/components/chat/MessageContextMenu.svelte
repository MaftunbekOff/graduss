<script lang="ts" module>
	export type MenuAction = 'reply' | 'edit' | 'copy' | 'pin' | 'forward' | 'select' | 'delete';
</script>

<script lang="ts">
	import type { Message } from '$lib/types';
	import ContextMenu, { type ContextMenuItem } from '$lib/components/ui/ContextMenu.svelte';
	import Reply from '@lucide/svelte/icons/reply';
	import Pencil from '@lucide/svelte/icons/pencil';
	import Copy from '@lucide/svelte/icons/copy';
	import Pin from '@lucide/svelte/icons/pin';
	import PinOff from '@lucide/svelte/icons/pin-off';
	import Forward from '@lucide/svelte/icons/forward';
	import SquareCheck from '@lucide/svelte/icons/square-check';
	import Trash2 from '@lucide/svelte/icons/trash-2';

	let {
		message,
		mine,
		x,
		y,
		onAction,
		onClose
	}: { message: Message; mine: boolean; x: number; y: number; onAction: (a: MenuAction) => void; onClose: () => void } = $props();

	const items = $derived(
		[
			{ key: 'reply', label: 'Javob berish', icon: Reply },
			...(mine && message.content ? [{ key: 'edit', label: 'Tahrirlash', icon: Pencil }] : []),
			...(message.content ? [{ key: 'copy', label: 'Matnni nusxalash', icon: Copy }] : []),
			{ key: 'pin', label: message.pinnedAt ? 'Qadashni olib tashlash' : 'Qadash', icon: message.pinnedAt ? PinOff : Pin },
			{ key: 'forward', label: 'Uzatish', icon: Forward },
			{ key: 'select', label: 'Tanlash', icon: SquareCheck },
			...(mine ? [{ key: 'delete', label: "O'chirish", icon: Trash2, danger: true }] : [])
		] as ContextMenuItem[]
	);
</script>

<ContextMenu {items} {x} {y} label="Xabar amallari" onSelect={(k) => onAction(k as MenuAction)} {onClose} />
