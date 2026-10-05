<script lang="ts">
	import { untrack } from 'svelte';
	import { page } from '$app/state';
	import { stableParam } from '$lib/stores/stableParam.svelte';
	import { data } from '$lib/stores/data.svelte';
	import { navSection } from '$lib/nav';
	import { navHist } from '$lib/stores/navhist.svelte';
	import ChannelCard from '$lib/components/channel/ChannelCard.svelte';
	import CreateChannelDialog from '$lib/components/channel/CreateChannelDialog.svelte';
	import EmptyState from '$lib/components/ui/EmptyState.svelte';
	import PencilFab from '$lib/components/ui/PencilFab.svelte';
	import Radio from '@lucide/svelte/icons/radio-tower';

	let { children } = $props();

	const idParam = stableParam('/channels', () => page.params.id);
	const activeId = $derived(idParam.value);
	// Bosh sahifa yoki Qidiruvdan kirilgan kanal "Kanallar" bo'limi emas: chapdagi ro'yxatsiz, to'liq kenglikda ochiladi.
	// Faqat manzil o'zgarganda hisoblanadi va bo'limdan chiqayotganda o'zgarmaydi (orqaga qaytganda ro'yxat chaqnab qolmasin).
	let standalone = $state(false);
	$effect.pre(() => {
		const path = page.url.pathname;
		if (!path.startsWith('/channels')) return;
		const from = untrack(() => navHist.from);
		standalone = !!page.params.id && !navSection(path, from).startsWith('/channels');
	});
	const joinedChannels = $derived(data.channels.filter((c) => c.joined));

	let createOpen = $state(false);
</script>

<svelte:head>
	<title>Kanallar / graduss</title>
	<meta name="description" content="Siyosat, sog'liqni saqlash, biznes va huquq bo'yicha kanallarga a'zo bo'ling." />
</svelte:head>

<!-- Ichkarida yuqori panel yo'q: balandlik shunga mos -->
<div class="flex sm:h-[calc(100vh-3.5rem-var(--player-h,0px))] {activeId ? 'h-[calc(100dvh-4rem)]' : 'h-[calc(100dvh-7.8rem-var(--player-h,0px))]'}">
	<div
		class="w-full shrink-0 flex-col overflow-y-auto border-r border-neutral-200 sm:w-80 dark:border-neutral-800 {standalone ? 'hidden' : activeId
			? 'hidden sm:flex'
			: 'flex'}"
	>
		{#if !activeId}<h1 class="sr-only">Kanallar</h1>{/if}
		{#each joinedChannels as channel (channel.id)}
			<ChannelCard {channel} active={channel.id === activeId} />
		{:else}
			<EmptyState icon={Radio} title="Hali hech qanday kanalga a'zo emassiz">
				{#snippet children()}
					<button
						onclick={() => (createOpen = true)}
						class="text-sm font-semibold text-brand-700 hover:underline dark:text-brand-400"
					>
						Kanal yarating
					</button>
				{/snippet}
			</EmptyState>
		{/each}
		<PencilFab inline label="Kanal yaratish" onclick={() => (createOpen = true)} />
	</div>

	<div class="min-w-0 flex-1 overflow-y-auto {activeId ? 'block' : 'hidden sm:block'}">
		{@render children()}
	</div>
</div>

<CreateChannelDialog bind:open={createOpen} />
