<script lang="ts">
	import type { Category, Post } from '$lib/types';
	import { BUILTIN_FILTERS, SORTS, matchesFilter, type PostFilter, type PostSort } from '$lib/postFilter';
	import { scale } from 'svelte/transition';
	import { cubicOut } from 'svelte/easing';
	import ChevronDown from '@lucide/svelte/icons/chevron-down';
	import Check from '@lucide/svelte/icons/check';
	import Settings2 from '@lucide/svelte/icons/settings-2';
	import ArrowUpDown from '@lucide/svelte/icons/arrow-up-down';

	// Bitta "Postlar" tabi: bosilganda Rasm · Video · Link · GIF (+ kanal egasining kategoriyalari) ochiladi.
	let {
		value = $bindable('all' as PostFilter),
		sort = $bindable('new' as PostSort),
		categories = [],
		posts,
		canManage = false,
		onManage,
		label = 'Postlar',
		showSort = true,
		active = true,
		onActivate
	}: {
		value?: PostFilter;
		sort?: PostSort;
		categories?: Category[];
		/** Shu tabdagi barcha postlar: ro'yxatda faqat posti bor turlar ko'rsatiladi (Rasm bo'lmasa "Rasmlar" chiqmaydi). */
		posts?: Post[];
		canManage?: boolean;
		onManage?: () => void;
		label?: string;
		/** false: ro'yxatda "Saralash" qatori ko'rinmaydi (masalan, Saqlanganlar). */
		showSort?: boolean;
		active?: boolean;
		onActivate?: () => void;
	} = $props();

	let open = $state(false);

	// Posti bor turlar ("Hammasi" doim bor). posts berilmasa hammasi ko'rsatiladi.
	const availableBuiltin = $derived(
		BUILTIN_FILTERS.filter((f) => f.id === 'all' || !posts || posts.some((p) => matchesFilter(p, f.id)))
	);
	// Kategoriya: egasi (canManage) hammasini ko'radi; boshqalarga faqat posti borlari.
	const availableCategories = $derived(
		categories.filter((c) => canManage || !posts || posts.some((p) => matchesFilter(p, `cat:${c.id}`)))
	);

	// Tanlangan filtr endi mavjud bo'lmasa (post o'chirilsa), "Hammasi" ga qaytadi.
	$effect(() => {
		if (value === 'all') return;
		const ok = value.startsWith('cat:')
			? availableCategories.some((c) => `cat:${c.id}` === value)
			: availableBuiltin.some((f) => f.id === value);
		if (!ok) value = 'all';
	});
	let btnEl = $state<HTMLElement>();
	// Ekran pastiga yaqin bo'lsa ro'yxat yuqoriga ochiladi (pastki panel ostida qolib ketmasin).
	let openUp = $state(false);
	let maxH = $state(480);
	let sortOpen = $state(false);
	let menuEl = $state<HTMLElement>();

	// Ro'yxat ochiq turganda sahifa aylanmaydi; aylantirishga urinilsa ro'yxat yopiladi.
	function closeOnScroll(node: HTMLElement, close: () => void) {
		let startY = 0;
		let startX = 0;
		const onWheel = (e: Event) => {
			e.preventDefault();
			close();
		};
		const onStart = (e: TouchEvent) => {
			startY = e.touches[0].clientY;
			startX = e.touches[0].clientX;
		};
		const onMove = (e: TouchEvent) => {
			e.preventDefault();
			// Oddiy bosishdagi mayda qimirlash yopmasin: faqat haqiqiy surish.
			const t = e.touches[0];
			if (Math.abs(t.clientY - startY) > 8 || Math.abs(t.clientX - startX) > 8) close();
		};
		node.addEventListener('wheel', onWheel, { passive: false });
		node.addEventListener('touchstart', onStart, { passive: true });
		node.addEventListener('touchmove', onMove, { passive: false });
		return {
			destroy() {
				node.removeEventListener('wheel', onWheel);
				node.removeEventListener('touchstart', onStart);
				node.removeEventListener('touchmove', onMove);
			}
		};
	}

	const currentLabel = $derived.by(() => {
		if (value === 'all') return label;
		const name = value.startsWith('cat:')
			? (categories.find((c) => c.id === value.slice(4))?.name ?? label)
			: (BUILTIN_FILTERS.find((f) => f.id === value)?.label ?? label);
		return name;
	});

	function pick(f: PostFilter) {
		value = f;
		open = false;
		onActivate?.();
	}

	// Saralash ochilganda variantlari ko'rinsin: ro'yxat pastigacha aylantiriladi.
	function toggleSort() {
		sortOpen = !sortOpen;
		if (sortOpen) setTimeout(() => menuEl?.scrollTo({ top: menuEl.scrollHeight, behavior: 'smooth' }), 30);
	}

	// Nofaol tabni bosish faqat o'sha bo'limga o'tkazadi; ro'yxat faol tabni qayta bosganda ochiladi.
	function toggle() {
		if (!active) {
			open = false;
			onActivate?.();
			return;
		}
		if (!open && btnEl) {
			const r = btnEl.getBoundingClientRect();
			const below = window.innerHeight - r.bottom - 76; // 76 = pastki panel + bo'shliq
			const above = r.top - 12;
			openUp = below < 340 && above > below;
			// Ro'yxat mavjud joyga sig'sa ham, sig'masa ichida aylanadi.
			maxH = Math.max(180, Math.min(480, openUp ? above : below));
		}
		sortOpen = false;
		open = !open;
	}
