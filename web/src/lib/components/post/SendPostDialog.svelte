<script lang="ts">
	import { session } from '$lib/stores/session.svelte';
	import { data } from '$lib/stores/data.svelte';
	import Avatar from '$lib/components/ui/Avatar.svelte';
	import Modal from '$lib/components/ui/Modal.svelte';
	import Users from '@lucide/svelte/icons/users';
	import Check from '@lucide/svelte/icons/check';
	import X from '@lucide/svelte/icons/x';

	let { open = $bindable(false), postId }: { open?: boolean; postId: string } = $props();

	let sentId = $state<string | null>(null);

	function otherParticipant(chat: (typeof data.chats)[number]) {
		return data.getUser(chat.participantIds.find((id) => id !== session.user.id)!);
	}

	function send(chatId: string) {
		if (sentId) return;
		data.sharePostToChat(postId, chatId);
		sentId = chatId;
		setTimeout(() => {
			open = false;
			sentId = null;
		}, 700);
	}

	function close() {
		open = false;
	}
</script>

<Modal bind:open onClose={close}>
	<div class="flex items-center justify-between border-b border-neutral-100 px-5 py-4 dark:border-neutral-800">
		<h2 class="text-lg font-bold text-neutral-900 dark:text-neutral-100">Yuborish</h2>
		<button
			onclick={close}
			aria-label="Yopish"
			class="rounded-full p-1.5 text-neutral-500 hover:bg-neutral-100 dark:text-neutral-400 dark:hover:bg-neutral-800"
		>
			<X class="size-4.5" />
		</button>
	</div>
	<div class="overflow-y-auto py-1">
		{#each data.chats as chat (chat.id)}
			{@const other = chat.isGroup ? undefined : otherParticipant(chat)}
			<button
				onclick={() => send(chat.id)}
				class="flex w-full items-center gap-3 px-5 py-2.5 text-left transition-colors hover:bg-neutral-50 dark:hover:bg-neutral-800"
			>
				{#if chat.isGroup}
					<span
						class="flex size-9 shrink-0 items-center justify-center rounded-full bg-neutral-700 text-white dark:bg-neutral-800"
					>
						<Users class="size-4.5" />
					</span>
				{:else}
					<Avatar name={other?.name ?? "Noma'lum"} color={other?.avatar ?? '#94a3b8'} size="sm" />
				{/if}
				<span class="min-w-0 flex-1 truncate font-medium text-neutral-800 dark:text-neutral-200">
					{chat.isGroup ? chat.title : (other?.name ?? "Noma'lum")}
				</span>
				{#if sentId === chat.id}
					<Check class="size-4.5 shrink-0 text-emerald-600" />
				{/if}
			</button>
		{:else}
			<p class="px-5 py-6 text-center text-sm text-neutral-500 dark:text-neutral-400">Suhbatlar yo'q.</p>
		{/each}
	</div>
</Modal>
