<script lang="ts">
	import { tick } from 'svelte';
	import Button from '$lib/components/ui/Button.svelte';
	import SuggestTextarea from '$lib/components/ui/SuggestTextarea.svelte';
	import EmojiButton from '$lib/components/ui/EmojiButton.svelte';
	import { enterToSend, insertAtCaret } from '$lib/autogrow';
	import Send from '@lucide/svelte/icons/send';

	// Pastga mahkamlangan yozish paneli (post izohlari, kampaniya muhokamasi). Klaviatura ochilganda ustiga ko'tariladi (--kb).
	let {
		onSend,
		placeholder = 'Izoh yozing',
		el = $bindable()
	}: { onSend: (text: string) => void; placeholder?: string; el?: HTMLTextAreaElement } = $props();

	let value = $state('');

	// Klaviatura ochilganda oxirgi xabarlar panel ustida ko'rinib tursin.
	function keepLatestVisible() {
		setTimeout(() => window.scrollTo({ top: document.documentElement.scrollHeight, behavior: 'smooth' }), 300);
	}

	// field-sizing hamma brauzerda yo'q: balandlikni qo'lda moslaymiz, uzun matn kesilmasin.
	$effect(() => {
		value;
		if (!el) return;
		el.style.height = 'auto';
		el.style.height = `${el.scrollHeight}px`;
	});

	function submit() {
		const t = value.trim();
		if (!t) return;
		onSend(t);
		value = '';
		// Yangi xabar ro'yxat oxirida: sahifani pastga olib boramiz.
		void tick().then(() => window.scrollTo({ top: document.documentElement.scrollHeight, behavior: 'smooth' }));
	}
</script>

<form
	onsubmit={(e) => {
		e.preventDefault();
		submit();
	}}
	style:bottom="var(--kb, 0px)"
	class="glass sticky z-10 mt-auto flex items-end gap-2 border-t border-neutral-200 px-3 py-2.5 dark:border-neutral-800"
>
	<div class="relative min-w-0 flex-1">
	<SuggestTextarea
		bind:el
		up
		onfocus={keepLatestVisible}
		onkeydown={(e) => enterToSend(e, submit)}
		bind:value
		rows={1}
		{placeholder}
		aria-label={placeholder}
		class="block max-h-32 min-h-10 w-full resize-none overflow-y-auto rounded-2xl pr-11 leading-snug border border-neutral-300 bg-white px-4 py-2 text-base outline-none [field-sizing:content] placeholder:text-neutral-400 focus:border-brand-500 focus:ring-1 focus:ring-brand-500 dark:border-neutral-700 dark:bg-neutral-900"
	/>
	<EmojiButton class="absolute bottom-0.5 right-1" onpick={(e) => (value = insertAtCaret(el, value, e))} />
	</div>
	<Button type="submit" size="sm" class="min-h-10 min-w-10" disabled={!value.trim()} aria-label="Yuborish">
		<Send class="size-4" />
		<span class="hidden sm:inline">Yuborish</span>
	</Button>
</form>
