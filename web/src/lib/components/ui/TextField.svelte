<script lang="ts">
	import type { HTMLInputAttributes } from 'svelte/elements';

	type Props = Omit<HTMLInputAttributes, 'value'> & {
		label: string;
		error?: string;
		hint?: string;
		value: string;
	};

	let { label, error, hint, value = $bindable(''), id, ...rest }: Props = $props();
	const inputId = $derived(id ?? `field-${label.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`);
</script>

<label class="flex flex-col gap-1.5" for={inputId}>
	<span class="text-sm font-medium text-neutral-700 dark:text-neutral-300">{label}</span>
	<input
		id={inputId}
		bind:value
		aria-invalid={!!error}
		{...rest}
		class="rounded-lg border px-3 py-2.5 outline-none transition-shadow focus:ring-1 dark:bg-neutral-900 dark:placeholder:text-neutral-600 {error
			? 'border-rose-400 focus:border-rose-500 focus:ring-rose-500 dark:border-rose-800'
			: 'border-neutral-300 focus:border-brand-500 focus:ring-brand-500 dark:border-neutral-700'}"
	/>
	{#if error}
		<span class="text-xs font-medium text-rose-600 dark:text-rose-400">{error}</span>
	{:else if hint}
		<span class="text-xs text-neutral-500 dark:text-neutral-400">{hint}</span>
	{/if}
</label>
