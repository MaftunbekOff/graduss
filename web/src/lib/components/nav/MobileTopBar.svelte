<script lang="ts">
	import { page } from '$app/state';
	import Logo from '$lib/components/brand/Logo.svelte';
	import Search from '@lucide/svelte/icons/search';
	import Bell from '@lucide/svelte/icons/bell';
	import { data } from '$lib/stores/data.svelte';
	import { hideTopBar, navSection } from '$lib/nav';
	import { navHist } from '$lib/stores/navhist.svelte';

	// mode: 'layout' (umumiy), 'profileTop' (profil tepasi, faqat kompyuter paneli), 'profileOverlay' (profil aylantirilganda yuqoriga chiqadigan panel)
	let { mode = 'layout' }: { mode?: 'layout' | 'profileTop' | 'profileOverlay' } = $props();
	const isProfile = $derived(page.url.pathname.startsWith('/profile/'));

	// Suhbat/kanal ichida va qidiruv sahifasida o'zining sarlavhasi (yoki qidiruv maydoni) bor.
	const hidden = $derived(hideTopBar(page.url.pathname) || mode === 'profileTop');
	// Kompyuterda: Bosh sahifa, Xabarlar, Kanallar, Bildirishnomalar, Profil tepasida yopishqoq panel (sarlavha, qidiruv, bildirishnoma).
	const TITLES: Record<string, string> = { '/feed': 'Bosh sahifa', '/chats': 'Xabarlar', '/channels': 'Kanallar', '/notifications': '' };
	const sectionTitle = (path: string) => {
		if (path.startsWith('/channels/')) {
			const sec = navSection(path, navHist.from);
			return sec === '/feed' ? 'Bosh sahifa' : sec === '/search' ? '' : 'Kanallar';
		}
		return TITLES[path] ?? (path.startsWith('/chats/') ? 'Xabarlar' : undefined);
	};
	const deskTitle = $derived(mode === 'layout' ? (isProfile ? undefined : sectionTitle(page.url.pathname)) : isProfile ? 'Profil' : undefined);
	const bellActive = $derived(page.url.pathname === '/notifications');
</script>

{#if !hidden}
	<div data-mobile-topbar class="flex items-center gap-3 border-b border-neutral-200 px-4 py-2 sm:hidden dark:border-neutral-800">
		<a href="/feed" aria-label="graduss" class="shrink-0 text-brand-700 dark:text-brand-400">
			<Logo size={32} wordmark={false} />
		</a>
		<a
			href="/search"
			aria-label="Qidiruv"
			class="flex min-w-0 flex-1 items-center gap-2 rounded-full border border-neutral-200 bg-neutral-100/70 px-4 py-2.5 text-neutral-500 transition-colors hover:bg-neutral-100 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-400"
		>
			<Search class="size-5 shrink-0" />
			<span class="truncate text-sm">Qidiruv</span>
		</a>
		<a
			href="/notifications"
			aria-label="Bildirishnomalar"
			class="relative flex shrink-0 items-center justify-center rounded-full p-2.5 transition-colors {bellActive
				? 'text-neutral-900 dark:text-white'
				: 'text-neutral-500'}"
		>
			<Bell class="size-6" />
			{#if data.unreadCount}
				<span
					class="absolute right-1 top-0.5 flex size-4 items-center justify-center rounded-full bg-rose-600 text-[10px] font-bold text-white ring-2 ring-white dark:ring-neutral-950"
				>
					{data.unreadCount > 9 ? '9+' : data.unreadCount}
				</span>
			{/if}
		</a>
	</div>
{/if}

{#if deskTitle !== undefined}
	<header data-testid="desktop-topbar" class="glass {mode === 'layout' ? 'sticky top-0 z-10' : ''} hidden items-center gap-3 border-b border-neutral-200 h-14 px-5 sm:flex dark:border-neutral-800">
		<p class="shrink-0 text-lg font-extrabold tracking-tight" aria-hidden="true">{deskTitle}</p>
		<a
			href="/search"
			aria-label="Qidiruv"
			class="ml-auto flex w-64 items-center gap-2 rounded-full border border-neutral-200 bg-neutral-100/70 px-4 py-2 text-neutral-500 transition-colors hover:bg-neutral-100 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-400"
		>
			<Search class="size-4 shrink-0" />
			<span class="truncate text-sm">Qidiruv</span>
		</a>
		<a href="/notifications" aria-label="Bildirishnomalar" class="relative flex shrink-0 items-center justify-center rounded-full p-2.5 text-neutral-500 hover:bg-neutral-100 dark:hover:bg-neutral-900">
			<Bell class="size-5" />
			{#if data.unreadCount}
				<span class="absolute right-1 top-0.5 flex size-4 items-center justify-center rounded-full bg-rose-600 text-[10px] font-bold text-white ring-2 ring-white dark:ring-neutral-950">{data.unreadCount > 9 ? '9+' : data.unreadCount}</span>
			{/if}
		</a>
	</header>
{/if}
