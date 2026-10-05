<script lang="ts">
	import { page } from '$app/state';
	import { goto } from '$app/navigation';
	import { data } from '$lib/stores/data.svelte';
	import { session } from '$lib/stores/session.svelte';
	import { toastStore } from '$lib/stores/toast.svelte';
	import { daysLeft, formatSum, timeAgo } from '$lib/utils';
	import Avatar from '$lib/components/ui/Avatar.svelte';
	import Button from '$lib/components/ui/Button.svelte';
	import Modal from '$lib/components/ui/Modal.svelte';
	import EmptyState from '$lib/components/ui/EmptyState.svelte';
	import Marquee from '$lib/components/ui/Marquee.svelte';
	import CampaignProgress from '$lib/components/channel/CampaignProgress.svelte';
	import CommentList from '$lib/components/post/CommentList.svelte';
	import ReplyBar from '$lib/components/post/ReplyBar.svelte';
	import PledgeDialog from '$lib/components/channel/PledgeDialog.svelte';
	import ArrowLeft from '@lucide/svelte/icons/arrow-left';
	import Check from '@lucide/svelte/icons/check';
	import Lock from '@lucide/svelte/icons/lock';
	import Vote from '@lucide/svelte/icons/vote';
	import CircleAlert from '@lucide/svelte/icons/circle-alert';

	const campaign = $derived(data.getCampaign(page.params.id ?? ''));
	const channel = $derived(campaign ? data.getChannel(campaign.channelId) : undefined);
	const isOwner = $derived(!!channel && channel.ownerId === session.user.id);
	const phase = $derived(campaign ? data.getCampaignPhase(campaign) : 'active');
	const raised = $derived(campaign ? data.getRaised(campaign) : 0);
	const backerIds = $derived(campaign ? data.getBackerIds(campaign) : []);
	const current = $derived(campaign ? data.getCurrentMilestone(campaign) : undefined);
	const myPledged = $derived(campaign ? data.getMyPledged(campaign) : 0);
	const isBacker = $derived(backerIds.includes(session.user.id));
	const need = $derived(Math.floor(backerIds.length / 2) + 1);

	// Donorlar: eng kattasidan boshlab, bir kishining bir nechta qo'llab-quvvatlovi jamlanadi.
	const donors = $derived.by(() => {
		if (!campaign) return [];
		const byUser = new Map<string, { userId: string; amount: number; last: string }>();
		for (const p of campaign.pledges) {
			const e = byUser.get(p.userId) ?? { userId: p.userId, amount: 0, last: p.createdAt };
			e.amount += p.amount;
			if (p.createdAt > e.last) e.last = p.createdAt;
			byUser.set(p.userId, e);
		}
		return [...byUser.values()].sort((a, b) => b.amount - a.amount);
	});

	let pledgeOpen = $state(false);
	let reportOpen = $state(false);
	let report = $state('');

	function back() {
		if (history.length > 1) history.back();
		else goto(campaign ? `/channels/${campaign.channelId}` : '/channels');
	}

	function submitReport(e: SubmitEvent) {
		e.preventDefault();
		if (campaign && data.submitMilestoneReport(campaign.id, report)) {
			toastStore.show('Hisobot yuborildi, donorlar ovoz beradi', 'success');
			reportOpen = false;
			report = '';
		}
	}

	function approve() {
		if (campaign && data.approveMilestone(campaign.id)) toastStore.show('Tasdiqlandi', 'success');
	}

	const statusText = $derived(phase === 'active' ? `${campaign ? daysLeft(campaign.deadline) : 0} kun qoldi` : phase === 'funded' ? "Yig'ildi" : "Yig'ilmadi");
</script>

