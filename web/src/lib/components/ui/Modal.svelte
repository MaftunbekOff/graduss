<script lang="ts">
	import type { Snippet } from 'svelte';
	import { fade, scale } from 'svelte/transition';
	import { cubicOut } from 'svelte/easing';
	import X from '@lucide/svelte/icons/x';

	let {
		open = $bindable(false),
		title,
		onClose,
		maxWidth = 'max-w-md',
		children
	}: {
		open?: boolean;
		title?: string;
		onClose?: () => void;
		maxWidth?: string;
		children: Snippet;
	} = $props();

	function handleClose() {
		open = false;
		if (onClose) onClose();
	}
</script>

{#if open}
	<div
		class="fixed inset-0 z-50 flex items-center justify-center p-4"
		onclick={(e) => e.stopPropagation()}
		role="presentation"
	>
		<button
			aria-label="Yopish"
			onclick={handleClose}
			transition:fade={{ duration: 150 }}
			class="absolute inset-0 cursor-default bg-black/50 backdrop-blur-sm"
		></button>

		<div
			transition:scale={{ duration: 180, start: 0.95, easing: cubicOut }}
			class="relative flex max-h-[85vh] w-full {maxWidth} flex-col overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-[var(--shadow-pop)] dark:border-neutral-800 dark:bg-neutral-900"
		>
			{#if title}
				<div class="flex items-center justify-between border-b border-neutral-200 px-5 py-3.5 dark:border-neutral-800">
					<h3 class="text-base font-bold text-neutral-900 dark:text-neutral-100">{title}</h3>
					<button
						onclick={handleClose}
						class="rounded-lg p-1 text-neutral-400 hover:bg-neutral-100 hover:text-neutral-600 dark:hover:bg-neutral-800 dark:hover:text-neutral-200"
						aria-label="Yopish"
					>
						<X class="size-4" />
					</button>
				</div>
			{/if}

			<div class="overflow-y-auto p-5">
				{@render children()}
			</div>
		</div>
	</div>
{/if}
