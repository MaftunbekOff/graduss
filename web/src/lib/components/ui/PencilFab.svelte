<script lang="ts">
	import Pencil from '@lucide/svelte/icons/pencil';

	// inline: ro'yxat ustuni ichida pastda yopishib turadi (kengroq sahifa emas, ustun bo'yicha).
	let { label, onclick, inline = false }: { label: string; onclick: () => void; inline?: boolean } = $props();
</script>

{#snippet btn(cls: string)}
	<button
		{onclick}
		aria-label={label}
		title={label}
		class="{cls} flex size-14 items-center justify-center rounded-full bg-brand-600 text-white shadow-lg transition-colors hover:bg-brand-700 dark:bg-brand-500 dark:hover:bg-brand-400"
	>
		<Pencil class="size-6" />
	</button>
{/snippet}

{#if inline}
	<div class="pointer-events-none sticky bottom-4 z-30 mt-auto flex justify-end px-4 pt-4">
		{@render btn('pointer-events-auto')}
	</div>
{:else}
	{@render btn('fixed bottom-[calc(5rem+var(--safe-b))] right-4 z-30 sm:bottom-6 sm:right-6')}
{/if}
