<script lang="ts">
	import { goto } from '$app/navigation';
	import { API_ON } from '$lib/api';
	import { session } from '$lib/stores/session.svelte';
	import Button from '$lib/components/ui/Button.svelte';
	import TextField from '$lib/components/ui/TextField.svelte';

	let identifier = $state('');
	let password = $state('');
	let errors = $state<{ identifier?: string; password?: string }>({});
	let loading = $state(false);
	let formError = $state('');

	function validate(): boolean {
		const next: typeof errors = {};
		if (identifier.trim().length < 3) next.identifier = 'Kamida 3 belgi kiriting';
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
			const err = await session.apiLogin(identifier.trim(), password);
			loading = false;
			if (err) {
				formError = err;
				return;
			}
		} else {
			await new Promise((resolve) => setTimeout(resolve, 500));
			session.login();
		}
		goto('/feed');
	}
</script>

<h2 class="mb-1 text-3xl font-extrabold tracking-tight">Xush kelibsiz</h2>
<p class="mb-8 text-neutral-500 dark:text-neutral-400">Hisobingizga kiring</p>

<form class="flex flex-col gap-4" onsubmit={handleSubmit} novalidate>
	<TextField
		label="Foydalanuvchi nomi yoki email"
		bind:value={identifier}
		error={errors.identifier}
		placeholder="anvarov"
		autocomplete="username"
	/>
	<TextField
		label="Parol"
		bind:value={password}
		error={errors.password}
		type="password"
		placeholder="••••••••"
		autocomplete="current-password"
	/>
	{#if formError}
		<p role="alert" class="rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700 dark:bg-rose-500/10 dark:text-rose-300">{formError}</p>
	{/if}
	<Button type="submit" full disabled={loading}>{loading ? 'Kirilmoqda...' : 'Kirish'}</Button>
</form>

<p class="mt-6 text-center text-sm text-neutral-500 dark:text-neutral-400">
	Hisobingiz yo'qmi?
	<a href="/register" class="font-semibold text-brand-700 hover:underline dark:text-brand-400">Ro'yxatdan o'tish</a>
</p>

{#if !API_ON}
	<p class="mt-4 text-center text-xs text-neutral-400 dark:text-neutral-600">
		Demo rejim: istalgan ma'lumot bilan kirishingiz mumkin.
	</p>
{/if}
