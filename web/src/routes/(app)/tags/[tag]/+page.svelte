<script lang="ts">
	import { page } from '$app/state';
	import { goto } from '$app/navigation';
	import { data } from '$lib/stores/data.svelte';
	import PostCard from '$lib/components/post/PostCard.svelte';
	import PostFilterTab from '$lib/components/post/PostFilterTab.svelte';
	import EmptyState from '$lib/components/ui/EmptyState.svelte';
	import { BUILTIN_FILTERS, matchesFilter, sortPosts, type PostFilter, type PostSort } from '$lib/postFilter';
	import ArrowLeft from '@lucide/svelte/icons/arrow-left';
	import Hash from '@lucide/svelte/icons/hash';

	const tag = $derived(decodeURIComponent(page.params.tag ?? '').toLowerCase());
	const allPosts = $derived(data.getPostsByTag(tag));
	let filter = $state<PostFilter>('all');
	let sort = $state<PostSort>('new');
	const posts = $derived(sortPosts(allPosts.filter((p) => matchesFilter(p, filter)), sort));

	function back() {
		if (history.length > 1) history.back();
		else goto('/search');
	}
</script>

<svelte:head>
	<title>#{tag} / graduss</title>
	<meta name="description" content={`graduss: #${tag} mavzusidagi postlar.`} />
</svelte:head>

<header class="sticky top-0 z-10 flex min-h-[61px] sm:min-h-14 items-center gap-3 border-b border-neutral-200 px-4 py-2 dark:border-neutral-800 glass">
	<button onclick={back} class="shrink-0 rounded-full p-2 hover:bg-neutral-100 dark:hover:bg-neutral-900" aria-label="Orqaga">
		<ArrowLeft class="size-5" />
	</button>
	<h1 class="min-w-0 truncate text-xl font-extrabold tracking-tight">#{tag}</h1>
</header>

{#if allPosts.length}
	<div class="flex border-b border-neutral-200 px-2 dark:border-neutral-800" role="tablist">
		<PostFilterTab bind:value={filter} bind:sort posts={allPosts} />
	</div>
	<div class="flex flex-col gap-3 p-3">
		{#each posts as post (post.id)}
			<PostCard {post} />
		{:else}
			<EmptyState icon={Hash} title={BUILTIN_FILTERS.find((f) => f.id === filter)?.empty ?? "Hali post yo'q"} />
		{/each}
	</div>
{:else}
	<EmptyState icon={Hash} title={`#${tag} bilan post topilmadi`} description="Bu teg bilan birinchi post yozing." />
{/if}
