<script lang="ts">
	import X from '@lucide/svelte/icons/x';

	let { open = $bindable(false), src = '' }: { open: boolean; src?: string } = $props();

	function close() {
		open = false;
	}
</script>

{#if open && src}
	<div
		role="dialog"
		aria-modal="true"
		class="fixed inset-0 z-50 flex items-center justify-center bg-black/95 p-4 backdrop-blur-md"
	>
		<button
			onclick={close}
			class="absolute right-4 top-4 z-10 rounded-full bg-neutral-800/80 p-2 text-white transition-colors hover:bg-neutral-700"
			aria-label="Yopish"
		>
			<X class="size-6" />
		</button>

		<div class="relative max-h-[90vh] max-w-[90vw] overflow-hidden rounded-2xl">
			<img
				{src}
				alt="Media detail"
				class="max-h-[90vh] max-w-[90vw] object-contain shadow-2xl"
			/>
		</div>
	</div>
{/if}
