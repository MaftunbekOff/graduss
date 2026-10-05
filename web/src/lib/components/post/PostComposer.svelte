<script lang="ts">
	import { session } from '$lib/stores/session.svelte';
	import { data } from '$lib/stores/data.svelte';
	import { toastStore } from '$lib/stores/toast.svelte';
	import Avatar from '$lib/components/ui/Avatar.svelte';
	import SuggestTextarea from '$lib/components/ui/SuggestTextarea.svelte';
	import Button from '$lib/components/ui/Button.svelte';
	import Image from '@lucide/svelte/icons/image';
	import Video from '@lucide/svelte/icons/video';
	import BarChart2 from '@lucide/svelte/icons/bar-chart-2';
	import Mic from '@lucide/svelte/icons/mic';
	import { API_ON } from '$lib/api';
	import Square from '@lucide/svelte/icons/square';
	import X from '@lucide/svelte/icons/x';
	import Plus from '@lucide/svelte/icons/plus';
	import CalendarClock from '@lucide/svelte/icons/calendar-clock';
	import ScheduledDialog from '$lib/components/post/ScheduledDialog.svelte';
	import { toLocalInput, formatDateTime } from '$lib/utils';

	const MAX = 1000;

	let {
		channelId,
		placeholder = 'Nima gapirmoqchisiz?',
		onPosted,
		defaultCategoryId
	}: { channelId?: string; placeholder?: string; onPosted?: () => void; defaultCategoryId?: string } = $props();

	// Faqat kanal egasi o'z kategoriyalaridan birini tanlay oladi.
	const channelCategories = $derived(
		channelId && data.getChannel(channelId)?.ownerId === session.user.id ? (data.getChannel(channelId)?.categories ?? []) : []
	);
	let categoryId = $state<string>('');
	$effect(() => {
		categoryId = defaultCategoryId ?? '';
	});

	let content = $state(data.getDraft());
	let mediaUrl = $state('');
	let showImageInput = $state(false);
	let videoUrl = $state('');
	let showVideoInput = $state(false);

	// Voice State
	let isRecording = $state(false);
	let recordSeconds = $state(0);
	let recordTimer: any = null;
	let hasAudioAttached = $state(false);
	let audioDuration = $state(0);

	// Rejalashtirish / qoralama (faqat demo rejim: backend hali yo'q)
	let scheduleOpen = $state(false);
	let scheduleValue = $state('');
	let plansOpen = $state(false);
	const unpublished = $derived(API_ON ? [] : data.getUnpublished(channelId));
	const scheduleAt = $derived(scheduleOpen && scheduleValue ? new Date(scheduleValue) : null);
	const scheduleValid = $derived(!!scheduleAt && !Number.isNaN(scheduleAt.getTime()) && scheduleAt.getTime() > Date.now());
	function toggleSchedule() {
		scheduleOpen = !scheduleOpen;
		if (scheduleOpen && !scheduleValue) scheduleValue = toLocalInput(new Date(Date.now() + 3_600_000));
	}

	// Poll State
	let showPollBuilder = $state(false);
	let pollQuestion = $state('');
	let pollOptions = $state(['', '']);

	$effect(() => {
		data.saveDraft(content);
	});

	const remaining = $derived(MAX - content.length);
	const overLimit = $derived(remaining < 0);
	const hasPoll = $derived(
		showPollBuilder &&
			pollQuestion.trim().length > 0 &&
			pollOptions.filter((o) => o.trim().length > 0).length >= 2
	);

	const canSubmit = $derived(
		(content.trim().length > 0 || mediaUrl.trim().length > 0 || videoUrl.trim().length > 0 || hasPoll || hasAudioAttached) && !overLimit
	);

	const SAMPLE_IMAGES = [
		'https://images.unsplash.com/photo-1580582932707-520aed937b7b?auto=format&fit=crop&w=1000&q=80',
		'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&w=1000&q=80',
		'https://images.unsplash.com/photo-1509391365360-2e959784a276?auto=format&fit=crop&w=1000&q=80',
		'https://images.unsplash.com/photo-1579783902614-a3fb3927b675?auto=format&fit=crop&w=1000&q=80'
	];

	// Namunaviy roliklar (demo): o'z serverimizda.
	const SAMPLE_VIDEOS = ['/demo/clip-1.webm', '/demo/clip-2.webm', '/demo/clip-3.webm'];

	// Bitta postga rasm YOKI video biriktiriladi.
	function toggleImage() {
		showImageInput = !showImageInput;
		if (showImageInput) {
			showVideoInput = false;
			videoUrl = '';
		}
	}
	function toggleVideo() {
		showVideoInput = !showVideoInput;
		if (showVideoInput) {
			showImageInput = false;
			mediaUrl = '';
		}
	}

	function startRecording() {
		isRecording = true;
		recordSeconds = 0;
		if (recordTimer) clearInterval(recordTimer);
		recordTimer = setInterval(() => {
			recordSeconds++;
		}, 1000);
	}

	function stopRecording() {
		isRecording = false;
		if (recordTimer) clearInterval(recordTimer);
		if (recordSeconds >= 1) {
			hasAudioAttached = true;
			audioDuration = recordSeconds;
			toastStore.show(`Ovozli xabar yozildi (${recordSeconds}s) 🎙️`, "success");
		}
	}

	function cancelAudio() {
		hasAudioAttached = false;
		audioDuration = 0;
	}

	function addPollOption() {
		if (pollOptions.length < 4) {
			pollOptions = [...pollOptions, ''];
		}
	}

	function removePollOption(index: number) {
		if (pollOptions.length > 2) {
			pollOptions = pollOptions.filter((_, i) => i !== index);
		}
	}

	function submit(mode: 'publish' | 'draft' = 'publish') {
		if (!canSubmit) return;
		const scheduled = mode === 'publish' && scheduleOpen && scheduleValid ? scheduleAt!.toISOString() : undefined;
		if (mode === 'publish' && scheduleOpen && !scheduled) return;

		let pollData = undefined;
		if (showPollBuilder && hasPoll) {
			pollData = {
				id: `poll_${Date.now()}`,
				question: pollQuestion.trim(),
				options: pollOptions
					.filter((o) => o.trim().length > 0)
					.map((optText, idx) => ({
						id: `opt_${Date.now()}_${idx}`,
						text: optText.trim(),
						votes: []
					}))
			};
		}

		data.createPost(
			content.trim(),
			channelId,
			mediaUrl.trim() || undefined,
			pollData,
			hasAudioAttached ? 'sample_voice.mp3' : undefined,
			hasAudioAttached ? audioDuration : undefined,
			videoUrl.trim() || undefined,
			categoryId || undefined,
			scheduled || mode === 'draft' ? { scheduledAt: scheduled, isDraft: mode === 'draft' } : undefined
		);
		toastStore.show(mode === 'draft' ? 'Qoralamaga saqlandi' : scheduled ? `Post ${formatDateTime(scheduled)} da chop etiladi` : 'Postingiz chop etildi! 🚀', 'success');

		content = '';
		mediaUrl = '';
		showImageInput = false;
		videoUrl = '';
		showVideoInput = false;
		showPollBuilder = false;
		scheduleOpen = false;
		scheduleValue = '';
		categoryId = defaultCategoryId ?? '';
		hasAudioAttached = false;
		audioDuration = 0;
		pollQuestion = '';
		pollOptions = ['', ''];
		data.clearDraft();
		onPosted?.();
	}
