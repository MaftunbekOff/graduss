<script lang="ts">
	// Doira video xabar (Telegram uslubi): pufaksiz doira, ijro progressi halqada, qolgan vaqt belgisi. Bosilsa ijro/pauza.
	// Ijro umumiy pleyerda (player store): boshqa sahifaga o'tilsa ovoz davom etadi, boshqaruv yuqoridagi mini-pleyerda.
	import { fmtTime } from '$lib/recorder';
	import { player } from '$lib/stores/player.svelte';

	let { src, duration = 0, id, title, chatId }: { src: string; duration?: number; id: string; title: string; chatId: string } = $props();

	const cur = $derived(player.isCurrent(id));
	const playing = $derived(cur && player.playing);
	const time = $derived(cur ? player.time : 0);
	const total = $derived(cur && player.total > 0 ? player.total : Math.max(duration, 1));
	const C = 2 * Math.PI * 48;
	const VIDEO_CLASS = 'absolute inset-[3px] size-[calc(100%-6px)] rounded-full bg-neutral-900 object-cover';

	let host = $state<HTMLElement>();
	let own: HTMLVideoElement | undefined;

	// Doirada ko'rinadigan video: ijro paytida umumiy pleyerning elementi, aks holda birinchi kadr uchun o'z elementi.
	$effect(() => {
		if (!host) return;
		if (!own) {
			own = document.createElement('video');
			own.playsInline = true;
			own.preload = 'metadata';
			own.src = src;
		}
		const node = cur && player.el instanceof HTMLVideoElement ? player.el : own;
		node.className = VIDEO_CLASS;
		if (host.firstChild !== node) host.replaceChildren(node);
	});

	function toggle() {
		if (cur) player.toggle();
		else player.play({ id, kind: 'video', src, title, chatId, duration });
	}
</script>

<button
	type="button"
	onclick={toggle}
	aria-label={playing ? 'To‘xtatish' : 'Video xabarni ijro etish'}
	class="group relative block size-[min(13rem,62vw)] shrink-0 rounded-full"
>
	<span bind:this={host} class="contents"></span>
	<svg viewBox="0 0 100 100" class="pointer-events-none absolute inset-0 size-full -rotate-90" aria-hidden="true">
		<circle cx="50" cy="50" r="48" fill="none" stroke-width="2" class="stroke-brand-600/25" />
		<circle cx="50" cy="50" r="48" fill="none" stroke-width="2.5" stroke-linecap="round" class="stroke-brand-600 transition-[stroke-dashoffset] duration-200" stroke-dasharray={C} stroke-dashoffset={C * (1 - Math.min(1, time / total))} />
	</svg>
	{#if !playing}
		<span class="pointer-events-none absolute inset-[3px] flex items-center justify-center rounded-full bg-black/25">
			<span class="flex size-14 items-center justify-center rounded-full bg-black/50 text-white backdrop-blur-sm">
				<svg viewBox="0 0 24 24" class="size-7 translate-x-px fill-current" aria-hidden="true"><path d="M8 5v14l11-7z" /></svg>
			</span>
		</span>
	{/if}
	<span class="pointer-events-none absolute bottom-3 left-3 rounded-full bg-black/55 px-2 py-0.5 text-xs font-medium tabular-nums text-white">
		{fmtTime(Math.max(0, Math.round(playing || time ? total - time : total)))}
	</span>
</button>
