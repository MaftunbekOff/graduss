<script lang="ts">
	import { tick } from 'svelte';
	import type { HTMLTextareaAttributes } from 'svelte/elements';
	import { data } from '$lib/stores/data.svelte';
	import { TAG_CHARS } from '$lib/hashtag';
	import Avatar from '$lib/components/ui/Avatar.svelte';

	// Matn maydoni: yozayotganda "@" dan keyin odam nomlari, "#" dan keyin mashhur teglar taklif qilinadi.
	type Props = Omit<HTMLTextareaAttributes, 'value'> & {
		value: string;
		el?: HTMLTextAreaElement;
		/** Takliflar ro'yxati maydon USTIDA ochiladi (pastga yopishgan panellar uchun). */
		up?: boolean;
	};
	let { value = $bindable(''), el = $bindable(), up = false, oninput, onkeydown, onblur, class: cls = '', ...rest }: Props = $props();

	type Item = { key: string; label: string; sub: string; insert: string; color?: string };
	let active = $state<{ kind: '@' | '#'; query: string; start: number } | null>(null);
	let sel = $state(0);
	// Ro'yxat oyna (modal) chegarasida kesilmasligi uchun 'fixed' joylashtiriladi.
	let pos = $state<{ left: number; width: number; top?: number; bottom?: number }>({ left: 0, width: 0 });
	const listId = `sg-${Math.random().toString(36).slice(2, 8)}`;

	const items = $derived.by<Item[]>(() => {
		if (!active) return [];
		if (active.kind === '@') {
			return data.suggestUsers(active.query, 5).map((u) => ({ key: u.id, label: u.name, sub: `@${u.username}`, insert: `@${u.username}`, color: u.avatar }));
		}
		return data.suggestTags(active.query, 5).map((t) => ({ key: t, label: `#${t}`, sub: '', insert: `#${t}` }));
	});

	function detect() {
		if (!el) return;
		const pos = el.selectionStart ?? value.length;
		const before = value.slice(0, pos);
		const m = new RegExp(`(?:^|\\s)([@#])([${TAG_CHARS}.-]*)$`, 'u').exec(before);
		if (!m) {
			active = null;
			return;
		}
		active = { kind: m[1] as '@' | '#', query: m[2], start: pos - m[2].length - 1 };
		place();
		sel = Math.min(sel, Math.max(0, items.length - 1));
	}

	function place() {
		if (!el) return;
		const r = el.getBoundingClientRect();
		const below = window.innerHeight - r.bottom;
		const openUp = up || (below < 230 && r.top > below);
		pos = openUp ? { left: r.left, width: r.width, bottom: window.innerHeight - r.top + 4 } : { left: r.left, width: r.width, top: r.bottom + 4 };
	}

	async function choose(item: Item) {
		if (!active || !el) return;
		const pos = el.selectionStart ?? value.length;
		const insert = item.insert + ' ';
		value = value.slice(0, active.start) + insert + value.slice(pos);
		const caret = active.start + insert.length;
		active = null;
		await tick();
		el.focus();
		el.setSelectionRange(caret, caret);
	}

	function handleKey(e: KeyboardEvent & { currentTarget: EventTarget & HTMLTextAreaElement }) {
		if (items.length) {
			if (e.key === 'ArrowDown') {
				e.preventDefault();
				sel = (sel + 1) % items.length;
				return;
			}
			if (e.key === 'ArrowUp') {
				e.preventDefault();
				sel = (sel - 1 + items.length) % items.length;
				return;
			}
			if (e.key === 'Enter' || e.key === 'Tab') {
				e.preventDefault();
				void choose(items[sel]);
				return;
			}
			if (e.key === 'Escape') {
				e.preventDefault();
				active = null;
				return;
			}
		}
		(onkeydown as ((ev: typeof e) => void) | undefined)?.(e);
	}
</script>

<div class="relative">
	<textarea
		bind:this={el}
		bind:value
		{...rest}
		class={cls}
		role="combobox"
		aria-autocomplete="list"
		aria-expanded={items.length > 0}
		aria-controls={listId}
		oninput={(e) => {
			(oninput as ((ev: typeof e) => void) | undefined)?.(e);
			detect();
		}}
		onkeydown={handleKey}
		onkeyup={(e) => (['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(e.key) ? detect() : undefined)}
		onclick={detect}
		onblur={(e) => {
			(onblur as ((ev: typeof e) => void) | undefined)?.(e);
			setTimeout(() => (active = null), 150);
		}}
	></textarea>

	{#if items.length}
		<ul
			id={listId}
			role="listbox"
			style:left="{pos.left}px" style:width="{pos.width}px" style:top={pos.top !== undefined ? `${pos.top}px` : undefined} style:bottom={pos.bottom !== undefined ? `${pos.bottom}px` : undefined}
			class="fixed z-[70] overflow-hidden rounded-xl border border-neutral-200 bg-white py-1 shadow-[var(--shadow-pop)] dark:border-neutral-800 dark:bg-neutral-900"
		>
			{#each items as item, i (item.key)}
				<li role="option" aria-selected={i === sel}>
					<button
						type="button"
						tabindex="-1"
						onpointerdown={(e) => e.preventDefault()}
						onclick={() => choose(item)}
						class="flex w-full items-center gap-3 px-3 py-2 text-left text-sm {i === sel ? 'bg-brand-50 dark:bg-brand-400/10' : 'hover:bg-neutral-50 dark:hover:bg-neutral-800'}"
					>
						{#if item.color}<Avatar name={item.label} color={item.color} size="sm" />{/if}
						<span class="min-w-0">
							<span class="block truncate font-semibold">{item.label}</span>
							{#if item.sub}<span class="block truncate text-xs text-neutral-500 dark:text-neutral-400">{item.sub}</span>{/if}
						</span>
					</button>
				</li>
			{/each}
		</ul>
	{/if}
</div>
