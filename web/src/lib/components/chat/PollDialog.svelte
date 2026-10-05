<script lang="ts">
	import type { Poll } from '$lib/types';
	import Modal from '$lib/components/ui/Modal.svelte';
	import Button from '$lib/components/ui/Button.svelte';
	import Plus from '@lucide/svelte/icons/plus';
	import X from '@lucide/svelte/icons/x';

	let { open = $bindable(false), onsubmit }: { open: boolean; onsubmit: (poll: Poll) => void } = $props();

	let question = $state('');
	let options = $state(['', '']);
	const filled = $derived(options.map((o) => o.trim()).filter(Boolean));
	const valid = $derived(question.trim().length > 0 && filled.length >= 2);

	$effect(() => {
		if (open) {
			question = '';
			options = ['', ''];
		}
	});

	function submit(e: SubmitEvent) {
		e.preventDefault();
		if (!valid) return;
		onsubmit({
			id: `poll_${Date.now()}`,
			question: question.trim(),
			options: filled.map((text, i) => ({ id: `o${i}`, text, votes: [] }))
		});
		open = false;
	}

	const field = 'w-full rounded-lg border border-neutral-300 bg-transparent px-3 py-2 text-base outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 dark:border-neutral-700';
</script>

<Modal bind:open title="So'rovnoma">
	<form onsubmit={submit} class="flex flex-col gap-3">
		<input bind:value={question} maxlength="200" placeholder="Savol" aria-label="Savol" class={field} />
		{#each options as _, i (i)}
			<div class="flex items-center gap-2">
				<input bind:value={options[i]} maxlength="80" placeholder="Variant {i + 1}" aria-label="Variant {i + 1}" class={field} />
				{#if options.length > 2}
					<button type="button" onclick={() => (options = options.filter((__, j) => j !== i))} aria-label="Variantni olib tashlash" class="shrink-0 rounded-full p-2 text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800"><X class="size-4" /></button>
				{/if}
			</div>
		{/each}
		{#if options.length < 6}
			<button type="button" onclick={() => (options = [...options, ''])} class="flex items-center gap-1.5 self-start text-sm font-semibold text-brand-700 dark:text-brand-400"><Plus class="size-4" />Variant qo'shish</button>
		{/if}
		<div class="flex justify-end gap-2">
			<Button variant="outline" type="button" onclick={() => (open = false)}>Bekor qilish</Button>
			<Button type="submit" disabled={!valid}>Yuborish</Button>
		</div>
	</form>
</Modal>
