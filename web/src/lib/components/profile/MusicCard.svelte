<script lang="ts">
	import { onDestroy } from 'svelte';
	import { isDirectAudio, type ProfileMusic } from '$lib/music';
	import Play from '@lucide/svelte/icons/play';
	import Pause from '@lucide/svelte/icons/pause';
	import ExternalLink from '@lucide/svelte/icons/external-link';
	import Music2 from '@lucide/svelte/icons/music-2';

	// Profil muqovasi (avatar orqasidagi fon) ustida turuvchi shaffof "kapsula": bosilganda ijro etiladi.
	// Bir vaqtda faqat bitta qo'shiq o'ynaydi ('graduss:music' xabari orqali).
	let { music }: { music: ProfileMusic } = $props();

	const direct = $derived(isDirectAudio(music.url) || music.url.startsWith('/demo/'));
	let audio: HTMLAudioElement | undefined;
	let playing = $state(false);
	let progress = $state(0);
	let failed = $state(false);

	const R = 15;
	const C = 2 * Math.PI * R;

	function ensure() {
		if (audio) return audio;
		audio = new Audio(music.url);
		audio.preload = 'none';
		audio.addEventListener('timeupdate', () => (progress = audio!.duration ? audio!.currentTime / audio!.duration : 0));
		audio.addEventListener('ended', () => {
			playing = false;
			progress = 0;
		});
		audio.addEventListener('pause', () => (playing = false));
		audio.addEventListener('play', () => (playing = true));
		audio.addEventListener('error', () => {
			failed = true;
			playing = false;
		});
		return audio;
	}

	async function toggle() {
		const a = ensure();
		if (!a.paused) {
			a.pause();
			return;
		}
		window.dispatchEvent(new CustomEvent('graduss:music', { detail: a }));
		failed = false;
		try {
			await a.play();
		} catch {
			failed = true;
		}
	}

	$effect(() => {
		const onOther = (e: Event) => {
			if (audio && (e as CustomEvent<HTMLAudioElement>).detail !== audio) audio.pause();
		};
		window.addEventListener('graduss:music', onOther);
		return () => window.removeEventListener('graduss:music', onOther);
	});

	onDestroy(() => {
		audio?.pause();
		audio = undefined;
	});
</script>

<div
	role="group"
	aria-label="Profil qo'shig'i"
	class="absolute bottom-3 right-3 z-10 flex max-w-[72%] items-center gap-2 rounded-full bg-black/40 py-1 pl-1 pr-3 text-white shadow-lg backdrop-blur-md"
>
	{#if direct}
		<button
			type="button"
			onclick={toggle}
			aria-label={playing ? "To'xtatish" : 'Ijro etish'}
			aria-pressed={playing}
			class="relative flex size-9 shrink-0 items-center justify-center rounded-full bg-white/20 transition-colors hover:bg-white/30"
		>
			<!-- ijro progressi: tugma atrofidagi halqa -->
			<svg class="absolute inset-0 -rotate-90" viewBox="0 0 36 36" role="progressbar" aria-valuenow={Math.round(progress * 100)} aria-valuemin="0" aria-valuemax="100" aria-label="Ijro progressi">
				<circle cx="18" cy="18" r={R} fill="none" stroke="rgba(255,255,255,.25)" stroke-width="2" />
				<circle cx="18" cy="18" r={R} fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-dasharray={C} stroke-dashoffset={C * (1 - progress)} />
			</svg>
			{#if playing}<Pause class="size-4" fill="currentColor" />{:else}<Play class="ml-0.5 size-4" fill="currentColor" />{/if}
		</button>
	{:else}
		<span class="flex size-9 shrink-0 items-center justify-center rounded-full bg-white/20"><Music2 class="size-4" /></span>
	{/if}

	<div class="min-w-0 leading-tight">
		<p class="truncate text-xs font-bold">{music.title}</p>
		<p class="truncate text-[11px] text-white/75">{music.artist || "Profil qo'shig'i"}{#if failed} · ijro etib bo'lmadi{/if}</p>
	</div>

	{#if playing}
		<span class="eq flex h-4 shrink-0 items-end gap-0.5" aria-hidden="true"><i></i><i></i><i></i></span>
	{/if}

	{#if !direct}
		<a
			href={music.url}
			target="_blank"
			rel="noopener noreferrer nofollow ugc"
			class="inline-flex shrink-0 items-center gap-1 rounded-full bg-white/25 px-2.5 py-1 text-[11px] font-semibold hover:bg-white/35"
		>
			Tinglash <ExternalLink class="size-3" />
		</a>
	{/if}
</div>

<style>
	.eq i {
		display: block;
		width: 3px;
		height: 100%;
		border-radius: 2px;
		background: white;
		transform-origin: bottom;
		animation: eq 0.9s ease-in-out infinite;
	}
	.eq i:nth-child(2) {
		animation-delay: -0.3s;
	}
	.eq i:nth-child(3) {
		animation-delay: -0.6s;
	}
	@keyframes eq {
		0%,
		100% {
			transform: scaleY(0.25);
		}
		50% {
			transform: scaleY(1);
		}
	}
	@media (prefers-reduced-motion: reduce) {
		.eq i {
			animation: none;
			transform: scaleY(0.6);
		}
	}
</style>
