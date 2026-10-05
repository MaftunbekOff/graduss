<script lang="ts">
	import type { Campaign } from '$lib/types';
	import { data } from '$lib/stores/data.svelte';
	import { toastStore } from '$lib/stores/toast.svelte';
	import { formatSum } from '$lib/utils';
	import Modal from '$lib/components/ui/Modal.svelte';
	import Button from '$lib/components/ui/Button.svelte';
	import TextField from '$lib/components/ui/TextField.svelte';

	let { open = $bindable(false), campaign }: { open: boolean; campaign: Campaign } = $props();

	let amount = $state('');
	const presets = [50_000, 100_000, 500_000, 1_000_000];
	const amountNum = $derived(Number(amount.replace(/\s/g, '')));
	const valid = $derived(Number.isInteger(amountNum) && amountNum >= 1000);

	$effect(() => {
		if (open) amount = '';
	});

	function submit(e: SubmitEvent) {
		e.preventDefault();
		if (!valid) return;
		if (data.pledge(campaign.id, amountNum)) {
			toastStore.show(`${formatSum(amountNum)} qo'llab-quvvatlandi`, 'success');
			open = false;
		} else {
			toastStore.show("Qo'llab-quvvatlab bo'lmadi", 'error');
		}
	}
</script>

<Modal bind:open title="Loyihani qo'llab-quvvatlash">
	<form onsubmit={submit} class="flex flex-col gap-4">
		<p class="text-sm text-neutral-600 dark:text-neutral-400">
			Maqsad yig'ilmasa pul to'liq qaytariladi. Yig'ilsa, pul egasiga bosqichma-bosqich, sizning tasdig'ingiz bilan beriladi.
		</p>
		<div class="flex flex-wrap gap-2">
			{#each presets as p (p)}
				<button
					type="button"
					onclick={() => (amount = String(p))}
					class="rounded-full border border-neutral-300 px-3 py-1 text-sm hover:bg-neutral-50 dark:border-neutral-700 dark:hover:bg-neutral-800"
				>
					{formatSum(p)}
				</button>
			{/each}
		</div>
		<TextField label="Summa (so'm, kamida 1 000)" bind:value={amount} inputmode="numeric" required />
		<p class="rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-800 dark:bg-amber-500/10 dark:text-amber-300">
			Demo rejim: haqiqiy to'lov ulanmagan, pul yechilmaydi.
		</p>
		<div class="flex justify-end gap-2">
			<Button variant="outline" type="button" onclick={() => (open = false)}>Bekor qilish</Button>
			<Button type="submit" disabled={!valid}>Tasdiqlash</Button>
		</div>
	</form>
</Modal>
