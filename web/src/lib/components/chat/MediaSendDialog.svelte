<script lang="ts" module>
	export interface MediaSend {
		files: File[];
		/** Kichraytirilgan rasmlar (files bilan bir xil tartibda). */
		urls: string[];
		caption: string;
		asFiles: boolean;
		spoiler: boolean;
		captionUp: boolean;
	}
</script>

<script lang="ts">
	// Media yuborishdan oldin ko'rik: izoh, qo'shish, izoh o'rni, fayl sifatida, spoyler.
	import { fileToResizedDataUrl } from '$lib/image';
	import { toastStore } from '$lib/stores/toast.svelte';
	import { autogrow } from '$lib/autogrow';
	import ContextMenu, { type ContextMenuItem } from '$lib/components/ui/ContextMenu.svelte';
	import Button from '$lib/components/ui/Button.svelte';
	import X from '@lucide/svelte/icons/x';
	import Plus from '@lucide/svelte/icons/plus';
	import Ellipsis from '@lucide/svelte/icons/ellipsis';
	import ArrowUpToLine from '@lucide/svelte/icons/arrow-up-to-line';
	import ArrowDownToLine from '@lucide/svelte/icons/arrow-down-to-line';
	import FileText from '@lucide/svelte/icons/file-text';
	import ImageIcon from '@lucide/svelte/icons/image';
	import EyeOff from '@lucide/svelte/icons/eye-off';
	import Eye from '@lucide/svelte/icons/eye';
	import Send from '@lucide/svelte/icons/send';

	let {
		open = $bindable(false),
		files = [],
		caption: initialCaption = '',
		onsend
	}: { open?: boolean; files?: File[]; caption?: string; onsend: (m: MediaSend) => void } = $props();

	const MAX = 10;
	let entries = $state<{ id: number; file: File; url: string }[]>([]);
	let caption = $state('');
	let asFiles = $state(false);
	let spoiler = $state(false);
	let captionUp = $state(false);
	let busy = $state(false);
	let menu = $state<{ x: number; y: number } | null>(null);
	let addEl = $state<HTMLInputElement>();
	let moreEl = $state<HTMLButtonElement>();
	let uid = 0;
	let wasOpen = false;

	async function addFiles(list: File[]) {
		busy = true;
		try {
			for (const file of list) {
				if (entries.length >= MAX) {
					toastStore.show(`Bir vaqtda ${MAX} tagacha fayl`, 'info');
					break;
				}
				try {
					entries.push({ id: ++uid, file, url: await fileToResizedDataUrl(file) });
				} catch (err) {
					toastStore.show(err instanceof Error ? err.message : 'Rasmni yuklab bo‘lmadi', 'error');
				}
			}
		} finally {
			busy = false;
		}
		if (!entries.length) open = false;
	}

	// Ochilganda boshlang'ich holat; yopilganda tozalanadi.
	$effect(() => {
		if (open && !wasOpen) {
			entries = [];
			caption = initialCaption;
			asFiles = spoiler = captionUp = false;
			void addFiles([...files]);
		}
		wasOpen = open;
	});

	function pickMore(e: Event) {
		const input = e.currentTarget as HTMLInputElement;
		const list = [...(input.files ?? [])];
		input.value = '';
		if (list.length) void addFiles(list);
	}

	function openMenu() {
		const r = moreEl!.getBoundingClientRect();
		menu = { x: r.right - 224, y: r.bottom + 4 };
	}

	const items = $derived<ContextMenuItem[]>([
		{ key: 'add', label: 'Qo‘shish', icon: Plus },
		{ key: 'caption', label: captionUp ? 'Izohni pastga tushirish' : 'Izohni tepaga chiqarish', icon: captionUp ? ArrowDownToLine : ArrowUpToLine },
		{ key: 'files', label: asFiles ? 'Rasm sifatida yuborish' : 'Fayl sifatida yuborish', icon: asFiles ? ImageIcon : FileText },
		...(asFiles ? [] : [{ key: 'spoiler', label: spoiler ? 'Spoylerni o‘chirish' : 'Spoyler yoqish', icon: spoiler ? Eye : EyeOff }])
	]);

	function onMenu(key: string) {
		menu = null;
		if (key === 'add') addEl?.click();
		else if (key === 'caption') captionUp = !captionUp;
		else if (key === 'files') asFiles = !asFiles;
		else if (key === 'spoiler') spoiler = !spoiler;
	}

	const fmtSize = (n: number) => (n < 1024 ? `${n} B` : n < 1048576 ? `${Math.round(n / 1024)} KB` : `${(n / 1048576).toFixed(1)} MB`);

	function send() {
		if (!entries.length || busy) return;
		onsend({ files: entries.map((e) => e.file), urls: entries.map((e) => e.url), caption: caption.trim(), asFiles, spoiler: spoiler && !asFiles, captionUp });
		open = false;
	}

	function onKey(e: KeyboardEvent) {
		if (!open || menu) return;
		if (e.key === 'Escape') open = false;
	}
</script>

<svelte:window onkeydown={onKey} />

