<script lang="ts">
	import type { Poll } from '$lib/types';
	import { data } from '$lib/stores/data.svelte';
	import { toastStore } from '$lib/stores/toast.svelte';
	import CheckCircle2 from '@lucide/svelte/icons/check-circle-2';
	import BarChart2 from '@lucide/svelte/icons/bar-chart-2';

	let { poll, postId, messageId }: { poll: Poll; postId?: string; messageId?: string } = $props();

	const me = $derived(data.currentUser.id);

	const totalVotes = $derived(
		poll.options.reduce((sum, opt) => sum + opt.votes.length, 0)
	);

	const myVotedOptionId = $derived.by(() => {
		for (const opt of poll.options) {
			if (opt.votes.includes(me)) return opt.id;
		}
		return null;
	});

	function handleVote(e: MouseEvent, optionId: string) {
		e.stopPropagation();
		if (messageId) data.voteMessagePoll(messageId, optionId);
		else if (postId) data.votePoll(postId, optionId);
		toastStore.show("Ovozingiz qabul qilindi!", "success");
	}
</script>

<div
	onclick={(e) => e.stopPropagation()}
	role="presentation"
	class="mt-3 flex flex-col gap-2 rounded-2xl border border-neutral-200 bg-neutral-50/70 p-3.5 dark:border-neutral-800 dark:bg-neutral-800/40"
>
	<div class="flex items-center gap-1.5 font-bold text-neutral-900 dark:text-neutral-100">
		<BarChart2 class="size-4 text-brand-500" />
		<span>{poll.question}</span>
	</div>

	<div class="mt-1 flex flex-col gap-2">
		{#each poll.options as option (option.id)}
			{@const count = option.votes.length}
			{@const pct = totalVotes > 0 ? Math.round((count / totalVotes) * 100) : 0}
			{@const isSelected = myVotedOptionId === option.id}

			<button
				type="button"
				onclick={(e) => handleVote(e, option.id)}
				class="group relative flex w-full items-center justify-between overflow-hidden rounded-xl border p-2.5 text-left text-sm font-medium transition-all {isSelected
					? 'border-brand-500 bg-brand-50/40 font-semibold text-brand-700 dark:border-brand-400 dark:bg-brand-950/40 dark:text-brand-300'
					: 'border-neutral-200 bg-white hover:border-neutral-300 dark:border-neutral-700 dark:bg-neutral-900 dark:hover:border-neutral-600'}"
			>
				<!-- Background Percentage Fill Bar -->
				<div
					class="absolute inset-y-0 left-0 transition-all duration-500 {isSelected
						? 'bg-brand-500/15 dark:bg-brand-400/20'
						: 'bg-neutral-200/60 dark:bg-neutral-800/60'}"
					style="width: {pct}%"
				></div>

				<!-- Option Text & Icon -->
				<span class="relative z-10 flex items-center gap-2">
					{#if isSelected}
						<CheckCircle2 class="size-4 text-brand-600 dark:text-brand-400" />
					{/if}
					{option.text}
				</span>

				<!-- Percentage & Count -->
				<span class="relative z-10 text-xs text-neutral-500 dark:text-neutral-400">
					{pct}% ({count})
				</span>
			</button>
		{/each}
	</div>

	<div class="mt-1 flex items-center justify-between text-xs text-neutral-500 dark:text-neutral-400">
		<span>{totalVotes} kishi ovoz berdi</span>
		{#if myVotedOptionId}
			<span class="text-brand-600 dark:text-brand-400 font-medium">Ovoz berdingiz</span>
		{/if}
	</div>
</div>
