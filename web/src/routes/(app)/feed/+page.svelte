<script lang="ts">
	import { data } from '$lib/stores/data.svelte';
	import PostComposer from '$lib/components/post/PostComposer.svelte';
	import PostCard from '$lib/components/post/PostCard.svelte';
	import EmptyState from '$lib/components/ui/EmptyState.svelte';
	import Modal from '$lib/components/ui/Modal.svelte';
	import Users from '@lucide/svelte/icons/users';
	import Onboarding from '$lib/components/onboarding/Onboarding.svelte';
	import RecommendedChannels from '$lib/components/channel/RecommendedChannels.svelte';
	import { onboarding } from '$lib/stores/onboarding.svelte';
	import PencilFab from '$lib/components/ui/PencilFab.svelte';

	let composeOpen = $state(false);

	const sortedPosts = $derived(
		[...data.getFeed()].sort(
			(a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
		)
	);
</script>

<svelte:head>
	<title>Bosh sahifa / graduss</title>
	<meta name="description" content="Kasbdoshlar kanallaridan yangiliklar va loyihalar lentasi." />
</svelte:head>


<h1 class="sr-only">Bosh sahifa</h1>

<Onboarding onWrite={() => (composeOpen = true)} />

<div class="flex flex-col gap-3 p-3">
	{#each sortedPosts as post (post.id)}
		<PostCard {post} />
	{:else}
		{#if !onboarding.visible}
			<EmptyState icon={Users} title="Lentada hozircha post yo'q" description="A'zo bo'lgan kanallaringiz postlari shu yerda ko'rinadi. Quyidagi kanallardan boshlang.">
				{#snippet children()}
					<div class="mx-auto mt-2 w-full max-w-sm text-left"><RecommendedChannels limit={4} /></div>
					<a href="/search" class="mt-3 inline-block text-sm font-semibold text-brand-700 hover:underline dark:text-brand-400">Barcha kanallarni qidirish</a>
				{/snippet}
			</EmptyState>
		{/if}
	{/each}
</div>

<PencilFab label="Post yozish" onclick={() => (composeOpen = true)} />

<Modal bind:open={composeOpen} title="Yangi post" maxWidth="max-w-xl">
	<PostComposer onPosted={() => (composeOpen = false)} />
</Modal>
