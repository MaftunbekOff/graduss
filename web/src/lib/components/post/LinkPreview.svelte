<script lang="ts">
	import Link2 from '@lucide/svelte/icons/link-2';
	import ArrowUpRight from '@lucide/svelte/icons/arrow-up-right';

	// Postdagi birinchi havola uchun karta (tarmoqdan hech narsa yuklanmaydi: domen va yo'l havoladan olinadi).
	let { url }: { url: string } = $props();

	const info = $derived.by(() => {
		try {
			const u = new URL(url);
			const path = (u.pathname + u.search).replace(/\/$/, '');
			return { host: u.hostname.replace(/^www\./, ''), path: path === '' ? '' : decodeURI(path) };
		} catch {
			return { host: url, path: '' };
		}
	});
</script>

<a
	href={url}
	target="_blank"
	rel="noopener noreferrer nofollow ugc"
	class="group mt-3 flex items-center gap-3 rounded-xl border border-neutral-200 bg-neutral-50 p-3 transition-colors hover:border-brand-300 hover:bg-brand-50/50 dark:border-neutral-800 dark:bg-neutral-900/60 dark:hover:border-brand-400/40"
	aria-label={`Havola: ${info.host}`}
>
	<span class="flex size-10 shrink-0 items-center justify-center rounded-lg bg-white text-brand-600 ring-1 ring-neutral-200 dark:bg-neutral-800 dark:text-brand-300 dark:ring-neutral-700">
		<Link2 class="size-5" />
	</span>
	<span class="min-w-0 flex-1">
		<span class="block truncate text-sm font-bold">{info.host}</span>
		{#if info.path}<span class="block truncate text-xs text-neutral-500 dark:text-neutral-400">{info.path}</span>{/if}
	</span>
	<ArrowUpRight class="size-4 shrink-0 text-neutral-400 transition-colors group-hover:text-brand-600" />
</a>
