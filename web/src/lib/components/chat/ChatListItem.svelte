<script lang="ts">
	import type { Chat } from '$lib/types';
	import { session } from '$lib/stores/session.svelte';
	import { data } from '$lib/stores/data.svelte';
	import { timeAgo } from '$lib/utils';
	import Avatar from '$lib/components/ui/Avatar.svelte';
	import { contextMenu } from '$lib/contextMenu';
	import Users from '@lucide/svelte/icons/users';
	import Pin from '@lucide/svelte/icons/pin';
	import BellOff from '@lucide/svelte/icons/bell-off';

	let { chat, active = false, oncontext }: { chat: Chat; active?: boolean; oncontext?: (x: number, y: number) => void } = $props();

	const otherUser = $derived(
		chat.isGroup
			? undefined
			: data.getUser(chat.participantIds.find((id) => id !== session.user.id)!)
	);
	const title = $derived(chat.isGroup ? chat.title! : (otherUser?.name ?? 'Noma\'lum'));
	const chatMessages = $derived(data.getChatMessages(chat.id));
	const last = $derived(chatMessages[chatMessages.length - 1]);
	const prefs = $derived(data.getChatPrefs(chat.id));
	const unread = $derived(active && !prefs.unread ? 0 : data.getUnreadCount(chat.id));
</script>

<a
	href={`/chats/${chat.id}`}
	use:contextMenu={{ onopen: (x, y) => oncontext?.(x, y) }}
	class="flex items-center gap-3 border-b border-neutral-100 px-4 py-3.5 transition-colors hover:bg-neutral-50 dark:border-neutral-900 dark:hover:bg-neutral-900/60 {active
		? 'bg-brand-50 dark:bg-brand-400/10'
		: ''}"
>
	{#if chat.isGroup}
		<span
			class="flex size-12 shrink-0 items-center justify-center rounded-full bg-neutral-700 text-white ring-2 ring-white dark:bg-neutral-800 dark:ring-neutral-950"
		>
			<Users class="size-6" />
		</span>
	{:else if otherUser}
		<Avatar name={otherUser.name} color={otherUser.avatar} size="lg" />
	{/if}
	<div class="min-w-0 flex-1">
		<div class="flex items-center justify-between gap-2">
			<p class="flex min-w-0 items-center gap-1 {unread ? 'font-extrabold' : 'font-bold'}">
				<span class="truncate">{title}</span>
				{#if prefs.muted}<BellOff class="size-3.5 shrink-0 text-neutral-400" aria-label="Ovozsiz" />{/if}
			</p>
			{#if last}
				<span class="shrink-0 text-xs text-neutral-500 dark:text-neutral-400">{timeAgo(last.createdAt)}</span>
			{/if}
		</div>
		{#if last}
			<div class="flex items-center justify-between gap-2">
				<p class="truncate text-sm {unread ? 'font-semibold text-neutral-900 dark:text-neutral-100' : 'text-neutral-500 dark:text-neutral-400'}">
					{last.senderId === session.user.id ? 'Siz: ' : ''}{last.content || (last.sticker ? `${last.sticker} Stiker` : last.imageUrl ? (/\.gif($|\?)/i.test(last.imageUrl) ? 'GIF' : 'Rasm') : '')}
				</p>
				{#if prefs.pinnedAt && !unread}<Pin class="size-4 shrink-0 text-neutral-400" aria-label="Qadalgan" />{/if}
				{#if unread}
					<span
						class="flex min-w-5 shrink-0 items-center justify-center rounded-full {prefs.muted ? 'bg-neutral-400 dark:bg-neutral-600' : 'bg-brand-600'} px-1.5 text-[11px] font-bold leading-5 text-white"
						aria-label={`${unread} ta o'qilmagan xabar`}>{unread > 99 ? '99+' : unread}</span
					>
				{/if}
			</div>
		{/if}
	</div>
</a>
