<script lang="ts">
	import { onMount } from 'svelte';
	import { goto, beforeNavigate } from '$app/navigation';
	import { navHist, rememberNav } from '$lib/stores/navhist.svelte';
	import { page } from '$app/state';
	import { hideBottomNav, isDetailPage } from '$lib/nav';
	import { trackKeyboard } from '$lib/keyboard';
	import { API_ON } from '$lib/api';
	import { data } from '$lib/stores/data.svelte';
	import { session } from '$lib/stores/session.svelte';
	import Sidebar from '$lib/components/nav/Sidebar.svelte';
	import MobileNav from '$lib/components/nav/MobileNav.svelte';
	import MobileTopBar from '$lib/components/nav/MobileTopBar.svelte';
	import MiniPlayer from '$lib/components/chat/MiniPlayer.svelte';
	import ToastContainer from '$lib/components/ui/ToastContainer.svelte';

	let { children } = $props();

	// Suhbat/post ichida pastki panel va pastki bo'shliq yo'q.
	const inChat = $derived(hideBottomNav(page.url.pathname));

	$effect(() => {
		if (session.ready && !session.loggedIn) goto('/login', { replaceState: true });
	});

	onMount(() => trackKeyboard());

	// Esc: ochiq oyna/menyu bo'lmasa va yozish maydonida turilmasa, ichki sahifadan orqaga qaytadi.
	function onEsc(e: KeyboardEvent) {
		if (e.key !== 'Escape' || e.defaultPrevented) return;
		const path = page.url.pathname;
		if (!isDetailPage(path)) return;
		const t = e.target as HTMLElement | null;
		if (t?.closest?.('input, textarea, select, [contenteditable="true"]')) return;
		if (document.querySelector('[role="dialog"], [role="menu"], [role="listbox"], [aria-expanded="true"], button.fixed.inset-0')) return;
		e.preventDefault();
		// Suhbat ichida Esc ro'yxatga qaytaradi (suhbatdan suhbatga o'tgan bo'lsa ham oldingi suhbatlarga emas).
		if (path.startsWith('/chats/')) goto('/chats');
		else if (navHist.canBack) history.back();
		else goto(path.startsWith('/channels/') ? '/channels' : '/feed');
	}
	// Qayerdan kelinganini o'tishdan OLDIN yozamiz: yangi sahifa birinchi chizilishidanoq to'g'ri bo'lim ko'rinadi (chaqnash bo'lmaydi).
	beforeNavigate(({ from, to }) => {
		if (!from?.url || !to?.url || from.url.pathname === to.url.pathname) return;
		rememberNav(from.url.pathname, to.url.pathname);
	});

	// Boshqa foydalanuvchilarning o'zgarishlarini ko'rish uchun davriy yangilash (API rejim).
	onMount(() => {
		if (!API_ON) return;
		const refresh = () => {
			if (document.visibilityState === 'visible' && session.loggedIn) void data.load();
		};
		const timer = setInterval(refresh, 20000);
		document.addEventListener('visibilitychange', refresh);
		return () => {
			clearInterval(timer);
			document.removeEventListener('visibilitychange', refresh);
		};
	});
</script>

<svelte:window onkeydown={onEsc} />

{#if session.loggedIn}
	<MiniPlayer />
	<div class="mx-auto flex min-h-screen max-w-6xl">
		<Sidebar />
		<main class="min-h-screen w-full min-w-0 border-x border-neutral-200 sm:pb-0 dark:border-neutral-800 {inChat ? '' : 'pb-[calc(4rem+var(--safe-b))]'}">
			<MobileTopBar />
			{@render children()}
		</main>
	</div>
	<MobileNav />
	<ToastContainer />
{/if}

