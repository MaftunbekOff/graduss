<script lang="ts">
	import { page } from '$app/state';
	import { goto } from '$app/navigation';
	import { fade } from 'svelte/transition';
	import MobileTopBar from '$lib/components/nav/MobileTopBar.svelte';
	import { data } from '$lib/stores/data.svelte';
	import { session } from '$lib/stores/session.svelte';
	import { formatCount, formatJoinDate, formatBirthDate, formatPhone, workStatus, WEEKDAYS, todayIndex } from '$lib/utils';
	import Avatar from '$lib/components/ui/Avatar.svelte';
	import Badge from '$lib/components/ui/Badge.svelte';
	import Button from '$lib/components/ui/Button.svelte';
	import PortfolioDialog from '$lib/components/profile/PortfolioDialog.svelte';
	import MusicCard from '$lib/components/profile/MusicCard.svelte';
	import PostFilterTab from '$lib/components/post/PostFilterTab.svelte';
	import { BUILTIN_FILTERS, matchesFilter, sortPosts, type PostFilter, type PostSort } from '$lib/postFilter';
	import SavedPosts from '$lib/components/profile/SavedPosts.svelte';
	import Briefcase from '@lucide/svelte/icons/briefcase';
	import Settings from '@lucide/svelte/icons/settings';
	import Music2 from '@lucide/svelte/icons/music-2';
	import Plus from '@lucide/svelte/icons/plus';
	import Trash2 from '@lucide/svelte/icons/trash-2';
	import PostCard from '$lib/components/post/PostCard.svelte';
	import EmptyState from '$lib/components/ui/EmptyState.svelte';
	import MapPin from '@lucide/svelte/icons/map-pin';
	import Marquee from '$lib/components/ui/Marquee.svelte';
	import BackButton from '$lib/components/ui/BackButton.svelte';
	import InfoItem from '$lib/components/profile/InfoItem.svelte';
	import Clock from '@lucide/svelte/icons/clock';
	import ChevronDown from '@lucide/svelte/icons/chevron-down';
	import Cake from '@lucide/svelte/icons/cake';
	import Phone from '@lucide/svelte/icons/phone';
	import Calendar from '@lucide/svelte/icons/calendar';
	import MessageCircle from '@lucide/svelte/icons/message-circle';
	import FileText from '@lucide/svelte/icons/file-text';
	import CircleAlert from '@lucide/svelte/icons/circle-alert';
	import CheckCircle2 from '@lucide/svelte/icons/check-circle-2';
	import Globe from '@lucide/svelte/icons/globe';
	import Send from '@lucide/svelte/icons/send';

	const profileUser = $derived(data.getUserByUsername(page.params.username ?? ''));
	const isOwnProfile = $derived(profileUser?.id === session.user.id);
	const userPosts = $derived(
		profileUser
			? [...data.getPostsByAuthor(profileUser.id)].sort(
					(a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
				)
			: []
	);

	let tab = $state<'posts' | 'saved'>(page.url.searchParams.get('tab') === 'saved' ? 'saved' : 'posts');
	const activeTab = $derived(isOwnProfile ? tab : 'posts');

	let filter = $state<PostFilter>('all');
	let savedFilter = $state<PostFilter>('all');
	let sort = $state<PostSort>('new');
	const filteredPosts = $derived(sortPosts(userPosts.filter((p) => matchesFilter(p, filter)), sort));

	let portfolioOpen = $state(false);
	const portfolio = $derived(profileUser?.portfolio ?? []);


	// Ism sarlavhada faqat sahifadagi ism ko'rinmay qolganda (pastga aylantirilganda) chiqadi.
	let nameEl = $state<HTMLElement>();
	let showTitle = $state(false);
	$effect(() => {
		if (!nameEl) return;
		const io = new IntersectionObserver(
			([e]) => {
				showTitle = !e.isIntersecting && e.boundingClientRect.top < 100;
			},
			{ rootMargin: '-56px 0px 0px 0px' }
		);
		io.observe(nameEl);
		return () => {
			io.disconnect();
			showTitle = false;
		};
	});

	// Aylantirish yo'nalishi: pastga bo'lsa ism paneli, tepaga bo'lsa qidiruv/bildirishnoma paneli (telefonda).
	let hoursOpen = $state(false);
	let scrollY = $state(0);
	let scrollingUp = $state(false);
	$effect(() => {
		let last = window.scrollY;
		const onScroll = () => {
			const y = window.scrollY;
			if (Math.abs(y - last) > 6) {
				scrollingUp = y < last;
				last = y;
			}
			scrollY = y;
		};
		onScroll();
		window.addEventListener('scroll', onScroll, { passive: true });
		return () => window.removeEventListener('scroll', onScroll);
	});
	const showBar = $derived(scrollingUp && scrollY > 120);

	function message() {
		if (!profileUser) return;
		const chat = data.getOrCreateChat(profileUser.id);
		goto(`/chats/${chat.id}`);
	}
</script>

<svelte:head>
	<title>{profileUser?.name ?? 'Profil'} / graduss</title>
	{#if profileUser}
		<meta name="description" content="{profileUser.name} (@{profileUser.username}) — {profileUser.sector}. {profileUser.bio}" />
	{/if}
</svelte:head>

{#if profileUser}
	<MobileTopBar mode="profileTop" />
	<!-- Sticky qatlam sahifa tarkibini surmasligi uchun nol balandlikda (aks holda aylantirish tebranadi) -->
	<div class="sticky top-0 z-20 h-0">
		{#if showBar}
			<div transition:fade={{ duration: 150 }} class="glass absolute inset-x-0 top-0">
				<MobileTopBar mode="profileOverlay" />
			</div>
		{/if}
		{#if showTitle}
			<header
				transition:fade={{ duration: 150 }}
				class="absolute inset-x-0 top-0 items-center justify-between border-b border-neutral-200 px-4 py-3 dark:border-neutral-800 glass {scrollingUp ? 'hidden' : 'flex'}"
			>
				<div class="flex items-center gap-2">
					<p class="text-xl font-bold">{profileUser.name}</p>
					{#if profileUser.isVerified}
						<CheckCircle2 class="size-5 fill-brand-500 text-white dark:fill-brand-400 dark:text-neutral-950" />
					{/if}
				</div>
				{#if isOwnProfile}
					<Button variant="outline" size="sm" onclick={() => goto('/settings')} aria-label="Sozlamalar">
						<Settings class="size-4" />
						<span class="hidden sm:inline">Sozlamalar</span>
					</Button>
				{/if}
			</header>
		{/if}
	</div>

	<!-- Cover Hero Banner -->
	<div
		class="relative h-36 overflow-hidden bg-gradient-to-br {profileUser.banner ?? 'from-brand-500 via-brand-700 to-indigo-900'}"
	>
		<div
			class="absolute inset-0 opacity-30"
			style:background-image="radial-gradient(circle at 20% 20%, rgba(255,255,255,.4), transparent 45%)"
		></div>
		<!-- Profil qo'shig'i: avatar orqasidagi muqova ustida -->
		{#if profileUser.music}
			{#key profileUser.music.url}<MusicCard music={profileUser.music} />{/key}
		{:else if isOwnProfile}
			<a
				href="/settings#profil-qoshigi"
				class="absolute bottom-3 right-3 z-10 inline-flex items-center gap-1.5 rounded-full bg-black/35 px-3 py-1.5 text-xs font-semibold text-white backdrop-blur-md hover:bg-black/50"
			>
				<Music2 class="size-3.5" /> Qo'shiq qo'shish
			</a>
		{/if}
		<BackButton overlay always={!isOwnProfile} class="absolute left-3 top-3" />
		{#if isOwnProfile}
			<button
				onclick={() => goto('/settings')}
				aria-label="Sozlamalar"
				title="Sozlamalar"
				class="absolute right-3 top-3 flex min-h-10 min-w-10 items-center justify-center gap-1.5 rounded-full bg-black/35 px-3 py-2 text-sm font-semibold text-white backdrop-blur-md transition-colors hover:bg-black/50"
			>
				<Settings class="size-4" />
				<span class="hidden sm:inline">Sozlamalar</span>
			</button>
		{/if}
	</div>

	<div class="px-4 pb-4">
		<div class="-mt-10 flex items-end justify-between">
			<div class="relative z-10 rounded-full ring-4 ring-white dark:ring-neutral-950">
				<Avatar name={profileUser.name} color={profileUser.avatar} size="xl" />
			</div>
			{#if !isOwnProfile}
				<div class="flex items-center gap-2">
					<Button variant="outline" onclick={message} aria-label="Xabar yozish">
						<MessageCircle class="size-4.5" />
					</Button>
				</div>
			{/if}
		</div>

		<div bind:this={nameEl} class="mt-3 flex flex-wrap items-center gap-x-1.5 gap-y-1">
			<h1 class="min-w-0 break-words text-xl font-extrabold tracking-tight">{profileUser.name}</h1>
			{#if profileUser.isVerified}
				<CheckCircle2 class="size-5 fill-brand-500 text-white dark:fill-brand-400 dark:text-neutral-950" />
			{/if}
			<Badge sector={profileUser.sector} />
		</div>
		<p class="min-w-0 text-neutral-500 dark:text-neutral-400"><Marquee>@{profileUser.username}</Marquee></p>

		<p class="mt-3 leading-relaxed text-neutral-900 dark:text-neutral-100">{profileUser.bio}</p>

		<!-- Ma'lumotlar kartasi -->
		<section aria-label="Ma'lumotlar" class="mt-4 overflow-hidden rounded-2xl border border-neutral-200 bg-neutral-50/60 dark:border-neutral-800 dark:bg-neutral-900/50">
			{#if profileUser.workHours}
				{@const st = workStatus(profileUser.workHours.days)}
				{@const today = todayIndex()}
				<div class="border-b border-neutral-200 dark:border-neutral-800" data-testid="profile-hours">
					<button type="button" onclick={() => (hoursOpen = !hoursOpen)} aria-expanded={hoursOpen} class="flex w-full items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-neutral-100/70 dark:hover:bg-neutral-800/40">
						<span class="flex size-9 shrink-0 items-center justify-center rounded-xl {st.open ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-400/10 dark:text-emerald-400' : 'bg-rose-50 text-rose-600 dark:bg-rose-400/10 dark:text-rose-400'}"><Clock class="size-[18px]" /></span>
						<span class="min-w-0 flex-1">
							<span class="block text-[11px] font-semibold uppercase leading-tight tracking-wide text-neutral-400 dark:text-neutral-500">Ish vaqti</span>
							<span class="mt-0.5 flex items-center gap-1.5 text-sm font-semibold {st.open ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}">
								<span class="size-2 shrink-0 rounded-full {st.open ? 'bg-emerald-500' : 'bg-rose-500'}"></span>{st.text}
							</span>
						</span>
						<ChevronDown class="size-4 shrink-0 text-neutral-400 transition-transform {hoursOpen ? 'rotate-180' : ''}" />
					</button>
					{#if hoursOpen}
						<ul class="mx-4 mb-3 flex flex-col overflow-hidden rounded-xl border border-neutral-200 bg-white text-sm dark:border-neutral-800 dark:bg-neutral-900">
							{#each profileUser.workHours.days as d, i (i)}
								<li class="flex items-center justify-between gap-4 px-3 py-2 {i === today ? 'bg-brand-50 font-semibold text-brand-700 dark:bg-brand-400/10 dark:text-brand-300' : 'text-neutral-700 dark:text-neutral-300'} {i ? 'border-t border-neutral-100 dark:border-neutral-800' : ''}">
									<span>{WEEKDAYS[i]}{#if i === today}<span class="ml-2 rounded-full bg-brand-600 px-1.5 py-0.5 text-[10px] font-bold uppercase text-white">Bugun</span>{/if}</span>
									<span class="tabular-nums {d ? '' : 'text-neutral-400'}">{d ? `${d.from} - ${d.to}` : 'Dam olish'}</span>
								</li>
							{/each}
						</ul>
					{/if}
				</div>
			{/if}
			<div class="grid grid-cols-2 gap-x-3 gap-y-4 p-3 sm:gap-x-4 sm:p-4">
				<InfoItem icon={MapPin} label="Joylashuv">{profileUser.location}</InfoItem>
				<InfoItem icon={Calendar} label="Qo'shilgan" tone="violet" wrap>{formatJoinDate(profileUser.joined)}</InfoItem>
				{#if profileUser.birthDate}
					<InfoItem icon={Cake} label="Tug'ilgan kun" tone="amber" testid="profile-birthdate">{formatBirthDate(profileUser.birthDate)}</InfoItem>
				{/if}
				{#if profileUser.website}
					<InfoItem icon={Globe} label="Vebsayt" tone="sky"><a href={profileUser.website} target="_blank" rel="noreferrer" class="text-brand-600 hover:underline dark:text-brand-400">{profileUser.website.replace(/^https?:\/\//, '')}</a></InfoItem>
				{/if}
				{#if profileUser.phone && (isOwnProfile || profileUser.showPhone)}
					<InfoItem icon={Phone} label="Telefon" tone="emerald" testid="profile-phone"><a href="tel:{profileUser.phone}" class="hover:underline">{formatPhone(profileUser.phone)}</a></InfoItem>
				{/if}
				{#if profileUser.telegram}
					<InfoItem icon={Send} label="Telegram" tone="sky"><a href="https://t.me/{profileUser.telegram}" target="_blank" rel="noreferrer" class="text-sky-600 hover:underline dark:text-sky-400">@{profileUser.telegram}</a></InfoItem>
				{/if}
			</div>
		</section>

	</div>

	{#if portfolio.length}
		<section class="border-b border-neutral-200 px-4 py-3 dark:border-neutral-800">
			<div class="mb-2 flex items-center justify-between">
				<h2 class="flex items-center gap-1.5 text-sm font-bold text-brand-700 dark:text-brand-400">
					<Briefcase class="size-4" /> Portfolio
				</h2>
				{#if isOwnProfile}
					<Button size="sm" variant="outline" onclick={() => (portfolioOpen = true)}>
						<Plus class="size-4" /> Qo'shish
					</Button>
				{/if}
			</div>
			{#if portfolio.length}
				<ul class="flex flex-col gap-2">
					{#each portfolio as item (item.id)}
						<li class="flex items-start justify-between gap-3 rounded-xl border border-neutral-200 p-3 dark:border-neutral-800">
							<div class="min-w-0">
								<p class="font-semibold">{item.title}</p>
								{#if item.description}<p class="text-sm text-neutral-600 dark:text-neutral-400">{item.description}</p>{/if}
								{#if item.url}
									<a href={item.url} target="_blank" rel="noreferrer noopener" class="text-sm text-brand-600 hover:underline dark:text-brand-400">{item.url.replace(/^https?:\/\//, '')}</a>
								{/if}
							</div>
							{#if isOwnProfile}
								<button
									onclick={() => data.removePortfolioItem(item.id)}
									aria-label="Portfoliodan o'chirish"
									class="rounded-lg p-1.5 text-neutral-400 hover:bg-neutral-100 hover:text-rose-600 dark:hover:bg-neutral-800"
								>
									<Trash2 class="size-4" />
								</button>
							{/if}
						</li>
					{/each}
				</ul>
			{:else}
				<p class="text-sm text-neutral-500 dark:text-neutral-400">O'z ishlaringizni qo'shing: loyiha, sertifikat, nashr.</p>
			{/if}
		</section>
	{/if}

	<div class="flex border-b border-neutral-200 px-4 dark:border-neutral-800">
		<PostFilterTab bind:value={filter} bind:sort posts={userPosts} active={activeTab === 'posts'} onActivate={() => (tab = 'posts')} />
		{#if isOwnProfile}
			<PostFilterTab bind:value={savedFilter} showSort={false} posts={data.getBookmarkedPosts()} label="Saqlanganlar" active={activeTab === 'saved'} onActivate={() => (tab = 'saved')} />
		{/if}
	</div>

	{#if activeTab === 'saved'}
		<SavedPosts filter={savedFilter} />
	{:else}
		<div class="flex flex-col gap-3 p-3">
			{#each filteredPosts as post (post.id)}
				<PostCard {post} />
			{:else}
				<EmptyState icon={FileText} title={BUILTIN_FILTERS.find((f) => f.id === filter)?.empty ?? "Hali postlar yo'q"} />
			{/each}
		</div>
	{/if}
{:else}
	<EmptyState icon={CircleAlert} title="Foydalanuvchi topilmadi" />
{/if}

<PortfolioDialog bind:open={portfolioOpen} />
