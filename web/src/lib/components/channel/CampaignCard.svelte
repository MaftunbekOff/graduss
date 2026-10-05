<script lang="ts">
	import type { Campaign } from '$lib/types';
	import { data } from '$lib/stores/data.svelte';
	import { session } from '$lib/stores/session.svelte';
	import { daysLeft } from '$lib/utils';
	import Button from '$lib/components/ui/Button.svelte';
	import CampaignProgress from './CampaignProgress.svelte';
	import PledgeDialog from './PledgeDialog.svelte';
	import ChevronRight from '@lucide/svelte/icons/chevron-right';

	// Ixcham karta: eng muhimi (necha pul, necha kun, nima qilish kerak). Bosqichlar va donorlar /campaigns/[id] sahifasida.
	let { campaign, isOwner }: { campaign: Campaign; isOwner: boolean } = $props();

	const phase = $derived(data.getCampaignPhase(campaign));
	const current = $derived(data.getCurrentMilestone(campaign));
	const backerIds = $derived(data.getBackerIds(campaign));
	const isBacker = $derived(backerIds.includes(session.user.id));
	const myPledged = $derived(data.getMyPledged(campaign));
	let pledgeOpen = $state(false);

	// Holatga mos bitta qisqa xabar
	const hint = $derived.by(() => {
		if (phase === 'failed') return { tone: 'bad', text: myPledged > 0 ? "Maqsad yig'ilmadi: mablag' to'liq qaytariladi." : "Maqsad yig'ilmadi, qo'llab-quvvatlovlar qaytariladi." };
		if (phase === 'funded' && current?.status === 'voting') {
			return isBacker && !current.approvals.includes(session.user.id)
				? { tone: 'action', text: `"${current.title}" bosqichi uchun sizning ovozingiz kerak.` }
				: { tone: 'info', text: `"${current.title}": donorlar ovoz bermoqda (${current.approvals.length}/${Math.floor(backerIds.length / 2) + 1}).` };
		}
		if (phase === 'funded' && current?.status === 'locked') {
			return isOwner ? { tone: 'action', text: `"${current.title}" bosqichi hisobotini yuboring.` } : { tone: 'info', text: `Navbatdagi bosqich: ${current.title}` };
		}
		if (phase === 'funded') return { tone: 'good', text: "Barcha bosqichlar bajarildi." };
		return null;
	});
</script>

<section class="rounded-2xl border border-neutral-200 bg-white p-4 shadow-[var(--shadow-card)] dark:border-neutral-800 dark:bg-neutral-900">
	<div class="flex items-start justify-between gap-3">
		<div class="min-w-0">
			<p class="text-xs font-semibold uppercase tracking-wide text-neutral-500 dark:text-neutral-400">Kampaniya</p>
			<h3 class="text-lg font-bold leading-snug">
				<a href={`/campaigns/${campaign.id}`} class="hover:underline">{campaign.title}</a>
			</h3>
		</div>
		<span
			class="shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold {phase === 'active'
				? 'bg-brand-50 text-brand-700 dark:bg-brand-400/10 dark:text-brand-400'
				: phase === 'funded'
					? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400'
					: 'bg-rose-50 text-rose-700 dark:bg-rose-500/10 dark:text-rose-400'}"
		>
			{phase === 'active' ? `${daysLeft(campaign.deadline)} kun qoldi` : phase === 'funded' ? "Yig'ildi" : "Yig'ilmadi"}
		</span>
	</div>

	<div class="mt-3"><CampaignProgress {campaign} /></div>

	{#if hint}
		<p
			class="mt-3 rounded-lg px-3 py-2 text-sm {hint.tone === 'bad'
				? 'bg-rose-50 text-rose-800 dark:bg-rose-500/10 dark:text-rose-300'
				: hint.tone === 'action'
					? 'bg-amber-50 text-amber-900 dark:bg-amber-500/10 dark:text-amber-200'
					: 'bg-neutral-50 text-neutral-700 dark:bg-neutral-800/60 dark:text-neutral-300'}"
		>
			{hint.text}
		</p>
	{/if}

	<div class="mt-3 flex flex-wrap items-center gap-3">
		{#if phase === 'active' && !isOwner}
			<Button onclick={() => (pledgeOpen = true)}>Qo'llab-quvvatlash</Button>
		{/if}
		<a href={`/campaigns/${campaign.id}`} class="inline-flex items-center gap-0.5 text-sm font-semibold text-brand-700 hover:underline dark:text-brand-400">
			Batafsil
			<ChevronRight class="size-4" />
		</a>
		{#if myPledged > 0}
			<span class="ml-auto text-xs text-neutral-500">Siz qo'llab-quvvatladingiz</span>
		{/if}
	</div>
</section>

<PledgeDialog bind:open={pledgeOpen} {campaign} />
