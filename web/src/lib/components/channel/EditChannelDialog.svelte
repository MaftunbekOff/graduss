<script lang="ts">
	import type { Channel } from '$lib/types';
	import { data } from '$lib/stores/data.svelte';
	import { toastStore } from '$lib/stores/toast.svelte';
	import Modal from '$lib/components/ui/Modal.svelte';
	import Button from '$lib/components/ui/Button.svelte';
	import TextField from '$lib/components/ui/TextField.svelte';
	import { AVATAR_COLORS, BANNERS } from '$lib/appearance';
	import { HANDLE_HINT, liveHandleError, sanitizeHandleInput, validateHandle } from '$lib/username';

	let {
		open = $bindable(false),
		channel
	}: {
		open: boolean;
		channel: Channel;
	} = $props();

	let name = $state('');
	let handle = $state('');
	let handleError = $state('');
	let description = $state('');
	let showOwner = $state(false);
	let avatar = $state('');
	let banner = $state('');

	$effect(() => {
		if (open) {
			name = channel.name;
			handle = channel.handle;
			handleError = '';
			description = channel.description;
			showOwner = !!channel.showOwner;
			avatar = channel.avatar;
			banner = channel.banner ?? BANNERS[1];
		}
	});

	function handleSubmit(e: SubmitEvent) {
		e.preventDefault();
		if (!name.trim() || !handle.trim()) return;
		const hErr = validateHandle(handle);
		if (hErr) {
			handleError = hErr;
			return;
		}
		if (handle.trim().toLowerCase() !== channel.handle && data.isHandleTaken(handle.trim())) {
			handleError = 'Bu manzil band';
			return;
		}

		data.updateChannel(channel.id, {
			name: name.trim(),
			handle: handle.trim().toLowerCase(),
			description: description.trim(),
			showOwner,
			avatar,
			banner
		});

		toastStore.show("Kanal ma'lumotlari yangilandi! ✏️", "success");
		open = false;
	}
</script>

<Modal bind:open title="Kanalni tahrirlash">
	<form onsubmit={handleSubmit} class="flex flex-col gap-4">
		<TextField label="Kanal nomi" bind:value={name} required placeholder="Masalan: Rasmiy axborotlar" />

		<TextField
			label="Kanal manzili (handle)"
			bind:value={handle}
			error={handleError}
			hint={HANDLE_HINT}
			required
			placeholder="masalan: rasmiy.kanal"
			autocapitalize="none"
			spellcheck={false}
			oninput={() => {
				handle = sanitizeHandleInput(handle);
				handleError = liveHandleError(handle) ?? '';
			}}
		/>

		<div>
			<label for="edit-channel-desc" class="mb-1 block text-xs font-semibold text-neutral-600 dark:text-neutral-400">Tavsif (opisaniye):</label>
			<textarea
				id="edit-channel-desc"
				bind:value={description}
				rows="3"
				placeholder="Kanalingiz nimaga bag'ishlangan?"
				class="w-full resize-none rounded-xl border border-neutral-300 bg-transparent p-3 text-sm outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 dark:border-neutral-700"
			></textarea>
		</div>

		<!-- Kanal ko'rinishi: avatar rangi va muqova -->
		<div class="rounded-xl border border-neutral-200 p-3 dark:border-neutral-800">
			<div class="relative mb-3 h-16 overflow-hidden rounded-lg bg-gradient-to-br {banner}" aria-hidden="true">
				<span
					class="absolute -bottom-0 left-3 flex size-10 translate-y-1/3 items-center justify-center rounded-full text-sm font-bold text-white ring-2 ring-white dark:ring-neutral-900"
					style:background-color={avatar}
					style:background-image="linear-gradient(145deg, rgba(255,255,255,.28), rgba(0,0,0,.12))">{name.trim()[0] ?? '?'}</span
				>
			</div>
			<p class="mt-5 text-xs font-semibold text-neutral-600 dark:text-neutral-400">Avatar rangi:</p>
			<div class="mt-1.5 flex flex-wrap gap-2.5">
				{#each AVATAR_COLORS as c (c)}
					<button
						type="button"
						aria-label={`Avatar rangi ${c}`}
						aria-pressed={avatar === c}
						onclick={() => (avatar = c)}
						class="size-10 rounded-full ring-2 ring-offset-2 ring-offset-white transition-transform hover:scale-105 dark:ring-offset-neutral-900 {avatar === c ? 'ring-brand-500' : 'ring-transparent'}"
						style:background-color={c}
					></button>
				{/each}
			</div>
			<p class="mt-3 text-xs font-semibold text-neutral-600 dark:text-neutral-400">Muqova:</p>
			<div class="mt-1.5 grid grid-cols-6 gap-2">
				{#each BANNERS as g (g)}
					<button
						type="button"
						aria-label={`Muqova ${g}`}
						aria-pressed={banner === g}
						onclick={() => (banner = g)}
						class="h-10 rounded-lg bg-gradient-to-br ring-2 ring-offset-2 ring-offset-white transition-transform hover:scale-105 dark:ring-offset-neutral-900 {g} {banner === g ? 'ring-brand-500' : 'ring-transparent'}"
					></button>
				{/each}
			</div>
		</div>

		<label class="flex cursor-pointer items-start gap-3 rounded-xl border border-neutral-200 p-3 dark:border-neutral-800">
			<input type="checkbox" bind:checked={showOwner} class="mt-0.5 size-4 accent-brand-600" />
			<span class="text-sm">
				<span class="font-semibold">Meni kanal egasi sifatida ko'rsatish</span>
				<span class="block text-xs text-neutral-500 dark:text-neutral-400">O'chiq bo'lsa, kanal sahifasida egasi ko'rsatilmaydi.</span>
			</span>
		</label>

		<div class="flex justify-end gap-2 pt-2">
			<Button variant="outline" onclick={() => (open = false)}>Bekor qilish</Button>
			<Button type="submit" disabled={!name.trim() || !handle.trim()}>Saqlash</Button>
		</div>
	</form>
</Modal>
