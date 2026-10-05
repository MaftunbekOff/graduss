<script lang="ts">
	import { goto } from '$app/navigation';
	import { API_ON } from '$lib/api';
	import { SECTORS } from '$lib/sectors';
	import type { Sector } from '$lib/types';
	import { onboarding } from '$lib/stores/onboarding.svelte';
	import { HANDLE_HINT, liveHandleError, sanitizeHandleInput, validateHandle } from '$lib/username';
	import { session } from '$lib/stores/session.svelte';
	import { data } from '$lib/stores/data.svelte';
	import Button from '$lib/components/ui/Button.svelte';
	import TextField from '$lib/components/ui/TextField.svelte';

	let name = $state('');
	let username = $state('');
	let email = $state('');
	let password = $state('');
	let errors = $state<{ name?: string; username?: string; email?: string; password?: string }>(
		{}
	);
	let sector = $state<string>('Tadbirkor');
	let loading = $state(false);
	let formError = $state('');

	const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

	function validate(): boolean {
		const next: typeof errors = {};
		if (name.trim().length < 2) next.name = 'Kamida 2 belgi kiriting';
		const uErr = validateHandle(username);
		if (uErr) next.username = uErr;
		else if (!API_ON && data.isUsernameTaken(username.trim())) next.username = 'Bu foydalanuvchi nomi band';
		if (!EMAIL_RE.test(email.trim())) next.email = "Email noto'g'ri formatda";
		if (password.length < (API_ON ? 8 : 6)) next.password = `Kamida ${API_ON ? 8 : 6} belgi bo'lishi kerak`;
		errors = next;
		return Object.keys(next).length === 0;
	}

	async function handleSubmit(e: SubmitEvent) {
		e.preventDefault();
		if (!validate() || loading) return;
		loading = true;
		formError = '';
		if (API_ON) {
			const err = await session.apiRegister({
				name: name.trim(),
				username: username.trim(),
				email: email.trim(),
				password,
				sector
			});
			loading = false;
			if (err) {
				formError = err;
				return;
			}
		} else {
			await new Promise((resolve) => setTimeout(resolve, 500));
			data.registerDemoUser({ name: name.trim(), username: username.trim().toLowerCase(), sector: sector as Sector });
			onboarding.reset();
			session.login();
		}
		goto('/feed');
	}
</script>

<h2 class="mb-1 text-3xl font-extrabold tracking-tight">Hisob yaratish</h2>
<p class="mb-8 text-neutral-500 dark:text-neutral-400">graduss jamoasiga qo'shiling</p>

<form class="flex flex-col gap-4" onsubmit={handleSubmit} novalidate>
	<TextField label="To'liq ism" bind:value={name} error={errors.name} placeholder="Anvar Anvarov" autocomplete="name" />
	<TextField
		label="Foydalanuvchi nomi"
		bind:value={username}
		error={errors.username}
		hint={HANDLE_HINT}
		placeholder="anvarov"
		autocomplete="username"
		autocapitalize="none"
		spellcheck={false}
		oninput={() => {
			username = sanitizeHandleInput(username);
			errors = { ...errors, username: liveHandleError(username) };
		}}
	/>
	<TextField
		label="Email"
		bind:value={email}
		error={errors.email}
		type="email"
		placeholder="siz@misol.uz"
		autocomplete="email"
	/>
	<TextField
		label="Parol"
		bind:value={password}
		error={errors.password}
		type="password"
		placeholder="••••••••"
		autocomplete="new-password"
	/>

 <label class="flex flex-col gap-1.5">
		<span class="text-sm font-medium text-neutral-700 dark:text-neutral-300">Kasb yo'nalishi</span>
		<select
			bind:value={sector}
			class="rounded-lg border border-neutral-300 px-3 py-2.5 outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 dark:border-neutral-700 dark:bg-neutral-900"
		>
			{#each SECTORS as s (s)}
				<option value={s}>{s}</option>
			{/each}
		</select>
	</label>

	{#if formError}
		<p role="alert" class="rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700 dark:bg-rose-500/10 dark:text-rose-300">{formError}</p>
	{/if}

	<Button type="submit" full disabled={loading}>{loading ? "Yaratilmoqda..." : "Ro'yxatdan o'tish"}</Button>
</form>

<p class="mt-6 text-center text-sm text-neutral-500 dark:text-neutral-400">
	Hisobingiz bormi?
	<a href="/login" class="font-semibold text-brand-700 hover:underline dark:text-brand-400">Kirish</a>
</p>

{#if !API_ON}
	<p class="mt-4 text-center text-xs text-neutral-400 dark:text-neutral-600">
		Demo rejim: istalgan ma'lumot bilan ro'yxatdan o'tishingiz mumkin.
	</p>
{/if}
