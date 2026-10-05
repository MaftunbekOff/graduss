<script lang="ts">
	import { goto } from '$app/navigation';
	import { data } from '$lib/stores/data.svelte';
	import { session } from '$lib/stores/session.svelte';
	import Avatar from '$lib/components/ui/Avatar.svelte';
	import Badge from '$lib/components/ui/Badge.svelte';
	import Modal from '$lib/components/ui/Modal.svelte';
	import X from '@lucide/svelte/icons/x';

	let { open = $bindable(false) }: { open?: boolean } = $props();

	const candidates = $derived(data.users.filter((u) => u.id !== session.user.id));

	function start(userId: string) {
		const chat = data.getOrCreateChat(userId);
		open = false;
		goto(`/chats/${chat.id}`);
	}

	function close() {
		open = false;
	}
</script>

<Modal bind:open onClose={close}>
	<div class="flex items-center justify-between border-b border-neutral-100 px-5 py-4 dark:border-neutral-800">
		<h2 class="text-lg font-bold text-neutral-900 dark:text-neutral-100">Yangi xabar</h2>
		<button
			onclick={close}
			aria-label="Yopish"
			class="rounded-full p-1.5 text-neutral-500 hover:bg-neutral-100 dark:text-neutral-400 dark:hover:bg-neutral-800"
		>
			<X class="size-4.5" />
		</button>
	</div>
	<div class="overflow-y-auto py-1">
		{#each candidates as user (user.id)}
			<button
				onclick={() => start(user.id)}
				class="flex w-full items-center gap-3 px-5 py-2.5 text-left transition-colors hover:bg-neutral-50 dark:hover:bg-neutral-800"
			>
				<Avatar name={user.name} color={user.avatar} size="sm" />
				<div class="min-w-0 flex-1">
					<div class="flex items-center gap-1.5">
						<span class="truncate font-medium text-neutral-800 dark:text-neutral-200">{user.name}</span>
						<Badge sector={user.sector} />
					</div>
					<p class="truncate text-xs text-neutral-500 dark:text-neutral-400">@{user.username}</p>
				</div>
			</button>
		{/each}
	</div>
</Modal>
