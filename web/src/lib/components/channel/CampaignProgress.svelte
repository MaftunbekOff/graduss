<script lang="ts">
	import type { Campaign } from '$lib/types';
	import { data } from '$lib/stores/data.svelte';
	import { formatSum } from '$lib/utils';

	// Pog'onali progress + asosiy raqamlar (kartada ham, kampaniya sahifasida ham bir xil).
	let { campaign, big = false }: { campaign: Campaign; big?: boolean } = $props();

	const phase = $derived(data.getCampaignPhase(campaign));
	const raised = $derived(data.getRaised(campaign));
	const percent = $derived(Math.min(100, Math.round((raised / campaign.goal) * 100)));
	const donors = $derived(data.getBackerIds(campaign).length);
	const steps = $derived.by(() => {
		let start = 0;
		return campaign.milestones.map((m) => {
			const fill = Math.max(0, Math.min(100, ((percent - start) / m.percent) * 100));
			start += m.percent;
			return { w: m.percent, fill };
		});
	});
</script>

<div>
	<div class="flex gap-1" role="progressbar" aria-valuenow={percent} aria-valuemin="0" aria-valuemax="100" aria-label="Yig'ilgan mablag'">
		{#each steps as step, i (i)}
			<div class="overflow-hidden rounded-full bg-neutral-200 dark:bg-neutral-800 {big ? 'h-3' : 'h-2'}" style:flex="{step.w} 1 0">
				<div class="h-full rounded-full {phase === 'failed' ? 'bg-rose-500' : 'bg-brand-600'}" style:width="{step.fill}%"></div>
			</div>
		{/each}
	</div>
	<div class="mt-1.5 flex flex-wrap items-baseline justify-between gap-x-3 {big ? 'text-base' : 'text-sm'}">
		<span><b>{formatSum(raised)}</b> <span class="text-neutral-500">/ {formatSum(campaign.goal)}</span></span>
		<span class="text-neutral-500">{percent}% · {donors} donor</span>
	</div>
</div>
