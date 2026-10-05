<script lang="ts">
	import { formatPhone, normalizePhone, WEEKDAYS, defaultWorkDays } from '$lib/utils';
	import { goto } from '$app/navigation';
	import { session } from '$lib/stores/session.svelte';
	import { data } from '$lib/stores/data.svelte';
	import { theme } from '$lib/stores/theme.svelte';
	import { AVATAR_COLORS, BANNERS } from '$lib/appearance';
	import { validateMusic, MUSIC_TITLE_MAX, MUSIC_ARTIST_MAX } from '$lib/music';
	import { accentStore } from '$lib/stores/accent.svelte';
	import type { AccentColor } from '$lib/types';
	import Avatar from '$lib/components/ui/Avatar.svelte';
	import Badge from '$lib/components/ui/Badge.svelte';
	import Button from '$lib/components/ui/Button.svelte';
	import TextField from '$lib/components/ui/TextField.svelte';
	import ArrowLeft from '@lucide/svelte/icons/arrow-left';
	import Sun from '@lucide/svelte/icons/sun';
	import Moon from '@lucide/svelte/icons/moon';
	import Laptop from '@lucide/svelte/icons/laptop';
	import LogOut from '@lucide/svelte/icons/log-out';
	import Check from '@lucide/svelte/icons/check';
	import Palette from '@lucide/svelte/icons/palette';

	const modes: { value: 'light' | 'dark' | 'system'; label: string; icon: typeof Sun }[] = [
		{ value: 'light', label: "Yorug'", icon: Sun },
		{ value: 'dark', label: 'Qorong\'i', icon: Moon },
		{ value: 'system', label: 'Tizim', icon: Laptop }
	];

	const ACCENTS: { id: AccentColor; name: string; bg: string }[] = [
		{ id: 'indigo', name: 'Indigo', bg: 'bg-indigo-600' },
		{ id: 'emerald', name: 'Zumrad', bg: 'bg-emerald-500' },
		{ id: 'amber', name: 'Amber', bg: 'bg-amber-500' },
		{ id: 'rose', name: 'Atirgul', bg: 'bg-rose-500' },
		{ id: 'cyan', name: 'Firuza', bg: 'bg-cyan-500' }
	];


	const palette = AVATAR_COLORS;

	let name = $state(session.user.name);
	let bio = $state(session.user.bio);
	let location = $state(session.user.location);
	let avatarColor = $state(session.user.avatar);
	let banner = $state(session.user.banner ?? BANNERS[0]);
	let website = $state(session.user.website ?? '');
	let telegram = $state(session.user.telegram ?? '');
	let birthDate = $state(session.user.birthDate ?? '');
	let phone = $state(session.user.phone ? formatPhone(session.user.phone) : '');
	let showPhone = $state(session.user.showPhone ?? false);
	const initDays = session.user.workHours?.days ?? defaultWorkDays();
	let hoursOn = $state(!!session.user.workHours);
	let hoursDays = $state(initDays.map((d) => ({ off: !d, from: d?.from ?? '09:00', to: d?.to ?? '18:00' })));
	let hoursError = $state('');
	let musicTitle = $state(session.user.music?.title ?? '');
	let musicArtist = $state(session.user.music?.artist ?? '');
	let musicUrl = $state(session.user.music?.url ?? '');
	let musicError = $state('');
	let errors = $state<{ name?: string; location?: string; phone?: string; birthDate?: string }>({});
	let saved = $state(false);

	function saveProfile() {
		const next: typeof errors = {};
		if (name.trim().length < 2) next.name = 'Kamida 2 belgi kiriting';
		if (location.trim().length < 2) next.location = 'Kamida 2 belgi kiriting';
		const phoneNorm = phone.trim() ? normalizePhone(phone) : null;
		if (phone.trim() && !phoneNorm) next.phone = 'Format: +998 90 123 45 67';
		if (birthDate && (birthDate > new Date().toISOString().slice(0, 10) || birthDate < '1900-01-01')) next.birthDate = "Sana noto'g'ri";
		hoursError = hoursOn && hoursDays.some((d) => !d.off && d.from >= d.to) ? "Tugash vaqti boshlanishidan keyin bo'lsin" : hoursOn && hoursDays.every((d) => d.off) ? 'Kamida bitta ish kuni tanlang' : '';
		errors = next;
		// Qo'shiq: hammasi bo'sh bo'lsa o'chiriladi; biri to'ldirilsa to'liq tekshiriladi.
		const anyMusic = musicTitle.trim() || musicArtist.trim() || musicUrl.trim();
		musicError = anyMusic ? (validateMusic({ title: musicTitle, artist: musicArtist, url: musicUrl }) ?? '') : '';
		if (Object.keys(next).length || musicError || hoursError) return;
		data.updateProfile({
			name: name.trim(),
			bio: bio.trim(),
			location: location.trim(),
			avatar: avatarColor,
			banner,
			website: website.trim() || undefined,
			telegram: telegram.trim() || undefined,
			birthDate: birthDate || undefined,
			phone: phoneNorm ?? undefined,
			showPhone: phoneNorm ? showPhone : false,
			workHours: hoursOn ? { days: hoursDays.map((d) => (d.off ? null : { from: d.from, to: d.to })) } : undefined,
			music: anyMusic ? { title: musicTitle.trim(), artist: musicArtist.trim(), url: musicUrl.trim() } : undefined
		});
		saved = true;
		setTimeout(() => (saved = false), 2000);
	}

	async function handleLogout() {
		await session.logout();
		goto('/login');
	}
