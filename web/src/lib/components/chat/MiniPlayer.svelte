<script lang="ts">
	// Yuqori mini-pleyer (Telegram kabi): ovozli/video xabar ijro etilayotganda har sahifada ko'rinadi.
	import { goto } from '$app/navigation';
	import { page } from '$app/state';
	import { fmtTime } from '$lib/recorder';
	import { player } from '$lib/stores/player.svelte';
	import Play from '@lucide/svelte/icons/play';
	import Pause from '@lucide/svelte/icons/pause';
	import X from '@lucide/svelte/icons/x';

	const H = 44;
	const track = $derived(player.current);

	// Yuqori panel (sarlavha) tagida joy qoldiriladi (app.css): --player-h.
	$effect(() => {
		document.documentElement.style.setProperty('--player-h', track ? `${H}px` : '0px');
		return () => document.documentElement.style.removeProperty('--player-h');
	});

	// Pleyer eng yuqoridagi ko'rinib turgan panelning pastki chetida va asosiy ustun kengligida turadi (panel yo'q bo'lsa eng tepada).
	let top = $state(0);
	let left = $state(0);
	let width = $state<number | null>(null);
	function measure() {
		let bottom = 0;
		for (const b of document.querySelectorAll<HTMLElement>('header.sticky.top-0, [data-mobile-topbar]')) {
			const r = b.getBoundingClientRect();
			if (r.height > 0) {
				bottom = r.bottom;
				break;
			}
		}
		top = Math.max(0, Math.round(bottom));
		const m = document.querySelector('main')?.getBoundingClientRect();
		left = m ? Math.round(m.left) : 0;
		width = m ? Math.round(m.width) : null;
	}
	$effect(() => {
		if (!track) return;
		measure();
		const t = setInterval(measure, 150);
		window.addEventListener('scroll', measure, { capture: true, passive: true });
		window.addEventListener('resize', measure);
		return () => {
			clearInterval(t);
			window.removeEventListener('scroll', measure, true);
			window.removeEventListener('resize', measure);
		};
	});

	function jump(id: string) {
		const el = document.getElementById(`msg-${id}`);
		el?.scrollIntoView({ block: 'center', behavior: 'smooth' });
		el?.animate([{ backgroundColor: 'rgb(99 102 241 / 0.18)' }, { backgroundColor: 'transparent' }], { duration: 1200 });
	}

	async function open() {
		if (!track) return;
		const path = `/chats/${track.chatId}`;
		if (page.url.pathname !== path) {
			await goto(path);
			await new Promise((r) => setTimeout(r, 350));
		}
		jump(track.id);
	}
</script>

{#if track}
	<div role="region" aria-label="Ijro etilmoqda" style="height: {H}px; top: {top}px; left: {left}px; {width ? `width: ${width}px` : 'right: 0'}" class="fixed z-40 border-b border-neutral-200 bg-white/95 backdrop-blur dark:border-neutral-800 dark:bg-neutral-950/95">
		<div class="mx-auto flex h-full max-w-6xl items-center gap-1 px-2">
			<button type="button" onclick={() => player.toggle()} aria-label={player.playing ? 'To‘xtatish' : 'Davom ettirish'} class="flex size-9 shrink-0 items-center justify-center rounded-full text-brand-600 hover:bg-neutral-100 dark:text-brand-400 dark:hover:bg-neutral-900">
				{#if player.playing}<Pause class="size-5 fill-current" />{:else}<Play class="size-5 translate-x-px fill-current" />{/if}
			</button>
			<button type="button" onclick={open} aria-label="Xabarga o'tish" class="min-w-0 flex-1 rounded-lg px-1 text-left leading-tight hover:bg-neutral-50 dark:hover:bg-neutral-900">
				<span class="block truncate text-sm font-semibold">{track.title}</span>
				<span class="block truncate text-xs tabular-nums text-neutral-500 dark:text-neutral-400">{track.kind === 'video' ? 'Video xabar' : 'Ovozli xabar'} · {fmtTime(Math.round(player.time))} / {fmtTime(Math.round(player.total))}</span>
			</button>
			<button type="button" onclick={() => player.cycleRate()} aria-label={`Tezlik ${player.rate}x`} class="shrink-0 rounded-full bg-neutral-100 px-2.5 py-1.5 text-xs font-bold tabular-nums hover:bg-neutral-200 dark:bg-neutral-800 dark:hover:bg-neutral-700">{player.rate}×</button>
			<button type="button" onclick={() => player.close()} aria-label="Ijroni yopish" class="flex size-9 shrink-0 items-center justify-center rounded-full text-neutral-500 hover:bg-neutral-100 dark:hover:bg-neutral-900"><X class="size-5" /></button>
		</div>
		<div class="absolute inset-x-0 bottom-0 h-0.5 bg-brand-600/20"><div class="h-full bg-brand-600" style="width: {Math.min(100, (player.time / Math.max(player.total, 1)) * 100)}%"></div></div>
	</div>
{/if}
