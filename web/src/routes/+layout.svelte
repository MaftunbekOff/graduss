<script lang="ts">
	import '../app.css';

	import { onMount } from 'svelte';
	import { onNavigate } from '$app/navigation';
	import { session } from '$lib/stores/session.svelte';

	let { children } = $props();

	onMount(() => {
		void session.init();
	});

	// Sahifalar orasida yumshoq (qisqa) o'tish: brauzer qo'llab-quvvatlasa va harakat kamaytirilmagan bo'lsa.
	onNavigate((navigation) => {
		if (!document.startViewTransition) return;
		// Orqaga/oldinga (brauzer tugmasi, surish) da o'tish animatsiyasi yo'q: ikki sahifa aralashib "ortiqcha sahifa" bo'lib ko'rinmasin.
		if (navigation.type === 'popstate') return;
		if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
		return new Promise((resolve) => {
			document.startViewTransition(async () => {
				resolve();
				await navigation.complete;
			});
		});
	});
</script>

<svelte:head>
	<title>graduss</title>
</svelte:head>

{@render children()}
