<script lang="ts">
	import { data } from '$lib/stores/data.svelte';
	import { toastStore } from '$lib/stores/toast.svelte';
	import Modal from '$lib/components/ui/Modal.svelte';
	import Button from '$lib/components/ui/Button.svelte';
	import TextField from '$lib/components/ui/TextField.svelte';
	import Plus from '@lucide/svelte/icons/plus';
	import Trash2 from '@lucide/svelte/icons/trash-2';

	let { open = $bindable(false), channelId }: { open: boolean; channelId: string } = $props();

	let title = $state('');
	let summary = $state('');
	let goal = $state('');
	let days = $state('30');
	let milestones = $state([{ title: '', percent: '50' }, { title: '', percent: '50' }]);

	$effect(() => {
		if (open) {
			title = '';
			summary = '';
			goal = '';
			days = '30';
			milestones = [{ title: '', percent: '50' }, { title: '', percent: '50' }];
		}
	});

	const goalNum = $derived(Number(goal.replace(/\s/g, '')));
	const daysNum = $derived(Number(days));
	const percentSum = $derived(milestones.reduce((s, m) => s + (Number(m.percent) || 0), 0));
	const valid = $derived(
		title.trim().length > 0 &&
			Number.isInteger(goalNum) &&
			goalNum >= 100_000 &&
			Number.isInteger(daysNum) &&
			daysNum >= 1 &&
			daysNum <= 90 &&
			milestones.length >= 1 &&
			milestones.every((m) => m.title.trim() && Number(m.percent) > 0) &&
			percentSum === 100
	);

	function submit(e: SubmitEvent) {
		e.preventDefault();
		if (!valid) return;
		const created = data.createCampaign(channelId, {
			title: title.trim(),
			summary: summary.trim(),
			goal: goalNum,
			days: daysNum,
			milestones: milestones.map((m) => ({ title: m.title.trim(), percent: Number(m.percent) }))
		});
		if (created) {
			toastStore.show('Kampaniya ochildi', 'success');
			open = false;
		} else {
			toastStore.show("Kampaniya ochib bo'lmadi", 'error');
		}
	}
</script>

<Modal bind:open title="Kampaniya boshlash" maxWidth="max-w-lg">
	<form onsubmit={submit} class="flex flex-col gap-4">
		<TextField label="Loyiha nomi" bind:value={title} required placeholder="Nima qurmoqchisiz?" />

		<div>
			<label for="camp-summary" class="mb-1 block text-sm font-medium text-neutral-700 dark:text-neutral-300">Tavsif</label>
			<textarea
				id="camp-summary"
				bind:value={summary}
				rows="3"
				placeholder="Loyiha nima, pul nimaga ketadi?"
				class="w-full resize-none rounded-lg border border-neutral-300 bg-transparent p-3 text-sm outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 dark:border-neutral-700"
			></textarea>
		</div>

		<div class="grid grid-cols-2 gap-3">
			<TextField label="Maqsad (so'm)" bind:value={goal} inputmode="numeric" required placeholder="50000000" />
			<TextField label="Muddat (kun, 1-90)" bind:value={days} inputmode="numeric" required />
		</div>

		<div>
			<p class="mb-1 text-sm font-medium text-neutral-700 dark:text-neutral-300">Bosqichlar</p>
			<p class="mb-2 text-xs text-neutral-500 dark:text-neutral-400">
				Pul bosqichma-bosqich ochiladi: har bosqich hisobotini donorlar ko'pchilik bilan tasdiqlaydi. Foizlar yig'indisi 100 bo'lsin.
			</p>
			<div class="flex flex-col gap-2">
				{#each milestones as m, i (i)}
					<div class="flex items-center gap-2">
						<input
							bind:value={m.title}
							placeholder={`${i + 1}-bosqich nomi`}
							aria-label={`${i + 1}-bosqich nomi`}
							class="min-w-0 flex-1 rounded-lg border border-neutral-300 bg-transparent px-3 py-2 text-sm outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 dark:border-neutral-700"
						/>
						<input
							bind:value={m.percent}
							inputmode="numeric"
							aria-label={`${i + 1}-bosqich foizi`}
							class="w-16 rounded-lg border border-neutral-300 bg-transparent px-2 py-2 text-center text-sm outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 dark:border-neutral-700"
						/>
						<span class="text-sm text-neutral-500">%</span>
						<button
							type="button"
							disabled={milestones.length === 1}
							onclick={() => (milestones = milestones.filter((_, j) => j !== i))}
							aria-label="Bosqichni o'chirish"
							class="rounded-lg p-1.5 text-neutral-400 hover:bg-neutral-100 hover:text-rose-600 disabled:opacity-30 dark:hover:bg-neutral-800"
						>
							<Trash2 class="size-4" />
						</button>
					</div>
				{/each}
			</div>
			<div class="mt-2 flex items-center justify-between">
				<button
					type="button"
					disabled={milestones.length >= 6}
					onclick={() => (milestones = [...milestones, { title: '', percent: '' }])}
					class="flex items-center gap-1 text-sm font-medium text-brand-700 hover:underline disabled:opacity-40 dark:text-brand-400"
				>
					<Plus class="size-4" /> Bosqich qo'shish
				</button>
				<span class="text-sm font-medium {percentSum === 100 ? 'text-emerald-600' : 'text-rose-600'}">{percentSum}%</span>
			</div>
		</div>

		<div class="flex justify-end gap-2 pt-2">
			<Button variant="outline" type="button" onclick={() => (open = false)}>Bekor qilish</Button>
			<Button type="submit" disabled={!valid}>Boshlash</Button>
		</div>
	</form>
</Modal>
