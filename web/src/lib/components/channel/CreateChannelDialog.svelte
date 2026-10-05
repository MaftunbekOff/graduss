<script lang="ts">
	import { goto } from '$app/navigation';
	import { data } from '$lib/stores/data.svelte';
	import TextField from '$lib/components/ui/TextField.svelte';
	import Button from '$lib/components/ui/Button.svelte';
	import Modal from '$lib/components/ui/Modal.svelte';
	import { SECTORS, fieldOf, type Sector } from '$lib/sectors';
	import { HANDLE_HINT, liveHandleError, sanitizeHandleInput, validateHandle } from '$lib/username';
	import X from '@lucide/svelte/icons/x';

	let { open = $bindable(false) }: { open?: boolean } = $props();

	let name = $state('');
	let handle = $state('');
	let description = $state('');
	let sector = $state<Sector | ''>('');
	let errors = $state<{ name?: string; handle?: string; description?: string }>({});


	function reset() {
		name = '';
		handle = '';
		description = '';
		sector = '';
		errors = {};
	}

	function close() {
		open = false;
		reset();
	}

	function autofillHandle() {
		if (handle) return;
		handle = name
			.trim()
			.toLowerCase()
			.replace(/[^a-z0-9]+/g, '');
	}

	function submit(e: SubmitEvent) {
		e.preventDefault();
		const next: typeof errors = {};
		if (name.trim().length < 3) next.name = 'Kamida 3 belgi kiriting';
		const cleanHandle = handle.trim().toLowerCase();
		const hErr = validateHandle(cleanHandle);
		if (hErr) next.handle = hErr;
		else if (data.isHandleTaken(cleanHandle)) next.handle = 'Bu manzil band';
		if (description.trim().length < 10) next.description = 'Kamida 10 belgi kiriting';
		errors = next;
		if (Object.keys(next).length) return;

		const channel = data.createChannel({
			name: name.trim(),
			handle: cleanHandle,
			description: description.trim(),
			sector: sector || undefined
		});
		open = false;
		reset();
		goto(`/channels/${channel.id}`);
	}
</script>

<Modal bind:open onClose={close}>
	<div class="overflow-y-auto p-5">
		<div class="flex items-center justify-between">
			<h2 class="text-lg font-bold text-neutral-900 dark:text-neutral-100">Kanal yaratish</h2>
			<button
				onclick={close}
				aria-label="Yopish"
				class="rounded-full p-1.5 text-neutral-500 hover:bg-neutral-100 dark:text-neutral-400 dark:hover:bg-neutral-800"
			>
				<X class="size-4.5" />
			</button>
		</div>

		<form class="mt-4 flex flex-col gap-3" onsubmit={submit} novalidate>
			<TextField
				label="Kanal nomi"
				bind:value={name}
				error={errors.name}
				placeholder="Masalan: Shahar Yangiliklari"
				oninput={autofillHandle}
			/>
			<TextField
				label="Manzil (handle)"
				bind:value={handle}
				error={errors.handle}
				hint={HANDLE_HINT}
				placeholder="shaharyangiliklari"
				autocapitalize="none"
				spellcheck={false}
				oninput={() => {
					handle = sanitizeHandleInput(handle);
					errors = { ...errors, handle: liveHandleError(handle) };
				}}
			/>
			<label class="flex flex-col gap-1.5">
				<span class="text-sm font-medium text-neutral-700 dark:text-neutral-300">Yo'nalishi (soha)</span>
				<select
					bind:value={sector}
					class="rounded-lg border border-neutral-300 px-3 py-2.5 text-sm outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 dark:border-neutral-700 dark:bg-neutral-900"
				>
					<option value="">Tanlanmagan</option>
					{#each SECTORS as s (s)}
						<option value={s}>{fieldOf(s)}</option>
					{/each}
				</select>
			</label>
			<label class="flex flex-col gap-1.5">
				<span class="text-sm font-medium text-neutral-700 dark:text-neutral-300">Tavsif</span>
				<textarea
					bind:value={description}
					rows="3"
					placeholder="Kanal haqida qisqacha..."
					class="resize-none rounded-lg border px-3 py-2.5 text-sm outline-none transition-shadow focus:ring-1 dark:bg-neutral-900 dark:placeholder:text-neutral-600 {errors.description
						? 'border-rose-400 focus:border-rose-500 focus:ring-rose-500 dark:border-rose-800'
						: 'border-neutral-300 focus:border-brand-500 focus:ring-brand-500 dark:border-neutral-700'}"
				></textarea>
				{#if errors.description}
					<span class="text-xs font-medium text-rose-600 dark:text-rose-400">{errors.description}</span>
				{/if}
			</label>

			<div class="mt-1 flex justify-end gap-2">
				<Button type="button" variant="outline" onclick={close}>Bekor qilish</Button>
				<Button type="submit">Yaratish</Button>
			</div>
		</form>
	</div>
</Modal>
