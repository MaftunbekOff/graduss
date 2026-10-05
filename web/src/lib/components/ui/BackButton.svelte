<script lang="ts">
	import { goto } from '$app/navigation';
	import { navHist } from '$lib/stores/navhist.svelte';
	import ArrowLeft from '@lucide/svelte/icons/arrow-left';

	// hideFromPrefix: shu bo'limdan kelinganda KOMPYUTERDA yashiriladi (ro'yxat yonida turibdi); telefonda doim ko'rinadi.
	// overlay: banner ustida (shaffof qora yumaloq); aks holda oddiy sarlavha tugmasi.
	let { overlay = false, always = false, fallback = '/feed', class: cls = '', hideFromPrefix }: { overlay?: boolean; always?: boolean; fallback?: string; class?: string; hideFromPrefix?: string } = $props();

	function back() {
		if (navHist.canBack) history.back();
		else goto(fallback);
	}
</script>

{#if always || navHist.canBack}
	<button
		type="button"
		onclick={back}
		aria-label="Orqaga"
		class="shrink-0 rounded-full p-2 {hideFromPrefix && navHist.from.startsWith(hideFromPrefix) ? 'sm:hidden' : ''} {overlay ? 'bg-black/35 text-white backdrop-blur-md hover:bg-black/50' : 'hover:bg-neutral-100 dark:hover:bg-neutral-900'} {cls}"
	>
		<ArrowLeft class="size-5" />
	</button>
{/if}
