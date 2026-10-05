<script lang="ts">
	import type { ChannelEvent } from '$lib/types';
	import { data } from '$lib/stores/data.svelte';
	import { toastStore } from '$lib/stores/toast.svelte';
	import { formatDateTime } from '$lib/utils';
	import Button from '$lib/components/ui/Button.svelte';
	import ConfirmDialog from '$lib/components/ui/ConfirmDialog.svelte';
	import CalendarDays from '@lucide/svelte/icons/calendar-days';
	import BellRing from '@lucide/svelte/icons/bell-ring';
	import Bell from '@lucide/svelte/icons/bell';
	import Trash2 from '@lucide/svelte/icons/trash-2';
	import ExternalLink from '@lucide/svelte/icons/external-link';

	let { event, isOwner, canRemind }: { event: ChannelEvent; isOwner: boolean; canRemind: boolean } = $props();

	let confirmOpen = $state(false);
	const reminded = $derived(data.hasEventReminder(event.id));
	const started = $derived(new Date(event.startsAt).getTime() <= Date.now());

	function toggle() {
		data.toggleEventReminder(event.id);
		toastStore.show(reminded ? 'Eslatma o\'chirildi' : 'Boshlanishidan 1 soat oldin eslatamiz', 'success');
	}
</script>

<article class="rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm dark:border-neutral-800 dark:bg-neutral-900" aria-label={`Tadbir: ${event.title}`}>
	<div class="flex items-start gap-3">
		<span class="mt-0.5 flex size-10 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand-700 dark:bg-brand-400/10 dark:text-brand-300">
			<CalendarDays class="size-5" />
		</span>
		<div class="min-w-0 flex-1">
			<p class="text-xs font-semibold {started ? 'text-emerald-600' : 'text-brand-700 dark:text-brand-400'}">
				{started ? 'Boshlandi' : formatDateTime(event.startsAt)}
			</p>
			<h3 class="break-words font-bold leading-snug">{event.title}</h3>
			{#if event.description}
				<p class="mt-1 whitespace-pre-line break-words text-sm text-neutral-600 dark:text-neutral-400">{event.description}</p>
			{/if}
			{#if isOwner}
				<p class="mt-1 text-xs text-neutral-500">{event.reminderIds.length} kishi eslatma qo'ygan · faqat sizga ko'rinadi</p>
			{/if}
			<div class="mt-3 flex flex-wrap items-center gap-2">
				{#if event.link}
					<a
						href={event.link}
						target="_blank"
						rel="noopener noreferrer"
						class="inline-flex items-center gap-1.5 rounded-lg bg-brand-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-brand-700"
					>
						<ExternalLink class="size-4" /> Qo'shilish
					</a>
				{/if}
				{#if canRemind && !started}
					<Button size="sm" variant="outline" onclick={toggle} aria-pressed={reminded}>
						{#if reminded}<BellRing class="mr-1.5 size-4 text-brand-600" /> Eslatma qo'yilgan{:else}<Bell class="mr-1.5 size-4" /> Eslatma qo'yish{/if}
					</Button>
				{/if}
				{#if isOwner}
					<button
						type="button"
						onclick={() => (confirmOpen = true)}
						aria-label="Tadbirni o'chirish"
						class="ml-auto rounded-full p-2.5 text-neutral-400 hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-500/10"
					>
						<Trash2 class="size-4" />
					</button>
				{/if}
			</div>
		</div>
	</div>
</article>

<ConfirmDialog
	bind:open={confirmOpen}
	title="Tadbirni o'chirish"
	message={`"${event.title}" tadbiri o'chiriladi.`}
	confirmLabel="O'chirish"
	danger
	onConfirm={() => data.deleteEvent(event.id)}
/>
