<script lang="ts">
	import type { Post } from '$lib/types';
	import { data } from '$lib/stores/data.svelte';
	import { timeAgo } from '$lib/utils';
	import { goto } from '$app/navigation';
	import { fly } from 'svelte/transition';
	import Avatar from '$lib/components/ui/Avatar.svelte';
	import Badge from '$lib/components/ui/Badge.svelte';
	import Button from '$lib/components/ui/Button.svelte';
	import Pin from '@lucide/svelte/icons/pin';
	import PostMenu from '$lib/components/post/PostMenu.svelte';
	import PostActionBar from '$lib/components/post/PostActionBar.svelte';
	import PostContent from '$lib/components/post/PostContent.svelte';
	import LinkPreview from '$lib/components/post/LinkPreview.svelte';
	import { firstLink } from '$lib/postFilter';
	import PollWidget from '$lib/components/post/PollWidget.svelte';
	import VoicePostWidget from '$lib/components/post/VoicePostWidget.svelte';
	import ImageLightboxModal from '$lib/components/post/ImageLightboxModal.svelte';

	let { post }: { post: Post } = $props();

	// Kanal postida kanal nomidan chiqadi, muallif profili ko'rsatilmaydi.
	const source = $derived(data.getPostSource(post)!);

	let editing = $state(false);
	let draft = $state('');
	let lightboxOpen = $state(false);

	function openPost(e?: Event) {
		// Havola, tugma va media ichidagi bosish kartani ochmaydi (havolalar SvelteKit orqali o'tadi, sahifa qayta yuklanmaydi).
		if ((e?.target as Element | undefined)?.closest?.('a, button, video, audio, input, textarea, select')) return;
		goto(`/post/${post.id}`);
	}

	function startEdit(e?: MouseEvent) {
		e?.stopPropagation();
		draft = post.content;
		editing = true;
	}

	function cancelEdit(e: MouseEvent) {
		e.stopPropagation();
		editing = false;
	}

	function saveEdit(e: MouseEvent) {
		e.stopPropagation();
		if (draft.trim()) data.editPost(post.id, draft.trim());
		editing = false;
	}

	function openLightbox(e?: Event) {
		e?.stopPropagation();
		lightboxOpen = true;
	}
</script>

<div
	role="link"
	tabindex="0"
	onclick={openPost}
	onkeydown={(e) => e.key === 'Enter' && e.target === e.currentTarget && openPost()}
	in:fly={{ y: 8, duration: 220 }}
	class="block cursor-pointer rounded-2xl border border-neutral-200 bg-white p-4 shadow-[var(--shadow-card)] transition-shadow hover:shadow-[var(--shadow-card-hover)] dark:border-neutral-800 dark:bg-neutral-900"
>
	{#if post.pinnedAt}
		<p class="mb-2 flex items-center gap-1.5 text-xs font-semibold text-brand-700 dark:text-brand-400">
			<Pin class="size-3.5" /> Qadalgan
		</p>
	{/if}

	<!-- Yuqori qator: avatar + nom/belgi + @handle · vaqt + menyu. Matn pastda to'liq kenglikda -->
	<div class="flex items-start gap-3">
		<Avatar name={source.name} color={source.avatar} />
		<div class="min-w-0 flex-1">
			<div class="flex items-center gap-x-1.5">
				<a
					href={source.href}
					class="-my-1 block min-w-0 truncate py-1 font-bold hover:underline"
					>{source.name}</a
				>
				{#if source.sector}<span class="shrink-0"><Badge sector={source.sector} channel={source.isChannel} /></span>{/if}
			</div>
			<p class="truncate text-sm text-neutral-500 dark:text-neutral-400">
				@{source.handle} · {timeAgo(post.createdAt)}{#if post.editedAt} · tahrirlangan{/if}
			</p>
		</div>
		<PostMenu {post} onEdit={startEdit} />
	</div>

	<div class="mt-3 min-w-0">
		{#if editing}
			<div onclick={(e) => e.stopPropagation()} role="presentation">
				<textarea
					bind:value={draft}
					rows="3"
					class="w-full resize-none rounded-lg border border-neutral-300 bg-transparent p-2 text-neutral-900 outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 dark:border-neutral-700 dark:text-neutral-100"
				></textarea>
				<div class="mt-1.5 flex justify-end gap-2">
					<Button size="sm" variant="outline" onclick={cancelEdit}>Bekor qilish</Button>
					<Button size="sm" disabled={!draft.trim()} onclick={saveEdit}>Saqlash</Button>
				</div>
			</div>
		{:else if post.content}
			<div>
				<PostContent content={post.content} />
			</div>
		{/if}

		{#if post.content && firstLink(post.content) && !editing}
			<LinkPreview url={firstLink(post.content)!} />
		{/if}

		<!-- Attached Voice Post Widget -->
		{#if post.audioUrl}
			<VoicePostWidget audioUrl={post.audioUrl} duration={post.audioDuration ?? 35} />
		{/if}

		<!-- Attached Media Image -->
		{#if post.mediaUrl}
			<div
				onclick={openLightbox}
				role="button"
				tabindex="0"
				onkeydown={(e) => e.key === 'Enter' && openLightbox(e)}
				class="mt-3 max-h-96 w-full overflow-hidden rounded-2xl border border-neutral-100 bg-neutral-100 dark:border-neutral-800 dark:bg-neutral-800"
			>
				<img
					src={post.mediaUrl}
					alt="Media content"
					loading="lazy"
					decoding="async"
					class="h-full w-full object-cover transition-transform hover:scale-[1.01]"
				/>
			</div>
		{/if}

		<!-- Attached Video -->
		{#if post.videoUrl}
			<!-- svelte-ignore a11y_media_has_caption -->
			<video
				src={post.videoUrl}
				controls
				preload="metadata"
				playsinline
				onclick={(e) => e.stopPropagation()}
				class="mt-3 max-h-96 w-full rounded-2xl bg-black"
			></video>
		{/if}

		<!-- Attached Poll Widget -->
		{#if post.poll}
			<PollWidget poll={post.poll} postId={post.id} />
		{/if}
	</div>

	<PostActionBar {post} layout="card" />
</div>

<ImageLightboxModal bind:open={lightboxOpen} src={post.mediaUrl} />
