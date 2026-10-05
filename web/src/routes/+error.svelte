<script lang="ts">
	import { page } from '$app/state';
	import Logo from '$lib/components/brand/Logo.svelte';

	const message = $derived(
		page.status === 404 ? 'Bu sahifa topilmadi.' : (page.error?.message ?? 'Nimadir xato ketdi.')
	);
</script>

<svelte:head>
	<title>{page.status} / graduss</title>
</svelte:head>

<div class="flex min-h-screen flex-col items-center justify-center gap-4 bg-white px-6 text-center dark:bg-neutral-950">
	<span class="text-brand-700 dark:text-brand-400"><Logo size={48} wordClass="text-2xl" /></span>
	<p class="text-6xl font-extrabold tracking-tight text-neutral-900 dark:text-white">{page.status}</p>
	<p class="max-w-sm text-neutral-500 dark:text-neutral-400">{message}</p>
	<a
		href="/feed"
		class="inline-flex items-center justify-center rounded-full bg-brand-600 px-4 py-2 text-sm font-semibold text-white shadow-sm shadow-brand-900/10 transition-colors hover:bg-brand-700"
	>
		Bosh sahifaga qaytish
	</a>
</div>
