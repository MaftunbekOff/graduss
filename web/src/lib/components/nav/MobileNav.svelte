<script lang="ts">
	import { navHist } from '$lib/stores/navhist.svelte';
	import { page } from '$app/state';
	import Home from '@lucide/svelte/icons/house';
	import MessageCircle from '@lucide/svelte/icons/message-circle';
	import Radio from '@lucide/svelte/icons/radio-tower';
	import UserIcon from '@lucide/svelte/icons/user';
	import { session } from '$lib/stores/session.svelte';
	import { data } from '$lib/stores/data.svelte';
	import { hideBottomNav, navSection } from '$lib/nav';

	const links = $derived([
		{ href: '/feed', label: 'Bosh sahifa', icon: Home },
		{ href: '/chats', label: 'Xabarlar', icon: MessageCircle, badge: data.unreadChats },
		{ href: '/channels', label: 'Kanallar', icon: Radio },
		{ href: `/profile/${session.user.username}`, label: 'Profil', icon: UserIcon }
	]);

	// Suhbat va post ichida pastki panel yashiriladi (yozish maydoni to'liq ochiladi).
	const inChat = $derived(hideBottomNav(page.url.pathname));

	function isActive(href: string) {
		const sec = navSection(page.url.pathname, navHist.from);
		return sec === href || sec.startsWith(href + '/');
	}
</script>

{#if !inChat}
<nav
	class="glass fixed inset-x-0 bottom-0 z-20 flex items-center justify-around border-t border-neutral-200 pb-[calc(0.375rem+var(--safe-b))] pt-1.5 sm:hidden dark:border-neutral-800"
>
	{#each links as link (link.href)}
		<a
			href={link.href}
			aria-label={link.label}
			aria-current={isActive(link.href) ? 'page' : undefined}
			class="relative flex items-center justify-center rounded-full p-3 transition-colors {isActive(
				link.href
			)
				? 'text-neutral-900 dark:text-white'
				: 'text-neutral-500 dark:text-neutral-500'}"
		>
			<link.icon class="size-6" />
			{#if link.badge}
				<span
					class="absolute right-2 top-1 flex size-4 items-center justify-center rounded-full bg-rose-600 text-[10px] font-bold text-white ring-2 ring-white dark:ring-neutral-950"
					aria-label={`${link.badge} ta o'qilmagan`}
				>
					{link.badge > 9 ? '9+' : link.badge}
				</span>
			{/if}
		</a>
	{/each}
</nav>
{/if}
