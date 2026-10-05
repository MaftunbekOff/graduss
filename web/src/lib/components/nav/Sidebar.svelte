<script lang="ts">
	import { navSection } from '$lib/nav';
	import { navHist } from '$lib/stores/navhist.svelte';
	import { page } from '$app/state';
	import Home from '@lucide/svelte/icons/house';
	import MessageCircle from '@lucide/svelte/icons/message-circle';
	import Radio from '@lucide/svelte/icons/radio-tower';
	import Settings from '@lucide/svelte/icons/settings';
	import Logo from '$lib/components/brand/Logo.svelte';
	import Ellipsis from '@lucide/svelte/icons/ellipsis';
	import { session } from '$lib/stores/session.svelte';
	import { data } from '$lib/stores/data.svelte';
	import { scale } from 'svelte/transition';
	import { cubicOut } from 'svelte/easing';
	import Avatar from '$lib/components/ui/Avatar.svelte';

	let menuOpen = $state(false);

	const links = $derived([
		{ href: '/feed', label: 'Bosh sahifa', icon: Home },
		{ href: '/chats', label: 'Xabarlar', icon: MessageCircle, badge: data.unreadChats },
		{ href: '/channels', label: 'Kanallar', icon: Radio }
	]);

	function isActive(href: string) {
		const sec = navSection(page.url.pathname, navHist.from);
		return sec === href || sec.startsWith(href + '/');
	}
</script>

<aside
	class="sticky top-0 hidden h-screen shrink-0 flex-col justify-between overflow-y-auto border-r border-neutral-200 px-2 py-6 sm:flex sm:w-20 lg:w-64 lg:px-3 dark:border-neutral-800"
>
	<div>
		<a
			href="/feed"
			class="mb-6 flex items-center justify-center gap-2 px-1 text-brand-700 lg:justify-start lg:px-3 dark:text-brand-400"
		>
			<Logo size={30} wordClass="hidden text-xl lg:inline" />
		</a>

		<nav class="flex flex-col gap-1">
			{#each links as link (link.href)}
				<a
					href={link.href}
					aria-current={isActive(link.href) ? 'page' : undefined}
					class="relative flex items-center justify-center gap-4 rounded-full px-3 py-3 text-lg transition-colors lg:justify-start {isActive(
						link.href
					)
						? 'bg-neutral-100 font-bold text-neutral-900 dark:bg-neutral-900 dark:text-white'
						: 'text-neutral-700 hover:bg-neutral-100 dark:text-neutral-300 dark:hover:bg-neutral-900'}"
				>
					<span class="relative">
						<link.icon class="size-6" />
						{#if link.badge}
							<span
								class="absolute -right-1 -top-1 flex size-4 items-center justify-center rounded-full bg-rose-600 text-[10px] font-bold text-white ring-2 ring-white dark:ring-neutral-950"
							>
								{link.badge > 9 ? '9+' : link.badge}
							</span>
						{/if}
					</span>
					<span class="hidden lg:inline">{link.label}</span>
				</a>
			{/each}
		</nav>
	</div>

	<div class="flex flex-col gap-2">
		<div class="relative flex items-center gap-1 rounded-full p-1 hover:bg-neutral-100 dark:hover:bg-neutral-900">
			<a
				href={`/profile/${session.user.username}`}
				class="flex min-w-0 flex-1 items-center justify-center gap-2 rounded-full p-1 lg:justify-start"
			>
				<Avatar name={session.user.name} color={session.user.avatar} size="sm" />
				<span class="hidden min-w-0 flex-1 text-left lg:block">
					<span class="block truncate text-sm font-semibold">{session.user.name}</span>
					<span class="block truncate text-xs text-neutral-500 dark:text-neutral-400"
						>@{session.user.username}</span
					>
				</span>
			</a>
			<button
				onclick={() => (menuOpen = !menuOpen)}
				aria-label="Ko'proq"
				class="hidden shrink-0 rounded-full p-1.5 text-neutral-500 hover:bg-neutral-200/70 lg:block dark:text-neutral-400 dark:hover:bg-neutral-800"
			>
				<Ellipsis class="size-4.5" />
			</button>

			{#if menuOpen}
				<button aria-label="Yopish" onclick={() => (menuOpen = false)} class="fixed inset-0 z-20 cursor-default"
				></button>
				<div
					transition:scale={{ duration: 130, start: 0.95, easing: cubicOut }}
					style="transform-origin: bottom right"
					class="absolute bottom-full right-0 z-30 mb-1 w-48 overflow-hidden rounded-xl border border-neutral-200 bg-white py-1 shadow-[var(--shadow-pop)] dark:border-neutral-800 dark:bg-neutral-900"
				>
					<a
						href="/settings"
						onclick={() => (menuOpen = false)}
						class="flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm text-neutral-800 hover:bg-neutral-50 dark:text-neutral-200 dark:hover:bg-neutral-800"
					>
						<Settings class="size-4" />
						Sozlamalar
					</a>
				</div>
			{/if}
		</div>
	</div>
</aside>