</script>

<div class="relative">
	<button
		bind:this={btnEl}
		type="button"
		role="tab"
		aria-selected={active}
		aria-haspopup="menu"
		aria-expanded={open}
		onclick={toggle}
		class="inline-flex items-center gap-1.5 border-b-2 px-3 py-3 text-sm font-bold transition-colors {active
			? 'border-brand-600 text-brand-700 dark:border-brand-400 dark:text-brand-400'
			: 'border-transparent text-neutral-500 hover:text-neutral-800 dark:text-neutral-400 dark:hover:text-neutral-200'}"
	>
		{currentLabel}
		{#if sort !== 'new'}<span class="size-1.5 rounded-full bg-amber-500" title="Saralash o'zgartirilgan"></span>{/if}
		<ChevronDown class="size-4 transition-transform {open ? 'rotate-180' : ''} {active ? '' : 'opacity-40'}" />
	</button>

	{#if open}
		<button
			type="button"
			aria-label="Yopish"
			use:closeOnScroll={() => (open = false)}
			onclick={() => (open = false)}
			class="fixed inset-0 z-20 cursor-default touch-none"
		></button>
		<div
			role="menu"
			bind:this={menuEl}
			transition:scale={{ duration: 130, start: 0.95, easing: cubicOut }}
			style="transform-origin: {openUp ? 'bottom' : 'top'} left; max-height: {maxH}px"
			class="absolute left-0 z-30 w-64 overflow-y-auto overscroll-contain rounded-xl border {openUp ? 'bottom-full mb-1' : 'top-full mt-1'} border-neutral-200 bg-white py-1 shadow-[var(--shadow-pop)] dark:border-neutral-800 dark:bg-neutral-900"
		>
			{#each availableBuiltin as f (f.id)}
				<button
					type="button"
					role="menuitemradio"
					aria-checked={value === f.id}
					onclick={() => pick(f.id)}
					class="flex w-full items-center justify-between gap-3 px-4 py-2 text-left text-sm text-neutral-800 hover:bg-neutral-50 dark:text-neutral-200 dark:hover:bg-neutral-800 {value === f.id ? 'font-semibold' : ''}"
				>
					{f.label}
					{#if value === f.id}<Check class="size-4 text-brand-600" />{/if}
				</button>
			{/each}

			{#if availableCategories.length}
				<p class="mt-1 border-t border-neutral-100 px-4 pb-1 pt-2 text-[11px] font-semibold uppercase tracking-wide text-neutral-400 dark:border-neutral-800">
					Kategoriyalar
				</p>
				{#each availableCategories as c (c.id)}
					<button
						type="button"
						role="menuitemradio"
						aria-checked={value === `cat:${c.id}`}
						onclick={() => pick(`cat:${c.id}`)}
						class="flex w-full items-center justify-between gap-3 px-4 py-2 text-left text-sm text-neutral-800 hover:bg-neutral-50 dark:text-neutral-200 dark:hover:bg-neutral-800 {value === `cat:${c.id}` ? 'font-semibold' : ''}"
					>
						<span class="truncate">{c.name}</span>
						{#if value === `cat:${c.id}`}<Check class="size-4 shrink-0 text-brand-600" />{/if}
					</button>
				{/each}
			{/if}

			{#if showSort}
				<!-- Saralash: yig'ilgan qator, bosilganda variantlari ochiladi -->
				<button
					type="button"
					aria-expanded={sortOpen}
					onclick={toggleSort}
					class="mt-1 flex w-full items-center justify-between gap-3 border-t border-neutral-100 px-4 py-2 text-left text-sm font-semibold text-neutral-800 hover:bg-neutral-50 dark:border-neutral-800 dark:text-neutral-200 dark:hover:bg-neutral-800"
				>
					<span class="flex items-center gap-3"><ArrowUpDown class="size-4" />Saralash</span>
					<span class="flex min-w-0 items-center gap-1 text-xs font-medium text-neutral-500 dark:text-neutral-400">
						<span class="truncate">{SORTS.find((o) => o.id === sort)?.label}</span>
						<ChevronDown class="size-4 shrink-0 transition-transform {sortOpen ? 'rotate-180' : ''}" />
					</span>
				</button>
				{#if sortOpen}
					{#each SORTS as o (o.id)}
						<button
							type="button"
							role="menuitemradio"
							aria-checked={sort === o.id}
							onclick={() => {
								sort = o.id;
								open = false;
								onActivate?.();
							}}
							class="flex w-full items-center justify-between gap-3 bg-neutral-50/70 py-2 pl-11 pr-4 text-left text-sm text-neutral-800 hover:bg-neutral-100 dark:bg-neutral-800/40 dark:text-neutral-200 dark:hover:bg-neutral-800 {sort === o.id ? 'font-semibold' : ''}"
						>
							{o.label}
							{#if sort === o.id}<Check class="size-4 text-brand-600" />{/if}
						</button>
					{/each}
				{/if}
			{/if}

			{#if canManage}
				<button
					type="button"
					onclick={() => {
						open = false;
						onManage?.();
					}}
					class="flex w-full items-center gap-3 border-t border-neutral-100 px-4 py-2 text-left text-sm font-semibold text-brand-700 hover:bg-brand-50 dark:border-neutral-800 dark:text-brand-400 dark:hover:bg-brand-400/10"
				>
					<Settings2 class="size-4" />
					Kategoriyalarni boshqarish
				</button>
			{/if}
		</div>
	{/if}
</div>
