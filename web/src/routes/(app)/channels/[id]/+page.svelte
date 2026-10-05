<script lang="ts">
	import { page } from '$app/state';
	import { goto } from '$app/navigation';
	import { data } from '$lib/stores/data.svelte';
	import { session } from '$lib/stores/session.svelte';
	import { scale } from 'svelte/transition';
	import { cubicOut } from 'svelte/easing';
	import Button from '$lib/components/ui/Button.svelte';
	import ConfirmDialog from '$lib/components/ui/ConfirmDialog.svelte';
	import EditChannelDialog from '$lib/components/channel/EditChannelDialog.svelte';
	import { formatCount } from '$lib/utils';
	import CampaignCard from '$lib/components/channel/CampaignCard.svelte';
	import CreateCampaignDialog from '$lib/components/channel/CreateCampaignDialog.svelte';
	import EventCard from '$lib/components/channel/EventCard.svelte';
	import CreateEventDialog from '$lib/components/channel/CreateEventDialog.svelte';
	import ChannelStatsDialog from '$lib/components/channel/ChannelStatsDialog.svelte';
	import ScheduledDialog from '$lib/components/post/ScheduledDialog.svelte';
	import { API_ON } from '$lib/api';
	import ChartColumn from '@lucide/svelte/icons/chart-column';
	import CalendarPlus from '@lucide/svelte/icons/calendar-plus';
	import CalendarClock from '@lucide/svelte/icons/calendar-clock';
	import Badge from '$lib/components/ui/Badge.svelte';
	import Marquee from '$lib/components/ui/Marquee.svelte';
	import EmptyState from '$lib/components/ui/EmptyState.svelte';
	import { DEFAULT_CHANNEL_BANNER } from '$lib/appearance';
	import PostComposer from '$lib/components/post/PostComposer.svelte';
	import PostFilterTab from '$lib/components/post/PostFilterTab.svelte';
	import CategoryDialog from '$lib/components/channel/CategoryDialog.svelte';
	import { BUILTIN_FILTERS, matchesFilter, sortPosts, type PostFilter, type PostSort } from '$lib/postFilter';
	import BackButton from '$lib/components/ui/BackButton.svelte';
	import PostCard from '$lib/components/post/PostCard.svelte';
	import Ellipsis from '@lucide/svelte/icons/ellipsis';
	import LogOut from '@lucide/svelte/icons/log-out';
	import Edit3 from '@lucide/svelte/icons/edit-3';
	import HandCoins from '@lucide/svelte/icons/hand-coins';
	import Radio from '@lucide/svelte/icons/radio-tower';
	import CircleAlert from '@lucide/svelte/icons/circle-alert';

	const channel = $derived(data.getChannel(page.params.id ?? ''));
	const owner = $derived(channel ? data.getUser(channel.ownerId) : undefined);
	const isOwner = $derived(channel?.ownerId === session.user.id);

	// Bitta "Postlar" tabi: ichida Rasm · Video · Link · GIF va egasining kategoriyalari
	let filter = $state<PostFilter>('all');
	let sort = $state<PostSort>('new');
	let categoryOpen = $state(false);
	const categories = $derived(channel?.categories ?? []);
	const channelPosts = $derived(
		channel
			? [...data.getPostsByChannel(channel.id)].sort((a, b) => {
					// Qadalganlar tepada (yangi qadalgani birinchi), qolganlari sanasi bo'yicha.
					if (!!a.pinnedAt !== !!b.pinnedAt) return a.pinnedAt ? -1 : 1;
					if (a.pinnedAt && b.pinnedAt) return new Date(b.pinnedAt).getTime() - new Date(a.pinnedAt).getTime();
					return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
				})
			: []
	);
	// Qadalganlar doim tepada (yangi qadalgani birinchi); qolganlari tanlangan saralash bo'yicha.
	const visiblePosts = $derived.by(() => {
		const list = channelPosts.filter((p) => matchesFilter(p, filter));
		return [...list.filter((p) => p.pinnedAt), ...sortPosts(list.filter((p) => !p.pinnedAt), sort)];
	});
	const emptyTitle = $derived(
		filter.startsWith('cat:')
			? `"${categories.find((c) => c.id === filter.slice(4))?.name ?? 'Kategoriya'}" kategoriyasida post yo'q`
			: (BUILTIN_FILTERS.find((f) => f.id === filter)?.empty ?? "Hali postlar yo'q")
	);

	let confirmOpen = $state(false);
	let editOpen = $state(false);
	let campaignOpen = $state(false);
	let eventOpen = $state(false);
	let statsOpen = $state(false);
	let plansOpen = $state(false);
	const events = $derived(channel ? data.getEventsByChannel(channel.id) : []);
	const plans = $derived(channel && isOwner && !API_ON ? data.getUnpublished(channel.id).length : 0);

	const campaign = $derived(channel ? data.getCampaignByChannel(channel.id) : undefined);
	const canStartCampaign = $derived(channel ? data.canCreateCampaign(channel.id) : false);
	let menuOpen = $state(false);

	function leaveChannel() {
		if (channel) data.toggleJoin(channel.id);
		menuOpen = false;
	}
