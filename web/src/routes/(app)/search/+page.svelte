<script lang="ts">
	import { page } from '$app/state';
	import { goto, replaceState } from '$app/navigation';
	import { data } from '$lib/stores/data.svelte';
	import BackButton from '$lib/components/ui/BackButton.svelte';
	import PostCard from '$lib/components/post/PostCard.svelte';
	import Avatar from '$lib/components/ui/Avatar.svelte';
	import Badge from '$lib/components/ui/Badge.svelte';
	import Button from '$lib/components/ui/Button.svelte';
	import EmptyState from '$lib/components/ui/EmptyState.svelte';
	import { SECTORS, fieldOf } from '$lib/sectors';
	import { daysLeft, formatSum } from '$lib/utils';
	import { fade } from 'svelte/transition';
	import { recentSearches } from '$lib/stores/recentSearches.svelte';
	import Search from '@lucide/svelte/icons/search';
	import History from '@lucide/svelte/icons/history';
	import TrendingUp from '@lucide/svelte/icons/trending-up';
	import Users from '@lucide/svelte/icons/users';
	import HandCoins from '@lucide/svelte/icons/hand-coins';
	import Radio from '@lucide/svelte/icons/radio-tower';
	import X from '@lucide/svelte/icons/x';

	let queryInput = $state(page.url.searchParams.get('q') ?? '');

	$effect(() => {
		const param = page.url.searchParams.get('q') ?? '';
		queryInput = param;
	});

	const results = $derived(data.search(queryInput));
	const hasResults = $derived(
		!!results.users.length || !!results.posts.length || !!results.channels.length
	);

	// Tanlangan tab va filtr manzilda saqlanadi: Kanallar/Odamlar ichiga kirib orqaga qaytganda ular yo'qolmaydi.
	function buildUrl(q: string) {
		const sp = new URLSearchParams();
		if (q) sp.set('q', q);
		if (exploreTab !== 'posts') sp.set('tab', exploreTab);
		if (sectorFilter) sp.set('sektor', sectorFilter);
		const qs = sp.toString();
		return qs ? `/search?${qs}` : '/search';
	}

	function onInputSearch() {
		goto(buildUrl(queryInput.trim()), { keepFocus: true, replaceState: true });
	}

	function clearSearch() {
		queryInput = '';
		goto(buildUrl(''), { replaceState: true });
	}

	function setTab(id: typeof exploreTab) {
		exploreTab = id;
		replaceState(buildUrl(queryInput.trim()), {});
	}

	function setSector(s: string) {
		sectorFilter = s;
		replaceState(buildUrl(queryInput.trim()), {});
	}

	const trendingPosts = $derived(data.getTrendingPosts(5));
	let sectorFilter = $state<string>(new URLSearchParams(location.search).get('sektor') ?? '');
	const suggestedUsers = $derived(data.getSuggestedUsers(30, sectorFilter || undefined));
	const popularChannels = $derived(data.getPopularChannels(8, sectorFilter || undefined));
	const activeCampaigns = $derived(data.getActiveCampaigns(sectorFilter || undefined));
	const hasExplore = $derived(
		!!trendingPosts.length || !!suggestedUsers.length || !!popularChannels.length || !!activeCampaigns.length
	);

	let exploreTab = $state<'posts' | 'channels' | 'people' | 'campaigns'>(
		(['channels', 'people', 'campaigns'] as const).find((t) => t === new URLSearchParams(location.search).get('tab')) ?? 'posts'
	);

	const EXPLORE_TABS = [
		{ id: 'posts', label: 'Postlar' },
		{ id: 'channels', label: 'Kanallar' },
		{ id: 'people', label: 'Odamlar' },
		{ id: 'campaigns', label: 'Kampaniyalar' }
	] as const;

	// Filtr tugmalari: odamlarda KASB nomi, kanal va kampaniyada SOHA nomi; postlarda filtr yo'q.
	const showChips = $derived(exploreTab !== 'posts');
	const chipLabel = (s: string) => (exploreTab === 'people' ? s : fieldOf(s as never));
</script>

<svelte:head>
	<title>{queryInput ? `"${queryInput}" qidiruvi` : 'Qidiruv'} / graduss</title>
	<meta name="description" content="graduss da foydalanuvchi, post va kanallarni qidiring, ommabop mazmunni kashf qiling." />
</svelte:head>