</script>

<svelte:head>
	<title>Sozlamalar / graduss</title>
</svelte:head>

<header
	class="sticky top-0 z-10 flex min-h-[61px] sm:min-h-14 items-center gap-4 border-b border-neutral-200 px-4 py-2 dark:border-neutral-800 glass"
>
	<button onclick={() => goto('/feed')} class="rounded-full p-2 hover:bg-neutral-100 dark:hover:bg-neutral-900" aria-label="Orqaga">
		<ArrowLeft class="size-5" />
	</button>
	<h1 class="text-xl font-bold">Sozlamalar</h1>
</header>

<section class="border-b border-neutral-200 px-4 py-4 dark:border-neutral-800">
	<h2 class="mb-3 text-sm font-bold uppercase tracking-wide text-neutral-500 dark:text-neutral-400">Hisob</h2>
	<a
		href={`/profile/${session.user.username}`}
		class="flex items-center gap-3 rounded-xl p-2 -mx-2 transition-colors hover:bg-neutral-50 dark:hover:bg-neutral-900"
	>
		<Avatar name={session.user.name} color={session.user.avatar} size="lg" />
		<div class="min-w-0 flex-1">
			<div class="flex items-center gap-1.5">
				<span class="truncate font-bold">{session.user.name}</span>
				<Badge sector={session.user.sector} />
			</div>
			<p class="truncate text-sm text-neutral-500 dark:text-neutral-400">@{session.user.username}</p>
		</div>
	</a>
</section>

