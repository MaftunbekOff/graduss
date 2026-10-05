<script lang="ts">
	import { data } from '$lib/stores/data.svelte';
	import Modal from '$lib/components/ui/Modal.svelte';
	import Button from '$lib/components/ui/Button.svelte';
	import X from '@lucide/svelte/icons/x';

	let { open = $bindable(false), channelId }: { open: boolean; channelId: string } = $props();

	const categories = $derived(data.getChannel(channelId)?.categories ?? []);
	let name = $state('');
	let error = $state('');

	$effect(() => {
		if (open) {
			name = '';
			error = '';
		}
	});

	function add(e: SubmitEvent) {
		e.preventDefault();
		const r = data.addChannelCategory(channelId, name);
		if (r.ok) {
			name = '';
			error = '';
		} else error = r.error ?? 'Xatolik';
	}
</script>

<Modal bind:open title="Kategoriyalar">
	<p class="mb-3 text-sm text-neutral-500 dark:text-neutral-400">
		O'z kanalingizga mos kategoriya yarating (masalan, "Yangiliklar", "Hisobotlar"). Post yozayotganda tanlaysiz,
		o'quvchilar esa "Postlar" tabidagi ro'yxatdan filtrlaydi.
	</p>

	<ul class="mb-3 flex flex-col gap-1.5">
		{#each categories as c (c.id)}
			<li class="flex items-center justify-between gap-2 rounded-xl border border-neutral-200 px-3 py-2 text-sm dark:border-neutral-800">
				<span class="truncate font-medium">{c.name}</span>
				<button
					type="button"
					onclick={() => data.removeChannelCategory(channelId, c.id)}
					aria-label={`${c.name} kategoriyasini o'chirish`}
					class="rounded-full p-1 text-neutral-400 hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-500/10"
				>
					<X class="size-4" />
				</button>
			</li>
		{:else}
			<li class="rounded-xl border border-dashed border-neutral-300 px-3 py-4 text-center text-sm text-neutral-500 dark:border-neutral-700">
				Hali kategoriya yo'q
			</li>
		{/each}
	</ul>

	<form onsubmit={add} class="flex items-start gap-2">
		<div class="min-w-0 flex-1">
			<input
				bind:value={name}
				maxlength="24"
				placeholder="Yangi kategoriya nomi"
				aria-label="Yangi kategoriya nomi"
				class="w-full rounded-xl border border-neutral-300 bg-transparent px-3 py-2 text-sm outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 dark:border-neutral-700"
			/>
			{#if error}<p class="mt-1 text-xs text-rose-600">{error}</p>{/if}
		</div>
		<Button type="submit" size="sm" disabled={!name.trim()}>Qo'shish</Button>
	</form>
</Modal>
