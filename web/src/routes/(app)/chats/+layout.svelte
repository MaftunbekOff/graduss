<script lang="ts">
	import { page } from '$app/state';
	import { goto } from '$app/navigation';
	import { toastStore } from '$lib/stores/toast.svelte';
	import { stableParam } from '$lib/stores/stableParam.svelte';
	import { data } from '$lib/stores/data.svelte';
	import { session } from '$lib/stores/session.svelte';
	import ChatListItem from '$lib/components/chat/ChatListItem.svelte';
	import NewChatDialog from '$lib/components/chat/NewChatDialog.svelte';
	import EmptyState from '$lib/components/ui/EmptyState.svelte';
	import PencilFab from '$lib/components/ui/PencilFab.svelte';
	import MessageCircle from '@lucide/svelte/icons/message-circle';
	import ContextMenu, { type ContextMenuItem } from '$lib/components/ui/ContextMenu.svelte';
	import ConfirmDialog from '$lib/components/ui/ConfirmDialog.svelte';
	import MailOpen from '@lucide/svelte/icons/mail-open';
	import Mail from '@lucide/svelte/icons/mail';
	import Pin from '@lucide/svelte/icons/pin';
	import PinOff from '@lucide/svelte/icons/pin-off';
	import Bell from '@lucide/svelte/icons/bell';
	import BellOff from '@lucide/svelte/icons/bell-off';
	import Archive from '@lucide/svelte/icons/archive';
	import ArchiveRestore from '@lucide/svelte/icons/archive-restore';
	import Trash2 from '@lucide/svelte/icons/trash-2';
	import ArrowLeft from '@lucide/svelte/icons/arrow-left';

	let { children } = $props();

	const idParam = stableParam('/chats', () => page.params.id);
	const activeId = $derived(idParam.value);
	function lastActivity(chatId: string) {
		const msgs = data.getChatMessages(chatId);
		if (!msgs.length) return Number.MAX_SAFE_INTEGER;
		return Math.max(...msgs.map((m) => new Date(m.createdAt).getTime()));
	}
	let showArchive = $state(false);
	const mine = $derived(data.chats.filter((c) => c.participantIds.includes(session.user.id)));
	const archivedCount = $derived(mine.filter((c) => data.getChatPrefs(c.id).archived && (c.isGroup || data.getChatMessages(c.id).length > 0)).length);
	const sortedChats = $derived(
		mine
			// Arxiv alohida ko'rinadi; ochiq turgan suhbat arxivda bo'lsa ham yo'qolmaydi.
			.filter((c) => !!data.getChatPrefs(c.id).archived === showArchive || c.id === activeId)
			// Hali xabar yozilmagan shaxsiy suhbat ro'yxatda ko'rinmaydi (ochiq turgan bo'lsa ko'rinadi).
			.filter((c) => c.isGroup || c.id === activeId || data.getChatMessages(c.id).length > 0)
			// Oxirgi xabar vaqti bo'yicha: yangi xabar kelgan suhbat tepada. Hali xabarsiz ochiq suhbat eng tepada.
			// Qadalganlar tepada (yangi qadalgani birinchi), qolgani oxirgi xabar vaqti bo'yicha.
			.sort((a, b) => {
				const pa = data.getChatPrefs(a.id).pinnedAt ?? '';
				const pb = data.getChatPrefs(b.id).pinnedAt ?? '';
				if (pa !== pb) return pa < pb ? 1 : -1;
				return lastActivity(b.id) - lastActivity(a.id);
			})
	);

	// Suhbat ustida o'ng tugma / bosib turish menyusi.
	let menu = $state<{ id: string; x: number; y: number } | null>(null);
	let deleteId = $state<string | null>(null);
	let deleteOpen = $state(false);
	const menuPrefs = $derived(menu ? data.getChatPrefs(menu.id) : {});
	const menuUnread = $derived(menu ? data.getUnreadCount(menu.id) > 0 : false);
	const menuItems = $derived<ContextMenuItem[]>([
		{ key: 'unread', label: menuUnread ? "O'qilgan deb belgilash" : "O'qilmagan deb belgilash", icon: menuUnread ? MailOpen : Mail },
		{ key: 'pinned', label: menuPrefs.pinnedAt ? 'Qadashni olib tashlash' : 'Tepaga qadash', icon: menuPrefs.pinnedAt ? PinOff : Pin },
		{ key: 'muted', label: menuPrefs.muted ? 'Ovozni yoqish' : "Ovozsiz qilish", icon: menuPrefs.muted ? Bell : BellOff },
		{ key: 'archived', label: menuPrefs.archived ? 'Arxivdan chiqarish' : 'Arxivlash', icon: menuPrefs.archived ? ArchiveRestore : Archive },
		{ key: 'delete', label: "Suhbatni o'chirish", icon: Trash2, danger: true }
	]);

	function onMenu(key: string) {
		const id = menu?.id;
		menu = null;
		if (!id) return;
		if (key === 'delete') {
			deleteId = id;
			deleteOpen = true;
			return;
		}
		if (key === 'unread') {
			// O'qilgan bo'lsa o'qilmagan qilinadi, aks holda o'qilgan deb belgilanadi.
			if (data.getUnreadCount(id) > 0) {
				data.markChatRead(id);
			} else {
				data.toggleChatPref(id, 'unread');
				if (id === activeId) void goto('/chats');
			}
			return;
		}
		data.toggleChatPref(id, key as 'pinned' | 'muted' | 'archived');
		const p = data.getChatPrefs(id);
		if (key === 'archived') {
			toastStore.show(p.archived ? 'Suhbat arxivlandi' : 'Suhbat arxivdan chiqarildi', 'success');
			if (p.archived && id === activeId) void goto('/chats');
		}
	}

	function confirmDelete() {
		if (!deleteId) return;
		const id = deleteId;
		if (id === activeId) void goto('/chats');
		data.deleteChat(id);
		deleteId = null;
	}

	let newChatOpen = $state(false);
