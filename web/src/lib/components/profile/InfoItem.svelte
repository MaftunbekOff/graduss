<script lang="ts">
	import type { Component, Snippet } from 'svelte';
	import Marquee from '$lib/components/ui/Marquee.svelte';

	// Profil ma'lumot katakchasi: rangli belgi, kichik yorliq va qiymat.
	let { icon: Icon, label, tone = 'brand', testid, wrap = false, children }: { wrap?: boolean; icon: Component<{ class?: string }>; label: string; tone?: 'brand' | 'amber' | 'sky' | 'emerald' | 'violet'; testid?: string; children: Snippet } = $props();

	const tones = {
		brand: 'text-brand-600 dark:text-brand-400 sm:bg-brand-50 sm:dark:bg-brand-400/10',
		amber: 'text-amber-600 dark:text-amber-400 sm:bg-amber-50 sm:dark:bg-amber-400/10',
		sky: 'text-sky-600 dark:text-sky-400 sm:bg-sky-50 sm:dark:bg-sky-400/10',
		emerald: 'text-emerald-600 dark:text-emerald-400 sm:bg-emerald-50 sm:dark:bg-emerald-400/10',
		violet: 'text-violet-600 dark:text-violet-400 sm:bg-violet-50 sm:dark:bg-violet-400/10'
	};
</script>

<div class="flex min-w-0 items-center gap-2 sm:gap-3 " data-testid={testid}>
	<span class="flex size-5 shrink-0 items-center justify-center sm:size-9 sm:rounded-xl {tones[tone]}"><Icon class="size-[18px]" /></span>
	<div class="min-w-0 flex-1">
		<p class="text-[11px] font-semibold uppercase leading-tight tracking-wide text-neutral-400 dark:text-neutral-500">{label}</p>
		<div class="mt-0.5 text-[13px] font-medium leading-snug text-neutral-900 sm:text-sm dark:text-neutral-100">
			{#if wrap}{@render children()}{:else}<Marquee>{@render children()}</Marquee>{/if}
		</div>
	</div>
</div>
