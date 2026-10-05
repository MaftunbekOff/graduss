<script lang="ts">
	import type { Snippet } from 'svelte';

	// Matn sig'masa, o'ngdan chapga uzluksiz oqib turadi (to'liq o'qiladi).
	// Sig'sa harakatsiz. "Harakatni kamaytirish" yoqilgan bo'lsa, oddiy "..." bilan kesiladi.
	let { children, class: cls = '' }: { children: Snippet; class?: string } = $props();

	let box = $state<HTMLElement>();
	let inner = $state<HTMLElement>();
	let shift = $state(0);
	let dist = $state(0);

	function measure() {
		if (!box || !inner) return;
		const over = Math.ceil(inner.scrollWidth - box.clientWidth);
		shift = over > 2 ? over : 0;
		dist = Math.ceil(inner.offsetWidth) + 32;
	}

	$effect(() => {
		if (!box || !inner) return;
		measure();
		const ro = new ResizeObserver(measure);
		ro.observe(box);
		ro.observe(inner);
		return () => ro.disconnect();
	});

	// Tezlik ~40 px/s
	const duration = $derived(`${Math.max(4, dist / 40).toFixed(1)}s`);
</script>

<span bind:this={box} class="marquee block min-w-0 overflow-hidden whitespace-nowrap {cls}" class:moving={shift > 0}>
	<span class="marquee-track inline-flex w-max" style:--dist="{dist}px" style:--dur={duration}>
		<span bind:this={inner} class="marquee-inner inline-block shrink-0">
			{@render children()}
		</span>
		{#if shift > 0}
			<!-- Uzluksiz aylanish uchun nusxa (ekran o'qiydigan dasturlar va Tab uchun yashirin) -->
			<span class="marquee-copy inline-block shrink-0 pl-8" aria-hidden="true" inert>
				{@render children()}
			</span>
		{/if}
	</span>
</span>

<style>
	/* Matn o'ngdan chapga uzluksiz oqadi: oxiri ko'rinib, boshiga qaytmasdan davom etadi. */
	.moving .marquee-track {
		animation: flow var(--dur) linear infinite;
		will-change: transform;
	}
	@keyframes flow {
		from {
			transform: translateX(0);
		}
		to {
			transform: translateX(calc(-1 * var(--dist)));
		}
	}
	@media (prefers-reduced-motion: reduce) {
		.moving .marquee-track {
			animation: none;
		}
		.moving .marquee-copy {
			display: none;
		}
		.moving .marquee-inner {
			display: block;
			overflow: hidden;
			text-overflow: ellipsis;
		}
	}
</style>
