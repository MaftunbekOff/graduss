<script lang="ts">
	import { onMount } from 'svelte';
	import { startRecording, blobToDataUrl, fmtTime, MAX_VOICE_SEC, type Recording } from '$lib/recorder';
	import { toastStore } from '$lib/stores/toast.svelte';

	// Mikrofon tugmasi bosib turilganda yozadi; qo'yib yuborilganda ota komponent end() ni chaqiradi.
	let { onsend, onfail, cancelling = false }: { onsend: (audio: { url: string; duration: number }) => void; onfail: () => void; cancelling?: boolean } = $props();

	let rec: Recording | undefined;
	let seconds = $state(0);
	let aborted: 'send' | 'cancel' | null = null;

	onMount(() => {
		let timer: ReturnType<typeof setInterval>;
		let dead = false;
		startRecording('audio')
			.then((r) => {
				if (dead) return r.cancel();
				rec = r;
				if (aborted) return void end(aborted === 'send');
				timer = setInterval(() => {
					seconds++;
					if (seconds >= MAX_VOICE_SEC) toastStore.show('Eng uzun ovozli xabar 2 daqiqa', 'info');
				}, 1000);
			})
			.catch(() => {
				toastStore.show('Mikrofonga ruxsat berilmadi', 'error');
				onfail();
			});
		return () => {
			dead = true;
			clearInterval(timer);
			rec?.cancel();
		};
	});

	/** Yozishni tugatadi: send=true bo'lsa yuboradi, aks holda tashlaydi. */
	export async function end(send: boolean) {
		if (!rec) {
			aborted = send ? 'send' : 'cancel';
			return;
		}
		const r = rec;
		rec = undefined;
		if (!send) return r.cancel();
		const { blob, seconds: duration } = await r.finish();
		if (duration < 1 || seconds < 1) return toastStore.show('Juda qisqa: tugmani bosib turing', 'info');
		onsend({ url: await blobToDataUrl(blob), duration: Math.min(duration, MAX_VOICE_SEC) });
	}
</script>

<div class="flex min-h-10 min-w-0 flex-1 items-center gap-2 rounded-full bg-neutral-100 px-4 text-sm dark:bg-neutral-900" data-testid="voice-recorder">
	<span class="size-2.5 shrink-0 animate-pulse rounded-full bg-rose-500"></span>
	<span class="tabular-nums">{fmtTime(seconds)}</span>
	<span class="truncate {cancelling ? 'font-semibold text-rose-600' : 'text-neutral-500'}">{cancelling ? 'Qo‘yib yuborsangiz bekor bo‘ladi' : '← Bekor qilish uchun chapga suring'}</span>
</div>
