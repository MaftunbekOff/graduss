<script lang="ts">
	import type { Message } from '$lib/types';
	import { data } from '$lib/stores/data.svelte';
	import { clockTime } from '$lib/utils';
	import Avatar from '$lib/components/ui/Avatar.svelte';
	import ImageLightboxModal from '$lib/components/post/ImageLightboxModal.svelte';
	import PollWidget from '$lib/components/post/PollWidget.svelte';
	import FileText from '@lucide/svelte/icons/file-text';
	import Download from '@lucide/svelte/icons/download';
	import AudioPlayer from '$lib/components/chat/AudioPlayer.svelte';
	import VideoNote from '$lib/components/chat/VideoNote.svelte';
	import { contextMenu } from '$lib/contextMenu';
	import Pin from '@lucide/svelte/icons/pin';
	import Forward from '@lucide/svelte/icons/forward';
	import EyeOff from '@lucide/svelte/icons/eye-off';
	import Check from '@lucide/svelte/icons/check';
	import CheckCheck from '@lucide/svelte/icons/check-check';

	// Guruhda: boshqalarning xabarlari chapda avatar bilan (Telegram kabi). Avatar ketma-ket xabarlarning oxirgisida, ism birinchisida.
	let {
		message,
		mine,
		showSender,
		first = true,
		last = true,
		selecting = false,
		selected = false,
		match,
		oncontext,
		ontoggle
	}: {
		message: Message;
		mine: boolean;
		showSender?: boolean;
		first?: boolean;
		last?: boolean;
		selecting?: boolean;
		selected?: boolean;
		/** Suhbatda qidirishda: joriy mos xabar yoki boshqa mosliklar. */
		match?: 'current' | 'other';
		oncontext?: (x: number, y: number) => void;
		ontoggle?: () => void;
	} = $props();

	const sender = $derived(data.getUser(message.senderId));
	const fmtSize = (n: number) => (n < 1024 ? `${n} B` : n < 1048576 ? `${Math.round(n / 1024)} KB` : `${(n / 1048576).toFixed(1)} MB`);
	const replyTo = $derived(message.replyToId ? data.messages.find((m) => m.id === message.replyToId) : undefined);
	const replyLabel = (m: Message) => m.content || (m.sticker ? `${m.sticker} Stiker` : m.imageUrl ? (/\.gif($|\?)/i.test(m.imageUrl) ? 'GIF' : 'Rasm') : m.file ? m.file.name : m.audio ? 'Ovozli xabar' : m.video ? 'Video xabar' : m.poll ? "So'rovnoma" : 'Xabar');
	let lightbox = $state(false);
	let lightboxSrc = $state('');
	let revealed = $state(false); // spoyler shu qurilmada ochilgan
	// Faqat media (matnsiz): vaqt rasm/video ustida pastki o'ngda; aks holda pufak ichida pastki o'ngda.
	const overlay = $derived(!message.content && !message.file && !message.audio && !message.poll && (!!message.imageUrl || !!message.video || !!message.sticker));
	const read = $derived(mine && data.isMessageRead(message));
	const album = $derived(message.images && message.images.length > 1 ? message.images : null);
	const hidden = $derived(!!message.spoiler && !revealed);
	function openImage(src: string) {
		if (hidden) {
			revealed = true;
			return;
		}
		lightboxSrc = src;
		lightbox = true;
	}
	// Guruhda boshqalarning xabari: yuboruvchi ismi pufak ichida tepada (ketma-ket xabarlarning birinchisida).
	const showName = $derived(!!showSender && !!sender && !mine && first);
	// Bir kishining ketma-ket xabarlari "paket": ichki burchaklar kichik, oxirgisida "dum" (Telegram kabi).
	const corners = $derived(
		mine
			? `${first ? '' : 'rounded-tr-md'} ${last ? 'rounded-br-sm' : 'rounded-br-md'}`
			: `${first ? '' : 'rounded-tl-md'} ${last ? 'rounded-bl-sm' : 'rounded-bl-md'}`
	);
	const hasMedia = $derived(!!message.imageUrl || !!message.poll);
	// Faqat matnli xabar: vaqt matnning oxirgi qatoriga sig'sa shu yerda (o'ngda), sig'masa keyingi qatorda.
	const inlineMeta = $derived(!!message.content && !hasMedia && !message.file && !message.audio && !message.video && !message.imageUrl);
	// Faqat doira video bo'lsa pufak yo'q (Telegram kabi); sarlavha (javob/uzatilgan) bo'lsa pufak qoladi.
	const plainVideo = $derived((!!message.video || !!message.sticker) && !message.content && !message.imageUrl && !message.file && !message.audio && !message.poll && !message.forwardedFrom && !message.replyToId && !showName);

	function jumpTo(id: string) {
		const el = document.getElementById(`msg-${id}`);
		el?.scrollIntoView({ block: 'center', behavior: 'smooth' });
		el?.animate([{ backgroundColor: 'rgb(99 102 241 / 0.18)' }, { backgroundColor: 'transparent' }], { duration: 1200 });
	}
