<script lang="ts">
	import { session } from '$lib/stores/session.svelte';
	import { data } from '$lib/stores/data.svelte';
	import { toastStore } from '$lib/stores/toast.svelte';
	import Avatar from '$lib/components/ui/Avatar.svelte';
	import Modal from '$lib/components/ui/Modal.svelte';
	import Users from '@lucide/svelte/icons/users';
	import X from '@lucide/svelte/icons/x';

	let { open = $bindable(false), messageIds, onDone }: { open?: boolean; messageIds: string[]; onDone?: () => void } = $props();

	// Faqat mening suhbatlarim; xabarsiz shaxsiy suhbatlar ro'yxatda bo'lmaydi (discardEmptyChat qoidasi).
	const targets = $derived(
		data.chats.filter((c) => c.participantIds.includes(session.user.id) && (c.isGroup || data.getChatMessages(c.id).length > 0))
	);

	function other(chat: (typeof data.chats)[number]) {
		return data.getUser(chat.participantIds.find((id) => id !== session.user.id)!);
	}

	function pick(chatId: string) {
		const n = data.forwardMessages(messageIds, chatId);
		open = false;
		toastStore.show(n > 1 ? `${n} ta xabar uzatildi` : 'Xabar uzatildi', 'success');
		onDone?.();
	}
</script>

<Modal bind:open onClose={() => (open = false)}>
	<div class="flex items-center justify-between border-b border-neutral-100 px-5 py-4 dark:border-neutral-800">
		<h2 class="text-lg font-bold text-neutral-900 dark:text-neutral-100">Uzatish</h2>
		<button onclick={() => (open = false)} aria-label="Yopish" class="rounded-full p-1.5 text-neutral-500 hover:bg-neutral-100 dark:text-neutral-400 dark:hover:bg-neutral-800">
			<X class="size-4.5" />
		</button>
	</div>
	<div class="overflow-y-auto py-1">
		{#each targets as chat (chat.id)}
			{@const o = chat.isGroup ? undefined : other(chat)}
			<button onclick={() => pick(chat.id)} class="flex w-full items-center gap-3 px-5 py-2.5 text-left transition-colors hover:bg-neutral-50 dark:hover:bg-neutral-800">
				{#if chat.isGroup}
					<span class="flex size-9 shrink-0 items-center justify-center rounded-full bg-neutral-700 text-white dark:bg-neutral-800"><Users class="size-4.5" /></span>
				{:else}
					<Avatar name={o?.name ?? "Noma'lum"} color={o?.avatar ?? '#94a3b8'} size="sm" />
				{/if}
				<span class="min-w-0 flex-1 truncate font-medium text-neutral-800 dark:text-neutral-200">{chat.isGroup ? chat.title : (o?.name ?? "Noma'lum")}</span>
			</button>
		{:else}
			<p class="px-5 py-6 text-center text-sm text-neutral-500 dark:text-neutral-400">Suhbatlar yo'q.</p>
		{/each}
	</div>
</Modal>