<svelte:head>
	<title>{campaign?.title ?? 'Kampaniya'} / graduss</title>
	{#if campaign}<meta name="description" content={campaign.summary} />{/if}
</svelte:head>

<header class="sticky top-0 z-10 flex min-h-[61px] sm:min-h-14 items-center gap-3 border-b border-neutral-200 px-4 py-2 dark:border-neutral-800 glass">
	<button onclick={back} class="shrink-0 rounded-full p-2 hover:bg-neutral-100 dark:hover:bg-neutral-900" aria-label="Orqaga">
		<ArrowLeft class="size-5" />
	</button>
	{#if channel}
		<a href={`/channels/${channel.id}`} class="flex min-w-0 flex-1 items-center gap-2.5">
			<Avatar name={channel.name} color={channel.avatar} size="sm" />
			<div class="min-w-0">
				<p class="font-bold leading-tight"><Marquee>{channel.name}</Marquee></p>
				<p class="truncate text-xs leading-tight text-neutral-500 dark:text-neutral-400">Kampaniya</p>
			</div>
		</a>
	{:else}
		<h1 class="text-xl font-bold">Kampaniya</h1>
	{/if}
</header>

{#if campaign}
	<div class="flex min-h-[calc(100dvh-3.5rem)] flex-col">
	<div class="flex flex-col gap-3 p-3">
		<!-- Asosiy: sarlavha, holat, progress, harakat -->
		<section class="rounded-2xl border border-neutral-200 bg-white p-4 shadow-[var(--shadow-card)] dark:border-neutral-800 dark:bg-neutral-900">
			<div class="flex items-start justify-between gap-3">
				<h1 class="text-xl font-extrabold leading-snug tracking-tight">{campaign.title}</h1>
				<span
					class="shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold {phase === 'active'
						? 'bg-brand-50 text-brand-700 dark:bg-brand-400/10 dark:text-brand-400'
						: phase === 'funded'
							? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400'
							: 'bg-rose-50 text-rose-700 dark:bg-rose-500/10 dark:text-rose-400'}">{statusText}</span
				>
			</div>
			{#if campaign.summary}
				<p class="mt-2 text-sm leading-relaxed text-neutral-700 dark:text-neutral-300">{campaign.summary}</p>
			{/if}

			<div class="mt-4"><CampaignProgress {campaign} big /></div>

			{#if phase === 'failed'}
				<p class="mt-4 rounded-lg bg-rose-50 px-3 py-2.5 text-sm text-rose-800 dark:bg-rose-500/10 dark:text-rose-300">
					Maqsad yig'ilmadi. Barcha qo'llab-quvvatlovlar to'liq qaytariladi{myPledged > 0 ? `: sizga ${formatSum(myPledged)}` : ''}.
				</p>
			{:else if phase === 'funded'}
				<p class="mt-4 text-sm text-neutral-600 dark:text-neutral-400">
					Egasiga ochilgan: <b class="text-neutral-900 dark:text-neutral-100">{formatSum(data.getReleasedAmount(campaign))}</b> / {formatSum(raised)}
				</p>
			{:else}
				<p class="mt-4 text-sm text-neutral-600 dark:text-neutral-400">
					Maqsad {daysLeft(campaign.deadline)} kun ichida yig'ilmasa, hamma qo'llab-quvvatlovlar qaytariladi. Yig'ilsa, mablag' bosqichma-bosqich, donorlar tasdig'i bilan ochiladi.
				</p>
			{/if}

			{#if (phase === 'active' && !isOwner) || myPledged > 0 || isOwner}
			<div class="mt-4 flex flex-wrap items-center gap-3">
				{#if phase === 'active' && !isOwner}
					<Button onclick={() => (pledgeOpen = true)}>Qo'llab-quvvatlash</Button>
				{/if}
				{#if myPledged > 0}<span class="text-sm text-neutral-500">Siz: {formatSum(myPledged)}</span>{/if}
				{#if isOwner}<span class="text-xs text-neutral-500">Bu sizning kampaniyangiz</span>{/if}
			</div>
			{/if}
		</section>

		<!-- Bosqichlar: vertikal vaqt chizig'i -->
		{#if phase !== 'failed'}
			<section class="rounded-2xl border border-neutral-200 bg-white p-4 shadow-[var(--shadow-card)] dark:border-neutral-800 dark:bg-neutral-900" aria-label="Bosqichlar">
				<h2 class="text-base font-bold">Bosqichlar</h2>
				<ol class="mt-3 flex flex-col">
					{#each campaign.milestones as m, i (m.id)}
						{@const isCurrent = phase === 'funded' && current?.id === m.id}
						{@const last = i === campaign.milestones.length - 1}
						<li class="flex gap-3">
							<div class="flex flex-col items-center">
								<span
									class="flex size-7 shrink-0 items-center justify-center rounded-full text-xs font-bold {m.status === 'released'
										? 'bg-emerald-600 text-white'
										: m.status === 'voting'
											? 'bg-amber-500 text-white'
											: 'bg-neutral-200 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-400'}"
								>
									{#if m.status === 'released'}<Check class="size-4" />{:else if m.status === 'voting'}<Vote class="size-4" />{:else}<Lock class="size-3.5" />{/if}
								</span>
								{#if !last}<span class="my-1 w-px flex-1 bg-neutral-200 dark:bg-neutral-700"></span>{/if}
							</div>
							<div class="min-w-0 flex-1 {last ? '' : 'pb-5'}">
								<p class="text-sm font-bold">{i + 1}. {m.title}</p>
								<p class="text-xs text-neutral-500">
									{m.percent}% · {formatSum((campaign.goal * m.percent) / 100)}
									· {m.status === 'released' ? 'mablag\' ochilgan' : m.status === 'voting' ? `ovoz berish: ${m.approvals.length}/${need} kerak` : 'kutilmoqda'}
								</p>
								{#if m.report}
									<p class="mt-2 rounded-lg bg-neutral-50 px-3 py-2 text-sm dark:bg-neutral-800/60">{m.report}</p>
								{/if}
								{#if isCurrent && m.status === 'locked' && isOwner}
									<div class="mt-2"><Button size="sm" onclick={() => (reportOpen = true)}>Hisobot yuborish</Button></div>
								{/if}
								{#if isCurrent && m.status === 'voting' && isBacker}
									<div class="mt-2">
										{#if m.approvals.includes(session.user.id)}
											<span class="text-sm text-emerald-600">Siz tasdiqladingiz</span>
										{:else}
											<Button size="sm" onclick={approve}>Tasdiqlash</Button>
										{/if}
									</div>
								{/if}
							</div>
						</li>
					{/each}
				</ol>
			</section>
		{/if}

		<!-- Donorlar -->
		<section class="rounded-2xl border border-neutral-200 bg-white p-4 shadow-[var(--shadow-card)] dark:border-neutral-800 dark:bg-neutral-900" aria-label="Donorlar">
			<h2 class="text-base font-bold">Donorlar</h2>
			{#if donors.length}
				<ul class="mt-2 flex flex-col divide-y divide-neutral-100 dark:divide-neutral-800">
					{#each donors as d (d.userId)}
						{@const u = data.getUser(d.userId)}
						<li class="flex items-center gap-3 py-2.5">
							{#if u}
								<a href={`/profile/${u.username}`} class="shrink-0"><Avatar name={u.name} color={u.avatar} size="sm" /></a>
							{/if}
							<div class="min-w-0 flex-1">
								<p class="truncate text-sm font-semibold">{u?.name ?? "Noma'lum"}{#if d.userId === session.user.id} <span class="text-xs font-medium text-brand-700 dark:text-brand-400">(siz)</span>{/if}</p>
								<p class="text-xs text-neutral-500">{timeAgo(d.last)}</p>
							</div>
							<span class="shrink-0 text-sm font-bold">{formatSum(d.amount)}</span>
						</li>
					{/each}
				</ul>
			{:else}
				<p class="mt-2 text-sm text-neutral-500">Hali donor yo'q. Birinchi bo'ling.</p>
			{/if}
		</section>

		<!-- Muhokama -->
		<section aria-label="Muhokama" class="rounded-2xl border border-neutral-200 bg-white pt-4 shadow-[var(--shadow-card)] dark:border-neutral-800 dark:bg-neutral-900">
			<h2 class="px-4 text-base font-bold">Muhokama</h2>
			<CommentList campaignId={campaign.id} />
		</section>
	</div>
	<ReplyBar placeholder="Savol yoki fikr yozing" onSend={(t) => data.addCampaignComment(campaign.id, t)} />
	</div>

	<PledgeDialog bind:open={pledgeOpen} {campaign} />

	<Modal bind:open={reportOpen} title="Bosqich hisoboti">
		<form onsubmit={submitReport} class="flex flex-col gap-4">
			<p class="text-sm text-neutral-600 dark:text-neutral-400">
				"{current?.title}" bosqichi bajarilganini isbotlang. Donorlarning ko'pchiligi tasdiqlasa, mablag' ochiladi.
			</p>
			<textarea
				bind:value={report}
				rows="4"
				aria-label="Hisobot"
				placeholder="Nima qilindi, qancha sarflandi?"
				class="w-full resize-none rounded-lg border border-neutral-300 bg-transparent p-3 text-sm outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 dark:border-neutral-700"
			></textarea>
			<div class="flex justify-end gap-2">
				<Button variant="outline" type="button" onclick={() => (reportOpen = false)}>Bekor qilish</Button>
				<Button type="submit" disabled={!report.trim()}>Yuborish</Button>
			</div>
		</form>
	</Modal>
{:else}
	<EmptyState icon={CircleAlert} title="Kampaniya topilmadi" />
{/if}
