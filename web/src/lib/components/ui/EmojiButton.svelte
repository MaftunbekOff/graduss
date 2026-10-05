<script lang="ts">
	import Smile from '@lucide/svelte/icons/smile';
	import Sticker from '@lucide/svelte/icons/sticker';
	import Search from '@lucide/svelte/icons/search';
	import { GIFS, STICKERS } from '$lib/stickers';

	// Matn maydoniga emoji qo'shish; xabarlarda Telegram kabi 3 bo'lim: Emoji · Stikerlar · GIF.
	// Stiker/GIF tanlash funksiyalari berilmasa (masalan, izohlarda) faqat emoji ko'rinadi. Oyna tugmaning o'ng chetiga tekislanib, CHAPGA ochiladi.
	let {
		onpick,
		onsticker,
		ongif,
		class: cls = ''
	}: { onpick: (emoji: string) => void; onsticker?: (sticker: string) => void; ongif?: (url: string) => void; class?: string } = $props();

	const EMOJIS = [
		'😀','😁','😂','🤣','😊','😇','🙂','😉','😍','🥰','😘','😋','😎','🤓','🤔','🤨',
		'😐','😴','😅','😢','😭','😤','😡','🥳','😮','😱','🙄','😬','🤝','👍','👎','👏',
		'🙌','🙏','💪','👌','✌️','🤞','👋','🫡','❤️','💙','💚','💛','🔥','✨','⭐','🎉',
		'✅','❌','⚠️','💡','📌','📎','📅','📈','💼','🏆','🎯','🚀','☕','🍀','🌟','💬',
		'😆','😜','🤪','😏','😌','🥹','🤗','🤭','🫢','😳','🥺','😞','😔','😩','🤯','🥶',
		'👀','🧠','🫶','🤲','👊','✊','🖐️','☝️','💯','💥','💫','🎂','🎁','📣','🔔','🔒'
	];

	type Tab = 'emoji' | 'sticker' | 'gif';
	const hasTabs = $derived(!!onsticker || !!ongif);
	let open = $state(false);
	let tab = $state<Tab>('emoji');
	let q = $state('');
	let btn = $state<HTMLButtonElement>();
	let pos = $state({ left: 0, bottom: 0, width: 288 });

	const gifs = $derived(GIFS.filter((g) => g.label.toLowerCase().includes(q.trim().toLowerCase())));

	function toggle() {
		if (!open && btn) {
			const r = btn.getBoundingClientRect();
			const width = Math.min(hasTabs ? 340 : 288, window.innerWidth - 16);
			// O'ng chet tugma bilan bir chiziqda: oyna chapga ochiladi.
			pos = { left: Math.max(8, Math.min(r.right - width, window.innerWidth - width - 8)), bottom: window.innerHeight - r.top + 8, width };
			tab = 'emoji';
			q = '';
		}
		open = !open;
	}

	const TABS = $derived(
		[
			{ key: 'emoji', label: 'Emoji', icon: Smile, show: true },
			{ key: 'sticker', label: 'Stikerlar', icon: Sticker, show: !!onsticker },
			{ key: 'gif', label: 'GIF', icon: Search, show: !!ongif }
		] as { key: Tab; label: string; icon: typeof Smile; show: boolean }[]
	);
</script>

<svelte:window onkeydown={(e) => open && e.key === 'Escape' && (open = false)} />

<button
	bind:this={btn}
	type="button"
	onpointerdown={(e) => e.preventDefault()}
	onclick={toggle}
	aria-label="Emoji"
	aria-expanded={open}
	class="flex size-9 shrink-0 items-center justify-center rounded-full text-neutral-500 transition-colors hover:text-brand-600 dark:text-neutral-400 {cls}"
>
	<Smile class="size-5" />
</button>

{#if open}
	<button type="button" aria-label="Yopish" tabindex="-1" onclick={() => (open = false)} class="fixed inset-0 z-[60] cursor-default"></button>
	<div
		role="dialog"
		aria-label="Emoji tanlash"
		style:left="{pos.left}px"
		style:bottom="{pos.bottom}px"
		style:width="{pos.width}px"
		class="fixed z-[70] flex flex-col overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-[var(--shadow-pop)] dark:border-neutral-800 dark:bg-neutral-900 {hasTabs ? 'h-80' : ''}"
	>
		<div class="min-h-0 flex-1 overflow-y-auto p-2">
			{#if tab === 'emoji'}
				<div class="grid grid-cols-8 gap-0.5">
					{#each EMOJIS as e (e)}
						<button type="button" onpointerdown={(ev) => ev.preventDefault()} onclick={() => onpick(e)} aria-label={e} class="flex size-8 items-center justify-center rounded-lg text-xl hover:bg-neutral-100 dark:hover:bg-neutral-800">{e}</button>
					{/each}
				</div>
			{:else if tab === 'sticker'}
				<div class="grid grid-cols-4 gap-1">
					{#each STICKERS as s (s)}
						<button type="button" onclick={() => { onsticker?.(s); open = false; }} aria-label={`Stiker ${s}`} class="flex aspect-square items-center justify-center rounded-xl text-4xl transition-transform hover:scale-110 hover:bg-neutral-100 dark:hover:bg-neutral-800">{s}</button>
					{/each}
				</div>
			{:else}
				<div class="relative mb-2">
					<Search class="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-neutral-400" />
					<input bind:value={q} type="search" placeholder="GIF qidirish" aria-label="GIF qidirish" class="h-9 w-full rounded-full bg-neutral-100 pl-9 pr-3 text-sm outline-none placeholder:text-neutral-500 focus:ring-1 focus:ring-brand-500 dark:bg-neutral-800" />
				</div>
				<div class="grid grid-cols-2 gap-1.5">
					{#each gifs as g (g.url)}
						<button type="button" onclick={() => { ongif?.(g.url); open = false; }} aria-label={`GIF: ${g.label}`} class="overflow-hidden rounded-xl bg-neutral-100 dark:bg-neutral-800">
							<img src={g.url} alt={g.label} loading="lazy" class="aspect-[3/2] w-full object-cover" />
						</button>
					{:else}
						<p class="col-span-2 py-6 text-center text-sm text-neutral-500">Hech narsa topilmadi</p>
					{/each}
				</div>
			{/if}
		</div>
		{#if hasTabs}
			<div role="tablist" aria-label="Emoji, stiker, GIF" class="flex border-t border-neutral-200 dark:border-neutral-800">
				{#each TABS.filter((t) => t.show) as t (t.key)}
					<button
						type="button"
						role="tab"
						aria-selected={tab === t.key}
						onpointerdown={(e) => e.preventDefault()}
						onclick={() => (tab = t.key)}
						class="flex flex-1 items-center justify-center gap-1.5 py-2.5 text-sm font-semibold transition-colors {tab === t.key ? 'text-brand-600 dark:text-brand-400' : 'text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200'}"
					>
						<t.icon class="size-4" />{t.label}
					</button>
				{/each}
			</div>
		{/if}
	</div>
{/if}
