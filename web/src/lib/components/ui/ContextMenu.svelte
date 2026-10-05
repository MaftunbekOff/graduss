<script lang="ts" module>
	import type { Component } from 'svelte';
	export interface ContextMenuItem {
		key: string;
		label: string;
		icon: Component<{ class?: string }>;
		danger?: boolean;
	}
</script>

<script lang="ts">
	import { scale } from 'svelte/transition';
	import { cubicOut } from 'svelte/easing';

	let {
		items,
		x,
		y,
		label,
		onSelect,
		onClose
	}: { items: ContextMenuItem[]; x: number; y: number; label: string; onSelect: (key: string) => void; onClose: () => void } = $props();

	let el = $state<HTMLDivElement>();
	let pos = $state({ left: 0, top: 0 });

	// Menyu ekran ichida qolsin: o'ng/past chetga yaqin bo'lsa ichkariga suriladi.
	$effect(() => {
		if (!el) return;
		const m = 8;
		pos = {
			left: Math.max(m, Math.min(x, window.innerWidth - el.offsetWidth - m)),
			top: Math.max(m, Math.min(y, window.innerHeight - el.offsetHeight - m))
		};
		el.querySelector<HTMLElement>('button')?.focus();
	});

	function onKey(e: KeyboardEvent) {
		if (e.key === 'Escape') return onClose();
		if (e.key !== 'ArrowDown' && e.key !== 'ArrowUp') return;
		e.preventDefault();
		const btns = [...(el?.querySelectorAll<HTMLElement>('button') ?? [])];
		const i = btns.indexOf(document.activeElement as HTMLElement);
		btns[(i + (e.key === 'ArrowDown' ? 1 : -1) + btns.length) % btns.length]?.focus();
	}
</script>

<svelte:window onkeydown={onKey} onresize={onClose} />

<button type="button" aria-label="Yopish" tabindex="-1" onclick={onClose} oncontextmenu={(e) => { e.preventDefault(); onClose(); }} class="fixed inset-0 z-40 cursor-default"></button>
<div
	bind:this={el}
	role="menu"
	aria-label={label}
	transition:scale={{ duration: 120, start: 0.95, easing: cubicOut }}
	style="left: {pos.left}px; top: {pos.top}px; transform-origin: top left"
	class="fixed z-50 w-56 overflow-hidden rounded-xl border border-neutral-200 bg-white py-1 shadow-[var(--shadow-pop)] dark:border-neutral-800 dark:bg-neutral-900"
>
	{#each items as item (item.key)}
		<button
			type="button"
			role="menuitem"
			onclick={() => onSelect(item.key)}
			class="flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm focus:outline-none {item.danger
				? 'text-rose-600 hover:bg-rose-50 focus:bg-rose-50 dark:hover:bg-rose-500/10 dark:focus:bg-rose-500/10'
				: 'text-neutral-800 hover:bg-neutral-50 focus:bg-neutral-50 dark:text-neutral-200 dark:hover:bg-neutral-800 dark:focus:bg-neutral-800'}"
		>
			<item.icon class="size-4" />
			{item.label}
		</button>
	{/each}
</div>
