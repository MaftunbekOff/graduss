<script lang="ts">
	import { data } from '$lib/stores/data.svelte';
	import BackButton from '$lib/components/ui/BackButton.svelte';
	import { timeAgo } from '$lib/utils';
	import Avatar from '$lib/components/ui/Avatar.svelte';
	import MessageSquare from '@lucide/svelte/icons/message-square';
	import Radio from '@lucide/svelte/icons/radio-tower';
	import AtSign from '@lucide/svelte/icons/at-sign';
	import EmptyState from '$lib/components/ui/EmptyState.svelte';
	import Bell from '@lucide/svelte/icons/bell';
	import CalendarDays from '@lucide/svelte/icons/calendar-days';

	const items = $derived(
		[...data.notifications].sort(
			(a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
		)
	);

	// Kunlar bo'yicha guruhlash: Bugun · Kecha · Shu hafta · Oldinroq
	function dayLabel(iso: string) {
		const d = new Date(iso);
		const now = new Date();
		const startOf = (x: Date) => new Date(x.getFullYear(), x.getMonth(), x.getDate()).getTime();
		const diff = Math.round((startOf(now) - startOf(d)) / 86_400_000);
		if (diff <= 0) return 'Bugun';
		if (diff === 1) return 'Kecha';
		if (diff < 7) return 'Shu hafta';
		return 'Oldinroq';
	}
	const ORDER = ['Bugun', 'Kecha', 'Shu hafta', 'Oldinroq'];
	const groups = $derived(
		ORDER.map((label) => ({ label, items: items.filter((n) => dayLabel(n.createdAt) === label) })).filter((g) => g.items.length)
	);

	const icons = {
		comment: MessageSquare,
		channel: Radio,
		mention: AtSign,
		event: CalendarDays
	};

	function text(n: (typeof items)[number]) {
		const actor = data.getUser(n.actorId);
		const name = actor?.name ?? "Noma'lum";
		switch (n.type) {
			case 'comment':
				return `${name} postingizga izoh qoldirdi`;
			case 'channel': {
				// Kanal postida muallif emas, kanalning o'zi ko'rsatiladi.
				const channel = n.channelId ? data.getChannel(n.channelId) : undefined;
				return `${channel?.name ?? 'Kanal'} kanalida yangi post`;
			}
			case 'mention':
				return `${name} sizni postda tilga oldi`;
			case 'event': {
				const ev = n.eventId ? data.getEvent(n.eventId) : undefined;
				return `${ev ? `"${ev.title}"` : 'Tadbir'} tez orada boshlanadi`;
			}
		}
	}

	function href(n: (typeof items)[number]) {
		if (n.postId) return `/post/${n.postId}`;
		if (n.channelId) return `/channels/${n.channelId}`;
		const actor = data.getUser(n.actorId);
		return actor ? `/profile/${actor.username}` : '/feed';
	}

	$effect(() => {
		data.markAllNotificationsRead();
	});
</script>

<svelte:head>
	<title>Bildirishnomalar / graduss</title>
	<meta name="description" content="graduss platformasidagi izoh va kanal yangiliklari haqida bildirishnomalar." />
</svelte:head>

<header class="sticky top-0 z-10 flex min-h-[61px] sm:min-h-14 items-center border-b border-neutral-200 px-4 py-2 dark:border-neutral-800 glass">
	<BackButton class="-ml-2 mr-2" />
	<h1 class="text-xl font-bold">Bildirishnomalar</h1>
</header>

<div>
	{#each groups as g (g.label)}
		<section aria-label={g.label}>
			<h2 class="border-b border-neutral-100 bg-neutral-50/80 px-4 py-2 text-xs font-bold uppercase tracking-wide text-neutral-500 dark:border-neutral-900 dark:bg-neutral-900/50 dark:text-neutral-400">
				{g.label}
			</h2>
			{#each g.items as n (n.id)}
			{@const channel = (n.type === 'channel' || n.type === 'event') && n.channelId ? data.getChannel(n.channelId) : undefined}
			{@const actor = channel ? { name: channel.name, avatar: channel.avatar } : data.getUser(n.actorId)}
			{@const Icon = icons[n.type]}
			<a
				href={href(n)}
				class="flex items-start gap-3 border-b border-neutral-100 px-4 py-3.5 transition-colors hover:bg-neutral-50 dark:border-neutral-900 dark:hover:bg-neutral-900/60 {n.read
					? ''
					: 'bg-brand-50/60 dark:bg-brand-400/10'}"
			>
				<Icon class="mt-1 size-5 shrink-0 text-brand-600 dark:text-brand-400" />
				{#if actor}
					<Avatar name={actor.name} color={actor.avatar} size="sm" />
				{/if}
				<div class="min-w-0 flex-1">
					<p class="leading-relaxed text-neutral-900 dark:text-neutral-100">{text(n)}</p>
					<p class="text-xs text-neutral-500 dark:text-neutral-400">{timeAgo(n.createdAt)}</p>
				</div>
				{#if !n.read}
					<span class="mt-2 size-2 shrink-0 rounded-full bg-brand-600 dark:bg-brand-400"></span>
				{/if}
			</a>
			{/each}
		</section>
	{:else}
		<EmptyState icon={Bell} title="Hozircha bildirishnomalar yo'q" description="Izoh va kanal yangiliklari shu yerda ko'rinadi." />
	{/each}
</div>
