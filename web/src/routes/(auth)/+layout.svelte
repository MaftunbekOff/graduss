<script lang="ts">
	import Logo from '$lib/components/brand/Logo.svelte';

	let { children } = $props();

	const points = [
		['Kasbdoshlar kanali', "Har bir soha o'z kanalida: tajriba, yangilik va portfolio."],
		['Bosqichli moliyalashtirish', "Kampaniya mablag'i ishlar bajarilgani sari, donorlar tasdig'i bilan ochiladi."],
		['Ochiq hisobot', "Har bosqich natijasi kanal a'zolari oldida ko'rsatiladi."]
	];
</script>

<div class="flex min-h-screen bg-white dark:bg-neutral-950">
	<div
		class="relative hidden w-1/2 flex-col justify-between overflow-hidden bg-gradient-to-br from-brand-700 via-brand-800 to-brand-950 px-14 py-14 text-white lg:flex"
	>
		<!-- pog'onalar: fon naqshi -->
		<svg class="pointer-events-none absolute -bottom-4 -right-4 w-[26rem] text-white" viewBox="0 -50 340 310" fill="currentColor" aria-hidden="true">
			<rect x="0" y="170" width="76" height="90" rx="14" fill-opacity="0.06" />
			<rect x="88" y="120" width="76" height="140" rx="14" fill-opacity="0.09" />
			<rect x="176" y="70" width="76" height="190" rx="14" fill-opacity="0.13" />
			<rect x="264" y="20" width="76" height="240" rx="14" fill-opacity="0.18" />
			<rect x="264" y="-18" width="76" height="28" rx="12" class="fill-amber-400" fill-opacity="0.75" />
		</svg>

		<Logo size={40} wordClass="text-3xl" />

		<div class="relative">
			<h1 class="max-w-md text-4xl font-extrabold leading-tight tracking-tight">
				Kasbingiz bilan birga, pog'onama-pog'ona.
			</h1>
			<p class="mt-4 max-w-md text-lg text-brand-100">
				Kasb egalari uchun jiddiy tarmoq: tajriba almashing, loyihalarni birgalikda amalga oshiring.
			</p>
			<ul class="mt-10 flex max-w-md flex-col gap-5">
				{#each points as [title, text], i (title)}
					<li class="flex gap-4">
						<span
							class="flex size-8 shrink-0 items-center justify-center rounded-lg bg-white/10 text-sm font-bold text-amber-300 ring-1 ring-white/20"
							>{i + 1}</span
						>
						<div>
							<p class="font-bold">{title}</p>
							<p class="text-sm text-brand-200">{text}</p>
						</div>
					</li>
				{/each}
			</ul>
		</div>
		<p class="relative text-sm text-brand-300">graduss.uz</p>
	</div>
	<div class="flex w-full flex-col items-center justify-center px-6 lg:w-1/2">
		<div class="w-full max-w-sm">
			<div class="mb-8 text-brand-700 lg:hidden dark:text-brand-400">
				<Logo size={34} wordClass="text-2xl" />
			</div>
			{@render children()}
		</div>
	</div>
</div>
