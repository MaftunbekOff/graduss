<script lang="ts">
	import { data } from '$lib/stores/data.svelte';
	import { toastStore } from '$lib/stores/toast.svelte';
	import { formatDateTime, toLocalInput } from '$lib/utils';
	import Modal from '$lib/components/ui/Modal.svelte';
	import Button from '$lib/components/ui/Button.svelte';
	import CalendarClock from '@lucide/svelte/icons/calendar-clock';
	import FileEdit from '@lucide/svelte/icons/file-pen-line';
	import Trash2 from '@lucide/svelte/icons/trash-2';

	let { open = $bindable(false), channelId }: { open: boolean; channelId?: string } = $props();

	const list = $derived(data.getUnpublished(channelId));
	// Qaysi postga vaqt tanlanmoqda va tanlangan qiymat
	let planId = $state<string | null>(null);
	let planValue = $state('');
	let error = $state('');

	$effect(() => {
		if (!open) {
			planId = null;
			error = '';
		}
	});
	// Hammasi chop etilsa/o'chirilsa oyna o'zi yopiladi.
	$effect(() => {
		if (open && list.length === 0) open = false;
	});

	function startPlan(id: string) {
		planId = id;
		planValue = toLocalInput(new Date(Date.now() + 3_600_000));
		error = '';
	}

	function savePlan() {
		if (!planId) return;
		if (!planValue || !data.reschedule(planId, new Date(planValue).toISOString())) {
			error = "Vaqt kelajakda bo'lsin";
			return;
		}
		planId = null;
		toastStore.show('Post rejalashtirildi', 'success');
	}

	const excerpt = (t: string, hasMedia: boolean) => (t.trim() ? (t.length > 140 ? `${t.slice(0, 140)}…` : t) : hasMedia ? 'Media post' : 'Matnsiz post');
</script>

<Modal bind:open title="Qoralama va rejalar" maxWidth="max-w-lg">
	<p class="mb-3 text-sm text-neutral-500 dark:text-neutral-400">Bu postlar faqat sizga ko'rinadi. Rejalashtirilgani vaqti kelganda o'zi chop etiladi.</p>
	<ul class="flex flex-col gap-2">
		{#each list as p (p.id)}
			<li class="rounded-xl border border-neutral-200 p-3 dark:border-neutral-800">
				<p class="flex items-center gap-1.5 text-xs font-semibold {p.scheduledAt ? 'text-brand-700 dark:text-brand-400' : 'text-neutral-500'}">
					{#if p.scheduledAt}
						<CalendarClock class="size-3.5" /> {formatDateTime(p.scheduledAt)} da chop etiladi
					{:else}
						<FileEdit class="size-3.5" /> Qoralama
					{/if}
				</p>
				<p class="mt-1 whitespace-pre-line break-words text-sm">{excerpt(p.content, !!(p.mediaUrl || p.videoUrl || p.poll || p.audioUrl))}</p>
				{#if planId === p.id}
					<div class="mt-2 flex flex-wrap items-start gap-2">
						<div>
							<input
								type="datetime-local"
								bind:value={planValue}
								min={toLocalInput(new Date(Date.now() + 60_000))}
								aria-label="Chop etish vaqti"
								class="rounded-lg border border-neutral-300 bg-transparent px-2 py-1.5 text-sm outline-none focus:border-brand-500 dark:border-neutral-700"
							/>
							{#if error}<p class="mt-1 text-xs text-rose-600">{error}</p>{/if}
						</div>
						<Button size="sm" onclick={savePlan}>Saqlash</Button>
						<Button size="sm" variant="ghost" onclick={() => (planId = null)}>Bekor</Button>
					</div>
				{:else}
					<div class="mt-2 flex flex-wrap items-center gap-2">
						<Button size="sm" onclick={() => { data.publishNow(p.id); toastStore.show('Post chop etildi', 'success'); }}>Hozir chop etish</Button>
						<Button size="sm" variant="outline" onclick={() => startPlan(p.id)}>{p.scheduledAt ? "Vaqtni o'zgartirish" : 'Rejalashtirish'}</Button>
						{#if p.scheduledAt}
							<Button size="sm" variant="ghost" onclick={() => data.reschedule(p.id, null)}>Qoralamaga qaytarish</Button>
						{/if}
						<button
							type="button"
							onclick={() => data.deletePost(p.id)}
							aria-label="Postni o'chirish"
							class="ml-auto rounded-full p-2.5 text-neutral-400 hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-500/10"
						>
							<Trash2 class="size-4" />
						</button>
					</div>
				{/if}
			</li>
		{/each}
	</ul>
</Modal>
