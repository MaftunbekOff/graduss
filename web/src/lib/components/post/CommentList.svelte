<script lang="ts">
	import { data } from '$lib/stores/data.svelte';
	import { session } from '$lib/stores/session.svelte';
	import { timeAgo } from '$lib/utils';
	import { fly } from 'svelte/transition';
	import Avatar from '$lib/components/ui/Avatar.svelte';
	import PostContent from '$lib/components/post/PostContent.svelte';
	import ConfirmDialog from '$lib/components/ui/ConfirmDialog.svelte';
	import EmptyState from '$lib/components/ui/EmptyState.svelte';
	import MessageSquare from '@lucide/svelte/icons/message-square';
	import Trash2 from '@lucide/svelte/icons/trash-2';

	let { postId, campaignId }: { postId?: string; campaignId?: string } = $props();

	const items = $derived(
		[...(campaignId ? data.getCampaignComments(campaignId) : data.getCommentsByPost(postId ?? ''))].sort(
			(a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
		)
	);

	let confirmOpen = $state(false);
	let pendingDeleteId = $state<string | null>(null);

	function askDelete(id: string) {
		pendingDeleteId = id;
		confirmOpen = true;
	}

	function confirmDelete() {
		if (pendingDeleteId) campaignId ? data.deleteCampaignComment(pendingDeleteId) : data.deleteComment(pendingDeleteId);
		pendingDeleteId = null;
	}
</script>

<!-- Chatdagi kabi: o'zimning izohim o'ngda (brend rangida), boshqalarniki chapda -->
<div class="flex flex-col gap-3 px-3 py-4">
	{#each items as comment (comment.id)}
		{@const author = data.getUser(comment.authorId)!}
		{@const mine = comment.authorId === session.user.id}
		<div in:fly={{ y: 8, duration: 200 }} class="group flex items-end gap-2 {mine ? 'flex-row-reverse' : ''}">
			{#if !mine}
				<a href={`/profile/${author.username}`} class="shrink-0" aria-label={author.name}>
					<Avatar name={author.name} color={author.avatar} size="sm" />
				</a>
			{/if}
			<div class="flex min-w-0 max-w-[80%] flex-col {mine ? 'items-end' : 'items-start'}">
				{#if !mine}
					<a
						href={`/profile/${author.username}`}
						class="mb-0.5 px-1 text-xs font-semibold text-neutral-500 hover:underline dark:text-neutral-400"
						>{author.name}</a
					>
				{/if}
				<div class="flex items-center gap-1 {mine ? 'flex-row-reverse' : ''}">
					<div
						class="whitespace-pre-wrap [overflow-wrap:anywhere] rounded-2xl px-3.5 py-2 text-sm shadow-sm {mine
							? 'rounded-br-sm bg-brand-600 text-white shadow-brand-900/10'
							: 'rounded-bl-sm bg-neutral-100 text-neutral-900 dark:bg-neutral-800 dark:text-neutral-100'}"
					>
						<PostContent content={comment.content} plain />
					</div>
					{#if mine}
						<button
							onclick={() => askDelete(comment.id)}
							aria-label="Izohni o'chirish"
							class="shrink-0 rounded-full p-1.5 text-neutral-400 opacity-0 transition-opacity hover:bg-rose-50 hover:text-rose-600 group-hover:opacity-100 [@media(hover:none)]:opacity-100 dark:text-neutral-600 dark:hover:bg-rose-500/10"
						>
							<Trash2 class="size-3.5" />
						</button>
					{/if}
				</div>
				<span class="mt-0.5 px-1 text-[11px] text-neutral-400 dark:text-neutral-600">{timeAgo(comment.createdAt)}</span>
			</div>
		</div>
	{:else}
		<EmptyState icon={MessageSquare} title={campaignId ? "Hali muhokama yo'q" : "Hali izoh yo'q"} description="Birinchi bo'lib fikringizni yozing." />
	{/each}
</div>

<ConfirmDialog
	bind:open={confirmOpen}
	title="Izohni o'chirish"
	message="Bu izohni o'chirmoqchimisiz? Bu amalni ortga qaytarib bo'lmaydi."
	confirmLabel="O'chirish"
	danger
	onConfirm={confirmDelete}
/>
