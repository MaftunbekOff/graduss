<script lang="ts">
	import type { Component, Snippet } from 'svelte';

	let {
		icon: Icon,
		title,
		description,
		children
	}: {
		icon?: Component<any>;
		title: string;
		description?: string;
		children?: Snippet;
	} = $props();
</script>

<div class="flex flex-col items-center gap-3 px-4 py-14 text-center">
	<span class="flex size-14 items-center justify-center rounded-full bg-neutral-100 text-neutral-400 dark:bg-neutral-900 dark:text-neutral-600">
		{#if Icon}
			<Icon class="size-6" />
		{/if}
	</span>
	<div>
		<p class="font-semibold text-neutral-700 dark:text-neutral-300">{title}</p>
		{#if description}
			<p class="mx-auto mt-0.5 max-w-xs text-sm text-neutral-500 dark:text-neutral-400">{description}</p>
		{/if}
	</div>
	{#if children}
		<div class="mt-1">
			{@render children()}
		</div>
	{/if}
</div>