</script>

<!-- svelte-ignore a11y_click_events_have_key_events, a11y_no_static_element_interactions -->
<div
	id={`msg-${message.id}`}
	use:contextMenu={{ onopen: (x, y) => oncontext?.(x, y), disabled: selecting, ignore: 'a[href], audio, video' }}
	onclick={selecting ? ontoggle : undefined}
	class="group flex items-end gap-2 rounded-lg [-webkit-touch-callout:none] {first ? 'mt-3' : ''} {mine ? 'justify-end' : ''} {selecting ? 'cursor-pointer select-none' : ''} {selected ? 'bg-brand-600/10' : ''} {match === 'current' ? 'ring-2 ring-amber-400' : match === 'other' ? 'ring-1 ring-amber-300/60' : ''}"
>
{#if selecting}
	<span
		role="checkbox"
		aria-checked={selected}
		aria-label="Xabarni tanlash"
		class="mb-1 flex size-5 shrink-0 items-center justify-center rounded-full border-2 {selected ? 'border-brand-600 bg-brand-600 text-white' : 'border-neutral-400 dark:border-neutral-600'} {mine ? 'order-last' : ''}"
	>
		{#if selected}<Check class="size-3" />{/if}
	</span>
{/if}
{#if showSender && !mine}
	<div class="w-8 shrink-0">
		{#if last && sender}
			<a href={`/profile/${sender.username}`} aria-label={sender.name}><Avatar name={sender.name} color={sender.avatar} size="sm" /></a>
		{/if}
	</div>
{/if}
<div class="flex min-w-0 flex-1 flex-col {mine ? 'items-end' : 'items-start'}">
	<div class="flex w-full {mine ? 'justify-end' : ''}">
		<div
			class="w-fit min-w-0 max-w-[88%] rounded-2xl text-sm sm:max-w-[75%] {plainVideo
				? ''
				: `shadow-sm ${hasMedia || message.video || message.sticker ? 'p-1' : 'px-3.5 py-2'} ${corners} ${mine
						? 'bg-brand-600 text-white shadow-brand-900/10'
						: 'bg-neutral-100 text-neutral-900 dark:bg-neutral-800 dark:text-neutral-100'}`}"
		>
			{#if showName}
				<a href={`/profile/${sender?.username}`} class="mb-0.5 block max-w-full truncate text-xs font-semibold text-brand-700 hover:underline dark:text-brand-400 {hasMedia || message.video ? 'px-2.5 pt-1.5' : ''}">{sender?.name}</a>
			{/if}
			{#if message.forwardedFrom}
				<p class="mb-1 flex min-w-0 items-center gap-1.5 text-xs {hasMedia || message.video ? 'px-2.5 pt-1.5' : ''}">
					<Forward class="size-3.5 shrink-0 opacity-80" />
					<span class="truncate"><span class="opacity-75">Uzatilgan:&nbsp;</span><span class="font-semibold">{message.forwardedFrom}</span></span>
				</p>
			{/if}
			{#if message.replyToId}
				<button
					type="button"
					onclick={() => replyTo && jumpTo(replyTo.id)}
					disabled={!replyTo || selecting}
					aria-label="Javob berilgan xabarga o'tish"
					class="mb-1 block w-full min-w-32 rounded-lg border-l-2 py-1 pl-2 pr-2 text-left text-xs {mine ? 'border-white/70 bg-white/15' : 'border-brand-600 bg-brand-600/10'} {hasMedia || message.video ? 'mx-1.5 mt-1.5 w-[calc(100%-0.75rem)]' : ''}"
				>
					<span class="block truncate font-semibold">{replyTo ? (data.getUser(replyTo.senderId)?.name ?? "Noma'lum") : 'Xabar'}</span>
					<span class="block truncate opacity-80">{replyTo ? replyLabel(replyTo) : "O'chirilgan xabar"}</span>
				</button>
			{/if}
			{#if message.content && message.captionUp}{@render caption()}{/if}
			{#if album}
				<div class="relative grid w-72 max-w-full grid-cols-2 gap-0.5 overflow-hidden rounded-xl">
					{#each album as src, i (i)}
						<button type="button" onclick={() => openImage(src)} aria-label={hidden ? 'Spoylerni ochish' : 'Rasmni kattalashtirish'} class="relative block overflow-hidden {album.length % 2 === 1 && i === album.length - 1 ? 'col-span-2 aspect-[2/1]' : 'aspect-square'}">
							<img {src} alt="Yuborilgan rasm" loading="lazy" decoding="async" class="size-full object-cover transition-[filter] duration-300 {hidden ? 'scale-110 blur-xl' : ''}" />
						</button>
					{/each}
					{#if hidden}{@render spoilerBadge()}{/if}
					{#if overlay}{@render metaPill()}{/if}
				</div>
			{:else if message.imageUrl}
				<button type="button" onclick={() => openImage(message.imageUrl!)} aria-label={hidden ? 'Spoylerni ochish' : 'Rasmni kattalashtirish'} class="relative block w-72 max-w-full overflow-hidden rounded-xl">
					<img src={message.imageUrl} alt="Yuborilgan rasm" loading="lazy" decoding="async" class="max-h-72 min-h-16 w-full object-cover transition-[filter] duration-300 {hidden ? 'scale-110 blur-xl' : ''}" />
					{#if hidden}{@render spoilerBadge()}{/if}
					{#if overlay}{@render metaPill()}{/if}
				</button>
			{/if}
			{#if message.file}
				<a
					href={message.file.url}
					download={message.file.name}
					class="flex w-64 max-w-full min-w-0 items-center gap-3 rounded-xl px-1 py-1 {mine ? 'hover:bg-white/10' : 'hover:bg-black/5 dark:hover:bg-white/5'}"
				>
					<span class="flex size-10 shrink-0 items-center justify-center rounded-full {mine ? 'bg-white/20' : 'bg-brand-600 text-white'}"><FileText class="size-5" /></span>
					<span class="min-w-0 flex-1">
						<span class="block truncate font-semibold">{message.file.name}</span>
						<span class="block text-xs opacity-70">{fmtSize(message.file.size)}</span>
					</span>
					<Download class="size-4 shrink-0 opacity-70" />
				</a>
			{/if}
			{#if message.audio}
				<AudioPlayer src={message.audio.url} duration={message.audio.duration} {mine} id={message.id} title={sender?.name ?? "Ovozli xabar"} chatId={message.chatId} />
			{/if}
			{#if message.video}
				<div class="relative w-fit">
					<VideoNote src={message.video.url} duration={message.video.duration} id={message.id} title={sender?.name ?? "Video xabar"} chatId={message.chatId} />
					{#if overlay}{@render metaPill()}{/if}
				</div>
			{/if}
			{#if message.sticker}
				<div class="relative w-fit px-1">
					<span class="block select-none text-[5.5rem] leading-none" role="img" aria-label={`Stiker ${message.sticker}`}>{message.sticker}</span>
					{#if overlay}{@render metaPill()}{/if}
				</div>
			{/if}
			{#if message.poll}
				<div class="w-72 max-w-full text-neutral-900 dark:text-neutral-100 [&>div]:mt-0"><PollWidget poll={message.poll} messageId={message.id} /></div>
			{/if}
			{#if message.content && !message.captionUp}{@render caption()}{/if}
			{#if !overlay && !inlineMeta}
				<div class="mt-0.5 flex justify-end {hasMedia || message.video ? 'px-2.5 pb-1' : ''} {mine ? 'text-white/70' : 'text-neutral-500 dark:text-neutral-400'}">{@render metaInner()}</div>
			{/if}
		</div>
	</div>
</div>
</div>

{#snippet caption()}
	<p class="whitespace-pre-wrap [overflow-wrap:anywhere] {hasMedia ? 'px-2.5 py-1.5' : ''}">{message.content}{#if inlineMeta}<span class="float-right ml-3 mt-2 {mine ? 'text-white/70' : 'text-neutral-500 dark:text-neutral-400'}">{@render metaInner()}</span>{/if}</p>
{/snippet}

{#snippet metaInner()}
	<span class="flex items-center gap-1 whitespace-nowrap text-[11px] leading-none">
		{#if message.pinnedAt}<Pin class="size-3" aria-label="Qadalgan" />{/if}
		{#if message.editedAt}<span>tahrirlangan</span>{/if}
		<time datetime={message.createdAt} class="tabular-nums">{clockTime(message.createdAt)}</time>
		{#if mine}
			{#if read}<CheckCheck class="size-3.5 text-sky-300" aria-label="O'qildi" data-status="read" />{:else}<Check class="size-3.5" aria-label="Yuborildi" data-status="sent" />{/if}
		{/if}
	</span>
{/snippet}

{#snippet metaPill()}
	<span class="pointer-events-none absolute bottom-2 right-2 rounded-full bg-black/55 px-2 py-1 text-white">{@render metaInner()}</span>
{/snippet}

{#snippet spoilerBadge()}
	<span class="pointer-events-none absolute inset-0 flex items-center justify-center"><span class="flex items-center gap-1.5 rounded-full bg-black/55 px-3 py-1.5 text-sm font-semibold text-white"><EyeOff class="size-4" />Spoyler</span></span>
{/snippet}

<ImageLightboxModal bind:open={lightbox} src={lightboxSrc} />
