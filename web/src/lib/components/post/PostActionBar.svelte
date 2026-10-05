<script lang="ts">
	import type { Post } from '$lib/types';
	import { goto } from '$app/navigation';
	import { formatCount } from '$lib/utils';
	import CommentTicker from '$lib/components/post/CommentTicker.svelte';
	import MessageSquare from '@lucide/svelte/icons/message-square';
	import Eye from '@lucide/svelte/icons/eye';

	let { post, layout = 'card' }: { post: Post; layout?: 'card' | 'detail' } = $props();

	// Kartadagi Izoh: post sahifasiga o'tib, yozish maydoniga fokus beradi.
	function openReply(e: MouseEvent) {
		e.stopPropagation();
		goto(`/post/${post.id}?reply=1`);
	}

</script>

<div class="mt-3 flex flex-col gap-2 border-t border-neutral-100 pt-2 dark:border-neutral-800">
	<!-- Action Buttons Bar -->
	<div class="flex items-center gap-1">
		{#if layout === 'card'}
			<button
				onclick={openReply}
				aria-label="Izoh yozish"
				class="-my-1 flex min-h-9 min-w-11 shrink-0 items-center justify-center gap-1.5 rounded-lg px-2 py-2 text-sm font-medium text-neutral-500 transition-colors hover:bg-brand-50 dark:text-neutral-400 dark:hover:bg-brand-400/10"
			>
				<MessageSquare class="size-4" />
				<span class="hidden sm:inline">Izoh</span>
				{#if post.comments}<span class="text-xs opacity-70">{formatCount(post.comments)}</span>{/if}
			</button>
			<CommentTicker postId={post.id} />
			<span class="flex shrink-0 items-center gap-1 pl-1 text-sm text-neutral-500 dark:text-neutral-400" title="Ko'rishlar">
				<Eye class="size-4" />
				{formatCount(post.views)}
			</span>
		{/if}
	</div>
</div>

