<script lang="ts">
	import { onboarding } from '$lib/stores/onboarding.svelte';
	import { data } from '$lib/stores/data.svelte';
	import RecommendedChannels from '$lib/components/channel/RecommendedChannels.svelte';
	import Check from '@lucide/svelte/icons/check';
	import X from '@lucide/svelte/icons/x';

	let { onWrite }: { onWrite: () => void } = $props();

	const name = $derived(data.currentUser?.name?.split(' ')[0] ?? '');
	const steps = $derived([
		{ key: 'profile', done: onboarding.profileDone, title: "Profilingizni to'ldiring", text: "Qisqacha o'zingiz haqingizda va joylashuvingizni yozing." },
		{ key: 'channels', done: onboarding.channelsDone, title: `Kamida ${onboarding.minChannels} ta kanalga a'zo bo'ling`, text: `${Math.min(onboarding.joinedCount, onboarding.minChannels)} / ${onboarding.minChannels}. Lentangiz shu kanallar postlaridan tuziladi.` },
		{ key: 'post', done: onboarding.postDone, title: 'Birinchi postingizni yozing', text: "Tajribangiz yoki savolingiz bilan o'rtoqlashing." }
	]);
</script>

{#if onboarding.visible}
	<section class="m-3 rounded-2xl border border-brand-200 bg-white p-4 shadow-[var(--shadow-card)] dark:border-brand-400/30 dark:bg-neutral-900" aria-label="Boshlash uchun qadamlar">
		<div class="flex items-start justify-between gap-3">
			<div>
				<h2 class="text-base font-extrabold tracking-tight">Xush kelibsiz{name ? `, ${name}` : ''}!</h2>
				<p class="text-sm text-neutral-500 dark:text-neutral-400">Boshlash uchun 3 qadam: {onboarding.doneCount} / 3</p>
			</div>
			<button type="button" onclick={() => onboarding.dismiss()} aria-label="Keyinroq" title="Keyinroq" class="rounded-full p-1.5 text-neutral-400 hover:bg-neutral-100 hover:text-neutral-600 dark:hover:bg-neutral-800">
				<X class="size-4" />
			</button>
		</div>

		<!-- Pog'onali progress: har bir qadam bitta pog'ona -->
		<div class="mt-3 flex gap-1" role="progressbar" aria-valuenow={onboarding.doneCount} aria-valuemin="0" aria-valuemax="3">
			{#each steps as s (s.key)}
				<div class="h-1.5 flex-1 rounded-full {s.done ? 'bg-brand-600' : 'bg-neutral-200 dark:bg-neutral-800'}"></div>
			{/each}
		</div>

		<ol class="mt-4 flex flex-col gap-4">
			{#each steps as s, i (s.key)}
				<li class="flex gap-3">
					<span
						class="mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full text-xs font-bold {s.done
							? 'bg-brand-600 text-white'
							: 'bg-neutral-100 text-neutral-500 dark:bg-neutral-800 dark:text-neutral-400'}"
					>
						{#if s.done}<Check class="size-3.5" />{:else}{i + 1}{/if}
					</span>
					<div class="min-w-0 flex-1">
						<p class="text-sm font-bold {s.done ? 'text-neutral-400 line-through dark:text-neutral-500' : ''}">{s.title}</p>
						{#if !s.done}
							<p class="mt-0.5 text-xs text-neutral-500 dark:text-neutral-400">{s.text}</p>
							{#if s.key === 'profile'}
								<a href="/settings" class="mt-2 inline-block rounded-full bg-brand-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-brand-700">Profilni to'ldirish</a>
							{:else if s.key === 'channels'}
								<div class="mt-2"><RecommendedChannels limit={5} /></div>
							{:else}
								<button type="button" onclick={onWrite} class="mt-2 rounded-full bg-brand-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-brand-700">Post yozish</button>
							{/if}
						{/if}
					</div>
				</li>
			{/each}
		</ol>
	</section>
{/if}
