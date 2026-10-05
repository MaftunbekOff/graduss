<script lang="ts">
	import { data } from '$lib/stores/data.svelte';
	import { formatCount } from '$lib/utils';
	import Modal from '$lib/components/ui/Modal.svelte';

	let { open = $bindable(false), channelId }: { open: boolean; channelId: string } = $props();

	const channel = $derived(data.getChannel(channelId));
	const stats = $derived(data.getChannelStats(channelId));
	const maxDay = $derived(Math.max(1, ...stats.perDay.map((d) => d.posts)));
	const tiles = $derived([
		{ label: 'Postlar', value: stats.posts },
		{ label: "Ko'rishlar", value: stats.views },
		{ label: 'Izohlar', value: stats.comments },
		{ label: "So'rovnoma ovozlari", value: stats.pollVotes },
		{ label: "Postga o'rtacha ko'rish", value: stats.avgViews },
		{ label: "Postga o'rtacha izoh", value: stats.avgComments }
	]);
	const excerpt = (t: string) => (t.trim() ? (t.length > 70 ? `${t.slice(0, 70)}…` : t) : 'Media post');
</script>

<Modal bind:open title="Kanal statistikasi" maxWidth="max-w-lg">
	<p class="mb-3 text-sm text-neutral-500 dark:text-neutral-400">Faqat sizga ko'rinadi. A'zolar soni: {formatCount(channel?.memberCount ?? 0)}.</p>

	<dl class="grid grid-cols-2 gap-2 sm:grid-cols-3">
		{#each tiles as t (t.label)}
			<div class="rounded-xl border border-neutral-200 px-3 py-2.5 dark:border-neutral-800">
				<dd class="text-xl font-extrabold tabular-nums">{formatCount(t.value)}</dd>
				<dt class="text-xs text-neutral-500 dark:text-neutral-400">{t.label}</dt>
			</div>
		{/each}
	</dl>

	<h3 class="mb-2 mt-5 text-sm font-bold">So'nggi 7 kunda chop etilgan postlar</h3>
	<div class="flex h-24 items-end gap-2" role="img" aria-label={`Kunlar bo'yicha postlar soni: ${stats.perDay.map((d) => `${d.label} ${d.posts}`).join(', ')}`}>
		{#each stats.perDay as d, i (i)}
			<div class="flex h-full flex-1 flex-col items-center justify-end gap-1">
				<span class="text-xs tabular-nums text-neutral-500">{d.posts || ''}</span>
				<span class="w-full rounded-t-md bg-brand-500 dark:bg-brand-400" style:height="{d.posts ? Math.max(8, (d.posts / maxDay) * 100) : 3}%" style:opacity={d.posts ? 1 : 0.25}></span>
			</div>
		{/each}
	</div>
	<div class="mt-1 flex gap-2 text-center text-xs text-neutral-500" aria-hidden="true">
		{#each stats.perDay as d, i (i)}<span class="flex-1">{d.label}</span>{/each}
	</div>

	<h3 class="mb-2 mt-5 text-sm font-bold">Eng ko'p ko'rilgan postlar</h3>
	<ol class="flex flex-col gap-1.5">
		{#each stats.top as p (p.id)}
			<li>
				<a href={`/post/${p.id}`} class="flex items-center justify-between gap-3 rounded-xl border border-neutral-200 px-3 py-2 text-sm hover:bg-neutral-50 dark:border-neutral-800 dark:hover:bg-neutral-800/60">
					<span class="min-w-0 truncate">{excerpt(p.content)}</span>
					<span class="shrink-0 text-xs tabular-nums text-neutral-500">{formatCount(p.views)} ko'rish · {p.comments} izoh</span>
				</a>
			</li>
		{:else}
			<li class="rounded-xl border border-dashed border-neutral-300 px-3 py-4 text-center text-sm text-neutral-500 dark:border-neutral-700">Hali post yo'q</li>
		{/each}
	</ol>
</Modal>
