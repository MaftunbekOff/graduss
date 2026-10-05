<script lang="ts">
	import type { Post } from '$lib/types';
	import { data } from '$lib/stores/data.svelte';
	import { session } from '$lib/stores/session.svelte';
	import { toastStore } from '$lib/stores/toast.svelte';
	import { scale } from 'svelte/transition';
	import { cubicOut } from 'svelte/easing';
	import ConfirmDialog from '$lib/components/ui/ConfirmDialog.svelte';
	import SendPostDialog from '$lib/components/post/SendPostDialog.svelte';
	import Ellipsis from '@lucide/svelte/icons/ellipsis';
	import LinkIcon from '@lucide/svelte/icons/link';
	import Trash2 from '@lucide/svelte/icons/trash-2';
	import Pencil from '@lucide/svelte/icons/pencil';
	import Bookmark from '@lucide/svelte/icons/bookmark';
	import Send from '@lucide/svelte/icons/send';
	import Pin from '@lucide/svelte/icons/pin';
	import PinOff from '@lucide/svelte/icons/pin-off';

	let { post, onDelete, onEdit }: { post: Post; onDelete?: () => void; onEdit?: () => void } =
		$props();

	let open = $state(false);
	let copied = $state(false);
	let confirmOpen = $state(false);
	let sendOpen = $state(false);

	const isOwn = $derived(post.authorId === session.user.id);
	const bookmarked = $derived(data.isBookmarked(post.id));

	function toggle(e: MouseEvent) {
		e.stopPropagation();
		open = !open;
	}

	function close(e?: MouseEvent) {
		e?.stopPropagation();
		open = false;
	}

	function toggleBookmark(e: MouseEvent) {
		e.stopPropagation();
		const wasSaved = data.isBookmarked(post.id);
		data.toggleBookmark(post.id);
		toastStore.show(wasSaved ? "Saqlanganlardan olindi" : "Saqlanganlarga qo'shildi", "success");
		close();
	}

	function togglePin(e: MouseEvent) {
		e.stopPropagation();
		close();
		const r = data.togglePin(post.id);
		toastStore.show(r.ok ? (r.pinned ? 'Post kanal tepasiga qadaldi' : 'Qadash olib tashlandi') : (r.error ?? 'Xatolik'), r.ok ? 'success' : 'error');
	}

	function openSend(e: MouseEvent) {
		e.stopPropagation();
		close();
		sendOpen = true;
	}

	async function copyLink(e: MouseEvent) {
		e.stopPropagation();
		await navigator.clipboard.writeText(`${location.origin}/post/${post.id}`);
		copied = true;
		setTimeout(() => (copied = false), 1500);
		close();
	}

	function askRemove(e: MouseEvent) {
		e.stopPropagation();
		close();
		confirmOpen = true;
	}

	function confirmRemove() {
		data.deletePost(post.id);
		onDelete?.();
	}

	function edit(e: MouseEvent) {
		e.stopPropagation();
		close();
		onEdit?.();
	}
</script>

<div class="relative shrink-0">
	<button
		onclick={toggle}
		aria-label="Ko'proq"
		class="-m-1.5 rounded-full p-2.5 text-neutral-500 transition-colors hover:bg-brand-50 hover:text-brand-600 dark:text-neutral-400 dark:hover:bg-brand-400/10 dark:hover:text-brand-400"
	>
		<Ellipsis class="size-4.5" />
	</button>

	{#if open}
		<button aria-label="Yopish" onclick={close} class="fixed inset-0 z-20 cursor-default"></button>
		<div
			transition:scale={{ duration: 130, start: 0.95, easing: cubicOut }}
			style="transform-origin: top right"
			class="absolute right-0 top-full z-30 mt-1 w-56 overflow-hidden rounded-xl border border-neutral-200 bg-white py-1 shadow-[var(--shadow-pop)] dark:border-neutral-800 dark:bg-neutral-900"
		>
			<button
				onclick={toggleBookmark}
				class="flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm text-neutral-800 hover:bg-neutral-50 dark:text-neutral-200 dark:hover:bg-neutral-800"
			>
				<Bookmark class="size-4" fill={bookmarked ? 'currentColor' : 'none'} />
				{bookmarked ? 'Saqlanganlardan olib tashlash' : 'Saqlash'}
			</button>
			{#if data.canPin(post)}
				<button
					onclick={togglePin}
					class="flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm text-neutral-800 hover:bg-neutral-50 dark:text-neutral-200 dark:hover:bg-neutral-800"
				>
					{#if post.pinnedAt}<PinOff class="size-4" />Qadashni olib tashlash{:else}<Pin class="size-4" />Kanal tepasiga qadash{/if}
				</button>
			{/if}
			<button
				onclick={openSend}
				class="flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm text-neutral-800 hover:bg-neutral-50 dark:text-neutral-200 dark:hover:bg-neutral-800"
			>
				<Send class="size-4" />
				Chatga yuborish
			</button>
			{#if isOwn}
				<button
					onclick={edit}
					class="flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm text-neutral-800 hover:bg-neutral-50 dark:text-neutral-200 dark:hover:bg-neutral-800"
				>
					<Pencil class="size-4" />
					Tahrirlash
				</button>
				<button
					onclick={askRemove}
					class="flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-500/10"
				>
					<Trash2 class="size-4" />
					Postni o'chirish
				</button>
			{/if}
			<button
				onclick={copyLink}
				class="flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm text-neutral-800 hover:bg-neutral-50 dark:text-neutral-200 dark:hover:bg-neutral-800"
			>
				<LinkIcon class="size-4" />
				{copied ? 'Nusxalandi!' : 'Havolani nusxalash'}
			</button>
		</div>
	{/if}

	<SendPostDialog bind:open={sendOpen} postId={post.id} />

	<ConfirmDialog
		bind:open={confirmOpen}
		title="Postni o'chirish"
		message="Bu postni o'chirmoqchimisiz? Bu amalni ortga qaytarib bo'lmaydi."
		confirmLabel="O'chirish"
		danger
		onConfirm={confirmRemove}
	/>
</div>
