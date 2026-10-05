<script lang="ts">
	import { data } from '$lib/stores/data.svelte';
	import { fly } from 'svelte/transition';

	let { postId }: { postId: string } = $props();

	// Oxirgi 5 ta izoh, yangisi birinchi; ular navbat bilan almashinib turadi.
	const items = $derived(
		[...data.getCommentsByPost(postId)]
			.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
			.slice(0, 5)
	);

	let index = $state(0);
	let el = $state<HTMLElement>();
	let visible = $state(false);

	const current = $derived(items.length ? items[index % items.length] : undefined);
	const author = $derived(current ? data.getUser(current.authorId) : undefined);

	// Ekranda ko'rinib turgan kartalardagina aylanadi (ko'p timer bo'lmasligi uchun).
	$effect(() => {
		if (!el) return;
		const io = new IntersectionObserver(([e]) => (visible = e.isIntersecting), { threshold: 0.3 });
		io.observe(el);
		return () => io.disconnect();
	});

	$effect(() => {
		const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
		if (!visible || reduce || items.length < 2) return;
		// Kartalar bir vaqtda almashmasligi uchun tasodifiy qo'shimcha kechikish.
		const t = setInterval(() => (index = (index + 1) % items.length), 3500 + Math.round(Math.random() * 1200));
		return () => clearInterval(t);
	});
</script>

<div bind:this={el} class="relative min-w-0 flex-1 overflow-hidden text-sm leading-6 text-neutral-500 dark:text-neutral-400">
	{#if current && author}
		{#key current.id}
			<p in:fly={{ y: 10, duration: 260 }} class="truncate">
				<span class="font-semibold text-neutral-700 dark:text-neutral-300">{author.name.split(' ')[0]}</span>
				{current.content}
			</p>
		{/key}
	{:else}
		<p class="truncate text-neutral-400 dark:text-neutral-600">Hali izoh yo'q</p>
	{/if}
</div>