</script>

<svelte:head>
	<title>{channel?.name ?? 'Kanal'} / graduss</title>
	{#if channel}
		<meta name="description" content={channel.description} />
	{/if}
</svelte:head>

{#if channel}
	<!-- Kanal ma'lumotlari oq panelda; postlar pastda kulrang fonda alohida kartalar -->
	<div class="border-b border-neutral-200 bg-white pb-2 shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
		<div class="relative h-28 overflow-hidden bg-gradient-to-br {channel.banner ?? DEFAULT_CHANNEL_BANNER}">
			<div
				class="absolute inset-0 opacity-40"
				style:background-image="radial-gradient(circle at 80% 20%, rgba(255,255,255,.25), transparent 45%)"
			></div>
			<BackButton overlay always hideFromPrefix="/channels" fallback="/channels" class="absolute left-3 top-3" />
			{#if isOwner}
				<button
					onclick={() => (editOpen = true)}
					class="absolute right-3 top-3 inline-flex items-center gap-1.5 rounded-full bg-black/35 px-3 py-1.5 text-sm font-semibold text-white backdrop-blur-md hover:bg-black/50"
				>
					<Edit3 class="size-4" />
					Tahrirlash
				</button>
			{/if}
		</div>

		<div class="px-4 pb-4">
			<div class="-mt-9 flex items-end justify-between">
				<span
					class="relative z-10 flex size-18 items-center justify-center rounded-full text-2xl font-semibold text-white ring-4 ring-white dark:ring-neutral-950"
					style:background-color={channel.avatar}
					style:background-image="linear-gradient(145deg, rgba(255,255,255,.28), rgba(0,0,0,.12))"
				>
					{channel.name[0]}
				</span>
				{#if !isOwner}
					{#if channel.joined}
						<div class="relative">
							<button
								onclick={() => (menuOpen = !menuOpen)}
								aria-label="Ko'proq"
								class="rounded-full border border-neutral-300 p-2 text-neutral-600 hover:bg-neutral-50 dark:border-neutral-700 dark:text-neutral-300 dark:hover:bg-neutral-800"
							>
								<Ellipsis class="size-5" />
							</button>
							{#if menuOpen}
								<button
									aria-label="Yopish"
									onclick={() => (menuOpen = false)}
									class="fixed inset-0 z-20 cursor-default"
								></button>
								<div
									transition:scale={{ duration: 130, start: 0.95, easing: cubicOut }}
									style="transform-origin: top right"
									class="absolute right-0 top-full z-30 mt-1 w-56 overflow-hidden rounded-xl border border-neutral-200 bg-white py-1 shadow-[var(--shadow-pop)] dark:border-neutral-800 dark:bg-neutral-900"
								>
									<button
										onclick={leaveChannel}
										class="flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-500/10"
									>
										<LogOut class="size-4" />
										A'zolikdan chiqish
									</button>
								</div>
							{/if}
						</div>
					{:else}
						<Button onclick={() => (confirmOpen = true)}>A'zo bo'lish</Button>
					{/if}
				{/if}
			</div>

			<div class="mt-3 flex items-center gap-x-2">
				<h1 class="min-w-0 text-xl font-extrabold tracking-tight"><Marquee>{channel.name}</Marquee></h1>
				{#if channel.sector}<span class="shrink-0"><Badge sector={channel.sector} channel /></span>{/if}
			</div>
			<p class="text-neutral-500 dark:text-neutral-400">@{channel.handle}</p>
			<p class="mt-3 leading-relaxed text-neutral-900 dark:text-neutral-100">{channel.description}</p>

			<div class="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-sm text-neutral-500 dark:text-neutral-400">
				{#if isOwner}
					<span title="Bu son faqat sizga ko'rinadi">{formatCount(channel.memberCount)} a'zo · faqat sizga ko'rinadi</span>
				{/if}
				{#if owner && channel.showOwner}
					<span
						>Egasi: <a href={`/profile/${owner.username}`} class="font-medium text-brand-700 hover:underline dark:text-brand-400"
							>{owner.name}</a
						></span
					>
				{/if}
			</div>

			{#if isOwner}
				<div class="mt-3 flex flex-wrap gap-2">
					<Button variant="outline" size="sm" onclick={() => (statsOpen = true)}><ChartColumn class="mr-1.5 size-4" />Statistika</Button>
					{#if !API_ON}
						<Button variant="outline" size="sm" onclick={() => (eventOpen = true)}><CalendarPlus class="mr-1.5 size-4" />Tadbir qo'shish</Button>
					{/if}
					{#if plans > 0}
						<Button variant="outline" size="sm" onclick={() => (plansOpen = true)}><CalendarClock class="mr-1.5 size-4" />Qoralama va rejalar ({plans})</Button>
					{/if}
				</div>
			{/if}
		</div>

		<div class="mt-1 flex border-t border-neutral-100 px-2 dark:border-neutral-800" role="tablist">
			<PostFilterTab bind:value={filter} bind:sort {categories} posts={channelPosts} canManage={isOwner} onManage={() => (categoryOpen = true)} />
		</div>
	</div>

	<div class="min-h-[40vh] bg-neutral-100 dark:bg-neutral-950">
		{#if isOwner && (filter === 'all' || filter.startsWith('cat:'))}
			<PostComposer channelId={channel.id} defaultCategoryId={filter.startsWith('cat:') ? filter.slice(4) : undefined} placeholder={`${channel.name} kanaliga yozing`} />
		{/if}

		<div class="flex flex-col gap-3 p-3">
			<!-- Kampaniya kanal ma'lumotlariga qo'shilmaydi: postlar qatorida alohida karta -->
			{#if filter === 'all'}
				{#each events as event (event.id)}
					<EventCard {event} {isOwner} canRemind={isOwner || channel.joined} />
				{/each}
				{#if campaign}
					<CampaignCard {campaign} {isOwner} />
				{:else if canStartCampaign}
					<div class="rounded-2xl border border-dashed border-neutral-300 p-4 text-center dark:border-neutral-700">
						<Button variant="outline" size="sm" onclick={() => (campaignOpen = true)}>
							<HandCoins class="mr-1.5 size-4" />
							Kampaniya boshlash
						</Button>
					</div>
				{/if}
			{/if}

			{#each visiblePosts as post (post.id)}
				<PostCard {post} />
			{:else}
				{#if !(filter === 'all' && campaign)}
					<EmptyState icon={Radio} title={emptyTitle} />
				{/if}
			{/each}
		</div>
	</div>
{:else}
	<EmptyState icon={CircleAlert} title="Kanal topilmadi" />
{/if}

{#if channel}
	<ConfirmDialog
		bind:open={confirmOpen}
		title="A'zo bo'lish"
		message={`"${channel.name}" kanaliga a'zo bo'lmoqchimisiz?`}
		confirmLabel="A'zo bo'lish"
		onConfirm={() => data.toggleJoin(channel.id)}
	/>

	<EditChannelDialog bind:open={editOpen} {channel} />
	<CategoryDialog bind:open={categoryOpen} channelId={channel.id} />
	<CreateCampaignDialog bind:open={campaignOpen} channelId={channel.id} />
	<CreateEventDialog bind:open={eventOpen} channelId={channel.id} />
	<ChannelStatsDialog bind:open={statsOpen} channelId={channel.id} />
	<ScheduledDialog bind:open={plansOpen} channelId={channel.id} />
{/if}
