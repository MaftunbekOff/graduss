<script lang="ts">
	import Play from '@lucide/svelte/icons/play';
	import Pause from '@lucide/svelte/icons/pause';
	import Mic from '@lucide/svelte/icons/mic';

	let {
		duration = 45
	}: {
		audioUrl?: string;
		duration?: number;
	} = $props();

	let isPlaying = $state(false);
	let currentTime = $state(0);
	let timer: any = null;

	const WAVEFORM_BARS = [
		35, 60, 40, 85, 55, 95, 70, 45, 90, 65, 80, 50, 75, 40, 95, 60, 85, 45, 70, 55,
		90, 60, 40, 75, 50, 85, 65, 95, 40, 70, 50, 80, 45, 90, 60, 75, 50, 85, 40, 65
	];

	function togglePlay(e: MouseEvent) {
		e.stopPropagation();
		if (isPlaying) {
			pause();
		} else {
			play();
		}
	}

	function play() {
		isPlaying = true;
		if (timer) clearInterval(timer);

		timer = setInterval(() => {
			if (currentTime >= duration) {
				pause();
				currentTime = 0;
			} else {
				currentTime += 1;
			}
		}, 1000);
	}

	function pause() {
		isPlaying = false;
		if (timer) clearInterval(timer);
	}

	function formatSecs(secs: number) {
		const m = Math.floor(secs / 60);
		const s = Math.floor(secs % 60);
		return `${m}:${s < 10 ? '0' : ''}${s}`;
	}
</script>

<div
	onclick={(e) => e.stopPropagation()}
	role="presentation"
	class="mt-3 flex items-center gap-3.5 rounded-2xl border border-brand-200 bg-brand-50/50 p-3.5 shadow-sm dark:border-brand-900/40 dark:bg-brand-950/30"
>
	<!-- Play/Pause Button -->
	<button
		type="button"
		onclick={togglePlay}
		class="flex size-11 shrink-0 items-center justify-center rounded-full bg-brand-600 text-white shadow-md transition-transform hover:scale-105 active:scale-95 dark:bg-brand-500"
		aria-label={isPlaying ? "Pauza" : "Ijro etish"}
	>
		{#if isPlaying}
			<Pause class="size-5 fill-current stroke-[2.5]" />
		{:else}
			<Play class="size-5 fill-current stroke-[2.5] ml-0.5" />
		{/if}
	</button>

	<!-- Waveform Visualizer & Timer -->
	<div class="flex min-w-0 flex-1 flex-col gap-1.5">
		<div class="flex items-center justify-between text-xs font-semibold text-brand-900 dark:text-brand-200">
			<span class="flex items-center gap-1">
				<Mic class="size-3.5 text-brand-600 dark:text-brand-400" />
				Ovozli xabar
			</span>
			<span class="font-mono text-neutral-500 dark:text-neutral-400">
				{formatSecs(currentTime)} / {formatSecs(duration)}
			</span>
		</div>

		<!-- Waveform Bars -->
		<div class="flex h-7 items-center gap-0.5 overflow-hidden">
			{#each WAVEFORM_BARS as barHeight, idx}
				{@const active = (idx / WAVEFORM_BARS.length) <= (currentTime / duration)}
				<div
					class="w-1 rounded-full transition-all duration-300 {active
						? 'bg-brand-600 dark:bg-brand-400'
						: 'bg-brand-200 dark:bg-brand-900/60'}"
					style="height: {barHeight}%;"
				></div>
			{/each}
		</div>
	</div>
</div>
