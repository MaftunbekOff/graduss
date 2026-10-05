<script lang="ts">
	import { tick, untrack } from 'svelte';
	import { page } from '$app/state';
	import { goto } from '$app/navigation';
	import { data } from '$lib/stores/data.svelte';
	import { session } from '$lib/stores/session.svelte';
	import { timeAgo, formatCount } from '$lib/utils';
	import Avatar from '$lib/components/ui/Avatar.svelte';
	import ReplyBar from '$lib/components/post/ReplyBar.svelte';
	import Marquee from '$lib/components/ui/Marquee.svelte';
	import Button from '$lib/components/ui/Button.svelte';
	import CommentList from '$lib/components/post/CommentList.svelte';
	import PostMenu from '$lib/components/post/PostMenu.svelte';
	import PostContent from '$lib/components/post/PostContent.svelte';
	import LinkPreview from '$lib/components/post/LinkPreview.svelte';
	import { firstLink } from '$lib/postFilter';
	import PollWidget from '$lib/components/post/PollWidget.svelte';
	import ImageLightboxModal from '$lib/components/post/ImageLightboxModal.svelte';
	import EmptyState from '$lib/components/ui/EmptyState.svelte';
	import ArrowLeft from '@lucide/svelte/icons/arrow-left';
	import Send from '@lucide/svelte/icons/send';
	import Eye from '@lucide/svelte/icons/eye';
	import CircleAlert from '@lucide/svelte/icons/circle-alert';

	const post = $derived(data.getPost(page.params.id ?? ''));
	const source = $derived(post ? data.getPostSource(post) : undefined);

	let replyEl = $state<HTMLTextAreaElement>();

	// Lentadagi "Izoh" orqali kelinsa, yozish maydoniga darhol fokus.
	$effect(() => {
		if (replyEl && page.url.searchParams.get('reply') === '1') {
			untrack(() => replyEl?.focus({ preventScroll: false }));
		}
	});
	let editing = $state(false);
	let draft = $state('');
	let lightboxOpen = $state(false);

	$effect(() => {
		const id = page.params.id;
		if (id) untrack(() => data.incrementView(id));
	});

	function startEdit() {
		if (!post) return;
		draft = post.content;
		editing = true;
	}

	function cancelEdit() {
		editing = false;
	}

	function saveEdit() {
		if (post && draft.trim()) data.editPost(post.id, draft.trim());
		editing = false;
	}
</script>

<svelte:head>
	<title>Post / graduss</title>
	{#if post && source}
		<meta name="description" content="{source.name}: {post.content.slice(0, 150)}" />
	{/if}
</svelte:head>

<div class="flex min-h-dvh flex-col">
<header
	class="sticky top-0 z-10 flex min-h-[61px] items-center gap-3 border-b border-neutral-200 px-4 py-2 sm:min-h-14 dark:border-neutral-800 glass"
>
	<button onclick={() => (history.length > 1 ? history.back() : goto('/feed'))} class="rounded-full p-2 hover:bg-neutral-100 dark:hover:bg-neutral-900" aria-label="Orqaga">
		<ArrowLeft class="size-5" />
	</button>
	{#if post && source}
		<!-- Post kimning nomidan: kanal postida kanal nomi (muallif ko'rsatilmaydi) -->
		<a href={source.href} class="flex min-w-0 flex-1 items-center gap-2.5">
			<Avatar name={source.name} color={source.avatar} size="sm" />
			<div class="min-w-0">
				<h1 class="font-bold leading-tight"><Marquee>{source.name}</Marquee></h1>
				<p class="truncate text-xs leading-tight text-neutral-500 dark:text-neutral-400">@{source.handle}</p>
			</div>
		</a>
		<PostMenu {post} onDelete={() => goto('/feed')} onEdit={startEdit} />
	{:else}
		<h1 class="text-xl font-bold">Post</h1>
	{/if}
</header>

{#if post && source}
	<article class="border-b border-neutral-200 px-4 py-4 dark:border-neutral-800">
		{#if editing}
			<textarea
				bind:value={draft}
				rows="4"
				class="w-full resize-none rounded-lg border border-neutral-300 bg-transparent p-2 text-xl leading-relaxed text-neutral-900 outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 dark:border-neutral-700 dark:text-neutral-100"
			></textarea>
			<div class="mt-2 flex justify-end gap-2">
				<Button size="sm" variant="outline" onclick={cancelEdit}>Bekor qilish</Button>
				<Button size="sm" disabled={!draft.trim()} onclick={saveEdit}>Saqlash</Button>
			</div>
		{:else}
			<div class="text-xl">
				<PostContent content={post.content} />
			</div>
		{/if}

		{#if post.content && firstLink(post.content) && !editing}
			<LinkPreview url={firstLink(post.content)!} />
		{/if}

		{#if post.mediaUrl}
			<div
				onclick={() => (lightboxOpen = true)}
				role="button"
				tabindex="0"
				onkeydown={(e) => e.key === 'Enter' && (lightboxOpen = true)}
				class="mt-4 max-h-[500px] w-full overflow-hidden rounded-2xl border border-neutral-100 bg-neutral-100 dark:border-neutral-800 dark:bg-neutral-800"
			>
				<img src={post.mediaUrl} alt="Attached media" decoding="async" class="h-full w-full object-cover" />
			</div>
		{/if}

		{#if post.videoUrl}
			<!-- svelte-ignore a11y_media_has_caption -->
			<video src={post.videoUrl} controls preload="metadata" playsinline class="mt-4 max-h-[500px] w-full rounded-2xl bg-black"></video>
		{/if}

		{#if post.poll}
			<PollWidget poll={post.poll} postId={post.id} />
		{/if}

		<!-- Vaqt chapda, ko'rishlar soni shu qatorning o'ng burchagida (alohida qator yo'q) -->
		<div class="mt-3 flex items-center justify-between gap-3 text-sm text-neutral-500 dark:text-neutral-400">
			<span>{timeAgo(post.createdAt)}{#if post.editedAt} · tahrirlangan{/if}</span>
			<span class="flex shrink-0 items-center gap-1" title="Ko'rishlar">
				<Eye class="size-4" />
				{formatCount(post.views)}
			</span>
		</div>

	</article>

	<CommentList postId={post.id} />

	<!-- Izoh yozish: pastga mahkamlangan; izohlar eskidan yangiga, yangisi shu panelning tepasida paydo bo'ladi -->
	<ReplyBar bind:el={replyEl} onSend={(t) => data.addComment(post.id, t)} />

	<ImageLightboxModal bind:open={lightboxOpen} src={post.mediaUrl} />
{:else}
	<EmptyState icon={CircleAlert} title="Post topilmadi" />
{/if}
</div>
