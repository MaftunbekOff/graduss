<script lang="ts">
	import { fmtTime } from '$lib/recorder';
	import { player } from '$lib/stores/player.svelte';
	import Play from '@lucide/svelte/icons/play';
	import Pause from '@lucide/svelte/icons/pause';

	let {
		src,
		duration,
		mine = false,
		id,
		title,
		chatId
	}: { src: string; duration: number; mine?: boolean; id: string; title: string; chatId: string } = $props();

	let seeking = false;
	const BARS = 32;
	const cur = $derived(player.isCurrent(id));
	const playing = $derived(cur && player.playing);
	const time = $derived(cur ? player.time : 0);
	const total = $derived(cur && player.total > 0 ? player.total : Math.max(duration, 1));
	const progress = $derived(Math.min(1, time / total));
	const track = $derived({ id, kind: 'voice' as const, src, title, chatId, duration });

	// To'lqin balandliklari: manbadan olingan barqaror (har safar bir xil) naqsh.
	const bars = $derived.by(() => {
		let h = 2166136261;
		const seed = `${src.length}:${src.slice(-24)}:${duration}`;
		for (let i = 0; i < seed.length; i++) h = Math.imul(h ^ seed.charCodeAt(i), 16777619);
		return Array.from({ length: BARS }, (_, i) => {
			h = Math.imul(h ^ (h >>> 15), 2246822519) + i;
			const v = ((h >>> 0) % 1000) / 1000;
			return 22 + Math.round(Math.abs(Math.sin(i * 0.6 + v * 3)) * 62 + v * 16);
		});
	});

	function toggle() {
		if (cur) player.toggle();
		else player.play(track);
	}

	function seekTo(e: PointerEvent) {
		const r = (e.currentTarget as HTMLElement).getBoundingClientRect();
		const ratio = Math.min(1, Math.max(0, (e.clientX - r.left) / r.width));
		if (cur) player.seek(ratio * total);
		else player.play(track, ratio * total);
	}
	function onKey(e: KeyboardEvent) {
		if (!cur || (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight')) return;
		e.preventDefault();
		player.seek(Math.min(total, player.time + (e.key === 'ArrowRight' ? 5 : -5)));
	}
</script>

<div class="flex w-64 max-w-full items-center gap-3 px-1 py-1">
	<button
		type="button"
		onclick={toggle}
		aria-label={playing ? 'To‘xtatish' : 'Eshitish'}
		class="flex size-10 shrink-0 items-center justify-center rounded-full transition-transform active:scale-95 {mine ? 'bg-white text-brand-700' : 'bg-brand-600 text-white'}"
	>
		{#if playing}<Pause class="size-4 fill-current" />{:else}<Play class="size-4 translate-x-px fill-current" />{/if}
	</button>
	<div class="min-w-0 flex-1">
		<div
			role="slider"
			tabindex="0"
			aria-label="Ovozli xabar vaqti"
			aria-valuemin={0}
			aria-valuemax={Math.round(total)}
			aria-valuenow={Math.round(time)}
			aria-valuetext={`${fmtTime(Math.round(time))} / ${fmtTime(Math.round(total))}`}
			onkeydown={onKey}
			onpointerdown={(e) => { seeking = true; (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId); seekTo(e); }}
			onpointermove={(e) => seeking && seekTo(e)}
			onpointerup={() => (seeking = false)}
			onpointercancel={() => (seeking = false)}
			class="flex h-7 cursor-pointer touch-none items-center gap-[2px] rounded outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
		>
			{#each bars as h, i (i)}
				<span
					class="w-[3px] shrink-0 grow rounded-full {i / BARS < progress ? (mine ? 'bg-white' : 'bg-brand-600') : mine ? 'bg-white/40' : 'bg-neutral-300 dark:bg-neutral-600'}"
					style:height="{h}%"
				></span>
			{/each}
		</div>
		<div class="mt-0.5 flex items-center justify-between text-xs tabular-nums opacity-80">
			<span>{fmtTime(Math.round(playing || time ? time : total))}</span>
			{#if cur}
				<button type="button" onclick={() => player.cycleRate()} aria-label={`Tezlik ${player.rate}x`} class="-my-1 rounded-full px-2 py-1 font-semibold {mine ? 'bg-white/20' : 'bg-black/5 dark:bg-white/10'}">{player.rate}×</button>
			{/if}
		</div>
	</div>
</div>
