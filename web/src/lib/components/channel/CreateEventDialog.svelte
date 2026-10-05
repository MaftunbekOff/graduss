<script lang="ts">
	import { data } from '$lib/stores/data.svelte';
	import { toastStore } from '$lib/stores/toast.svelte';
	import { toLocalInput } from '$lib/utils';
	import Modal from '$lib/components/ui/Modal.svelte';
	import Button from '$lib/components/ui/Button.svelte';

	let { open = $bindable(false), channelId }: { open: boolean; channelId: string } = $props();

	let title = $state('');
	let description = $state('');
	let startsAt = $state('');
	let link = $state('');
	let error = $state('');

	$effect(() => {
		if (open) {
			title = '';
			description = '';
			startsAt = toLocalInput(new Date(Date.now() + 86_400_000));
			link = '';
			error = '';
		}
	});

	function submit(e: SubmitEvent) {
		e.preventDefault();
		const r = data.createEvent(channelId, { title, description, startsAt: startsAt ? new Date(startsAt).toISOString() : '', link });
		if (!r.ok) {
			error = r.error ?? 'Xatolik';
			return;
		}
		open = false;
		toastStore.show("Tadbir qo'shildi", 'success');
	}

	const field =
		'w-full rounded-xl border border-neutral-300 bg-transparent px-3 py-2 text-sm outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 dark:border-neutral-700';
</script>

<Modal bind:open title="Tadbir qo'shish">
	<form onsubmit={submit} class="flex flex-col gap-3">
		<label class="text-sm font-medium">
			Nomi
			<input bind:value={title} maxlength="80" required placeholder="Masalan: Ochiq suhbat" class="mt-1 {field}" />
		</label>
		<label class="text-sm font-medium">
			Boshlanish vaqti
			<input type="datetime-local" bind:value={startsAt} min={toLocalInput(new Date(Date.now() + 60_000))} required class="mt-1 {field}" />
		</label>
		<label class="text-sm font-medium">
			Tavsif <span class="font-normal text-neutral-400">(ixtiyoriy)</span>
			<textarea bind:value={description} maxlength="300" rows="3" class="mt-1 resize-none {field}"></textarea>
		</label>
		<label class="text-sm font-medium">
			Qo'shilish havolasi <span class="font-normal text-neutral-400">(ixtiyoriy)</span>
			<input type="url" bind:value={link} placeholder="https://..." class="mt-1 {field}" />
		</label>
		{#if error}<p class="text-sm text-rose-600" role="alert">{error}</p>{/if}
		<div class="flex justify-end gap-2">
			<Button type="button" variant="ghost" onclick={() => (open = false)}>Bekor</Button>
			<Button type="submit" disabled={!title.trim()}>Qo'shish</Button>
		</div>
	</form>
</Modal>
