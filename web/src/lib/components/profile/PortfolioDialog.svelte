<script lang="ts">
	import { data } from '$lib/stores/data.svelte';
	import { toastStore } from '$lib/stores/toast.svelte';
	import Modal from '$lib/components/ui/Modal.svelte';
	import Button from '$lib/components/ui/Button.svelte';
	import TextField from '$lib/components/ui/TextField.svelte';

	let { open = $bindable(false) }: { open: boolean } = $props();

	let title = $state('');
	let description = $state('');
	let url = $state('');

	$effect(() => {
		if (open) {
			title = '';
			description = '';
			url = '';
		}
	});

	const urlOk = $derived(!url.trim() || /^https?:\/\/\S+$/.test(url.trim()));
	const valid = $derived(title.trim().length >= 2 && urlOk);

	function submit(e: SubmitEvent) {
		e.preventDefault();
		if (!valid) return;
		data.addPortfolioItem({ title: title.trim(), description: description.trim(), url: url.trim() });
		toastStore.show("Portfolioga qo'shildi", 'success');
		open = false;
	}
</script>

<Modal bind:open title="Portfolioga ish qo'shish">
	<form onsubmit={submit} class="flex flex-col gap-4">
		<TextField label="Ish nomi" bind:value={title} required placeholder="Masalan: Registon Runner" />
		<div>
			<label for="pf-desc" class="mb-1 block text-sm font-medium text-neutral-700 dark:text-neutral-300">Tavsif</label>
			<textarea
				id="pf-desc"
				bind:value={description}
				rows="3"
				placeholder="Nima qildingiz, natija qanday?"
				class="w-full resize-none rounded-lg border border-neutral-300 bg-transparent p-3 text-sm outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 dark:border-neutral-700"
			></textarea>
		</div>
		<TextField
			label="Havola (ixtiyoriy)"
			bind:value={url}
			placeholder="https://..."
			error={urlOk ? undefined : "https:// bilan boshlanishi kerak"}
		/>
		<div class="flex justify-end gap-2">
			<Button variant="outline" type="button" onclick={() => (open = false)}>Bekor qilish</Button>
			<Button type="submit" disabled={!valid}>Qo'shish</Button>
		</div>
	</form>
</Modal>
