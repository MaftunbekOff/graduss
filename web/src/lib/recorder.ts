// Ovoz/video yozish yordamchilari (MediaRecorder). Demo: natija data URL sifatida saqlanadi, shuning uchun bitrate past.
export const MAX_VOICE_SEC = 120;
export const MAX_VIDEO_SEC = 30;

export const recordingSupported = () => typeof MediaRecorder !== 'undefined' && !!navigator.mediaDevices?.getUserMedia;

function pickMime(kind: 'audio' | 'video') {
	const list = kind === 'audio' ? ['audio/webm;codecs=opus', 'audio/mp4', 'audio/webm'] : ['video/webm;codecs=vp8,opus', 'video/webm', 'video/mp4'];
	return list.find((t) => MediaRecorder.isTypeSupported(t));
}

export function blobToDataUrl(blob: Blob) {
	return new Promise<string>((resolve, reject) => {
		const r = new FileReader();
		r.onload = () => resolve(String(r.result));
		r.onerror = () => reject(r.error);
		r.readAsDataURL(blob);
	});
}

export interface Recording {
	stream: MediaStream;
	/** Yozishni tugatadi va natijani qaytaradi. */
	finish(): Promise<{ blob: Blob; seconds: number }>;
	/** Yozuvni tashlab yuboradi, qurilmani bo'shatadi. */
	cancel(): void;
}

export async function startRecording(kind: 'audio' | 'video'): Promise<Recording> {
	const stream = await navigator.mediaDevices.getUserMedia(
		kind === 'audio' ? { audio: true } : { audio: true, video: { facingMode: 'user', width: { ideal: 320 }, height: { ideal: 320 } } }
	);
	const mimeType = pickMime(kind);
	const rec = new MediaRecorder(stream, { mimeType, audioBitsPerSecond: 24_000, ...(kind === 'video' ? { videoBitsPerSecond: 250_000 } : {}) });
	const chunks: Blob[] = [];
	rec.ondataavailable = (e) => e.data.size && chunks.push(e.data);
	const t0 = Date.now();
	rec.start(250);
	const release = () => stream.getTracks().forEach((t) => t.stop());
	return {
		stream,
		finish: () =>
			new Promise((resolve) => {
				rec.onstop = () => {
					release();
					resolve({ blob: new Blob(chunks, { type: rec.mimeType || mimeType }), seconds: Math.max(1, Math.round((Date.now() - t0) / 1000)) });
				};
				if (rec.state !== 'inactive') rec.stop();
				else rec.onstop?.(new Event('stop'));
			}),
		cancel: () => {
			rec.onstop = null;
			if (rec.state !== 'inactive') rec.stop();
			release();
		}
	};
}

export const fmtTime = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
