<script lang="ts">
	import { onMount } from 'svelte';
	import { startRecording, blobToDataUrl, fmtTime, MAX_VIDEO_SEC, type Recording } from '$lib/recorder';
	import { toastStore } from '$lib/stores/toast.svelte';

	// Doira shaklidagi video xabar: tugma bosib turilganda yoziladi, qo'yib yuborilganda ota komponent end() ni chaqiradi.
	let { onsend, onfail, cancelling = false }: { onsend: (video: { url: string; duration: number }) => void; onfail: () => void; cancelling?: boolean } = $props();

	let videoEl = $state<HTMLVideoElement>();
	let seconds = $state(0);
	let rec: Recording | undefined;
	let aborted: 'send' | 'cancel' | null = null;

	onMount(() => {
		let timer: ReturnType<typeof setInterval>;
		let dead = false;
		startRecording('video')
			.then((r) => {
				if (dead) return r.cancel();
				rec = r;
				if (aborted) return void end(aborted === 'send');
				if (videoEl) {
					videoEl.srcObject = r.stream;
					void videoEl.play().catch(() => {});
				}
				timer = setInterval(() => {
					seconds++;
					if (seconds >= MAX_VIDEO_SEC) toastStore.show('Eng uzun video xabar 30 soniya', 'info');
				}, 1000);
			})
			.catch(() => {
				toastStore.show('Kamera yoki mikrofonga ruxsat berilmadi', 'error');
				onfail();
			});
		return () => {
			dead = true;
			clearInterval(timer);
			rec?.cancel();
		};
	});

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
		onsend({ url: await blobToDataUrl(blob), duration: Math.min(duration, MAX_VIDEO_SEC) });
	}
</script>

<div role="dialog" aria-label="Video xabar yozilmoqda" data-testid="video-recorder" class="pointer-events-none fixed inset-0 z-[80] flex flex-col items-center justify-center gap-5 bg-black/80 p-6 backdrop-blur-sm">
	<div class="size-64 max-w-[80vw] overflow-hidden rounded-full ring-4 {cancelling ? 'ring-rose-500' : 'ring-white/80'}">
		<!-- svelte-ignore a11y_media_has_caption -->
		<video bind:this={videoEl} muted playsinline class="size-full -scale-x-100 object-cover"></video>
	</div>
	<p class="flex items-center gap-2 text-sm text-white"><span class="size-2.5 animate-pulse rounded-full bg-rose-500"></span><span class="tabular-nums">{fmtTime(seconds)} / {fmtTime(MAX_VIDEO_SEC)}</span></p>
	<p class="text-sm {cancelling ? 'font-semibold text-rose-400' : 'text-white/70'}">{cancelling ? 'Qo‘yib yuborsangiz bekor bo‘ladi' : 'Qo‘yib yuborsangiz yuboriladi. Bekor qilish: chapga suring'}</p>
</div>