{#if open}
	<div class="fixed inset-0 z-50 flex items-end justify-center p-0 sm:items-center sm:p-4" role="presentation">
		<button aria-label="Yopish" onclick={() => (open = false)} class="absolute inset-0 cursor-default bg-black/50 backdrop-blur-sm"></button>
		<div role="dialog" aria-modal="true" aria-label="Media yuborish" class="relative flex max-h-[92dvh] w-full flex-col overflow-hidden rounded-t-2xl border border-neutral-200 bg-white shadow-[var(--shadow-pop)] sm:max-w-md sm:rounded-2xl dark:border-neutral-800 dark:bg-neutral-900">
			<div class="flex items-center gap-1 border-b border-neutral-200 px-3 py-2 dark:border-neutral-800">
				<button type="button" onclick={() => (open = false)} aria-label="Bekor qilish" class="rounded-full p-2 text-neutral-500 hover:bg-neutral-100 dark:hover:bg-neutral-800"><X class="size-5" /></button>
				<h2 class="min-w-0 flex-1 truncate px-1 text-base font-bold">{asFiles ? 'Fayl yuborish' : 'Media yuborish'}{entries.length > 1 ? ` (${entries.length})` : ''}</h2>
				<button type="button" bind:this={moreEl} onclick={openMenu} aria-label="Media sozlamalari" aria-haspopup="menu" class="rounded-full p-2 text-neutral-500 hover:bg-neutral-100 dark:hover:bg-neutral-800"><Ellipsis class="size-5" /></button>
			</div>

			<div class="flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto p-4">
				{#snippet captionBox()}
					<textarea
						use:autogrow
						bind:value={caption}
						rows="1"
						placeholder="Izoh qo‘shing"
						aria-label="Izoh"
						class="max-h-32 min-h-10 w-full resize-none rounded-2xl bg-neutral-100 px-4 py-2.5 text-base leading-snug outline-none placeholder:text-neutral-500 focus:ring-1 focus:ring-brand-500 dark:bg-neutral-800"
					></textarea>
				{/snippet}
				{#if captionUp}{@render captionBox()}{/if}

				{#if asFiles}
					<ul class="flex flex-col gap-2">
						{#each entries as e (e.id)}
							<li class="flex items-center gap-3 rounded-xl bg-neutral-100 px-3 py-2 dark:bg-neutral-800">
								<span class="flex size-10 shrink-0 items-center justify-center rounded-full bg-brand-600 text-white"><FileText class="size-5" /></span>
								<span class="min-w-0 flex-1"><span class="block truncate text-sm font-semibold">{e.file.name}</span><span class="block text-xs text-neutral-500">{fmtSize(e.file.size)}</span></span>
								<button type="button" onclick={() => (entries = entries.filter((x) => x.id !== e.id))} aria-label="Faylni olib tashlash" class="rounded-full p-2 hover:bg-neutral-200 dark:hover:bg-neutral-700"><X class="size-4" /></button>
							</li>
						{/each}
					</ul>
				{:else}
					<div class="grid gap-1.5 {entries.length > 1 ? 'grid-cols-2' : 'grid-cols-1'}">
						{#each entries as e, i (e.id)}
							<div class="relative overflow-hidden rounded-xl bg-neutral-100 dark:bg-neutral-800 {entries.length > 1 && entries.length % 2 === 1 && i === entries.length - 1 ? 'col-span-2' : ''}">
								<img src={e.url} alt="Yuboriladigan rasm" class="w-full object-cover {entries.length > 1 ? 'aspect-square' : 'max-h-80'} {spoiler ? 'scale-110 blur-xl' : ''}" />
								{#if spoiler}
									<span class="pointer-events-none absolute inset-0 flex items-center justify-center"><span class="flex items-center gap-1.5 rounded-full bg-black/55 px-3 py-1.5 text-sm font-semibold text-white"><EyeOff class="size-4" />Spoyler</span></span>
								{/if}
								<button type="button" onclick={() => (entries = entries.filter((x) => x.id !== e.id))} aria-label="Rasmni olib tashlash" class="absolute right-1.5 top-1.5 flex size-8 items-center justify-center rounded-full bg-black/60 text-white hover:bg-black/80"><X class="size-4" /></button>
							</div>
						{/each}
					</div>
				{/if}
				{#if busy}<p class="text-center text-sm text-neutral-500">Yuklanmoqda…</p>{/if}

				{#if !captionUp}{@render captionBox()}{/if}
			</div>

			<div class="flex items-center justify-between gap-2 border-t border-neutral-200 px-4 py-3 dark:border-neutral-800">
				<button type="button" onclick={() => addEl?.click()} class="flex items-center gap-1.5 rounded-full px-3 py-2 text-sm font-semibold text-brand-700 hover:bg-brand-50 dark:text-brand-400 dark:hover:bg-brand-400/10"><Plus class="size-4" />Qo‘shish</button>
				<Button type="button" onclick={send} disabled={!entries.length || busy} aria-label="Yuborish"><Send class="size-4" />Yuborish</Button>
			</div>
			<input bind:this={addEl} type="file" accept="image/*" multiple class="sr-only" tabindex="-1" aria-label="Media qo‘shish" onchange={pickMore} />
		</div>
	</div>
	{#if menu}
		<ContextMenu {items} x={menu.x} y={menu.y} label="Media sozlamalari" onSelect={onMenu} onClose={() => (menu = null)} />
	{/if}
{/if}