<section class="border-b border-neutral-200 px-4 py-4 dark:border-neutral-800">
	<h2 class="mb-3 text-sm font-bold uppercase tracking-wide text-neutral-500 dark:text-neutral-400">Profilni tahrirlash</h2>

	<div class="mb-4">
		<span class="mb-1.5 block text-xs font-semibold text-neutral-600 dark:text-neutral-400">Avatar rangi:</span>
		<div class="flex flex-wrap items-center gap-2.5">
			{#each palette as color (color)}
				<button
					type="button"
					onclick={() => (avatarColor = color)}
					aria-label="Rang tanlash"
					class="size-10 shrink-0 rounded-full ring-2 ring-offset-2 ring-offset-white transition-transform hover:scale-110 dark:ring-offset-neutral-950 {avatarColor ===
					color
						? 'ring-brand-500'
						: 'ring-transparent'}"
					style:background-color={color}
				></button>
			{/each}
		</div>
	</div>

	<div class="mb-4">
		<span class="mb-1.5 block text-xs font-semibold text-neutral-600 dark:text-neutral-400">Profil Cover Banner stili:</span>
		<div class="flex gap-2">
			{#each BANNERS as bGrad}
				<button
					type="button"
					onclick={() => (banner = bGrad)}
					class="h-10 flex-1 rounded-lg bg-gradient-to-br {bGrad} transition-transform hover:scale-105 {banner === bGrad ? 'ring-2 ring-brand-500 ring-offset-2 dark:ring-offset-neutral-950' : ''}"
					aria-label="Banner tanlash"
				></button>
			{/each}
		</div>
	</div>

	<div class="flex flex-col gap-3">
		<TextField label="Ism" bind:value={name} error={errors.name} />
		<label class="flex flex-col gap-1.5">
			<span class="text-sm font-medium text-neutral-700 dark:text-neutral-300">Bio</span>
			<textarea
				bind:value={bio}
				rows="3"
				class="resize-none rounded-lg border border-neutral-300 px-3 py-2.5 text-sm outline-none transition-shadow focus:border-brand-500 focus:ring-1 focus:ring-brand-500 dark:border-neutral-700 dark:bg-neutral-900"
			></textarea>
		</label>
		<TextField label="Joylashuv" bind:value={location} error={errors.location} />
		<TextField label="Vebsayt (URL)" bind:value={website} placeholder="https://..." />
		<TextField label="Telegram manzil" bind:value={telegram} placeholder="username" />
		<label class="flex flex-col gap-1.5">
			<span class="text-sm font-medium text-neutral-700 dark:text-neutral-300">Tug'ilgan kun</span>
			<input type="date" bind:value={birthDate} max={new Date().toISOString().slice(0, 10)} class="rounded-lg border border-neutral-300 bg-transparent px-3 py-2.5 text-base outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 dark:border-neutral-700 dark:bg-neutral-900" />
			{#if errors.birthDate}<span class="text-xs text-rose-600">{errors.birthDate}</span>{/if}
		</label>
		<TextField label="Telefon raqam" bind:value={phone} placeholder="+998 90 123 45 67" error={errors.phone} />
		<label class="flex items-start gap-2 text-sm text-neutral-700 dark:text-neutral-300">
			<input type="checkbox" bind:checked={showPhone} disabled={!phone.trim()} class="mt-0.5 size-4 accent-brand-600" />
			<span>Telefon raqamim boshqalarga ko'rinsin<span class="block text-xs text-neutral-500">O'chiq bo'lsa raqamni faqat o'zingiz ko'rasiz.</span></span>
		</label>

		<fieldset class="mt-1 flex flex-col gap-2 rounded-xl border border-neutral-200 p-3 dark:border-neutral-800" aria-label="Ish vaqti">
			<legend class="px-1 text-sm font-bold">Ish vaqti</legend>
			<label class="flex items-center gap-2 text-sm text-neutral-700 dark:text-neutral-300">
				<input type="checkbox" bind:checked={hoursOn} class="size-4 accent-brand-600" />
				Profilda ish vaqtini ko'rsatish (Toshkent vaqti)
			</label>
			{#if hoursOn}
				{#each hoursDays as d, i (i)}
					<div class="flex items-center gap-2 text-sm">
						<span class="w-20 shrink-0 text-xs font-medium sm:w-24 sm:text-sm">{WEEKDAYS[i]}</span>
						<label class="flex shrink-0 items-center gap-1 text-xs text-neutral-500"><input type="checkbox" bind:checked={d.off} class="size-4 accent-brand-600" aria-label="{WEEKDAYS[i]} dam olish" />Dam</label>
						{#if !d.off}
							<input type="time" bind:value={d.from} aria-label="{WEEKDAYS[i]} boshlanishi" class="w-0 min-w-0 flex-1 rounded-lg border border-neutral-300 bg-transparent px-2 py-1.5 text-base outline-none focus:border-brand-500 dark:border-neutral-700 dark:bg-neutral-900" />
							<span class="text-neutral-400">-</span>
							<input type="time" bind:value={d.to} aria-label="{WEEKDAYS[i]} tugashi" class="w-0 min-w-0 flex-1 rounded-lg border border-neutral-300 bg-transparent px-2 py-1.5 text-base outline-none focus:border-brand-500 dark:border-neutral-700 dark:bg-neutral-900" />
						{/if}
					</div>
				{/each}
				{#if hoursError}<p class="text-xs text-rose-600">{hoursError}</p>{/if}
			{/if}
		</fieldset>

		<fieldset id="profil-qoshigi" class="mt-1 flex flex-col gap-3 rounded-xl border border-neutral-200 p-3 dark:border-neutral-800">
			<legend class="px-1 text-sm font-bold">Profil qo'shig'i</legend>
			<p class="-mt-1 text-xs text-neutral-500 dark:text-neutral-400">
				Profilingizda ko'rinadi. Audio fayl havolasi (mp3, wav...) bo'lsa o'sha yerning o'zida ijro etiladi, boshqa havola (YouTube, Spotify...) "Tinglash" tugmasi bilan ochiladi. Bo'sh qoldirsangiz o'chadi.
			</p>
			<TextField label="Qo'shiq nomi" bind:value={musicTitle} maxlength={MUSIC_TITLE_MAX} placeholder="Masalan: Dutor navosi" />
			<TextField label="Ijrochi" bind:value={musicArtist} maxlength={MUSIC_ARTIST_MAX} placeholder="Masalan: Otabek Sodiqov" />
			<TextField label="Havola (URL)" bind:value={musicUrl} placeholder="https://..." error={musicError} />
		</fieldset>

		<div class="mt-1 flex items-center gap-3">
			<Button onclick={saveProfile}>Saqlash</Button>
			{#if saved}
				<span class="flex items-center gap-1 text-sm font-medium text-emerald-600 dark:text-emerald-400">
					<Check class="size-4" /> Saqlandi
				</span>
			{/if}
		</div>
	</div>
</section>

<section class="border-b border-neutral-200 px-4 py-4 dark:border-neutral-800">
	<h2 class="mb-3 text-sm font-bold uppercase tracking-wide text-neutral-500 dark:text-neutral-400">Ko'rinish va Aksent Ranglar</h2>

	<!-- Theme Mode -->
	<div class="grid grid-cols-3 gap-2 mb-4">
		{#each modes as mode (mode.value)}
			<button
				onclick={() => theme.set(mode.value)}
				class="flex flex-col items-center gap-1.5 rounded-xl border px-3 py-3 text-sm font-medium transition-colors {theme.choice ===
				mode.value
					? 'border-brand-500 bg-brand-50 text-brand-700 dark:border-brand-500 dark:bg-brand-400/10 dark:text-brand-400'
					: 'border-neutral-200 text-neutral-600 hover:bg-neutral-50 dark:border-neutral-800 dark:text-neutral-400 dark:hover:bg-neutral-900'}"
			>
				<mode.icon class="size-5" />
				{mode.label}
			</button>
		{/each}
	</div>

	<!-- Accent Colors -->
	<div>
		<div class="flex items-center gap-1.5 mb-2 text-xs font-semibold text-neutral-600 dark:text-neutral-400">
			<Palette class="size-4 text-brand-500" />
			<span>Aksent rangi:</span>
		</div>
		<div class="flex gap-2">
			{#each ACCENTS as acc (acc.id)}
				<button
					type="button"
					onclick={() => accentStore.setAccent(acc.id)}
					class="flex flex-1 items-center justify-center gap-1.5 rounded-xl border py-2 text-xs font-bold transition-all {accentStore.current === acc.id
						? 'border-brand-500 ring-2 ring-brand-500 ring-offset-1 dark:ring-offset-neutral-950'
						: 'border-neutral-200 hover:border-neutral-400 dark:border-neutral-800'}"
				>
					<span class="size-3.5 rounded-full {acc.bg}"></span>
					<span>{acc.name}</span>
				</button>
			{/each}
		</div>
	</div>
</section>

<section class="px-4 py-4">
	<h2 class="mb-3 text-sm font-bold uppercase tracking-wide text-neutral-500 dark:text-neutral-400">Hisob boshqaruvi</h2>
	<button
		onclick={handleLogout}
		class="flex w-full items-center gap-3 rounded-xl border border-rose-200 px-4 py-3 text-left text-sm font-semibold text-rose-600 transition-colors hover:bg-rose-50 dark:border-rose-900/50 dark:text-rose-400 dark:hover:bg-rose-500/10"
	>
		<LogOut class="size-4.5" />
		Chiqish
	</button>
</section>
