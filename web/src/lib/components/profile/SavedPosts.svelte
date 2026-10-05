<script lang="ts">
	import { data } from '$lib/stores/data.svelte';
	import PostCard from '$lib/components/post/PostCard.svelte';
	import EmptyState from '$lib/components/ui/EmptyState.svelte';
	import Bookmark from '@lucide/svelte/icons/bookmark';
	import { BUILTIN_FILTERS, matchesFilter, type PostFilter } from '$lib/postFilter';

	// Filtr "Saqlanganlar" tabidagi ochiladigan ro'yxatdan keladi (Hammasi · Rasmlar · Videolar · Linklar · GIFlar).
	let { filter = 'all' }: { filter?: PostFilter } = $props();

	const filteredPosts = $derived(data.getBookmarkedPosts().filter((p) => matchesFilter(p, filter)));
	const emptyTitle = $derived(
		filter === 'all' ? 'Saqlangan post topilmadi' : (BUILTIN_FILTERS.find((f) => f.id === filter)?.empty ?? 'Saqlangan post topilmadi')
	);
</script>

<div class="flex flex-col gap-3 p-3">
	{#each filteredPosts as post (post.id)}
		<PostCard {post} />
	{:else}
		<EmptyState
			icon={Bookmark}
			title={emptyTitle}
			description={filter === 'all' ? "Postlarni saqlab, keyinroq qaytib kelib o'qishingiz mumkin." : 'Boshqa turni tanlab ko‘ring.'}
		/>
	{/each}
</div>
