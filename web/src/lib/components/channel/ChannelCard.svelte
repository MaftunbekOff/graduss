<script lang="ts">
	import type { Channel } from '$lib/types';

	let { channel, active = false }: { channel: Channel; active?: boolean } = $props();
</script>

<a
	href={`/channels/${channel.id}`}
	class="flex items-center gap-3 border-b border-neutral-200 px-4 py-3.5 transition-colors hover:bg-neutral-50/80 dark:border-neutral-800 dark:hover:bg-neutral-900/50 {active
		? 'bg-brand-50 dark:bg-brand-400/10'
		: ''}"
>
	<span
		class="flex size-12 shrink-0 items-center justify-center rounded-full text-lg font-semibold text-white ring-2 ring-white dark:ring-neutral-950"
		style:background-color={channel.avatar}
		style:background-image="linear-gradient(145deg, rgba(255,255,255,.28), rgba(0,0,0,.12))"
	>
		{channel.name[0]}
	</span>
	<div class="min-w-0 flex-1">
		<p class="truncate font-bold">{channel.name}</p>
		<p class="truncate text-sm text-neutral-500 dark:text-neutral-400">
			@{channel.handle}
		</p>
		<p class="truncate text-sm text-neutral-500 dark:text-neutral-400">{channel.description}</p>
	</div>
</a>
