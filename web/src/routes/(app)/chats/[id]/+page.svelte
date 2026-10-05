<script lang="ts">
	import { untrack } from 'svelte';
	import { page } from '$app/state';
	import { goto } from '$app/navigation';
	import { data } from '$lib/stores/data.svelte';
	import { session } from '$lib/stores/session.svelte';
	import { scale } from 'svelte/transition';
	import { cubicOut } from 'svelte/easing';
	import { API_ON } from '$lib/api';
	import MediaSendDialog, { type MediaSend } from '$lib/components/chat/MediaSendDialog.svelte';
	import { toastStore } from '$lib/stores/toast.svelte';
	import ImageIcon from '@lucide/svelte/icons/image';
	import EmojiButton from '$lib/components/ui/EmojiButton.svelte';
	import { autogrow, enterToSend, insertAtCaret } from '$lib/autogrow';
	import AttachMenu from '$lib/components/chat/AttachMenu.svelte';
	import VoiceRecorder from '$lib/components/chat/VoiceRecorder.svelte';
	import VideoRecorder from '$lib/components/chat/VideoRecorder.svelte';
	import { recordingSupported } from '$lib/recorder';
	import Mic from '@lucide/svelte/icons/mic';
	import PollDialog from '$lib/components/chat/PollDialog.svelte';
	import CallDialog from '$lib/components/chat/CallDialog.svelte';
	import Phone from '@lucide/svelte/icons/phone';
	import Video from '@lucide/svelte/icons/video';
	import MessageBubble from '$lib/components/chat/MessageBubble.svelte';
	import MessageContextMenu, { type MenuAction } from '$lib/components/chat/MessageContextMenu.svelte';
	import ForwardDialog from '$lib/components/chat/ForwardDialog.svelte';
	import Pin from '@lucide/svelte/icons/pin';
	import Forward from '@lucide/svelte/icons/forward';
	import Reply from '@lucide/svelte/icons/reply';
	import Pencil from '@lucide/svelte/icons/pencil';
	import Copy from '@lucide/svelte/icons/copy';
	import Trash2 from '@lucide/svelte/icons/trash-2';
	import type { Message } from '$lib/types';
	import Avatar from '$lib/components/ui/Avatar.svelte';
	import Badge from '$lib/components/ui/Badge.svelte';
	import Button from '$lib/components/ui/Button.svelte';
	import EmptyState from '$lib/components/ui/EmptyState.svelte';
	import ConfirmDialog from '$lib/components/ui/ConfirmDialog.svelte';
	import Modal from '$lib/components/ui/Modal.svelte';
	import ArrowLeft from '@lucide/svelte/icons/arrow-left';
	import Send from '@lucide/svelte/icons/send';
	import Users from '@lucide/svelte/icons/users';
	import MessageCircle from '@lucide/svelte/icons/message-circle';
	import CircleAlert from '@lucide/svelte/icons/circle-alert';
	import Ellipsis from '@lucide/svelte/icons/ellipsis';
	import LogOut from '@lucide/svelte/icons/log-out';
	import X from '@lucide/svelte/icons/x';
	import Search from '@lucide/svelte/icons/search';
	import ChevronUp from '@lucide/svelte/icons/chevron-up';
	import ChevronDown from '@lucide/svelte/icons/chevron-down';

	let callKind = $state<'voice' | 'video'>('voice');
	let callOpen = $state(false);
	let docEl = $state<HTMLInputElement>();
	let pollOpen = $state(false);
	let pendingFile = $state<{ name: string; size: number; url: string } | null>(null);
	let draftEl = $state<HTMLTextAreaElement>();
	const rawChat = $derived(data.getChat(page.params.id ?? ''));
	const chat = $derived(
		rawChat && rawChat.participantIds.includes(session.user.id) ? rawChat : undefined
	);
	const otherUser = $derived(
		chat && !chat.isGroup
			? data.getUser(chat.participantIds.find((id) => id !== session.user.id)!)
			: undefined
	);
	const title = $derived(chat ? (chat.isGroup ? chat.title! : (otherUser?.name ?? "Noma'lum")) : '');
	const chatMessages = $derived(chat ? data.getChatMessages(chat.id) : []);
	const participants = $derived(chat ? data.getChatParticipants(chat.id) : []);

	// Xabar yozmasdan chiqib ketilsa, bo'sh shaxsiy suhbat saqlanib qolmasin.
	$effect(() => {
		const id = page.params.id;
		return () => {
			if (id) data.discardEmptyChat(id);
		};
	});

	let draft = $state('');
	let fileEl = $state<HTMLInputElement>();
	let mediaOpen = $state(false);
	let mediaFiles = $state<File[]>([]);
	let scrollEl: HTMLDivElement | undefined = $state();
	let menuOpen = $state(false);
	let membersOpen = $state(false);
	let confirmLeaveOpen = $state(false);

	function confirmLeave() {
		if (!chat) return;
		data.leaveChat(chat.id);
		goto('/chats');
	}

	$effect(() => {
		chatMessages.length;
		if (scrollEl) scrollEl.scrollTop = scrollEl.scrollHeight;
	});

	// Telefonda suhbat ochiq paytda sahifaning o'zi aylanmasin (yozish paneli pastda qotib turadi).
	$effect(() => {
		document.documentElement.classList.add('chat-open');
		return () => document.documentElement.classList.remove('chat-open');
	});

	// Klaviatura ochilib-yopilganda (ro'yxat balandligi o'zgarganda) pastda turgan bo'lsangiz pastda qolasiz.
	$effect(() => {
		const el = scrollEl;
		if (!el) return;
		let atBottom = true;
		const onScroll = () => (atBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 80);
		const ro = new ResizeObserver(() => {
			if (atBottom) el.scrollTop = el.scrollHeight;
		});
		el.addEventListener('scroll', onScroll, { passive: true });
		ro.observe(el);
		return () => {
			el.removeEventListener('scroll', onScroll);
			ro.disconnect();
		};
	});

	// Suhbat ochilganda va yangi xabar kelganda o'qilgan deb belgilanadi (o'qilmaganlar belgisi yo'qoladi).
	$effect(() => {
		chatMessages.length;
		if (chat) data.markChatRead(chat.id);
	});

	function pickImage(e: Event) {
		const input = e.currentTarget as HTMLInputElement;
		const list = [...(input.files ?? [])];
		input.value = '';
		if (!list.length) return;
		mediaFiles = list;
		mediaOpen = true;
	}

	function sendSticker(sticker: string) {
		if (!chat) return;
		data.sendMessage(chat.id, '', undefined, { sticker, replyToId: replyId ?? undefined });
		replyId = null;
	}
	function sendGif(url: string) {
		if (!chat) return;
		data.sendMessage(chat.id, '', url, { replyToId: replyId ?? undefined });
		replyId = null;
	}

	function readDataUrl(file: File) {
		return new Promise<string>((resolve, reject) => {
			const r = new FileReader();
			r.onload = () => resolve(String(r.result));
			r.onerror = () => reject(new Error('Faylni o‘qib bo‘lmadi'));
			r.readAsDataURL(file);
		});
	}

	async function sendMedia(m: MediaSend) {
		if (!chat) return;
		const replyToId = replyId ?? undefined;
		replyId = null;
		if (!m.asFiles) {
			data.sendMessage(chat.id, m.caption, m.urls[0], { images: m.urls.length > 1 ? m.urls : undefined, spoiler: m.spoiler, captionUp: m.captionUp, replyToId });
		} else {
			// Fayl sifatida: asl fayl (kichraytirilmagan), har biri alohida xabar; izoh birinchisida (tepada) yoki oxirgisida.
			const capAt = m.captionUp ? 0 : m.files.length - 1;
			for (const [i, file] of m.files.entries()) {
				if (file.size > MAX_FILE) {
					toastStore.show(`"${file.name}": demo rejimda fayl 1 MB dan oshmasligi kerak`, 'error');
					continue;
				}
				try {
					const url = await readDataUrl(file);
					data.sendMessage(chat.id, i === capAt ? m.caption : '', undefined, { file: { name: file.name, size: file.size, url }, replyToId: i === 0 ? replyToId : undefined });
				} catch (err) {
					toastStore.show(err instanceof Error ? err.message : 'Faylni o‘qib bo‘lmadi', 'error');
				}
			}
		}
		draft = '';
	}

	// Telegram kabi: tugmani bosish rejimni almashtiradi (ovoz/video), bosib turish yozadi, qo'yib yuborish yuboradi.
	let micMode = $state<'voice' | 'video'>('voice');
	let recKind = $state<'voice' | 'video' | null>(null);
	let cancelling = $state(false);
	let voiceRef = $state<{ end: (send: boolean) => Promise<void> }>();
	let videoRef = $state<{ end: (send: boolean) => Promise<void> }>();
	const showMic = $derived(!API_ON && !draft.trim() && !pendingFile);
	let holdTimer: ReturnType<typeof setTimeout> | undefined;
	let downX = 0;

	function micDown(e: PointerEvent) {
		if (!recordingSupported()) return toastStore.show('Brauzer yozishni qo‘llab-quvvatlamaydi', 'error');
		downX = e.clientX;
		cancelling = false;
		(e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
		holdTimer = setTimeout(() => {
			holdTimer = undefined;
			recKind = micMode;
		}, 250);
	}
	function micMove(e: PointerEvent) {
		if (recKind) cancelling = downX - e.clientX > 80;
	}
	async function micUp() {
		if (holdTimer) {
			// qisqa bosish: rejimni almashtirish
			clearTimeout(holdTimer);
			holdTimer = undefined;
			micMode = micMode === 'voice' ? 'video' : 'voice';
			return;
		}
		if (!recKind) return;
		const ref = recKind === 'voice' ? voiceRef : videoRef;
		await ref?.end(!cancelling);
		recKind = null;
		cancelling = false;
	}
	async function micAbort() {
		clearTimeout(holdTimer);
		holdTimer = undefined;
		if (!recKind) return;
		await (recKind === 'voice' ? voiceRef : videoRef)?.end(false);
		recKind = null;
		cancelling = false;
	}
	function sendVoice(audio: { url: string; duration: number }) {
		if (chat) data.sendMessage(chat.id, '', undefined, { audio });
	}
	function sendVideo(video: { url: string; duration: number }) {
		if (chat) data.sendMessage(chat.id, '', undefined, { video });
	}

	const MAX_FILE = 1_000_000; // demo: localStorage hajmi cheklangan
	function pickDoc(e: Event) {
		const input = e.currentTarget as HTMLInputElement;
		const file = input.files?.[0];
		input.value = '';
		if (!file) return;
		if (file.size > MAX_FILE) {
			toastStore.show('Demo rejimda fayl 1 MB dan oshmasligi kerak', 'error');
			return;
		}
		const r = new FileReader();
		r.onload = () => (pendingFile = { name: file.name, size: file.size, url: String(r.result) });
		r.onerror = () => toastStore.show('Faylni o‘qib bo‘lmadi', 'error');
		r.readAsDataURL(file);
	}

	function sendPoll(poll: import('$lib/types').Poll) {
		if (chat) data.sendMessage(chat.id, '', undefined, { poll });
	}

	// Xabar amallari (o'ng tugma / bosib turish menyusi): javob, tahrir, nusxa, qadash, uzatish, tanlash, o'chirish.
	let menu = $state<{ id: string; x: number; y: number } | null>(null);
	const menuMessage = $derived(menu ? chatMessages.find((m) => m.id === menu!.id) : undefined);
	let replyId = $state<string | null>(null);
	let editId = $state<string | null>(null);
	let selecting = $state(false);
	let selectedIds = $state<string[]>([]);
	let forwardIds = $state<string[]>([]);
	let forwardOpen = $state(false);
	// Suhbat ichida qidirish: mos xabarlar belgilanadi, strelkalar bilan oldinga-orqaga o'tiladi.
	let searchOpen = $state(false);
	let searchQuery = $state('');
	let searchIdx = $state(0);
	let searchEl = $state<HTMLInputElement>();
	const matchText = (m: Message) => `${m.content} ${m.file?.name ?? ''} ${m.poll?.question ?? ''}`.toLowerCase();
	const matches = $derived.by(() => {
		const q = searchQuery.trim().toLowerCase();
		return searchOpen && q ? chatMessages.filter((m) => matchText(m).includes(q)).map((m) => m.id) : [];
	});
	const currentMatch = $derived(matches.length ? matches[Math.min(searchIdx, matches.length - 1)] : undefined);

	function openSearch() {
		searchOpen = true;
		queueMicrotask(() => searchEl?.focus());
	}
	function closeSearch() {
		searchOpen = false;
		searchQuery = '';
	}
	// Eng yangi moslikdan boshlanadi; "yuqoriga" = eskiroq, "pastga" = yangiroq.
	function stepSearch(dir: 1 | -1) {
		if (!matches.length) return;
		searchIdx = (Math.min(searchIdx, matches.length - 1) + dir + matches.length) % matches.length;
		jumpTo(matches[searchIdx]);
	}
	$effect(() => {
		searchQuery;
		const last = matches.length - 1;
		untrack(() => {
			searchIdx = Math.max(0, last);
			if (last >= 0) queueMicrotask(() => jumpTo(matches[last]));
		});
	});

	let deleteIds = $state<string[]>([]);
	let deleteOpen = $state(false);

	const replyMessage = $derived(replyId ? chatMessages.find((m) => m.id === replyId) : undefined);
	const pinned = $derived(chat ? data.getPinnedMessages(chat.id) : []);
	let pinIdx = $state(0);
	const pinShown = $derived(pinned[Math.min(pinIdx, pinned.length - 1)]);
	const selectedMine = $derived(selectedIds.length > 0 && selectedIds.every((id) => chatMessages.find((m) => m.id === id)?.senderId === session.user.id));

	const nameOf = (m: Message) => data.getUser(m.senderId)?.name ?? "Noma'lum";
	const preview = (m: Message) => m.content || (m.sticker ? `${m.sticker} Stiker` : m.imageUrl ? (/\.gif($|\?)/i.test(m.imageUrl) ? 'GIF' : 'Rasm') : m.file ? m.file.name : m.audio ? 'Ovozli xabar' : m.video ? 'Video xabar' : m.poll ? "So'rovnoma" : 'Xabar');

	function jumpTo(id: string) {
		const el = document.getElementById(`msg-${id}`);
		el?.scrollIntoView({ block: 'center', behavior: 'smooth' });
		el?.animate([{ backgroundColor: 'rgb(99 102 241 / 0.18)' }, { backgroundColor: 'transparent' }], { duration: 1200 });
	}

	async function copyText(text: string) {
		try {
			await navigator.clipboard.writeText(text);
			toastStore.show('Nusxalandi', 'success');
		} catch {
			toastStore.show('Nusxalab bo‘lmadi', 'error');
		}
	}

	function cancelCompose() {
		replyId = null;
		if (editId) draft = '';
		editId = null;
	}

	function onMenuAction(a: MenuAction) {
		const m = menuMessage;
		menu = null;
		if (!m) return;
		if (a === 'reply') {
			editId = null;
			replyId = m.id;
			draftEl?.focus();
		} else if (a === 'edit') {
			replyId = null;
			editId = m.id;
			draft = m.content;
			pendingFile = null;
			draftEl?.focus();
		} else if (a === 'copy') void copyText(m.content);
		else if (a === 'pin') {
			data.toggleMessagePin(m.id);
			toastStore.show(m.pinnedAt ? 'Xabar qadaldi' : 'Qadash olib tashlandi', 'success');
		} else if (a === 'forward') {
			forwardIds = [m.id];
			forwardOpen = true;
		} else if (a === 'select') {
			selecting = true;
			selectedIds = [m.id];
		} else if (a === 'delete') {
			deleteIds = [m.id];
			deleteOpen = true;
		}
	}

	function toggleSelect(id: string) {
		selectedIds = selectedIds.includes(id) ? selectedIds.filter((x) => x !== id) : [...selectedIds, id];
		if (!selectedIds.length) selecting = false;
	}
	function endSelect() {
		selecting = false;
		selectedIds = [];
	}
	function copySelected() {
		const text = chatMessages.filter((m) => selectedIds.includes(m.id) && m.content).map((m) => m.content).join('\n');
		if (text) void copyText(text);
		else toastStore.show('Tanlanganlarda matn yo‘q', 'info');
	}

	function onWindowKey(e: KeyboardEvent) {
		if (e.key !== 'Escape' || menu || forwardOpen || deleteOpen) return;
		if (selecting) endSelect();
		else if (replyId || editId) cancelCompose();
	}

	function send() {
		const trimmed = draft.trim();
		if (editId) {
			if (trimmed) data.editMessage(editId, trimmed);
			cancelCompose();
			return;
		}
		if ((!trimmed && !pendingFile) || !chat) return;
		data.sendMessage(chat.id, trimmed, undefined, { file: pendingFile ?? undefined, replyToId: replyId ?? undefined });
		draft = '';
		pendingFile = null;
		replyId = null;
	}
</script>

<!-- Capture: qidiruv ochiqligida Esc faqat qidiruvni yopadi (layout'dagi "orqaga" Esc'i ishlamasin) -->
<svelte:window
	onkeydowncapture={(e) => {
		if (e.key === 'Escape' && searchOpen && !menu && !forwardOpen && !deleteOpen) {
			e.preventDefault();
			closeSearch();
		}
	}}
	onkeydown={onWindowKey}
/>

<svelte:head>
	<title>{title || 'Suhbat'} / graduss</title>
</svelte:head>

{#if chat}
	{#if recKind === 'video'}
		<VideoRecorder bind:this={videoRef} {cancelling} onsend={sendVideo} onfail={() => (recKind = null)} />
	{/if}
	<PollDialog bind:open={pollOpen} onsubmit={sendPoll} />
	{#if otherUser}
		<CallDialog bind:open={callOpen} kind={callKind} name={otherUser.name} color={otherUser.avatar} />
	{/if}
	<div class="flex h-full flex-col">
		{#if selecting}
			<header class="sticky top-0 z-10 flex min-h-[61px] sm:min-h-14 items-center gap-1 border-b border-neutral-200 px-3 py-2 dark:border-neutral-800 glass">
				<button onclick={endSelect} aria-label="Tanlashni bekor qilish" class="rounded-full p-2 hover:bg-neutral-100 dark:hover:bg-neutral-900"><X class="size-5" /></button>
				<h1 class="min-w-0 flex-1 truncate font-bold">{selectedIds.length} ta tanlandi</h1>
				<button onclick={copySelected} aria-label="Matnni nusxalash" class="rounded-full p-2 text-neutral-600 hover:bg-neutral-100 dark:text-neutral-300 dark:hover:bg-neutral-900"><Copy class="size-5" /></button>
				<button onclick={() => { forwardIds = [...selectedIds]; forwardOpen = true; }} aria-label="Uzatish" class="rounded-full p-2 text-neutral-600 hover:bg-neutral-100 dark:text-neutral-300 dark:hover:bg-neutral-900"><Forward class="size-5" /></button>
				{#if selectedMine}
					<button onclick={() => { deleteIds = [...selectedIds]; deleteOpen = true; }} aria-label="O'chirish" class="rounded-full p-2 text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-500/10"><Trash2 class="size-5" /></button>
				{/if}
			</header>
		{:else}
		<header
			class="sticky top-0 z-10 flex min-h-[61px] sm:min-h-14 items-center gap-3 border-b border-neutral-200 px-4 py-2 dark:border-neutral-800 glass"
		>
			<button onclick={() => goto('/chats')} class="rounded-full p-2 hover:bg-neutral-100 sm:hidden dark:hover:bg-neutral-900" aria-label="Orqaga">
				<ArrowLeft class="size-5" />
			</button>
			{#if chat.isGroup}
				<span class="flex size-9 items-center justify-center rounded-full bg-neutral-700 text-white dark:bg-neutral-800">
					<Users class="size-5" />
				</span>
			{:else if otherUser}
				<Avatar name={otherUser.name} color={otherUser.avatar} size="sm" />
			{/if}
			<h1 class="min-w-0 flex-1 truncate font-bold">{title}</h1>
			<button onclick={openSearch} aria-label="Suhbatda qidirish" aria-pressed={searchOpen} class="rounded-full p-2 text-neutral-500 hover:bg-neutral-100 dark:text-neutral-400 dark:hover:bg-neutral-900">
				<Search class="size-5" />
			</button>
			{#if !chat.isGroup && otherUser}
				<button onclick={() => { callKind = 'voice'; callOpen = true; }} aria-label="Ovozli qo'ng'iroq" class="rounded-full p-2 text-neutral-500 hover:bg-neutral-100 dark:text-neutral-400 dark:hover:bg-neutral-900">
					<Phone class="size-5" />
				</button>
				<button onclick={() => { callKind = 'video'; callOpen = true; }} aria-label="Video qo'ng'iroq" class="rounded-full p-2 text-neutral-500 hover:bg-neutral-100 dark:text-neutral-400 dark:hover:bg-neutral-900">
					<Video class="size-5" />
				</button>
			{/if}
			{#if chat.isGroup}
				<div class="relative">
					<button
						onclick={() => (menuOpen = !menuOpen)}
						aria-label="Ko'proq"
						class="rounded-full p-2 text-neutral-500 hover:bg-neutral-100 dark:text-neutral-400 dark:hover:bg-neutral-900"
					>
						<Ellipsis class="size-5" />
					</button>
					{#if menuOpen}
						<button aria-label="Yopish" onclick={() => (menuOpen = false)} class="fixed inset-0 z-20 cursor-default"
						></button>
						<div
							transition:scale={{ duration: 130, start: 0.95, easing: cubicOut }}
							style="transform-origin: top right"
							class="absolute right-0 top-full z-30 mt-1 w-56 overflow-hidden rounded-xl border border-neutral-200 bg-white py-1 shadow-[var(--shadow-pop)] dark:border-neutral-800 dark:bg-neutral-900"
						>
							<button
								onclick={() => {
									membersOpen = true;
									menuOpen = false;
								}}
								class="flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm text-neutral-800 hover:bg-neutral-50 dark:text-neutral-200 dark:hover:bg-neutral-800"
							>
								<Users class="size-4" />
								A'zolarni ko'rish
							</button>
							<button
								onclick={() => {
									confirmLeaveOpen = true;
									menuOpen = false;
								}}
								class="flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-500/10"
							>
								<LogOut class="size-4" />
								Guruhdan chiqish
							</button>
						</div>
					{/if}
				</div>
			{/if}
		</header>
		{/if}

		{#if searchOpen}
			<div class="flex items-center gap-1 border-b border-neutral-200 bg-white/80 px-3 py-1.5 dark:border-neutral-800 dark:bg-neutral-950/80">
				<Search class="ml-1 size-4 shrink-0 text-neutral-400" />
				<input
					bind:this={searchEl}
					bind:value={searchQuery}
					type="search"
					placeholder="Xabarlarda qidirish"
					aria-label="Xabarlarda qidirish"
					onkeydown={(e) => {
						if (e.key === 'Enter') {
							e.preventDefault();
							stepSearch(e.shiftKey ? 1 : -1);
						}
					}}
					class="min-w-0 flex-1 bg-transparent px-2 py-1.5 text-base outline-none placeholder:text-neutral-400 sm:text-sm"
				/>
				{#if searchQuery.trim()}
					<span class="shrink-0 text-xs tabular-nums text-neutral-500" aria-live="polite">{matches.length ? `${Math.min(searchIdx, matches.length - 1) + 1}/${matches.length}` : 'Topilmadi'}</span>
				{/if}
				<button type="button" onclick={() => stepSearch(-1)} disabled={!matches.length} aria-label="Oldingi (eskiroq) xabar" class="shrink-0 rounded-full p-2.5 text-neutral-500 hover:bg-neutral-100 disabled:opacity-40 dark:hover:bg-neutral-900"><ChevronUp class="size-4" /></button>
				<button type="button" onclick={() => stepSearch(1)} disabled={!matches.length} aria-label="Keyingi (yangiroq) xabar" class="shrink-0 rounded-full p-2.5 text-neutral-500 hover:bg-neutral-100 disabled:opacity-40 dark:hover:bg-neutral-900"><ChevronDown class="size-4" /></button>
				<button type="button" onclick={closeSearch} aria-label="Qidiruvni yopish" class="shrink-0 rounded-full p-2.5 text-neutral-500 hover:bg-neutral-100 dark:hover:bg-neutral-900"><X class="size-4" /></button>
			</div>
		{/if}

		{#if pinShown}
			<div class="flex items-center gap-1 border-b border-neutral-200 bg-white/80 px-3 py-1.5 text-sm dark:border-neutral-800 dark:bg-neutral-950/80">
				<button type="button" onclick={() => { jumpTo(pinShown.id); if (pinned.length > 1) pinIdx = (pinIdx + 1) % pinned.length; }} aria-label="Qadalgan xabarga o'tish" class="flex min-w-0 flex-1 items-center gap-2 rounded-lg px-1 py-1 text-left hover:bg-neutral-100 dark:hover:bg-neutral-900">
					<Pin class="size-4 shrink-0 text-brand-600" />
					<span class="min-w-0">
						<span class="block text-xs font-semibold text-brand-600">Qadalgan xabar{pinned.length > 1 ? ` (${Math.min(pinIdx, pinned.length - 1) + 1}/${pinned.length})` : ''}</span>
						<span class="block truncate">{preview(pinShown)}</span>
					</span>
				</button>
				<button type="button" onclick={() => data.toggleMessagePin(pinShown.id)} aria-label="Qadashni olib tashlash" class="shrink-0 rounded-full p-2 text-neutral-500 hover:bg-neutral-100 dark:hover:bg-neutral-900"><X class="size-4" /></button>
			</div>
		{/if}

		<div bind:this={scrollEl} class="flex-1 space-y-1 overflow-y-auto overscroll-contain px-4 py-4">
			{#each chatMessages as message, i (message.id)}
				<MessageBubble
					{message}
					mine={message.senderId === session.user.id}
					showSender={chat.isGroup}
					first={chatMessages[i - 1]?.senderId !== message.senderId}
					last={chatMessages[i + 1]?.senderId !== message.senderId}
					{selecting}
					match={currentMatch === message.id ? 'current' : matches.includes(message.id) ? 'other' : undefined}
					selected={selectedIds.includes(message.id)}
					oncontext={(x, y) => (menu = { id: message.id, x, y })}
					ontoggle={() => toggleSelect(message.id)}
				/>
			{:else}
				<div class="flex h-full items-center justify-center">
					<EmptyState icon={MessageCircle} title="Hali xabar yo'q" description="Birinchi xabarni yuboring." />
				</div>
			{/each}
		</div>

		<form
			class="border-t border-neutral-200 px-3 pt-3 pb-[max(0.75rem,var(--safe-b))] dark:border-neutral-800"
			onsubmit={(e) => {
				e.preventDefault();
				send();
			}}
		>
			{#if replyMessage || editId}
				{@const target = replyMessage ?? chatMessages.find((m) => m.id === editId)}
				<div class="mb-2 flex items-center gap-2 rounded-xl bg-neutral-100 py-1.5 pl-3 pr-1 dark:bg-neutral-900">
					{#if editId}<Pencil class="size-4 shrink-0 text-brand-600" />{:else}<Reply class="size-4 shrink-0 text-brand-600" />{/if}
					<div class="min-w-0 flex-1 border-l-2 border-brand-600 pl-2 text-xs">
						<span class="block truncate font-semibold text-brand-600">{editId ? 'Tahrirlash' : target ? nameOf(target) : 'Javob'}</span>
						<span class="block truncate text-neutral-600 dark:text-neutral-400">{target ? preview(target) : ''}</span>
					</div>
					<button type="button" onclick={cancelCompose} aria-label="Bekor qilish" class="shrink-0 rounded-full p-2 hover:bg-neutral-200 dark:hover:bg-neutral-800"><X class="size-4" /></button>
				</div>
			{/if}
			{#if pendingFile}
				<div class="mb-2 flex items-center gap-2 text-sm">
					<span class="min-w-0 truncate rounded-full bg-neutral-100 px-3 py-1.5 dark:bg-neutral-800">{pendingFile.name}</span>
					<button type="button" onclick={() => (pendingFile = null)} aria-label="Faylni olib tashlash" class="shrink-0 rounded-full p-1.5 hover:bg-neutral-100 dark:hover:bg-neutral-800"><X class="size-4" /></button>
				</div>
			{/if}
			<div class="flex items-end gap-2">
				{#if recKind === 'voice'}
					<VoiceRecorder bind:this={voiceRef} {cancelling} onsend={sendVoice} onfail={() => (recKind = null)} />
				{:else}
				{#if !API_ON}
					<input bind:this={fileEl} type="file" accept="image/*" multiple class="sr-only" tabindex="-1" aria-label="Rasm tanlash" onchange={pickImage} />
					<input bind:this={docEl} type="file" class="sr-only" tabindex="-1" aria-label="Fayl tanlash" onchange={pickDoc} />
					<AttachMenu onmedia={() => fileEl?.click()} onfile={() => docEl?.click()} onpoll={() => (pollOpen = true)} />
				{/if}
				<div class="relative min-w-0 flex-1">
				<textarea
					bind:this={draftEl}
					use:autogrow
					bind:value={draft}
					onkeydown={(e) => enterToSend(e, send)}
					rows="1"
					placeholder="Xabar yozing"
					aria-label="Xabar yozing"
					class="block max-h-32 min-h-10 w-full resize-none overflow-y-auto rounded-2xl bg-neutral-100 py-2.5 pl-4 pr-11 text-base leading-snug outline-none placeholder:text-neutral-500 focus:ring-1 focus:ring-brand-500 dark:bg-neutral-900 dark:placeholder:text-neutral-500"
				></textarea>
				<EmojiButton class="absolute bottom-0.5 right-1" onpick={(e) => (draft = insertAtCaret(draftEl, draft, e))} onsticker={sendSticker} ongif={sendGif} />
				</div>
				{/if}
				{#if showMic}
					<button
						type="button"
						onpointerdown={micDown}
						onpointermove={micMove}
						onpointerup={micUp}
						onpointercancel={micAbort}
						oncontextmenu={(e) => e.preventDefault()}
						onclick={(e) => e.detail === 0 && (micMode = micMode === 'voice' ? 'video' : 'voice')}
						aria-label={micMode === 'voice' ? 'Ovozli xabar' : 'Video xabar'}
						title="Bosing: ovoz/video almashadi. Bosib turing: yozish, qo'yib yuboring: yuborish"
						class="flex size-10 shrink-0 touch-none select-none items-center justify-center rounded-full bg-brand-600 text-white transition-transform [-webkit-touch-callout:none] {recKind ? 'scale-125 bg-rose-600' : 'active:scale-95'}"
					>
						{#if micMode === 'voice'}<Mic class="size-5" />{:else}<Video class="size-5" />{/if}
					</button>
				{:else}
				<Button type="submit" size="icon" disabled={!draft.trim() && !pendingFile} aria-label="Yuborish">
					<Send class="size-4" />
				</Button>
				{/if}
			</div>
		</form>
	</div>

	{#if menu && menuMessage}
		<MessageContextMenu message={menuMessage} mine={menuMessage.senderId === session.user.id} x={menu.x} y={menu.y} onAction={onMenuAction} onClose={() => (menu = null)} />
	{/if}
	<MediaSendDialog bind:open={mediaOpen} files={mediaFiles} caption={draft} onsend={sendMedia} />
	<ForwardDialog bind:open={forwardOpen} messageIds={forwardIds} onDone={endSelect} />
	<ConfirmDialog
		bind:open={deleteOpen}
		title={deleteIds.length > 1 ? `${deleteIds.length} ta xabarni o'chirish` : "Xabarni o'chirish"}
		message={deleteIds.length > 1 ? "Tanlangan xabarlarni o'chirmoqchimisiz? Bu amalni ortga qaytarib bo'lmaydi." : "Bu xabarni o'chirmoqchimisiz? Bu amalni ortga qaytarib bo'lmaydi."}
		confirmLabel="O'chirish"
		danger
		onConfirm={() => {
			data.deleteMessages(deleteIds);
			if (replyId && deleteIds.includes(replyId)) replyId = null;
			if (editId && deleteIds.includes(editId)) cancelCompose();
			endSelect();
		}}
	/>

	{#if chat.isGroup}
		<Modal bind:open={membersOpen} onClose={() => (membersOpen = false)}>
			<div class="flex items-center justify-between border-b border-neutral-100 px-5 py-4 dark:border-neutral-800">
				<h2 class="text-lg font-bold text-neutral-900 dark:text-neutral-100">A'zolar ({participants.length})</h2>
				<button
					onclick={() => (membersOpen = false)}
					aria-label="Yopish"
					class="rounded-full p-1.5 text-neutral-500 hover:bg-neutral-100 dark:text-neutral-400 dark:hover:bg-neutral-800"
				>
					<X class="size-4.5" />
				</button>
			</div>
			<div class="overflow-y-auto py-1">
				{#each participants as member (member.id)}
					<a
						href={`/profile/${member.username}`}
						onclick={() => (membersOpen = false)}
						class="flex items-center gap-3 px-5 py-2.5 text-left transition-colors hover:bg-neutral-50 dark:hover:bg-neutral-800"
					>
						<Avatar name={member.name} color={member.avatar} size="sm" />
						<div class="min-w-0 flex-1">
							<div class="flex items-center gap-1.5">
								<span class="truncate font-medium text-neutral-800 dark:text-neutral-200">{member.name}</span>
								<Badge sector={member.sector} />
							</div>
							<p class="truncate text-xs text-neutral-500 dark:text-neutral-400">@{member.username}</p>
						</div>
					</a>
				{/each}
			</div>
		</Modal>

		<ConfirmDialog
			bind:open={confirmLeaveOpen}
			title="Guruhdan chiqish"
			message={`"${title}" guruhidan chiqmoqchimisiz? Suhbat tarixi ro'yxatingizdan yo'qoladi.`}
			confirmLabel="Chiqish"
			danger
			onConfirm={confirmLeave}
		/>
	{/if}
{:else}
	<EmptyState icon={CircleAlert} title="Suhbat topilmadi" />
{/if}
