<script lang="ts">
	import Button from '$lib/components/ui/Button.svelte';
	import Modal from '$lib/components/ui/Modal.svelte';

	let {
		open = $bindable(false),
		title,
		message,
		confirmLabel = 'Tasdiqlash',
		cancelLabel = 'Bekor qilish',
		danger = false,
		onConfirm
	}: {
		open?: boolean;
		title: string;
		message: string;
		confirmLabel?: string;
		cancelLabel?: string;
		danger?: boolean;
		onConfirm: () => void;
	} = $props();

	function confirm() {
		open = false;
		onConfirm();
	}

	function cancel() {
		open = false;
	}
</script>

<Modal bind:open onClose={cancel}>
	<div class="p-5">
		<h2 class="text-lg font-bold text-neutral-900 dark:text-neutral-100">{title}</h2>
		<p class="mt-1.5 text-sm leading-relaxed text-neutral-600 dark:text-neutral-400">{message}</p>
		<div class="mt-5 flex justify-end gap-2">
			<Button variant="outline" onclick={cancel}>{cancelLabel}</Button>
			<Button variant={danger ? 'danger' : 'primary'} onclick={confirm}>{confirmLabel}</Button>
		</div>
	</div>
</Modal>