</script>

<svelte:head>
	<title>Xabarlar / graduss</title>
</svelte:head>

<!-- Ichkarida yuqori panel yo'q: balandlik shunga mos -->
<div class="flex sm:h-[calc(100vh-3.5rem-var(--player-h,0px))] {activeId ? 'h-[calc(100dvh-var(--kb,0px))]' : 'h-[calc(100dvh-7.8rem-var(--player-h,0px))]'}">
	<div
		class="w-full shrink-0 flex-col overflow-y-auto border-r border-neutral-200 sm:w-80 dark:border-neutral-800 {activeId
			? 'hidden sm:flex'
			: 'flex'}"
	>
		{#if !activeId}<h1 class="sr-only">Xabarlar</h1>{/if}
		{#if showArchive}
			<button onclick={() => (showArchive = false)} class="flex items-center gap-3 border-b border-neutral-100 px-4 py-3 text-left text-sm font-semibold hover:bg-neutral-50 dark:border-neutral-900 dark:hover:bg-neutral-900/60">
				<ArrowLeft class="size-5" /> Arxiv
			</button>
		{:else if archivedCount > 0}
			<button onclick={() => (showArchive = true)} class="flex items-center gap-3 border-b border-neutral-100 px-4 py-3 text-left text-sm font-semibold text-neutral-600 hover:bg-neutral-50 dark:border-neutral-900 dark:text-neutral-300 dark:hover:bg-neutral-900/60">
				<Archive class="size-5" /> Arxiv <span class="text-neutral-400">({archivedCount})</span>
			</button>
		{/if}
		{#each sortedChats as chat (chat.id)}
			<ChatListItem {chat} active={chat.id === activeId} oncontext={(x, y) => (menu = { id: chat.id, x, y })} />
		{:else}
			<EmptyState icon={MessageCircle} title="Hali suhbatlar yo'q">
				{#snippet children()}
					<button
						onclick={() => (newChatOpen = true)}
						class="text-sm font-semibold text-brand-700 hover:underline dark:text-brand-400"
					>
						Yangi xabar yozing
					</button>
				{/snippet}
			</EmptyState>
		{/each}
		<PencilFab inline label="Yangi xabar" onclick={() => (newChatOpen = true)} />
	</div>

	<div class="min-w-0 flex-1 overflow-y-auto overscroll-contain {activeId ? 'block' : 'hidden sm:block'}">
		{@render children()}
	</div>
</div>

<NewChatDialog bind:open={newChatOpen} />

{#if menu}
	<ContextMenu items={menuItems} x={menu.x} y={menu.y} label="Suhbat amallari" onSelect={onMenu} onClose={() => (menu = null)} />
{/if}
<ConfirmDialog
	bind:open={deleteOpen}
	title="Suhbatni o'chirish"
	message="Suhbat va undagi barcha xabarlar o'chiriladi. Bu amalni ortga qaytarib bo'lmaydi."
	confirmLabel="O'chirish"
	danger
	onConfirm={confirmDelete}
/>
