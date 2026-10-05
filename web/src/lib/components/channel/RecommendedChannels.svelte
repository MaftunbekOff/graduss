<script lang="ts">
	import { data } from '$lib/stores/data.svelte';
	import Check from '@lucide/svelte/icons/check';

	// Ro'yxat bir marta olinadi: a'zo bo'lingach qatorlar yo'qolib, joylar sakramasin.
	let { limit = 5 }: { limit?: number } = $props();
	const shown = data.getRecommendedChannels(limit);
</script>

<ul class="flex flex-col gap-2">
	{#each shown as c (c.id)}
		{@const joined = !!data.getChannel(c.id)?.joined}
		<li class="flex items-center gap-3 rounded-xl border border-neutral-200 p-2.5 dark:border-neutral-800">
			<a href={`/channels/${c.id}`} class="flex min-w-0 flex-1 items-center gap-3">
				<span
					class="flex size-10 shrink-0 items-center justify-center rounded-full text-sm font-semibold text-white"
					style:background-color={c.avatar}
					style:background-image="linear-gradient(145deg, rgba(255,255,255,.28), rgba(0,0,0,.12))"
				>
					{c.name[0]}
				</span>
				<span class="min-w-0">
					<span class="block truncate text-sm font-bold">{c.name}</span>
					<span class="block truncate text-xs text-neutral-500 dark:text-neutral-400">{c.description}</span>
				</span>
			</a>
			<button
				type="button"
				onclick={() => data.toggleJoin(c.id)}
				aria-pressed={joined}
				class="inline-flex shrink-0 items-center gap-1 rounded-full px-3 py-1.5 text-xs font-semibold transition-colors {joined
					? 'bg-brand-50 text-brand-700 dark:bg-brand-400/10 dark:text-brand-300'
					: 'bg-brand-600 text-white hover:bg-brand-700'}"
			>
				{#if joined}<Check class="size-3.5" />A'zo{:else}A'zo bo'lish{/if}
			</button>
		</li>
	{/each}
</ul>
