<script lang="ts">
	import Modal from '$lib/components/ui/Modal.svelte';
	import Avatar from '$lib/components/ui/Avatar.svelte';
	import Button from '$lib/components/ui/Button.svelte';
	import PhoneOff from '@lucide/svelte/icons/phone-off';
	import Mic from '@lucide/svelte/icons/mic';
	import MicOff from '@lucide/svelte/icons/mic-off';

	// Demo qo'ng'iroq oynasi: haqiqiy ulanish (WebRTC) backend bilan birga qo'shiladi.
	let {
		open = $bindable(false),
		kind,
		name,
		color
	}: { open: boolean; kind: 'voice' | 'video'; name: string; color: string } = $props();

	let seconds = $state(0);
	let muted = $state(false);

	$effect(() => {
		if (!open) return;
		seconds = 0;
		muted = false;
		const id = setInterval(() => seconds++, 1000);
		return () => clearInterval(id);
	});

	const status = $derived(seconds < 3 ? 'Qo\'ng\'iroq qilinmoqda…' : 'Demo: haqiqiy ulanish hali yo\'q');
</script>

<Modal bind:open title={kind === 'video' ? 'Video qo\'ng\'iroq' : 'Ovozli qo\'ng\'iroq'}>
	<div class="flex flex-col items-center gap-3 py-4 text-center" data-testid="call-dialog">
		<Avatar {name} {color} size="xl" />
		<p class="text-lg font-bold">{name}</p>
		<p class="text-sm text-neutral-500">{status}</p>
		<p class="text-xs tabular-nums text-neutral-400">{String(Math.floor(seconds / 60)).padStart(2, '0')}:{String(seconds % 60).padStart(2, '0')}</p>
		<div class="mt-2 flex items-center gap-4">
			<button
				type="button"
				onclick={() => (muted = !muted)}
				aria-pressed={muted}
				aria-label={muted ? 'Ovozni yoqish' : 'Ovozni o\'chirish'}
				class="flex size-12 items-center justify-center rounded-full bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-800 dark:hover:bg-neutral-700"
			>
				{#if muted}<MicOff class="size-5" />{:else}<Mic class="size-5" />{/if}
			</button>
			<Button variant="danger" class="size-12 !rounded-full !p-0" onclick={() => (open = false)} aria-label="Qo'ng'iroqni tugatish">
				<PhoneOff class="size-5" />
			</Button>
		</div>
	</div>
</Modal>