</script>

<div class="flex gap-3 border-b border-neutral-200 px-4 py-4 dark:border-neutral-800">
	<Avatar name={session.user.name} color={session.user.avatar} />
	<div class="min-w-0 flex-1">
		<SuggestTextarea
			bind:value={content}
			rows={2}
			{placeholder}
			aria-label="Post matni"
			class="w-full resize-none border-none bg-transparent text-lg leading-snug outline-none placeholder:text-neutral-400 dark:placeholder:text-neutral-600"
		/>

		<!-- Voice Recorder Widget -->
		{#if isRecording}
			<div class="mb-3 flex items-center justify-between rounded-2xl border border-rose-300 bg-rose-50/80 p-3 text-rose-700 dark:border-rose-900/50 dark:bg-rose-950/40 dark:text-rose-300">
				<div class="flex items-center gap-2">
					<div class="size-3 animate-ping rounded-full bg-rose-600"></div>
					<span class="text-xs font-bold uppercase tracking-wider">Ovoz yozilmoqda...</span>
					<span class="font-mono text-sm font-bold">{recordSeconds}s</span>
				</div>
				<Button size="sm" variant="danger" onclick={stopRecording}>
					<Square class="mr-1 size-3.5 fill-current" />
					To me-xtatish
				</Button>
			</div>
		{:else if hasAudioAttached}
			<div class="mb-3 flex items-center justify-between rounded-2xl border border-brand-200 bg-brand-50/60 p-3 text-brand-800 dark:border-brand-900/50 dark:bg-brand-950/40 dark:text-brand-300">
				<div class="flex items-center gap-2">
					<Mic class="size-4 text-brand-600 dark:text-brand-400" />
					<span class="text-xs font-bold">Ovozli xabar biriktirildi ({audioDuration} soniya)</span>
				</div>
				<button onclick={cancelAudio} class="text-neutral-400 hover:text-rose-500">
					<X class="size-4" />
				</button>
			</div>
		{/if}

		<!-- Image Attachment Input & Preview -->
		{#if showImageInput}
			<div class="mb-3 rounded-2xl border border-neutral-200 bg-neutral-50/80 p-3 dark:border-neutral-800 dark:bg-neutral-900/50">
				<div class="flex items-center justify-between gap-2">
					<label for="composer-image-url" class="text-xs font-semibold text-neutral-600 dark:text-neutral-400">Rasm havola (URL) yoki namunani tanlang:</label>
					<button onclick={() => { showImageInput = false; mediaUrl = ''; }} class="text-neutral-400 hover:text-neutral-600">
						<X class="size-4" />
					</button>
				</div>
				<input
					id="composer-image-url"
					type="url"
					bind:value={mediaUrl}
					placeholder="https://..."
					class="mt-1.5 w-full rounded-xl border border-neutral-300 bg-white px-3 py-1.5 text-sm outline-none focus:border-brand-500 dark:border-neutral-700 dark:bg-neutral-800"
				/>

				<!-- Preset Quick Sample Images -->
				<div class="mt-2 flex gap-2 overflow-x-auto pb-1">
					{#each SAMPLE_IMAGES as sampleImg}
						<button
							type="button"
							onclick={() => (mediaUrl = sampleImg)}
							class="size-12 shrink-0 overflow-hidden rounded-lg border-2 transition-transform hover:scale-105 {mediaUrl === sampleImg ? 'border-brand-500' : 'border-transparent'}"
						>
							<img src={sampleImg} alt="Sample" loading="lazy" decoding="async" class="h-full w-full object-cover" />
						</button>
					{/each}
				</div>

				{#if mediaUrl}
					<div class="relative mt-2 max-h-48 overflow-hidden rounded-xl">
						<img src={mediaUrl} alt="Attached media" class="w-full object-cover" />
					</div>
				{/if}
			</div>
		{/if}

		<!-- Video biriktirish -->
		{#if showVideoInput}
			<div class="mb-3 rounded-2xl border border-neutral-200 bg-neutral-50/80 p-3 dark:border-neutral-800 dark:bg-neutral-900/50">
				<div class="flex items-center justify-between gap-2">
					<label for="composer-video-url" class="text-xs font-semibold text-neutral-600 dark:text-neutral-400">Video havola (mp4/webm) yoki namunani tanlang:</label>
					<button type="button" aria-label="Yopish" onclick={() => { showVideoInput = false; videoUrl = ''; }} class="text-neutral-400 hover:text-neutral-600">
						<X class="size-4" />
					</button>
				</div>
				<input
					id="composer-video-url"
					type="url"
					bind:value={videoUrl}
					placeholder="https://..."
					class="mt-1.5 w-full rounded-xl border border-neutral-300 bg-white px-3 py-1.5 text-sm outline-none focus:border-brand-500 dark:border-neutral-700 dark:bg-neutral-800"
				/>
				<div class="mt-2 flex gap-2">
					{#each SAMPLE_VIDEOS as clip, i (clip)}
						<button
							type="button"
							onclick={() => (videoUrl = clip)}
							class="rounded-lg border-2 px-3 py-1.5 text-xs font-semibold transition-colors {videoUrl === clip ? 'border-brand-500 bg-brand-50 text-brand-700 dark:bg-brand-400/10 dark:text-brand-300' : 'border-neutral-200 text-neutral-600 dark:border-neutral-700 dark:text-neutral-300'}"
						>
							Namuna {i + 1}
						</button>
					{/each}
				</div>
				{#if videoUrl}
					<!-- svelte-ignore a11y_media_has_caption -->
					<video src={videoUrl} controls preload="metadata" playsinline class="mt-2 max-h-48 w-full rounded-xl bg-black"></video>
				{/if}
			</div>
		{/if}

		<!-- Poll Builder Widget -->
		{#if showPollBuilder}
			<div class="mb-3 rounded-2xl border border-brand-200 bg-brand-50/30 p-3.5 dark:border-brand-900/50 dark:bg-brand-950/20">
				<div class="flex items-center justify-between">
					<span class="flex items-center gap-1.5 text-xs font-bold text-brand-700 dark:text-brand-300">
						<BarChart2 class="size-4" />
						So'rovnoma (Poll) yaratish
					</span>
					<button onclick={() => (showPollBuilder = false)} class="text-neutral-400 hover:text-neutral-600">
						<X class="size-4" />
					</button>
				</div>

				<input
					type="text"
					bind:value={pollQuestion}
					placeholder="Savolni kiriting..."
					class="mt-2 w-full rounded-xl border border-neutral-300 bg-white px-3 py-2 text-sm font-semibold outline-none focus:border-brand-500 dark:border-neutral-700 dark:bg-neutral-900"
				/>

				<div class="mt-2 flex flex-col gap-2">
					{#each pollOptions as opt, idx}
						<div class="flex items-center gap-2">
							<input
								type="text"
								bind:value={pollOptions[idx]}
								placeholder="{idx + 1}-variant"
								class="flex-1 rounded-lg border border-neutral-300 bg-white px-3 py-1.5 text-xs outline-none focus:border-brand-500 dark:border-neutral-700 dark:bg-neutral-900"
							/>
							{#if pollOptions.length > 2}
								<button type="button" onclick={() => removePollOption(idx)} class="text-neutral-400 hover:text-rose-500">
									<X class="size-3.5" />
								</button>
							{/if}
						</div>
					{/each}
				</div>

				{#if pollOptions.length < 4}
					<button
						type="button"
						onclick={addPollOption}
						class="mt-2 flex items-center gap-1 text-xs font-semibold text-brand-600 hover:underline dark:text-brand-400"
					>
						<Plus class="size-3.5" />
						Variant qo'shish
					</button>
				{/if}
			</div>
		{/if}

		{#if scheduleOpen}
			<div class="mb-3 flex flex-wrap items-center gap-2 rounded-2xl border border-brand-200 bg-brand-50/30 p-3 dark:border-brand-900/50 dark:bg-brand-950/20">
				<label for="composer-schedule" class="flex items-center gap-1.5 text-xs font-bold text-brand-700 dark:text-brand-300">
					<CalendarClock class="size-4" /> Chop etish vaqti
				</label>
				<input
					id="composer-schedule"
					type="datetime-local"
					bind:value={scheduleValue}
					min={toLocalInput(new Date(Date.now() + 60_000))}
					class="rounded-lg border border-neutral-300 bg-white px-2 py-1 text-sm outline-none focus:border-brand-500 dark:border-neutral-700 dark:bg-neutral-900"
				/>
				{#if !scheduleValid}<span class="text-xs text-rose-600">Vaqt kelajakda bo'lsin</span>{/if}
				<button type="button" aria-label="Rejalashtirishni bekor qilish" onclick={() => (scheduleOpen = false)} class="ml-auto rounded-full p-2.5 text-neutral-400 hover:text-neutral-600"><X class="size-4" /></button>
			</div>
		{/if}

		{#if channelCategories.length}
			<label class="mb-2 flex items-center gap-2 text-xs font-medium text-neutral-500 dark:text-neutral-400">
				Kategoriya:
				<select
					bind:value={categoryId}
					aria-label="Post kategoriyasi"
					class="min-w-0 rounded-lg border border-neutral-300 bg-transparent px-2 py-1 text-xs text-neutral-800 outline-none focus:border-brand-500 dark:border-neutral-700 dark:text-neutral-200"
				>
					<option value="">Tanlanmagan</option>
					{#each channelCategories as c (c.id)}
						<option value={c.id}>{c.name}</option>
					{/each}
				</select>
			</label>
		{/if}

		<!-- Bottom Tools Bar -->
		<div class="mt-2 flex flex-wrap items-center justify-between gap-y-2 border-t border-neutral-100 pt-2.5 dark:border-neutral-800">
			<div class="flex min-w-0 flex-wrap items-center gap-1">
				<button
					type="button"
					onclick={toggleImage}
					class="flex items-center gap-1.5 rounded-lg px-2.5 py-2.5 text-xs font-medium text-neutral-500 transition-colors hover:bg-neutral-100 dark:text-neutral-400 dark:hover:bg-neutral-800"
				>
					<Image class="size-4 text-brand-500" />
					Rasm
				</button>

				<button
					type="button"
					onclick={toggleVideo}
					class="flex items-center gap-1.5 rounded-lg px-2.5 py-2.5 text-xs font-medium text-neutral-500 transition-colors hover:bg-neutral-100 dark:text-neutral-400 dark:hover:bg-neutral-800"
				>
					<Video class="size-4 text-brand-500" />
					Video
				</button>

				<!-- Ovozli post: audio fayl saqlash hali yo'q, shuning uchun API rejimda yashirin -->
				{#if !API_ON}
					<button
						type="button"
						onclick={startRecording}
						disabled={isRecording}
						class="flex items-center gap-1.5 rounded-lg px-2.5 py-2.5 text-xs font-medium text-neutral-500 transition-colors hover:bg-neutral-100 dark:text-neutral-400 dark:hover:bg-neutral-800"
					>
						<Mic class="size-4 text-rose-500" />
						Ovoz
					</button>
				{/if}

				<button
					type="button"
					onclick={() => (showPollBuilder = !showPollBuilder)}
					class="flex items-center gap-1.5 rounded-lg px-2.5 py-2.5 text-xs font-medium text-neutral-500 transition-colors hover:bg-neutral-100 dark:text-neutral-400 dark:hover:bg-neutral-800"
				>
					<BarChart2 class="size-4 text-brand-500" />
					So'rovnoma
						</button>

						{#if !API_ON}
							<button
								type="button"
								onclick={toggleSchedule}
								aria-pressed={scheduleOpen}
								class="flex items-center gap-1.5 rounded-lg px-2.5 py-2.5 text-xs font-medium transition-colors hover:bg-neutral-100 dark:hover:bg-neutral-800 {scheduleOpen ? 'text-brand-700 dark:text-brand-300' : 'text-neutral-500 dark:text-neutral-400'}"
							>
								<CalendarClock class="size-4 text-brand-500" />
								Rejalashtirish
							</button>
						{/if}
					</div>

			<div class="ml-auto flex shrink-0 items-center gap-3">
				<span class="flex items-center gap-2 text-xs font-medium {overLimit ? 'text-rose-600' : 'text-neutral-400 dark:text-neutral-500'}">
					{#if remaining <= 100}
						<svg class="size-5 -rotate-90" viewBox="0 0 20 20">
							<circle cx="10" cy="10" r="8" fill="none" stroke="currentColor" stroke-width="2" class="text-neutral-200 dark:text-neutral-800" />
							<circle
								cx="10"
								cy="10"
								r="8"
								fill="none"
								stroke="currentColor"
								stroke-width="2"
								stroke-dasharray={2 * Math.PI * 8}
								stroke-dashoffset={2 * Math.PI * 8 * (1 - Math.min(content.length, MAX) / MAX)}
								stroke-linecap="round"
							/>
						</svg>
						{remaining}
					{/if}
				</span>
				{#if !API_ON}
					<Button size="sm" variant="ghost" disabled={!canSubmit} onclick={() => submit('draft')}>Qoralamaga</Button>
				{/if}
				<Button size="sm" disabled={!canSubmit || (scheduleOpen && !scheduleValid)} onclick={() => submit('publish')}>{scheduleOpen ? 'Rejalashtirish' : 'Chop etish'}</Button>
			</div>
		</div>
		{#if unpublished.length}
			<button type="button" onclick={() => (plansOpen = true)} class="mt-2 text-xs font-semibold text-brand-700 hover:underline dark:text-brand-400">
				Qoralama va rejalar ({unpublished.length})
			</button>
		{/if}
	</div>
	<ScheduledDialog bind:open={plansOpen} {channelId} />
</div>