<header class="sticky top-0 z-10 flex min-h-[61px] sm:min-h-14 items-center border-b border-neutral-200 px-4 py-2 dark:border-neutral-800 glass">
	<h1 class="sr-only">Qidiruv</h1>
	<div class="flex w-full items-center gap-1">
	<BackButton class="-ml-2" />
	<div class="relative min-w-0 flex-1">
		<label
			class="flex items-center gap-2 rounded-full bg-neutral-100 px-4 py-2.5 text-sm text-neutral-500 transition-shadow focus-within:bg-white focus-within:shadow-[var(--shadow-card)] focus-within:ring-1 focus-within:ring-brand-400 dark:bg-neutral-900 dark:text-neutral-400 dark:focus-within:bg-neutral-900"
		>
			<Search class="size-4 shrink-0 text-brand-500" />
			<input
				bind:value={queryInput}
				oninput={onInputSearch}
				onkeydown={(e) => e.key === 'Enter' && recentSearches.add(queryInput)}
				enterkeyhint="search"
				type="text"
				placeholder="Odam, kanal yoki post qidiring"
				class="w-full bg-transparent text-neutral-900 outline-none placeholder:text-neutral-500 dark:text-neutral-100 dark:placeholder:text-neutral-500"
			/>
			{#if queryInput}
				<button onclick={clearSearch} class="rounded-full p-1 hover:bg-neutral-200 dark:hover:bg-neutral-800">
					<X class="size-4" />
				</button>
			{/if}
		</label>
	</div>
	</div>
</header>

{#if !queryInput.trim()}
	{#if !hasExplore}
		<EmptyState icon={Search} title="Hozircha kashf qilish uchun narsa yo'q" />
	{:else}
		{#if recentSearches.list.length}
			<section aria-label="Oxirgi qidiruvlar" class="border-b border-neutral-200 dark:border-neutral-800">
				<div class="flex items-center justify-between px-4 pb-1 pt-3">
					<h2 class="flex items-center gap-1.5 text-sm font-bold text-neutral-700 dark:text-neutral-300"><History class="size-4" />Oxirgi qidiruvlar</h2>
					<button type="button" onclick={() => recentSearches.clear()} class="rounded-full px-2 py-2 text-xs font-semibold text-brand-700 hover:bg-brand-50 dark:text-brand-400 dark:hover:bg-brand-400/10">Tozalash</button>
				</div>
				<ul class="pb-1">
					{#each recentSearches.list as q (q)}
						<li class="flex items-center">
							<button
								type="button"
								onclick={() => {
									queryInput = q;
									onInputSearch();
									recentSearches.add(q);
								}}
								class="min-w-0 flex-1 truncate px-4 py-2.5 text-left text-sm hover:bg-neutral-50 dark:hover:bg-neutral-900/60"
							>
								{q}
							</button>
							<button
								type="button"
								onclick={() => recentSearches.remove(q)}
								aria-label={`"${q}" ni o'chirish`}
								class="mr-2 flex size-10 shrink-0 items-center justify-center rounded-full text-neutral-400 hover:bg-neutral-100 hover:text-rose-600 dark:hover:bg-neutral-800"
							>
								<X class="size-4" />
							</button>
						</li>
					{/each}
				</ul>
			</section>
		{/if}

		<div class="flex border-b border-neutral-200 dark:border-neutral-800" role="tablist">
			{#each EXPLORE_TABS as t (t.id)}
				<button
					role="tab"
					aria-selected={exploreTab === t.id}
					onclick={() => setTab(t.id)}
					class="flex-1 border-b-2 px-1 py-3 text-sm font-bold transition-colors {exploreTab === t.id
						? 'border-brand-600 text-brand-700 dark:border-brand-400 dark:text-brand-400'
						: 'border-transparent text-neutral-500 hover:text-neutral-800 dark:text-neutral-400 dark:hover:text-neutral-200'}"
				>
					{t.label}
				</button>
			{/each}
		</div>
		{#if showChips}
			<div class="flex gap-2 overflow-x-auto border-b border-neutral-200 px-4 py-2.5 dark:border-neutral-800" role="group" aria-label="Filtr">
				{#each ['', ...SECTORS] as s (s)}
					<button
						onclick={() => setSector(s)}
						aria-pressed={sectorFilter === s}
						class="shrink-0 rounded-full px-3 py-1 text-sm font-medium transition-colors {sectorFilter === s
							? 'bg-brand-600 text-white'
							: 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200 dark:bg-neutral-800 dark:text-neutral-300 dark:hover:bg-neutral-700'}"
					>
						{s ? chipLabel(s) : 'Hammasi'}
					</button>
				{/each}
			</div>
		{/if}

		{#if exploreTab === 'posts'}
			{#if trendingPosts.length}
				<div class="flex flex-col gap-3 p-3">
					{#each trendingPosts as post (post.id)}
						<PostCard {post} />
					{/each}
				</div>
			{:else}
				<EmptyState icon={TrendingUp} title="Hali ommabop post yo'q" />
			{/if}
		{:else if exploreTab === 'people'}
			{#each suggestedUsers as user (user.id)}
				<a href={`/profile/${user.username}`} class="flex items-center gap-3 border-b border-neutral-100 px-4 py-3 hover:bg-neutral-50 dark:border-neutral-900 dark:hover:bg-neutral-900/60">
					<Avatar name={user.name} color={user.avatar} />
					<div class="min-w-0 flex-1">
						<div class="flex flex-wrap items-center gap-x-1.5">
							<span class="truncate font-bold">{user.name}</span>
							<Badge sector={user.sector} />
						</div>
						<p class="truncate text-sm text-neutral-500 dark:text-neutral-400">@{user.username}</p>
					</div>
				</a>
			{:else}
				<EmptyState icon={Users} title="Bu kasbda odam topilmadi" />
			{/each}
		{:else if exploreTab === 'campaigns'}
			{#each activeCampaigns as c (c.id)}
				{@const ch = data.getChannel(c.channelId)}
				<a href={`/campaigns/${c.id}`} class="block border-b border-neutral-100 px-4 py-3 hover:bg-neutral-50 dark:border-neutral-900 dark:hover:bg-neutral-900/60">
					<p class="font-bold">{c.title}</p>
					<p class="text-sm text-neutral-500 dark:text-neutral-400">{ch?.name}{ch?.sector ? ` · ${fieldOf(ch.sector)}` : ''} · {daysLeft(c.deadline)} kun qoldi</p>
					<div class="mt-2 h-1.5 overflow-hidden rounded-full bg-neutral-200 dark:bg-neutral-800">
						<div class="h-full rounded-full bg-brand-600" style:width="{Math.min(100, (data.getRaised(c) / c.goal) * 100)}%"></div>
					</div>
					<p class="mt-1 text-xs text-neutral-500">{formatSum(data.getRaised(c))} / {formatSum(c.goal)}</p>
				</a>
			{:else}
				<EmptyState icon={HandCoins} title="Faol kampaniya yo'q" />
			{/each}
		{:else if popularChannels.length}
			{#each popularChannels as channel (channel.id)}
				<a href={`/channels/${channel.id}`} class="flex items-center gap-3 border-b border-neutral-100 px-4 py-3 hover:bg-neutral-50 dark:border-neutral-900 dark:hover:bg-neutral-900/60">
					<span
						class="flex size-10 shrink-0 items-center justify-center rounded-full text-sm font-semibold text-white ring-2 ring-white dark:ring-neutral-950"
						style:background-color={channel.avatar}
						style:background-image="linear-gradient(145deg, rgba(255,255,255,.28), rgba(0,0,0,.12))"
					>
						{channel.name[0]}
					</span>
					<div class="min-w-0 flex-1">
						<p class="truncate font-bold">{channel.name}</p>
						<p class="truncate text-sm text-neutral-500 dark:text-neutral-400">@{channel.handle}</p>
					</div>
				</a>
			{/each}
		{:else}
			<EmptyState icon={Radio} title="Hali ommabop kanal yo'q" />
		{/if}
	{/if}
{:else if !hasResults}
	<EmptyState icon={Search} title="Hech narsa topilmadi" description={`"${queryInput}" bo'yicha natija yo'q.`} />
{:else}
	<!-- svelte-ignore a11y_click_events_have_key_events, a11y_no_static_element_interactions -->
	<div onclick={(e) => (e.target as HTMLElement).closest('a') && recentSearches.add(queryInput)}>
	{#if results.users.length}
		<section>
			<h2 class="border-b border-neutral-200 px-4 py-2 text-sm font-bold text-brand-700 dark:border-neutral-800 dark:text-brand-400">
				Odamlar
			</h2>
			{#each results.users as user (user.id)}
				<a href={`/profile/${user.username}`} class="flex items-center gap-3 border-b border-neutral-100 px-4 py-3 hover:bg-neutral-50 dark:border-neutral-900 dark:hover:bg-neutral-900/60">
					<Avatar name={user.name} color={user.avatar} />
					<div class="min-w-0 flex-1">
						<div class="flex items-center gap-1.5">
							<span class="font-bold">{user.name}</span>
							<Badge sector={user.sector} />
						</div>
						<p class="text-sm text-neutral-500 dark:text-neutral-400">@{user.username}</p>
					</div>
				</a>
			{/each}
		</section>
	{/if}

	{#if results.channels.length}
		<section>
			<h2 class="border-b border-neutral-200 px-4 py-2 text-sm font-bold text-brand-700 dark:border-neutral-800 dark:text-brand-400">
				Kanallar
			</h2>
			{#each results.channels as channel (channel.id)}
				<a href={`/channels/${channel.id}`} class="flex items-center gap-3 border-b border-neutral-100 px-4 py-3 hover:bg-neutral-50 dark:border-neutral-900 dark:hover:bg-neutral-900/60">
					<span
						class="flex size-10 shrink-0 items-center justify-center rounded-full text-sm font-semibold text-white ring-2 ring-white dark:ring-neutral-950"
						style:background-color={channel.avatar}
						style:background-image="linear-gradient(145deg, rgba(255,255,255,.28), rgba(0,0,0,.12))"
					>
						{channel.name[0]}
					</span>
					<div class="min-w-0 flex-1">
						<p class="truncate font-bold">{channel.name}</p>
						<p class="truncate text-sm text-neutral-500 dark:text-neutral-400">@{channel.handle}</p>
					</div>
				</a>
			{/each}
		</section>
	{/if}

	{#if results.posts.length}
		<section>
			<h2 class="border-b border-neutral-200 px-4 py-2 text-sm font-bold text-brand-700 dark:border-neutral-800 dark:text-brand-400">
				Postlar
			</h2>
			<div class="flex flex-col gap-3 p-3">
				{#each results.posts as post (post.id)}
					<PostCard {post} />
				{/each}
			</div>
		</section>
	{/if}
	</div>
{/if}
