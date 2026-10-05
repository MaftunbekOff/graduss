<script lang="ts">
	import { toastStore } from '$lib/stores/toast.svelte';
	import { fly } from 'svelte/transition';
	import CheckCircle2 from '@lucide/svelte/icons/check-circle-2';
	import AlertCircle from '@lucide/svelte/icons/alert-circle';
	import Info from '@lucide/svelte/icons/info';
	import X from '@lucide/svelte/icons/x';

	const toasts = $derived(toastStore.toasts);
</script>

<div
	aria-live="polite"
	class="pointer-events-none fixed bottom-16 right-4 z-50 flex flex-col gap-2 sm:bottom-6 sm:right-6"
>
	{#each toasts as toast (toast.id)}
		<div
			in:fly={{ y: 20, duration: 250 }}
			out:fly={{ y: 10, duration: 180 }}
			class="pointer-events-auto flex items-center gap-3 rounded-xl border p-3.5 shadow-lg backdrop-blur-md transition-all sm:min-w-72 sm:max-w-96 {toast.type ===
			'success'
				? 'border-emerald-500/30 bg-emerald-950/80 text-emerald-100 dark:bg-emerald-950/90'
				: toast.type === 'error'
					? 'border-rose-500/30 bg-rose-950/80 text-rose-100 dark:bg-rose-950/90'
					: 'border-neutral-700/50 bg-neutral-900/90 text-neutral-100 dark:bg-neutral-900/95'}"
		>
			{#if toast.type === 'success'}
				<CheckCircle2 class="size-5 shrink-0 text-emerald-400" />
			{:else if toast.type === 'error'}
				<AlertCircle class="size-5 shrink-0 text-rose-400" />
			{:else}
				<Info class="size-5 shrink-0 text-brand-400" />
			{/if}

			<p class="flex-1 text-xs font-medium leading-snug sm:text-sm">{toast.message}</p>

			<button
				onclick={() => toastStore.remove(toast.id)}
				class="rounded-lg p-1 text-neutral-400 transition-colors hover:bg-white/10 hover:text-white"
				aria-label="Yopish"
			>
				<X class="size-4" />
			</button>
		</div>
	{/each}
</div>
