// Rasmni yuborishdan oldin kichraytirish (demo rejimda localStorage'ga sig'ishi uchun): uzun tomoni 960 px, JPEG ~0.72.
export const MAX_IMAGE_BYTES = 12 * 1024 * 1024;

export async function fileToResizedDataUrl(file: File, maxSide = 960, quality = 0.72): Promise<string> {
	if (!file.type.startsWith('image/')) throw new Error('Faqat rasm yuborish mumkin');
	if (file.size > MAX_IMAGE_BYTES) throw new Error('Rasm 12 MB dan oshmasligi kerak');
	const bmp = await createImageBitmap(file);
	const k = Math.min(1, maxSide / Math.max(bmp.width, bmp.height));
	const w = Math.max(1, Math.round(bmp.width * k));
	const h = Math.max(1, Math.round(bmp.height * k));
	const canvas = document.createElement('canvas');
	canvas.width = w;
	canvas.height = h;
	const ctx = canvas.getContext('2d');
	if (!ctx) throw new Error('Rasmni qayta ishlab bo‘lmadi');
	ctx.fillStyle = '#ffffff'; // shaffof PNG qora bo'lib qolmasin
	ctx.fillRect(0, 0, w, h);
	ctx.drawImage(bmp, 0, 0, w, h);
	bmp.close?.();
	return canvas.toDataURL('image/jpeg', quality);
}
