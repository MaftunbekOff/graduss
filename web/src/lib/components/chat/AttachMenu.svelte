<script lang="ts">
	import Paperclip from '@lucide/svelte/icons/paperclip';
	import ImageIcon from '@lucide/svelte/icons/image';
	import FileText from '@lucide/svelte/icons/file-text';
	import BarChart2 from '@lucide/svelte/icons/bar-chart-2';

	// Biriktirish menyusi: Media, Fayl, So'rovnoma. Menyu tugma ustida ochiladi.
	let {
		onmedia,
		onfile,
		onpoll,
		disabled = false
	}: { onmedia: () => void; onfile: () => void; onpoll: () => void; disabled?: boolean } = $props();

	let open = $state(false);
	const choose = (fn: () => void) => {
		open = false;
		fn();
	};
</script>

<svelte:window onkeydown={(e) => open && e.key === 'Escape' && (open = false)} />

<div class="relative shrink-0">
	<button
		type="button"
		onclick={() => (open = !open)}
		{disabled}
		aria-label="Biriktirish"
		aria-haspopup="menu"
		aria-expanded={open}
		class="flex size-10 items-center justify-center rounded-full text-neutral-500 transition-colors hover:bg-neutral-100 hover:text-brand-600 disabled:opacity-50 dark:text-neutral-400 dark:hover:bg-neutral-800"
	>
		<Paperclip class="size-5" />
	</button>
	{#if open}
		<button type="button" aria-label="Yopish" tabindex="-1" onclick={() => (open = false)} class="fixed inset-0 z-20 cursor-default"></button>
		<div role="menu" class="absolute bottom-full left-0 z-30 mb-2 w-48 overflow-hidden rounded-xl border border-neutral-200 bg-white py-1 shadow-[var(--shadow-pop)] dark:border-neutral-800 dark:bg-neutral-900">
			{#each [{ label: 'Media', icon: ImageIcon, fn: onmedia }, { label: 'Fayl', icon: FileText, fn: onfile }, { label: "So'rovnoma", icon: BarChart2, fn: onpoll }] as it (it.label)}
				<button
					type="button"
					role="menuitem"
					onclick={() => choose(it.fn)}
					class="flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm text-neutral-800 hover:bg-neutral-50 dark:text-neutral-200 dark:hover:bg-neutral-800"
				>
					<it.icon class="size-4" />
					{it.label}
				</button>
			{/each}
		</div>
	{/if}
</div>
