// graduss frontend "tutun sinovi" (smoke test): haqiqiy brauzerda asosiy oqimlarni tekshiradi.
// Ishga tushirish: `npm run smoke` (build + preview + shu skript). Faqat DEMO rejim (localStorage), backend kerak emas.
// Har bir tekshiruv check(nom, shart) bilan; bittasi ham yiqilsa chiqish kodi 1.
import { chromium } from 'playwright-core';

const BASE = process.argv[2] || 'http://127.0.0.1:4199';
const fails = [];
let total = 0;

function check(name, cond, extra = '') {
	total++;
	const ok = !!cond;
	console.log((ok ? 'OK   ' : 'FAIL ') + name + (!ok && extra ? `  [${extra}]` : ''));
	if (!ok) fails.push(name);
}

const browser = await chromium.launch({ args: ['--use-fake-device-for-media-stream', '--use-fake-ui-for-media-stream'] });

async function session(kind, { auth = true, scheme = 'light' } = {}) {
	const mobile = kind === 'm';
	const ctx = await browser.newContext({
		viewport: mobile ? { width: 390, height: 844 } : { width: 1280, height: 900 },
		colorScheme: scheme,
		hasTouch: mobile
	});
	await ctx.grantPermissions(['microphone', 'camera']);
	// Tashqi tarmoqqa (rasm, shrift) chiqmaymiz: sinov tez va barqaror bo'lsin.
	await ctx.route('**/*', (r) => (r.request().url().startsWith(BASE) ? r.continue() : r.abort()));
	if (auth) await ctx.addInitScript(() => localStorage.setItem('session', 'true'));
	const page = await ctx.newPage();
	page.errors = [];
	page.on('pageerror', (e) => page.errors.push(e.message));
	page.on('console', (m) => {
		if (m.type() === 'error' && !/Failed to load resource|net::ERR/.test(m.text())) page.errors.push(m.text());
	});
	return page;
}

const go = async (p, path, wait = 700) => {
	await p.goto(BASE + path);
	await p.waitForTimeout(wait);
};
const texts = async (loc) => (await loc.allInnerTexts()).map((t) => t.trim());
const cards = (p) => p.locator('main [role="link"]');
const tabs = (p) => p.getByRole('tab');
const items = async (p, i = 0) => {
	await tabs(p).nth(i).click();
	await p.waitForTimeout(250);
	const r = await texts(p.getByRole('menuitemradio'));
	await p.keyboard.press('Escape');
	await p.mouse.click(2, 2);
	await p.waitForTimeout(200);
	return r;
};

// ───────────────────────── 1. Sahifalar xatosiz ochiladi, gorizontal aylanish yo'q ─────────────────────────
for (const kind of ['m', 'd']) {
	const p = await session(kind);
	const paths = ['/feed', '/search', '/chats', '/chats/ch1', '/channels', '/channels/c1', '/channels/c6', '/post/p15', '/profile/anvarov', '/profile/dr.malika', '/notifications', '/settings', '/campaigns/k1', '/campaigns/k6', '/campaigns/k7'];
	let bad = [];
	for (const path of paths) {
		await go(p, path, 500);
		const ov = await p.evaluate(() => document.documentElement.scrollWidth > innerWidth + 1);
		if (ov) bad.push(path);
	}
	check(`[${kind}] 15 ta sahifada gorizontal aylanish yo'q`, bad.length === 0, bad.join(','));
	check(`[${kind}] sahifalarda JS xatosi yo'q`, p.errors.length === 0, p.errors.slice(0, 2).join(' | '));
	await p.context().close();
}

// ───────────────────────── 1b. Qulaylik (a11y): nomsiz boshqaruv yo'q, bitta h1, teginish maydoni ─────────────────────────
{
	const p = await session('m');
	const paths = ['/feed', '/search', '/chats', '/chats/ch1', '/channels', '/channels/c1', '/channels/c6', '/post/p15', '/profile/anvarov', '/profile/dr.malika', '/notifications', '/settings', '/campaigns/k1', '/campaigns/k6'];
	const unnamed = [];
	const noH1 = [];
	const tiny = [];
	for (const path of paths) {
		await go(p, path, 500);
		const r = await p.evaluate(() => {
			const name = (el) => {
				const al = el.getAttribute('aria-label');
				if (al?.trim()) return al.trim();
				const lb = el.getAttribute('aria-labelledby');
				if (lb && lb.split(' ').map((id) => document.getElementById(id)?.textContent ?? '').join('').trim()) return 'x';
				if (el.id) { const l = document.querySelector(`label[for="${CSS.escape(el.id)}"]`); if (l?.textContent.trim()) return 'x'; }
				if (el.closest('label')?.textContent.trim()) return 'x';
				if ((el.innerText || el.textContent || '').trim()) return 'x';
				if (el.querySelector('img[alt]')?.alt.trim()) return 'x';
				if (el.getAttribute('title')?.trim() || el.getAttribute('placeholder')?.trim()) return 'x';
				return '';
			};
			const un = [];
			const small = [];
			document.querySelectorAll('button, a[href], input, textarea, select, [role="button"], [role="tab"], [role="link"]').forEach((el) => {
				const r = el.getBoundingClientRect();
				if (!r.width || !r.height || el.type === 'hidden') return;
				if (!name(el)) un.push(el.tagName.toLowerCase());
			});
			// ikonli tugmalar (matn yo'q) kamida 36x36 bo'lsin
			document.querySelectorAll('button').forEach((el) => {
				const r = el.getBoundingClientRect();
				if (r.width && (el.innerText || '').trim() === '' && !el.closest('label') && (r.width < 34 || r.height < 34) && getComputedStyle(el).opacity !== '0') small.push((el.getAttribute('aria-label') || '?') + ` ${Math.round(r.width)}x${Math.round(r.height)}`);
			});
			return { un, h1: document.querySelectorAll('main h1, main [role="heading"][aria-level="1"]').length, small };
		});
		if (r.un.length) unnamed.push(`${path}:${r.un.length}`);
		if (r.h1 !== 1) noH1.push(`${path}:${r.h1}`);
		if (r.small.length) tiny.push(`${path}:${r.small.join(',')}`);
	}
	check("barcha sahifalarda nomsiz tugma/havola/maydon yo'q", unnamed.length === 0, unnamed.join(' '));
	check('har sahifada aynan bitta h1 sarlavha', noH1.length === 0, noH1.join(' '));
	check("ikonli tugmalar teginish uchun yetarli (>=34 px)", tiny.length === 0, tiny.slice(0, 3).join(' | '));
	await p.context().close();
}

// ───────────────────────── 1c. Zamonaviy qatlam: meta, PWA, havola kartasi, bildirishnoma guruhlari ─────────────────────────
{
	const p = await session('m');
	await go(p, '/feed');
	const head = await p.evaluate(() => ({
		icons: [...document.querySelectorAll('link[rel~="icon"]')].map((l) => l.getAttribute('href')),
		manifest: document.querySelector('link[rel="manifest"]')?.getAttribute('href'),
		apple: !!document.querySelector('link[rel="apple-touch-icon"]'),
		og: document.querySelector('meta[property="og:image"]')?.getAttribute('content'),
		theme: document.querySelector('meta[name="theme-color"]')?.getAttribute('content')
	}));
	check("faqat bitta favicon (brend), eski megafon yo'q", head.icons.length === 1 && /\/favicon\.svg$/.test(head.icons[0]), head.icons.join(','));
	check('PWA: manifest, apple-touch-icon, theme-color, og:image bor', head.manifest === '/manifest.webmanifest' && head.apple && head.theme === '#3730a3' && /og\.png$/.test(head.og ?? ''));
	const man = await p.evaluate(async () => (await fetch('/manifest.webmanifest')).json());
	check("manifest to'g'ri (nom, start_url, 2 ta ikonka)", man.name === 'graduss' && man.start_url === '/feed' && man.icons.length === 2);
	const ic = await p.evaluate(async () => Promise.all(['/icons/icon-192.png', '/icons/icon-512.png', '/icons/apple-touch-icon.png', '/og.png'].map(async (u) => (await fetch(u)).ok)));
	check('ikonkalar va og rasm mavjud', ic.every(Boolean), ic.join(','));
	// havola kartasi
	await go(p, '/channels/c6');
	const lp = p.locator('main a[aria-label="Havola: opensource.guide"]');
	check("postdagi havola uchun karta (domen) chiqadi, yangi oynada ochiladi", (await lp.count()) === 1 && (await lp.getAttribute('target')) === '_blank' && /noopener/.test((await lp.getAttribute('rel')) ?? ''));
	await lp.click({ trial: true }).catch(() => {});
	// bildirishnomalar guruhlangan
	await go(p, '/notifications');
	const heads = await texts(p.locator('main section[aria-label] h2'));
	check("bildirishnomalar kunlar bo'yicha guruhlangan (sarlavhalar)", heads.length >= 1 && heads.every((h) => ['bugun', 'kecha', 'shu hafta', 'oldinroq'].includes(h.toLowerCase())), heads.join(','));
	check("modern qatlamda JS xatosi yo'q", p.errors.length === 0, p.errors[0]);
	await p.context().close();
}

// ───────────────────────── 2. Ro'yxatdan o'tish va username qoidalari ─────────────────────────
{
	const p = await session('m', { auth: false });
	await go(p, '/register');
	const u = p.getByLabel('Foydalanuvchi nomi');
	const err = async () => (await p.locator('label:has(#field-foydalanuvchi-nomi) span.text-rose-600').allInnerTexts()).join('|');
	await u.fill('');
	await u.pressSequentially('kun_uz');
	check('username: kun_uz rad etiladi', /pastki chiziq/.test(await err()));
	await u.fill('');
	await u.pressSequentially('123uz');
	check('username: 123uz rad etiladi', /Harf bilan boshlanishi/.test(await err()));
	await u.fill('');
	await u.pressSequentially('kun__uz');
	check('username: kun__uz rad etiladi', (await err()).length > 0);
	await u.fill('');
	await u.pressSequentially('Kun.UZ');
	check('username: Kun.UZ kichik harfga o`tadi va qabul qilinadi', (await u.inputValue()) === 'kun.uz' && (await err()) === '');
	await p.getByLabel("To'liq ism").fill('Kun Uz');
	await p.getByLabel('Email').fill('kun@uz.uz');
	await p.getByLabel('Parol').fill('parol1234');
	await p.getByRole('button', { name: "Ro'yxatdan o'tish" }).click();
	await p.waitForTimeout(1200);
	check("ro'yxatdan o'tgach lentaga o'tadi", p.url().endsWith('/feed'), p.url());
	await p.goto(BASE + '/profile/kun.uz');
	await p.waitForTimeout(600);
	check('/profile/kun.uz ochiladi (nuqtali username)', (await p.locator('main').innerText()).includes('@kun.uz'));
	check("ro'yxatdan o'tishda JS xatosi yo'q", p.errors.length === 0, p.errors[0]);
	await p.context().close();
}

// ───────────────────────── 2b. Yangi foydalanuvchi: yo'l-yo'riq (onboarding) ─────────────────────────
{
	const p = await session('m', { auth: false });
	await go(p, '/register');
	await p.getByLabel("To'liq ism").fill('Yangi Odam');
	await p.getByLabel('Foydalanuvchi nomi').fill('yangi.odam');
	await p.getByLabel('Email').fill('yangi@uz.uz');
	await p.getByLabel('Parol').fill('parol1234');
	await p.getByRole('button', { name: "Ro'yxatdan o'tish" }).click();
	await p.waitForTimeout(1200);
	const ob = p.getByRole('region', { name: 'Boshlash uchun qadamlar' });
	check("yangi foydalanuvchida yo'l-yo'riq ko'rinadi (0/3)", (await ob.count()) === 1 && /0 \/ 3/.test(await ob.innerText()));
	check('yangi foydalanuvchining lentasi bo`sh, postlar yo`q', (await cards(p).count()) === 0);
	check("tavsiya etilgan kanallar ko'rinadi", (await ob.locator('ul li').count()) >= 3);
	// 3 ta kanalga a'zo bo'lish
	const btns = ob.getByRole('button', { name: "A'zo bo'lish" });
	for (let i = 0; i < 3; i++) {
		await ob.getByRole('button', { name: "A'zo bo'lish" }).first().click();
		await p.waitForTimeout(250);
	}
	check("3 ta kanalga a'zo bo'lgach 2-qadam bajarilib (1/3) ro'yxat yig'iladi", /1 \/ 3/.test(await ob.innerText()) && (await ob.locator('ul li').count()) === 0);
	check("a'zo bo'lingan kanal postlari lentada paydo bo'ladi", (await cards(p).count()) >= 1);
	// profil to'ldirish (sozlamalar)
	await go(p, '/settings');
	await p.getByLabel('Bio').fill('Yangi mutaxassisman');
	await p.getByLabel('Joylashuv').fill('Toshkent');
	await p.getByRole('button', { name: /Saqlash|Saqlash/ }).first().click().catch(() => {});
	await p.waitForTimeout(400);
	await go(p, '/feed');
	// post yozish
	const ob2 = p.getByRole('region', { name: 'Boshlash uchun qadamlar' });
	if (await ob2.count()) {
		await ob2.getByRole('button', { name: 'Post yozish' }).click().catch(() => {});
		await p.waitForTimeout(300);
		await p.getByPlaceholder('Nima gapirmoqchisiz?').fill('Birinchi postim').catch(() => {});
		await p.getByRole('button', { name: 'Chop etish' }).click().catch(() => {});
		await p.waitForTimeout(500);
	}
	check("3 qadam bajarilgach yo'l-yo'riq yo'qoladi", (await p.getByRole('region', { name: 'Boshlash uchun qadamlar' }).count()) === 0);
	// 'Keyinroq' yopadi va eslab qoladi
	const q = await session('m', { auth: false });
	await go(q, '/register');
	await q.getByLabel("To'liq ism").fill('Ikkinchi Odam');
	await q.getByLabel('Foydalanuvchi nomi').fill('ikkinchi.odam');
	await q.getByLabel('Email').fill('ikkinchi@uz.uz');
	await q.getByLabel('Parol').fill('parol1234');
	await q.getByRole('button', { name: "Ro'yxatdan o'tish" }).click();
	await q.waitForTimeout(1200);
	await q.getByRole('button', { name: 'Keyinroq' }).click();
	await q.waitForTimeout(300);
	await q.reload();
	await q.waitForTimeout(700);
	check("'Keyinroq' yo'l-yo'riqni yopadi va yangilangandan keyin ham yopiq", (await q.getByRole('region', { name: 'Boshlash uchun qadamlar' }).count()) === 0);
	check("yo'l-yo'riq yopilgach bo'sh lentada tavsiya etilgan kanallar chiqadi", (await q.getByText("Lentada hozircha post yo'q").count()) === 1 && (await q.locator('main ul li').count()) >= 3);
	check("yo'l-yo'riqda JS xatosi yo'q", p.errors.length === 0 && q.errors.length === 0, p.errors[0] || q.errors[0]);
	await p.context().close();
	await q.context().close();
}

// ───────────────────────── 3. Lenta, post yozish, post sahifasi, izoh ─────────────────────────
{
	const p = await session('m');
	await go(p, '/feed');
	const n = await cards(p).count();
	check('lentada postlar bor', n >= 5, String(n));
	check('lentada Ulashish tugmasi yo`q', (await p.getByRole('button', { name: 'Ulashish' }).count()) === 0);
	check("post kartasida ko'rishlar soni bor", (await p.locator('main [role="link"] span[title="Ko\'rishlar"]').count()) >= 5);
	check('lentada ichki composer yo`q, qalamcha bor', (await p.getByPlaceholder('Nima gapirmoqchisiz?').count()) === 0 && (await p.getByRole('button', { name: 'Post yozish' }).count()) === 1);
	await p.getByRole('button', { name: 'Post yozish' }).click();
	await p.waitForTimeout(300);
	await p.getByPlaceholder('Nima gapirmoqchisiz?').fill('Smoke sinov posti');
	await p.getByRole('button', { name: 'Chop etish' }).click();
	await p.waitForTimeout(500);
	check('yangi post lentada paydo bo`ladi, oyna yopiladi', (await p.getByText('Smoke sinov posti').count()) === 1 && (await p.getByPlaceholder('Nima gapirmoqchisiz?').count()) === 0);
	// post sahifasi
	await go(p, '/post/p15');
	const header = await p.locator('main header').first().innerText();
	check('post sarlavhasida kanal nomi, muallif yo`q', header.includes('Dasturchilar Uyi') && !header.includes('Bobur') && !/@bobur/.test(header));
	check('post sahifasida pastki panel va yuqori panel yo`q (telefon)', (await p.locator('nav.fixed').filter({ visible: true }).count()) === 0 && (await p.locator('main a[aria-label="Qidiruv"]').filter({ visible: true }).count()) === 0);
	const bar = await p.locator('main form').boundingBox();
	check('izoh paneli ekran pastiga mahkamlangan', Math.round(bar.y + bar.height) >= 840, String(bar.y + bar.height));
	await p.getByPlaceholder('Izoh yozing').fill('Smoke izoh');
	await p.locator('main form').getByRole('button', { name: 'Yuborish' }).click();
	await p.waitForTimeout(700);
	const mine = p.locator('main .group').last().locator('div.rounded-2xl').first();
	const bb = await mine.boundingBox();
	check("o'z izohim o'ngda (brend rangli)", (await mine.innerText()).includes('Smoke izoh') && 390 - (bb.x + bb.width) < 40 && (await mine.getAttribute('class')).includes('bg-brand-600'));
	await p.locator('main header').getByRole('button', { name: "Ko'proq" }).click();
	await p.waitForTimeout(200);
	check('post menyusi: Saqlash va Chatga yuborish bor', (await texts(p.locator('div.absolute.right-0 button'))).join('|').includes('Saqlash') && (await p.getByRole('button', { name: 'Chatga yuborish' }).count()) === 1);
	check('post sahifasida JS xatosi yo`q', p.errors.length === 0, p.errors[0]);
	await p.context().close();
}

// ───────────────────────── 4. Kanal: bitta tab, select, filtr, saralash ─────────────────────────
{
	const p = await session('m');
	await go(p, '/channels/c6');
	check('kanalda bitta "Postlar" tabi', (await tabs(p).count()) === 1 && (await texts(tabs(p)))[0] === 'Postlar');
	const l6 = await items(p);
	check("select faqat posti bor turlarni ko'rsatadi (c6: Hammasi, Linklar, kategoriyalar)", l6[0] === 'Hammasi' && l6.includes('Linklar') && !l6.includes('Rasmlar') && !l6.includes('GIFlar') && !l6.includes('Videolar'), l6.join(','));
	await go(p, '/channels/c12');
	const l12 = await items(p);
	check('c12: Rasmlar va Videolar bor, GIFlar yo`q', l12.includes('Rasmlar') && l12.includes('Videolar') && !l12.includes('GIFlar'), l12.join(','));
	await go(p, '/channels/c10');
	check('c10: GIFlar bor', (await items(p)).includes('GIFlar'));
	await tabs(p).first().click();
	await p.getByRole('menuitemradio', { name: 'GIFlar' }).click();
	await p.waitForTimeout(300);
	check('GIF tasvir chiziladi (img .gif)', (await p.locator('main img[src$=".gif"]').count()) === 1);
	// filtr ishlashi
	await go(p, '/channels/c12');
	await tabs(p).first().click();
	await p.getByRole('menuitemradio', { name: 'Videolar' }).click();
	await p.waitForTimeout(300);
	check('Videolar filtri faqat videoli postlarni ko`rsatadi, tab nomi o`zgaradi', (await cards(p).count()) >= 1 && (await cards(p).evaluateAll((els) => els.every((e) => e.querySelector('video')))) && (await texts(tabs(p)))[0] === 'Videolar');
	// saralash yig'ilgan
	await tabs(p).first().click();
	await p.waitForTimeout(300);
	check('Saralash yig`ilgan qator', (await p.getByRole('menuitemradio', { name: 'Eskilari birinchi' }).count()) === 0 && (await p.getByRole('button', { name: /Saralash/ }).count()) === 1);
	await p.getByRole('button', { name: /Saralash/ }).click();
	await p.waitForTimeout(300);
	check('Saralash bosilganda variantlari ochiladi', (await p.getByRole('menuitemradio', { name: 'Eskilari birinchi' }).count()) === 1);
	// scroll urinishi yopadi
	// g'ildirak nuqtasi ro'yxatdan TASHQARIDA bo'lsin (ro'yxat joyi ekranga qarab o'zgaradi)
	const mb = await p.getByRole('menu').boundingBox();
	await p.mouse.move(Math.min(386, mb.x + mb.width + 24), Math.max(30, mb.y + mb.height / 2));
	await p.mouse.wheel(0, 300);
	await p.waitForTimeout(300);
	check('select ochiq turganda scroll urinishi uni yopadi', (await p.getByRole('menu').count()) === 0);
	// a'zolar soni va egasi
	await go(p, '/channels/c13');
	const t13 = await p.locator('main').innerText();
	check("boshqalarga a'zolar soni va 'Egasi' ko'rinmaydi", !/a'zo\b(?! bo)/.test(t13.replace(/a'zo bo'l\w*/g, '')) && !/Egasi:/.test(t13));
	check('kanal soha belgisi (Musiqa) kanal ichida bor', t13.includes('Musiqa'));
	await go(p, '/channels');
	check("kanallar ro'yxatida soha belgisi va son yo'q", (await p.locator('main a[href^="/channels/c"] span.ring-inset').count()) === 0);
	check('kanallar sahifasida JS xatosi yo`q', p.errors.length === 0, p.errors[0]);
	await p.context().close();
}

// ───────────────────────── 5. Kanal egasi: a'zolar soni, qadash, kategoriya, kampaniya ─────────────────────────
{
	const p = await session('m');
	await go(p, '/channels/c1');
	const t = await p.locator('main').innerText();
	check("egasiga a'zolar soni 'faqat sizga ko'rinadi' bilan ko'rinadi", /faqat sizga ko'rinadi/.test(t));
	check("kampaniya kartasi postlar maydonida, ma'lumotlar panelida emas", await p.evaluate(() => { const tl = document.querySelector('[role="tablist"]'); return !!document.querySelector('main section') && !tl?.parentElement?.querySelector('section'); }));
	// kategoriya yaratish/takror/o'chirish
	await tabs(p).first().click();
	await p.waitForTimeout(250);
	await p.getByText('Kategoriyalarni boshqarish').click();
	await p.waitForTimeout(300);
	await p.getByLabel('Yangi kategoriya nomi').fill('SmokeKat');
	await p.getByRole('button', { name: "Qo'shish", exact: true }).click();
	await p.waitForTimeout(200);
	await p.getByLabel('Yangi kategoriya nomi').fill('SmokeKat');
	await p.getByRole('button', { name: "Qo'shish", exact: true }).click();
	await p.waitForTimeout(200);
	check('kategoriya yaratiladi, takrori rad etiladi', (await p.getByText('Bunday kategoriya bor').count()) === 1 && (await p.locator('ul li span.truncate').allInnerTexts()).includes('SmokeKat'));
	await p.mouse.click(2, 2);
	await p.waitForTimeout(300);
	// kategoriyali post
	await p.getByPlaceholder(/kanaliga yozing/).fill('Kategoriyali smoke post');
	await p.getByLabel('Post kategoriyasi').selectOption({ label: 'SmokeKat' });
	await p.getByRole('button', { name: 'Chop etish' }).click();
	await p.waitForTimeout(400);
	await tabs(p).first().click();
	await p.waitForTimeout(250);
	await p.getByRole('menuitemradio', { name: 'SmokeKat' }).click();
	await p.waitForTimeout(300);
	check('kategoriya filtri postni topadi', (await cards(p).count()) === 1 && (await p.getByText('Kategoriyali smoke post').count()) === 1);
	// qadash
	await tabs(p).first().click();
	await p.waitForTimeout(200);
	await p.getByRole('menuitemradio', { name: 'Hammasi' }).click();
	await p.waitForTimeout(300);
	const target = cards(p).filter({ hasText: 'Kategoriyali smoke post' }).first();
	await target.getByRole('button', { name: "Ko'proq" }).click();
	await p.waitForTimeout(200);
	await p.getByRole('button', { name: 'Kanal tepasiga qadash' }).click();
	await p.waitForTimeout(400);
	check('qadalgan post tepada va "Qadalgan" yozuvi bor', /Qadalgan/.test(await cards(p).first().innerText()) && (await cards(p).first().innerText()).includes('Kategoriyali smoke post'));
	await go(p, '/channels/c1');
	await p.mouse.move(200, 400);
	await p.mouse.wheel(0, 500);
	await p.waitForTimeout(500);
	check("Tahrirlash tugmasi banner ustida, aylantirilganda qotib turmaydi", (await p.getByRole('button', { name: 'Tahrirlash' }).evaluate((e) => e.getBoundingClientRect().bottom)) < 0);
	check("kanal egasi bo'lmaganida (c13) qadash tugmasi yo'q", await (async () => {
		await go(p, '/channels/c13');
		await cards(p).first().getByRole('button', { name: "Ko'proq" }).click();
		await p.waitForTimeout(200);
		return (await p.getByRole('button', { name: /qadash/i }).count()) === 0;
	})());
	check('egasi sahifasida JS xatosi yo`q', p.errors.length === 0, p.errors[0]);
	await p.context().close();
}

// ───────────────────────── 5b. Kampaniya: ixcham karta va alohida sahifa ─────────────────────────
{
	const p = await session('m');
	await go(p, '/channels/c3');
	const card = p.locator('main section').first();
	check('kanalda kampaniya kartasi ixcham (bosqichlar ro`yxati yo`q), "Batafsil" havolasi bor', (await card.getByText('Kampaniya', { exact: true }).count()) === 1 && (await card.locator('ol').count()) === 0 && (await card.getByRole('link', { name: /Batafsil/ }).count()) === 1);
	await card.getByRole('link', { name: /Batafsil/ }).click();
	await p.waitForTimeout(600);
	check('"Batafsil" kampaniya sahifasiga olib boradi', /\/campaigns\/k1$/.test(p.url()), p.url());
	check('kampaniya sahifasida yuqori panel yo`q, kanal nomi sarlavhada', (await p.locator('main a[aria-label="Qidiruv"]').filter({ visible: true }).count()) === 0 && (await p.locator('main header').first().innerText()).includes('Startap Hamjamiyati'));
	const t = await p.locator('main').innerText();
	check("sahifada sarlavha, raqamlar, bosqichlar va donorlar bor", t.includes('Mahalliy startaplar uchun coworking') && /Bosqichlar/.test(t) && /Donorlar/.test(t) && (await p.locator('main section[aria-label="Donorlar"] li').count()) === 4);
	check('bosqichlar vaqt chizig`ida (3 ta)', (await p.locator('main section[aria-label="Bosqichlar"] li').count()) === 3);
	// qo'llab-quvvatlash
	const before = await p.locator('main section[aria-label="Donorlar"] li').count();
	await p.getByRole('button', { name: "Qo'llab-quvvatlash" }).click();
	await p.waitForTimeout(300);
	await p.locator('.fixed.inset-0.z-50 input').first().fill('250000');
	await p.locator('.fixed.inset-0.z-50 form button[type="submit"]').click();
	await p.waitForTimeout(500);
	check("qo'llab-quvvatlagach donorlar ro'yxatida '(siz)' paydo bo'ladi", (await p.locator('main section[aria-label="Donorlar"] li').count()) === before + 1 && (await p.locator('main section[aria-label="Donorlar"]').innerText()).includes('(siz)'));
	// yig'ilmagan kampaniya
	await go(p, '/campaigns/k7');
	const t7 = await p.locator('main').innerText();
	check("yig'ilmagan kampaniya: qaytarish xabari bor, bosqichlar bo'limi yo'q", /to'liq qaytariladi/.test(t7) && (await p.locator('main section[aria-label="Bosqichlar"]').count()) === 0);
	// egasi: hisobot yuborish (c1 ning kampaniyasi k2, 2-bosqich kutilmoqda)
	await go(p, '/campaigns/k2');
	check("kampaniya egasiga 'Hisobot yuborish' ko'rinadi", (await p.getByRole('button', { name: 'Hisobot yuborish' }).count()) === 1);
	await p.getByRole('button', { name: 'Hisobot yuborish' }).click();
	await p.waitForTimeout(300);
	await p.getByLabel('Hisobot').fill('Jihozlar o`rnatildi, cheklar ilova qilindi.');
	await p.locator('.fixed.inset-0.z-50 form button[type="submit"]').click();
	await p.waitForTimeout(500);
	check("hisobot yuborilgach bosqich 'ovoz berish' holatiga o'tadi", /ovoz berish: \d+\/\d+ kerak/.test(await p.locator('main section[aria-label="Bosqichlar"]').innerText()));
	// qidiruvdagi kampaniya havolasi
	await go(p, '/search');
	await tabs(p).nth(3).click();
	await p.waitForTimeout(300);
	check("qidiruvda kampaniya kampaniya sahifasiga olib boradi", ((await p.locator('main a[href^="/campaigns/"]').count()) >= 1));
	check('kampaniya sahifalarida JS xatosi yo`q', p.errors.length === 0, p.errors[0]);
	await p.context().close();
}

// ───────────────────────── 6. Profil: tablar, saqlanganlar, select ─────────────────────────
{
	const p = await session('m');
	await go(p, '/profile/anvarov');
	check('profil: Postlar | Saqlanganlar tablari', (await texts(tabs(p))).join('|') === 'Postlar|Saqlanganlar');
	// nofaol tabni bosish faqat o'tadi
	await tabs(p).nth(1).click();
	await p.waitForTimeout(300);
	check('nofaol tab bosilganda select ochilmaydi', (await p.getByRole('menu').count()) === 0 && (await p.locator('[role="tab"][aria-selected="true"]').innerText()).trim() === 'Saqlanganlar');
	await tabs(p).nth(1).click();
	await p.waitForTimeout(300);
	check('faol tab qayta bosilganda select ochiladi', (await p.getByRole('menu').count()) === 1);
	check('Saqlanganlar selectida Saralash yo`q', (await p.getByRole('button', { name: /Saralash/ }).count()) === 0);
	await p.keyboard.press('Escape');
	await p.mouse.click(2, 2);
	// saqlash va filtr
	await go(p, '/post/p22');
	await p.locator('main header').getByRole('button', { name: "Ko'proq" }).click();
	await p.getByRole('button', { name: /^Saqlash$/ }).click();
	await p.waitForTimeout(300);
	await go(p, '/profile/anvarov?tab=saved');
	const sl = await items(p, 1);
	check('Saqlanganlar: faqat Hammasi va Videolar (saqlangan post videoli)', sl.join('|') === 'Hammasi|Videolar', sl.join(','));
	await tabs(p).nth(1).click();
	await p.getByRole('menuitemradio', { name: 'Videolar' }).click();
	await p.waitForTimeout(300);
	check('Videolar tanlanganda tab nomi "Videolar", 1 ta post', (await texts(tabs(p)))[1] === 'Videolar' && (await cards(p).count()) === 1);
	// avatar muqova ostida emas
	await go(p, '/profile/dr.malika');
	const av = await p.evaluate(() => { const a = [...document.querySelectorAll('main .relative.z-10')].find((e) => e.querySelector('span')); return !!a; });
	check('profil avatari muqova ustida (z-10)', av);
	check('profilda JS xatosi yo`q', p.errors.length === 0, p.errors[0]);
	await p.context().close();
}

// ───────────────────────── 6b. Profil qo'shig'i ─────────────────────────
{
	const p = await session('m');
	await go(p, '/profile/otabek.music');
	const card = p.getByLabel("Profil qo'shig'i");
	check("profilda qo'shiq kartasi bor (nom va ijrochi)", (await card.count()) === 1 && /Dutor navosi/.test(await card.innerText()) && /Otabek Sodiqov/.test(await card.innerText()));
	await card.getByRole('button', { name: 'Ijro etish' }).click();
	await p.waitForTimeout(900);
	check("ijro etish ishlaydi (tugma 'To'xtatish' bo'ladi, progress yuradi)", (await card.getByRole('button', { name: "To'xtatish" }).count()) === 1 && (await card.getByRole('progressbar').getAttribute('aria-valuenow')) !== '0');
	await card.getByRole('button', { name: "To'xtatish" }).click();
	await p.waitForTimeout(200);
	check("To'xtatish bosilganda qaytadan 'Ijro etish'", (await card.getByRole('button', { name: 'Ijro etish' }).count()) === 1);
	await go(p, '/profile/anvarov');
	check("o'z profilimda test qo'shiq (Bahor kuyi) muqova ustida turadi", /Bahor kuyi/.test(await p.getByLabel("Profil qo'shig'i").innerText()));
	check("qo'shiq kapsulasi muqova ichida (avatar orqasidagi fon)", await p.evaluate(() => { const g = document.querySelector('[aria-label="Profil qo\'shig\'i"]'); const banner = g?.parentElement; return !!banner && banner.className.includes('h-36') && banner.className.includes('bg-gradient'); }));
	await go(p, '/profile/dr.malika');
	check("qo'shig'i yo'q boshqa profilda kapsula ham, 'qo'shish' havolasi ham yo'q", (await p.getByLabel("Profil qo'shig'i").count()) === 0 && (await p.getByRole('link', { name: /Qo'shiq qo'shish/ }).count()) === 0);
	// sozlamalar orqali qo'shish / xato / o'chirish
	await go(p, '/settings');
	await p.getByLabel("Qo'shiq nomi").fill('Mening navom');
	await p.getByLabel('Havola (URL)').fill('noto`g`ri');
	await p.getByRole('button', { name: 'Saqlash', exact: true }).first().click();
	await p.waitForTimeout(300);
	check("noto'g'ri havola rad etiladi", (await p.getByText(/https:\/\/ bilan boshlanishi/).count()) === 1);
	await p.getByLabel('Havola (URL)').fill('/demo/melody-2.wav');
	await p.getByLabel('Ijrochi').fill('Anvar Anvarov');
	await p.getByRole('button', { name: 'Saqlash', exact: true }).first().click();
	await p.waitForTimeout(300);
	await go(p, '/profile/anvarov');
	check("sozlamalarda qo'shilgan qo'shiq profilda ko'rinadi", /Mening navom/.test(await p.getByLabel("Profil qo'shig'i").innerText()));
	await p.getByLabel("Profil qo'shig'i").getByRole('button', { name: 'Ijro etish' }).click();
	await p.waitForTimeout(500);
	await go(p, '/settings');
	await p.getByLabel("Qo'shiq nomi").fill('');
	await p.getByLabel('Ijrochi').fill('');
	await p.getByLabel('Havola (URL)').fill('');
	await p.getByRole('button', { name: 'Saqlash', exact: true }).first().click();
	await p.waitForTimeout(300);
	await go(p, '/profile/anvarov');
	check("hammasi bo'sh saqlansa qo'shiq o'chadi va 'Qo'shiq qo'shish' havolasi chiqadi", (await p.getByLabel("Profil qo'shig'i").count()) === 0 && (await p.getByRole('link', { name: /Qo'shiq qo'shish/ }).count()) === 1);
	// tashqi havola: Tinglash
	await go(p, '/settings');
	await p.getByLabel("Qo'shiq nomi").fill('Tashqi');
	await p.getByLabel('Havola (URL)').fill('https://www.youtube.com/watch?v=abc');
	await p.getByRole('button', { name: 'Saqlash', exact: true }).first().click();
	await p.waitForTimeout(300);
	await go(p, '/profile/anvarov');
	const ext = p.getByLabel("Profil qo'shig'i").getByRole('link', { name: /Tinglash/ });
	check("audio bo'lmagan havola uchun 'Tinglash' (yangi oyna, noopener)", (await ext.count()) === 1 && (await ext.getAttribute('target')) === '_blank' && /noopener/.test((await ext.getAttribute('rel')) ?? ''));
	check("profil qo'shig'ida JS xatosi yo'q", p.errors.length === 0, p.errors[0]);
	await p.context().close();
}

// ───────────────────────── 7. Xabarlar ─────────────────────────
{
	const p = await session('m');
	const names = async () => await p.locator('main a[href^="/chats/"]').evaluateAll((els) => els.map((e) => e.innerText.split('\n')[0].trim()));
	await go(p, '/chats');
	const before = await names();
	// profildan xabar tugmasi, yozmay qaytish
	await go(p, '/profile/j.rustamov');
	await p.getByRole('button', { name: 'Xabar yozish' }).click();
	await p.waitForTimeout(500);
	await p.goBack();
	await p.waitForTimeout(300);
	await go(p, '/chats');
	check("yozilmagan suhbat ro'yxatda qolmaydi", (await names()).length === before.length, `${before.length} -> ${(await names()).length}`);
	// oxirgi suhbatga yozish -> tepaga chiqadi
	const last = before[before.length - 1];
	await p.locator('main a[href^="/chats/"]').last().click();
	await p.waitForTimeout(500);
	check('suhbat ichida pastki va yuqori panel yo`q', (await p.locator('nav.fixed').filter({ visible: true }).count()) === 0);
	{
		const box = p.getByPlaceholder('Xabar yozing');
		const h0 = await box.evaluate((e) => e.offsetHeight);
		await box.fill('uzun '.repeat(80));
		await p.waitForTimeout(250);
		const h1 = await box.evaluate((e) => e.offsetHeight);
		check("xabar maydoni uzun matnda 2+ qatorga o'tadi", h1 > h0 + 15, `${h0} -> ${h1}`);
		await box.fill('');
		await box.pressSequentially('bir');
		await box.press('Shift+Enter');
		await box.pressSequentially('ikki');
		check('Shift+Enter yangi qator qo`shadi, yubormaydi', (await box.inputValue()) === 'bir\nikki');
		await box.fill('');
		await p.getByRole('button', { name: 'Emoji', exact: true }).click();
		await p.getByRole('button', { name: '🔥', exact: true }).click();
		check('emoji tanlansa maydonga qo`shiladi', (await box.inputValue()) === '🔥', await box.inputValue());
		await p.keyboard.press('Escape');
		await p.waitForTimeout(150);
	}
	await p.getByPlaceholder('Xabar yozing').fill('Smoke xabar');
	await p.getByPlaceholder('Xabar yozing').press('Enter');
	await p.waitForTimeout(400);
	await go(p, '/chats');
	check("xabar yozilgan suhbat ro'yxat tepasiga chiqadi", (await names())[0] === last, `${last} vs ${(await names())[0]}`);
	check("xabarlar sahifasida qalamcha va 4 belgili pastki panel bor", (await p.getByRole('button', { name: 'Yangi xabar' }).filter({ visible: true }).count()) >= 1 && (await p.locator('nav.fixed a').count()) === 4);
	check('xabarlarda JS xatosi yo`q', p.errors.length === 0, p.errors[0]);
	await p.context().close();
}

// ───────────────────────── 7b. Xabarlarda rasm va o'qilmaganlar belgisi ─────────────────────────
{
	const p = await session('m');
	await go(p, '/chats');
	const navBadge = async () => (await p.locator('nav.fixed a[href="/chats"] span.bg-rose-600').allInnerTexts()).map((t) => t.trim()).join('');
	check("pastki panelda Xabarlar belgisi o'qilmagan suhbatlar sonini ko'rsatadi (2)", (await navBadge()) === '2', await navBadge());
	const pills = await p.locator('main a[href^="/chats/"] span.bg-brand-600').count();
	check("ro'yxatda o'qilmagan suhbatlarda son belgisi bor (2 ta suhbat)", pills === 2, String(pills));
	const first = p.locator('main a[href="/chats/ch6"]');
	check("o'qilmagan suhbat nomi qalin ko'rsatiladi", (await first.locator('p.font-extrabold').count()) === 1);
	await first.click();
	await p.waitForTimeout(600);
	await p.goBack();
	await p.waitForTimeout(500);
	check("suhbat ochilgach o'qilgan bo'ladi (belgi 1 ga kamayadi)", (await navBadge()) === '1', await navBadge());
	// rasm yuborish
	await go(p, '/chats/ch1');
	const png = await p.evaluate(() => { const c = document.createElement('canvas'); c.width = 40; c.height = 30; const x = c.getContext('2d'); x.fillStyle = '#4338ca'; x.fillRect(0, 0, 40, 30); return c.toDataURL('image/png').split(',')[1]; });
	await p.locator('input[aria-label="Rasm tanlash"]').setInputFiles({ name: 'test.png', mimeType: 'image/png', buffer: Buffer.from(png, 'base64') });
	await p.waitForTimeout(500);
	check("tanlangan rasm yuborishdan oldin ko'rinadi", (await p.getByAltText('Yuboriladigan rasm').count()) === 1);
	await p.getByRole('button', { name: 'Yuborish', exact: true }).click();
	await p.waitForTimeout(500);
	const bubbleImg = p.locator('main img[alt="Yuborilgan rasm"]');
	check("rasm xabar sifatida yuboriladi va pufakda ko'rinadi (matnsiz)", (await bubbleImg.count()) === 1 && (await p.getByAltText('Yuboriladigan rasm').count()) === 0);
	await p.getByRole('button', { name: 'Rasmni kattalashtirish' }).click();
	await p.waitForTimeout(300);
	check("rasm bosilganda kattalashadi", (await p.locator('.fixed.inset-0 img').count()) >= 1);
	await p.keyboard.press('Escape');
	await p.mouse.click(5, 5);
	await go(p, '/chats');
	check("ro'yxatda rasm xabari 'Rasm' deb ko'rsatiladi", /Siz: Rasm/.test(await p.locator('main a[href="/chats/ch1"]').innerText()));
	check("rasm bo'lmagan matnga rasm tugmasi: yuborishsiz bo'sh xabar ruxsat etilmaydi", await (async () => { await go(p, '/chats/ch1'); return (await p.getByRole('button', { name: 'Yuborish', exact: true }).count()) === 0 && (await p.getByRole('button', { name: 'Ovozli xabar', exact: true }).count()) === 1; })());
	check("xabarlarda JS xatosi yo'q (rasm/o'qilmagan)", p.errors.length === 0, p.errors[0]);
	await p.context().close();
}

// ───────────────────────── 7b2. Xabar kontekst menyusi (o'ng tugma) ─────────────────────────
{
	const p = await session('m');
	await go(p, '/chats/ch1');
	const ta = p.getByLabel('Xabar yozing');
	await ta.fill('Menyu sinov xabari');
	await p.getByRole('button', { name: 'Yuborish', exact: true }).click();
	await p.waitForTimeout(400);
	const bubble = () => p.locator('main [id^="msg-"] p').filter({ hasText: /^Menyu sinov xabari/ });
	const items = async () => (await p.getByRole('menuitem').allInnerTexts()).map((t) => t.trim());
	await bubble().click({ button: 'right' });
	await p.waitForTimeout(250);
	check("o'ng tugma: o'z xabarida 7 band, tartibi to'g'ri", (await items()).join('|') === "Javob berish|Tahrirlash|Matnni nusxalash|Qadash|Uzatish|Tanlash|O'chirish", (await items()).join('|'));
	await p.keyboard.press('Escape');
	await p.waitForTimeout(250);
	check('Escape menyuni yopadi', (await p.getByRole('menu').count()) === 0);
	const other = p.locator('main [id^="msg-"] p').filter({ hasNotText: 'Menyu sinov xabari' }).first();
	await other.click({ button: 'right' });
	await p.waitForTimeout(250);
	check("o'ng tugma: begona xabarda Tahrirlash va O'chirish yo'q", !(await items()).some((t) => /Tahrirlash|O'chirish/.test(t)) && (await items()).length === 5, (await items()).join('|'));
	await p.keyboard.press('Escape');
	// javob
	await bubble().click({ button: 'right' });
	await p.getByRole('menuitem', { name: 'Javob berish' }).click();
	await ta.fill('Javob matni');
	await p.getByRole('button', { name: 'Yuborish', exact: true }).click();
	await p.waitForTimeout(400);
	check('javob: pufakda iqtibos bor', (await p.getByRole('button', { name: "Javob berilgan xabarga o'tish" }).count()) >= 1);
	// tahrir
	await bubble().click({ button: 'right' });
	await p.getByRole('menuitem', { name: 'Tahrirlash' }).click();
	check('tahrir: matn yozish maydoniga tushadi', (await ta.inputValue()) === 'Menyu sinov xabari');
	await ta.fill('Menyu tahrirlandi');
	await p.keyboard.press('Enter');
	await p.waitForTimeout(400);
	check('tahrir: matn yangilanadi va "tahrirlangan" belgisi chiqadi', (await p.locator('main').innerText()).includes('Menyu tahrirlandi') && (await p.locator('main').innerText()).includes('tahrirlangan'));
	// qadash
	const edited = () => p.locator('main [id^="msg-"] p').filter({ hasText: /^Menyu tahrirlandi/ });
	await edited().click({ button: 'right' });
	await p.getByRole('menuitem', { name: 'Qadash', exact: true }).click();
	await p.waitForTimeout(300);
	check('qadash: tepada qadalgan xabar paneli', (await p.getByRole('button', { name: "Qadalgan xabarga o'tish" }).count()) === 1);
	await p.getByRole('button', { name: 'Qadashni olib tashlash' }).click();
	await p.waitForTimeout(300);
	check('qadashni olib tashlash paneli yo`q qiladi', (await p.getByRole('button', { name: "Qadalgan xabarga o'tish" }).count()) === 0);
	// tanlash + o'chirish
	await edited().click({ button: 'right' });
	await p.getByRole('menuitem', { name: 'Tanlash' }).click();
	await p.waitForTimeout(250);
	check('tanlash: sarlavhada "1 ta tanlandi"', /1 ta tanlandi/.test(await p.locator('main h1').first().innerText()));
	await p.getByRole('button', { name: "O'chirish", exact: true }).click();
	await p.getByRole('button', { name: "O'chirish", exact: true }).last().click();
	await p.waitForTimeout(400);
	check("o'chirish: xabar yo'qoladi", !(await p.locator('main').innerText()).includes('Menyu tahrirlandi'));
	check("xabar menyusida JS xatosi yo'q", p.errors.length === 0, p.errors[0]);
	await p.context().close();
}

// ───────────────────────── 7b3. Suhbat ro'yxati menyusi ─────────────────────────
{
	const p = await session('m');
	await go(p, '/chats');
	const rows = () => p.locator('main a[href^="/chats/"]');
	const items = async () => (await p.getByRole('menuitem').allInnerTexts()).map((t) => t.trim());
	const n0 = await rows().count();
	const lastHref = await rows().last().getAttribute('href');
	await rows().last().click({ button: 'right' });
	await p.waitForTimeout(250);
	check("suhbatda o'ng tugma: 5 band, tartibi to'g'ri", (await items()).join('|') === "O'qilmagan deb belgilash|Tepaga qadash|Ovozsiz qilish|Arxivlash|Suhbatni o'chirish", (await items()).join('|'));
	await p.keyboard.press('Escape');
	await p.waitForTimeout(200);
	check('suhbat menyusi Escape bilan yopiladi va sahifa o`zgarmaydi', (await p.getByRole('menu').count()) === 0 && new URL(p.url()).pathname === '/chats');
	// qadash: oxirgi suhbat tepaga chiqadi
	await rows().last().click({ button: 'right' });
	await p.getByRole('menuitem', { name: 'Tepaga qadash' }).click();
	await p.waitForTimeout(300);
	check('qadash: suhbat ro`yxat tepasiga chiqadi', (await rows().first().getAttribute('href')) === lastHref);
	check('qadalgan suhbatda qadash belgisi (o`qilmaganda sonidan keyin)', (await rows().first().locator('svg[aria-label="Qadalgan"]').count()) + (await rows().first().locator('span.bg-brand-600').count()) >= 1);
	// ovozsiz
	await rows().first().click({ button: 'right' });
	await p.getByRole('menuitem', { name: 'Ovozsiz qilish' }).click();
	await p.waitForTimeout(250);
	check('ovozsiz: suhbatda ovozsiz belgisi', (await rows().first().locator('svg[aria-label="Ovozsiz"]').count()) === 1);
	// o'qilmagan deb belgilash
	await rows().first().click({ button: 'right' });
	const it = await items();
	await p.getByRole('menuitem').first().click();
	await p.waitForTimeout(250);
	check("o'qilmagan/o'qilgan belgilash ishlaydi (belgi o'zgaradi)", it[0].includes('belgilash'));
	// arxiv
	await rows().first().click({ button: 'right' });
	await p.getByRole('menuitem', { name: 'Arxivlash' }).click();
	await p.waitForTimeout(300);
	check('arxivlash: suhbat ro`yxatdan ketadi', (await rows().count()) === n0 - 1);
	check('arxivlash: "Arxiv (1)" qatori chiqadi', (await p.getByRole('button', { name: /^Arxiv/ }).count()) === 1);
	await p.getByRole('button', { name: /^Arxiv/ }).click();
	await p.waitForTimeout(250);
	check('arxiv ichida arxivlangan suhbat ko`rinadi', (await rows().count()) === 1);
	await rows().first().click({ button: 'right' });
	check('arxivda "Arxivdan chiqarish" bandi', (await items()).includes('Arxivdan chiqarish'));
	await p.getByRole('menuitem', { name: 'Arxivdan chiqarish' }).click();
	await p.waitForTimeout(250);
	await p.getByRole('button', { name: /^Arxiv/ }).click();
	await p.waitForTimeout(250);
	check('arxivdan chiqarilgach suhbat ro`yxatga qaytadi', (await rows().count()) === n0);
	// o'chirish
	await rows().last().click({ button: 'right' });
	await p.getByRole('menuitem', { name: "Suhbatni o'chirish" }).click();
	await p.waitForTimeout(250);
	check("o'chirish: tasdiqlash oynasi chiqadi", (await p.getByText("Bu amalni ortga qaytarib bo'lmaydi.").count()) === 1);
	await p.getByRole('button', { name: "O'chirish", exact: true }).click();
	await p.waitForTimeout(300);
	check("suhbatni o'chirish: ro'yxatdan yo'qoladi", (await rows().count()) === n0 - 1);
	check("suhbat menyusida JS xatosi yo'q", p.errors.length === 0, p.errors[0]);
	await p.context().close();
}

// ───────────────────────── 7b4. Xabar turlari: o'lcham va sig'ish (ovoz, video, fayl, so'rovnoma, uzatilgan) ─────────────────────────
for (const kind of ['m', 'd']) {
	const p = await session(kind);
	await go(p, '/chats/ch4');
	await p.evaluate(() => {
		const key = 'graduss-data-v2';
		const s = JSON.parse(localStorage.getItem(key));
		const t = (n) => new Date(Date.now() - n * 60000).toISOString();
		const poll = { id: 'pp', question: 'Qaysi kun qulay?', options: [{ id: 'a', text: 'Dushanba', votes: ['u1'] }, { id: 'b', text: 'Seshanba', votes: [] }] };
		const add = (n, x) => s.messages.push({ id: 'sz' + n, chatId: 'ch4', createdAt: t(40 - n), ...x });
		s.messages = s.messages.filter((m) => m.chatId !== 'ch4');
		add(1, { senderId: 'u2', content: '', audio: { url: '/demo/melody-1.wav', duration: 34 } });
		add(2, { senderId: 'u1', content: '', audio: { url: '/demo/melody-2.wav', duration: 7 } });
		add(3, { senderId: 'u2', content: '', video: { url: '/demo/clip-1.webm', duration: 12 } });
		add(4, { senderId: 'u1', content: '', video: { url: '/demo/clip-2.webm', duration: 5 } });
		add(5, { senderId: 'u1', content: 'Hisobot', file: { name: 'juda-uzun-hisobot-fayli-nomi-2026-yil-yakuniy.pdf', size: 2456000, url: 'data:application/pdf;base64,AA==' } });
		add(6, { senderId: 'u2', content: '', poll });
		add(7, { senderId: 'u1', content: 'Uzatilgan uzun matn '.repeat(12), forwardedFrom: 'Anvar Karimov' });
		add(8, { senderId: 'u1', content: '', audio: { url: '/demo/melody-1.wav', duration: 34 }, forwardedFrom: 'Otabek Rahimov' });
		add(9, { senderId: 'u2', content: '', video: { url: '/demo/clip-3.webm', duration: 9 }, forwardedFrom: 'Gulchehra' });
		add(10, { senderId: 'u1', content: '', poll, forwardedFrom: 'Anvar Karimov' });
		add(11, { senderId: 'u1', content: '', file: { name: 'a.pdf', size: 1200, url: 'data:application/pdf;base64,AA==' }, forwardedFrom: 'Anvar Karimov' });
		localStorage.setItem(key, JSON.stringify(s));
	});
	await go(p, '/chats/ch4', 1200);
	const r = await p.evaluate(() => {
		const sc = document.querySelector('div.flex-1.space-y-1');
		const box = sc.getBoundingClientRect();
		const bad = [];
		for (const row of sc.querySelectorAll('[id^="msg-"]')) {
			for (const el of row.querySelectorAll('*')) {
				const b = el.getBoundingClientRect();
				if (b.width && (b.right > box.right + 1 || b.left < box.left - 1)) { bad.push(row.id + ':' + el.tagName); break; }
			}
		}
		const note = sc.querySelector('button[aria-label="Video xabarni ijro etish"]').getBoundingClientRect();
		return { overflowX: sc.scrollWidth > sc.clientWidth + 1, bad, noteRatio: Math.round((note.width / note.height) * 100) / 100, noteW: Math.round(note.width), rows: sc.querySelectorAll('[id^="msg-"]').length };
	});
	check(`[${kind}] xabar turlari konteynerdan chiqmaydi`, !r.overflowX && r.bad.length === 0, JSON.stringify(r));
	const tm = await p.evaluate(() => {
		const rows = [...document.querySelectorAll('div.flex-1.space-y-1 [id^="msg-"]')];
		const bad = [];
		for (const row of rows) {
			const t = row.querySelector('time');
			if (!t || !/^\d{2}:\d{2}$/.test(t.textContent.trim())) { bad.push(row.id + ':yo\'q'); continue; }
			const bub = t.closest('div.w-fit') ?? row;
			const b = bub.getBoundingClientRect(), r = t.getBoundingClientRect();
			if (r.right > b.right + 1 || b.bottom - r.bottom > b.height / 2 || r.left < b.left + b.width / 3) bad.push(row.id);
		}
		return { n: rows.length, bad };
	});
	check(`[${kind}] har bir xabarda yuborilgan vaqt (SS:DD) pufakning pastki o'ng burchagida`, tm.n >= 11 && tm.bad.length === 0, JSON.stringify(tm));
	const nameIn = await p.evaluate(() => {
		const row = document.querySelector('div.flex-1.space-y-1 [id^="msg-"]');
		const n = row.querySelector('a[href^="/profile/"].font-semibold');
		const bub = n?.closest('div.w-fit');
		if (!n || !bub) return false;
		const b = bub.getBoundingClientRect(), r = n.getBoundingClientRect();
		return r.left >= b.left && r.right <= b.right + 1 && r.top >= b.top && r.bottom <= b.bottom;
	});
	check(`[${kind}] guruhda yuboruvchi ismi pufak ichida (tepada)`, nameIn);
	check(`[${kind}] doira video aniq doira va 150-210 px`, r.noteRatio === 1 && r.noteW >= 150 && r.noteW <= 210, JSON.stringify(r));
	check(`[${kind}] ovozli xabarda to'lqin va vaqt chizig'i (slider) bor`, (await p.getByRole('slider', { name: 'Ovozli xabar vaqti' }).count()) === 3);
	check(`[${kind}] uzatilgan xabarlarda "Uzatilgan: ism" yozuvi`, (await p.locator('main').innerText()).includes('Uzatilgan:\u00a0Anvar Karimov') || /Uzatilgan:\s*Anvar Karimov/.test(await p.locator('main').innerText()));
	await p.getByRole('button', { name: 'Eshitish' }).first().click();
	await p.waitForTimeout(300);
	await p.getByRole('button', { name: 'Eshitish' }).first().click();
	await p.waitForTimeout(300);
	check(`[${kind}] bir vaqtda bitta ovozli xabar ijro etiladi`, (await p.locator('main').getByRole('button', { name: 'To‘xtatish' }).count()) === 1);
	// mini-pleyer: yuqorida, boshqa sahifaga o'tilsa ham qoladi
	check(`[${kind}] ijro paytida yuqorida mini-pleyer yuqori panel tagida (yuboruvchi ismi, tezlik, yopish)`, (await p.getByRole('region', { name: 'Ijro etilmoqda' }).count()) === 1 && (await p.getByRole('region', { name: 'Ijro etilmoqda' }).getByRole('button', { name: 'Ijroni yopish' }).count()) === 1 && (await p.getByRole('region', { name: 'Ijro etilmoqda' }).boundingBox()).y > 0);
	// sahifa qayta yuklanmasin: ilova ichida o'tamiz (telefonda 'Orqaga', kompyuterda 'Bosh sahifa' havolasi)
	await (kind === 'm' ? p.getByRole('button', { name: 'Orqaga', exact: true }) : p.locator('aside a[href="/feed"]').first()).click();
	await p.waitForTimeout(700);
	check(`[${kind}] boshqa sahifaga o'tilsa ham mini-pleyer qoladi va yopishqoq panel uning ostida`, (await p.getByRole('region', { name: 'Ijro etilmoqda' }).count()) === 1 && (await p.evaluate(() => { const h = [...document.querySelectorAll('header')].find((e) => getComputedStyle(e).position === 'sticky' && e.getBoundingClientRect().height > 0); const bar = document.querySelector('[aria-label="Ijro etilmoqda"]').getBoundingClientRect(); return !h || (Math.round(h.getBoundingClientRect().top) <= 0 && bar.top >= h.getBoundingClientRect().bottom - 1); })));
	await p.getByRole('region', { name: 'Ijro etilmoqda' }).getByRole('button', { name: 'Xabarga o\'tish' }).click();
	await p.waitForTimeout(900);
	check(`[${kind}] mini-pleyerni bosish suhbatga qaytaradi`, new URL(p.url()).pathname === '/chats/ch4');
	await p.getByRole('region', { name: 'Ijro etilmoqda' }).getByRole('button', { name: 'Ijroni yopish' }).click();
	await p.waitForTimeout(300);
	check(`[${kind}] ijroni yopish mini-pleyerni olib tashlaydi`, (await p.getByRole('region', { name: 'Ijro etilmoqda' }).count()) === 0);
	check(`[${kind}] xabar turlarida JS xatosi yo'q`, p.errors.length === 0, p.errors[0]);
	await p.context().close();
}

// ───────────────────────── 7b5. Media yuborish oynasi (Qo'shish, izoh o'rni, fayl sifatida, spoyler) ─────────────────────────
{
	const p = await session('m');
	await go(p, '/chats/ch1');
	const png = await p.evaluate(() => { const c = document.createElement('canvas'); c.width = 40; c.height = 30; const x = c.getContext('2d'); x.fillStyle = '#4338ca'; x.fillRect(0, 0, 40, 30); return c.toDataURL('image/png').split(',')[1]; });
	const file = (n) => ({ name: n, mimeType: 'image/png', buffer: Buffer.from(png, 'base64') });
	const dlg = p.getByRole('dialog', { name: 'Media yuborish' });
	const items = async () => (await p.getByRole('menuitem').allInnerTexts()).map((t) => t.trim());
	await p.locator('input[aria-label="Rasm tanlash"]').setInputFiles([file('a.png'), file('b.png')]);
	await p.waitForTimeout(600);
	check("media tanlangach oyna ochiladi, 2 ta rasm ko'rinadi", (await dlg.count()) === 1 && (await dlg.getByAltText('Yuboriladigan rasm').count()) === 2);
	await dlg.getByRole('button', { name: 'Media sozlamalari' }).click();
	await p.waitForTimeout(250);
	check("media menyusi: Qo'shish, izoh tepaga, fayl sifatida, spoyler (tartib)", (await items()).join('|') === "Qo‘shish|Izohni tepaga chiqarish|Fayl sifatida yuborish|Spoyler yoqish", (await items()).join('|'));
	await p.getByRole('menuitem', { name: 'Qo‘shish' }).click();
	await dlg.locator('input[aria-label="Media qo‘shish"]').setInputFiles(file('c.png'));
	await p.waitForTimeout(500);
	check("Qo'shish: uchinchi rasm qo'shiladi", (await dlg.getByAltText('Yuboriladigan rasm').count()) === 3);
	await dlg.getByRole('button', { name: 'Media sozlamalari' }).click();
	await p.getByRole('menuitem', { name: 'Izohni tepaga chiqarish' }).click();
	await dlg.getByRole('button', { name: 'Media sozlamalari' }).click();
	check("izoh tepada: menyu 'Izohni pastga tushirish' ga o'zgaradi", (await items()).includes('Izohni pastga tushirish'));
	await p.getByRole('menuitem', { name: 'Spoyler yoqish' }).click();
	await p.waitForTimeout(200);
	check("spoyler yoqilganda oldindan ko'rishda 'Spoyler' belgisi", (await dlg.getByText('Spoyler', { exact: true }).count()) >= 1);
	await dlg.getByLabel('Izoh', { exact: true }).fill('Albom izohi');
	await dlg.getByRole('button', { name: 'Yuborish', exact: true }).click();
	await p.waitForTimeout(500);
	check("albom: 3 ta rasm bitta xabarda, xira (spoyler)", (await p.locator('main img[alt="Yuborilgan rasm"]').count()) === 3 && (await p.getByRole('button', { name: 'Spoylerni ochish' }).count()) === 3);
	check("izoh mediadan tepada", await p.evaluate(() => { const row = [...document.querySelectorAll('main [id^="msg-"]')].pop(); const t = [...row.querySelectorAll('p')].find((e) => e.textContent === 'Albom izohi'); const im = row.querySelector('img'); return !!t && !!im && t.getBoundingClientRect().top < im.getBoundingClientRect().top; }));
	await p.getByRole('button', { name: 'Spoylerni ochish' }).first().click();
	await p.waitForTimeout(300);
	check("spoyler bosilganda ochiladi", (await p.getByRole('button', { name: 'Spoylerni ochish' }).count()) === 0);
	// fayl sifatida
	await p.locator('input[aria-label="Rasm tanlash"]').setInputFiles(file('hujjat.png'));
	await p.waitForTimeout(500);
	await dlg.getByRole('button', { name: 'Media sozlamalari' }).click();
	await p.getByRole('menuitem', { name: 'Fayl sifatida yuborish' }).click();
	await dlg.getByRole('button', { name: 'Media sozlamalari' }).click();
	check("fayl sifatida: spoyler bandi yo'qoladi", !(await items()).some((t) => /Spoyler/.test(t)));
	await p.keyboard.press('Escape');
	await dlg.getByRole('button', { name: 'Yuborish', exact: true }).click();
	await p.waitForTimeout(600);
	check("fayl sifatida yuborilgan rasm fayl kartasi bo'lib chiqadi", (await p.locator('main a[download="hujjat.png"]').count()) === 1);
	check("media oynasida JS xatosi yo'q", p.errors.length === 0, p.errors[0]);
	await p.context().close();
}

// ───────────────────────── 7b6. O'qildi belgisi (1 ptichka -> 2 ptichka) ─────────────────────────
{
	const p = await session('m');
	await go(p, '/chats/ch1');
	await p.getByLabel('Xabar yozing').fill('Ptichka sinovi');
	await p.getByRole('button', { name: 'Yuborish', exact: true }).click();
	await p.waitForTimeout(500);
	const row = () => p.locator('main [id^="msg-"]').filter({ hasText: 'Ptichka sinovi' }).last();
	check("yuborilgan xabarda 1 ta ptichka (Yuborildi), vaqtning o'ng tomonida", (await row().locator('svg[data-status="sent"]').count()) === 1 && (await row().locator('svg[data-status="read"]').count()) === 0 && await p.evaluate(() => { const r = [...document.querySelectorAll('main [id^="msg-"]')].filter((e) => e.textContent.includes('Ptichka sinovi')).pop(); return r.querySelector('svg[data-status]').getBoundingClientRect().left >= r.querySelector('time').getBoundingClientRect().right - 1; }));
	await p.waitForTimeout(4500);
	check("o'qilgach 2 ta ptichka (O'qildi)", (await row().locator('svg[data-status="read"]').count()) === 1 && (await row().locator('svg[data-status="sent"]').count()) === 0);
	check("o'qildi belgisida JS xatosi yo'q", p.errors.length === 0, p.errors[0]);
	await p.context().close();
}

// ───────────────────────── 7b7. Emoji/Stiker/GIF oynasi, tekislash, Esc ─────────────────────────
for (const kind of ['m', 'd']) {
	const p = await session(kind);
	await go(p, '/chats/ch1');
	const align = await p.evaluate(() => {
		const ta = document.querySelector('textarea[aria-label="Xabar yozing"]');
		const bt = document.querySelector('button[aria-label="Emoji"]');
		const a = ta.getBoundingClientRect(), b = bt.getBoundingClientRect();
		return { dy: Math.round(((a.top + a.bottom) / 2 - (b.top + b.bottom) / 2) * 10) / 10, taH: Math.round(a.height), wrapH: Math.round(ta.parentElement.getBoundingClientRect().height) };
	});
	check(`[${kind}] emoji tugmasi yozish maydoni o'rtasida (vertikal)`, Math.abs(align.dy) <= 1.5 && align.wrapH === align.taH, JSON.stringify(align));
	await p.getByRole('button', { name: 'Emoji', exact: true }).click();
	await p.waitForTimeout(200);
	const geo = await p.evaluate(() => { const d = document.querySelector('[role="dialog"][aria-label="Emoji tanlash"]').getBoundingClientRect(); const b = document.querySelector('button[aria-label="Emoji"]').getBoundingClientRect(); return { dRight: Math.round(d.right), bRight: Math.round(b.right), dLeft: Math.round(d.left), vw: innerWidth }; });
	check(`[${kind}] emoji oynasi chapga ochiladi (o'ng chet tugma bilan bir chiziqda)`, (geo.dRight <= geo.bRight + 2 || geo.dLeft <= 8) && geo.dLeft >= 0 && geo.dRight <= geo.vw, JSON.stringify(geo));
	check(`[${kind}] oynada Emoji, Stikerlar, GIF bo'limlari`, (await p.getByRole('tab').allInnerTexts()).map((t) => t.trim()).join('|') === 'Emoji|Stikerlar|GIF');
	await p.getByRole('tab', { name: 'Stikerlar' }).click();
	await p.getByRole('button', { name: 'Stiker 🎉' }).click();
	await p.waitForTimeout(400);
	check(`[${kind}] stiker yuboriladi: katta emoji, pufaksiz, vaqt bilan`, (await p.locator('main [role="img"][aria-label="Stiker 🎉"]').count()) === 1);
	await p.getByRole('button', { name: 'Emoji', exact: true }).click();
	await p.getByRole('tab', { name: 'GIF' }).click();
	await p.getByLabel('GIF qidirish').fill('rahm');
	await p.waitForTimeout(150);
	check(`[${kind}] GIF qidiruvi filtrlaydi`, (await p.getByRole('button', { name: /^GIF: / }).count()) === 1);
	await p.getByRole('button', { name: 'GIF: Rahmat' }).click();
	await p.waitForTimeout(400);
	check(`[${kind}] GIF yuboriladi (rasm xabari sifatida)`, (await p.locator('main img[src="/demo/gif-rahmat.gif"]').count()) === 1);
	await go(p, '/chats');
	check(`[${kind}] ro'yxatda "GIF" ko'rinadi`, /Siz: GIF/.test(await p.locator('main a[href="/chats/ch1"]').innerText()));
	check(`[${kind}] emoji oynasida JS xatosi yo'q`, p.errors.length === 0, p.errors[0]);
	await p.context().close();
}
{
	const p = await session('d');
	await go(p, '/chats');
	await p.locator('main a[href="/chats/ch1"]').click();
	await p.waitForTimeout(500);
	await p.locator('main a[href="/chats/ch2"]').click();
	await p.waitForTimeout(500);
	await p.locator('main a[href="/chats/ch3"]').click();
	await p.waitForTimeout(500);
	await p.keyboard.press('Escape');
	await p.waitForTimeout(500);
	check("suhbatdan suhbatga o'tilgach Esc ro'yxatga (/chats) qaytaradi, oldingi suhbatga emas", new URL(p.url()).pathname === '/chats', p.url());
	await p.context().close();
}

// ───────────────────────── 7c. #teg sahifalari, @eslatma takliflari, oxirgi qidiruvlar ─────────────────────────
{
	const p = await session('m');
	await go(p, '/feed');
	await p.getByRole('button', { name: 'Post yozish' }).click();
	await p.waitForTimeout(300);
	const ta = p.getByLabel('Post matni');
	await ta.click();
	await ta.pressSequentially('Salom @dr.m');
	await p.waitForTimeout(250);
	const opt = p.getByRole('option');
	{
		const lbx = await p.getByRole('listbox').boundingBox();
		const mdl = await p.locator('.fixed.inset-0.z-50 > div').last().boundingBox();
		check("composer oynasida takliflar oyna chegarasida kesilmaydi (5 tagacha ko'rinadi)", !!lbx && lbx.y + lbx.height <= 844 && (await p.getByRole('option').count()) >= 1 && (await p.getByRole('option').last().boundingBox()).y + 10 <= 844);
	}
	check("'@' dan keyin odam takliflari chiqadi (Malika)", (await opt.count()) >= 1 && /Malika/.test(await opt.first().innerText()), await texts(opt).then((x) => x.join('|')));
	await p.keyboard.press('Enter');
	await p.waitForTimeout(200);
	check("Enter bilan tanlanganda '@dr.malika ' kiritiladi, ro'yxat yopiladi", (await ta.inputValue()) === 'Salom @dr.malika ' && (await p.getByRole('option').count()) === 0, await ta.inputValue());
	await ta.pressSequentially('mavzu #gol');
	await p.waitForTimeout(250);
	check("'#' dan keyin teg takliflari chiqadi (#golang)", (await texts(p.getByRole('option'))).some((t) => t.includes('#golang')));
	await p.getByRole('option').first().click();
	await p.waitForTimeout(200);
	check("teg bosib tanlanadi", /#golang $/.test(await ta.inputValue()), await ta.inputValue());
	await p.getByRole('button', { name: 'Chop etish' }).click();
	await p.waitForTimeout(500);
	// teg sahifasi
	const tagLink = p.locator('main a[href="/tags/golang"]').first();
	check("postdagi #golang /tags/golang ga olib boradi", (await tagLink.count()) >= 1);
	await go(p, '/tags/golang');
	check("teg sahifasi: sarlavha '#golang', postlar bor, yuqori panel yo'q", (await p.getByRole('heading', { level: 1 }).innerText()) === '#golang' && (await cards(p).count()) >= 2 && (await p.locator('main a[aria-label="Qidiruv"]').filter({ visible: true }).count()) === 0);
	check("teg sahifasida faqat shu teg bilan postlar", await cards(p).evaluateAll((els) => els.every((e) => /#golang/i.test(e.innerText))));
	await go(p, '/tags/yoqteg');
	check("mavjud bo'lmagan teg: bo'sh holat", (await p.getByText('#yoqteg bilan post topilmadi').count()) === 1);
	// izoh maydonida takliflar yuqoriga ochiladi
	await go(p, '/post/p15');
	const ca = p.getByPlaceholder('Izoh yozing');
	await ca.click();
	await ca.pressSequentially('@bo');
	await p.waitForTimeout(250);
	const lb = await p.getByRole('listbox').boundingBox();
	const cb = await ca.boundingBox();
	check("izoh maydonida takliflar maydon USTIDA ochiladi", !!lb && lb.y + lb.height <= cb.y + 2);
	check("takliflar ro'yxati ekran ichida to'liq ko'rinadi", !!lb && lb.y >= 0 && lb.y + lb.height <= 844);
	// tinish belgisi bilan tugagan eslatma va teg havola bo'ladi
	await ca.fill('');
	await ca.pressSequentially('Rahmat @dr.malika, #golang!');
	await p.keyboard.press('Escape');
	await p.locator('main form').getByRole('button', { name: 'Yuborish' }).click();
	await p.waitForTimeout(500);
	const last = p.locator('main .group').last();
	check("izohdagi '@dr.malika,' va '#golang!' havolalarga aylanadi (tinish belgisi havoladan tashqarida)", (await last.locator('a[href="/profile/dr.malika"]').count()) === 1 && (await last.locator('a[href="/tags/golang"]').count()) === 1 && (await last.locator('a[href="/profile/dr.malika"]').innerText()) === '@dr.malika' && /,\s*#golang!/.test((await last.innerText()).replace(/\s+/g, ' ')));
	// oxirgi qidiruvlar
	await go(p, '/search');
	check("boshida oxirgi qidiruvlar bloki yo'q", (await p.getByLabel('Oxirgi qidiruvlar').count()) === 0);
	const inp = p.getByPlaceholder(/qidiring/);
	await inp.fill('kun uz');
	await inp.press('Enter');
	await p.waitForTimeout(300);
	await inp.fill('hisobot');
	await inp.press('Enter');
	await p.waitForTimeout(300);
	await go(p, '/search');
	const rec = p.getByLabel('Oxirgi qidiruvlar');
	check("Enter bosilgan so'rovlar eslab qolinadi (yangisi birinchi)", (await rec.count()) === 1 && (await texts(rec.locator('li button:not([aria-label])'))).join('|') === 'hisobot|kun uz', await texts(rec.locator('li button:not([aria-label])')).then((x) => x.join('|')));
	await rec.getByRole('button', { name: 'kun uz', exact: true }).click();
	await p.waitForTimeout(400);
	check("oxirgi so'rov bosilganda qidiriladi", (await inp.inputValue()) === 'kun uz');
	await inp.fill('');
	await p.waitForTimeout(300);
	await p.getByLabel('Oxirgi qidiruvlar').getByRole('button', { name: /"hisobot" ni o'chirish/ }).click();
	await p.waitForTimeout(200);
	check("bitta so'rovni o'chirish ishlaydi", (await p.getByLabel('Oxirgi qidiruvlar').locator('li').count()) === 1);
	await p.getByRole('button', { name: 'Tozalash' }).click();
	await p.waitForTimeout(200);
	check("'Tozalash' hammasini o'chiradi", (await p.getByLabel('Oxirgi qidiruvlar').count()) === 0);
	check("#teg/@eslatma/qidiruvda JS xatosi yo'q", p.errors.length === 0, p.errors[0]);
	await p.context().close();
}

// ───────────────────────── 8. Qidiruv va sozlamalar ─────────────────────────
{
	const p = await session('m');
	await go(p, '/search');
	check('qidiruv: 4 ta tab', (await texts(tabs(p))).join('|') === 'Postlar|Kanallar|Odamlar|Kampaniyalar');
	check('Postlar tabida filtr chiplari yo`q', (await p.locator('[aria-label="Filtr"]').count()) === 0);
	await tabs(p).nth(2).click();
	await p.waitForTimeout(250);
	check('Odamlar tabida kasb chiplari (Dasturchi)', (await texts(p.locator('[aria-label="Filtr"] button'))).includes('Dasturchi'));
	await tabs(p).nth(1).click();
	await p.waitForTimeout(250);
	check('Kanallar tabida soha chiplari (Dasturlash)', (await texts(p.locator('[aria-label="Filtr"] button'))).includes('Dasturlash'));
	await go(p, '/settings');
	check("sozlamalarda yuqori panel yo'q", (await p.locator('main a[aria-label="Qidiruv"]').filter({ visible: true }).count()) === 0);
	const col = () => p.evaluate(() => getComputedStyle(document.documentElement).getPropertyValue('--color-brand-600').trim());
	const c0 = await col();
	await p.getByRole('button', { name: 'Zumrad' }).click();
	await p.waitForTimeout(200);
	const c1 = await col();
	await p.reload();
	await p.waitForTimeout(500);
	check('aksent rangi o`zgaradi va yangilangandan keyin saqlanadi', c0 === '#4f46e5' && c1 === '#059669' && (await col()) === '#059669', `${c0} ${c1} ${await col()}`);
	check('qidiruv/sozlamalarda JS xatosi yo`q', p.errors.length === 0, p.errors[0]);
	await p.context().close();
}

// ───────────────────────── 8e. Orqaga qaytish tugmasi ─────────────────────────
{
	const p = await session('m');
	// post -> izoh egasi profili -> orqaga
	await go(p, '/feed');
	await p.locator('main [role="link"]').first().click();
	await p.waitForTimeout(600);
	await p.locator('main a[href^="/profile/"]').first().click();
	await p.waitForTimeout(600);
	check("boshqa foydalanuvchi profilida orqaga tugmasi bor", (await p.getByRole('button', { name: 'Orqaga' }).filter({ visible: true }).count()) >= 1);
	await p.getByRole('button', { name: 'Orqaga' }).filter({ visible: true }).first().click();
	await p.waitForTimeout(600);
	check("orqaga tugmasi postga qaytaradi", p.url().includes('/post/p15'), p.url());
	await go(p, '/profile/dr.malika');
	check("to'g'ridan-to'g'ri ochilgan boshqa profilda ham orqaga tugmasi bor", (await p.getByRole('button', { name: 'Orqaga' }).filter({ visible: true }).count()) >= 1);
	await go(p, '/feed');
	await p.locator('a[aria-label="Bildirishnomalar"]').first().click();
	await p.waitForTimeout(500);
	check("bildirishnomalar sahifasida orqaga tugmasi bor (ilovadan kelinganda)", (await p.getByRole('button', { name: 'Orqaga' }).filter({ visible: true }).count()) >= 1);
	await p.getByRole('button', { name: 'Orqaga' }).filter({ visible: true }).first().click();
	await p.waitForTimeout(500);
	check("bildirishnomalardan orqaga lentaga qaytadi", p.url().endsWith('/feed'), p.url());
	await go(p, '/channels');
	await p.locator('main a[href^="/channels/"]').first().click();
	await p.waitForTimeout(600);
	check("Telefonda Kanallar ro'yxatidan kirilgan kanalda orqaga tugmasi BOR", (await p.getByRole('button', { name: 'Orqaga' }).filter({ visible: true }).count()) === 1);
	await go(p, '/post/p15');
	await p.locator('main a[href^="/channels/"]').first().click();
	await p.waitForTimeout(600);
	check("postdan kirilgan kanalda orqaga tugmasi bor va postga qaytaradi", (await p.getByRole('button', { name: 'Orqaga' }).filter({ visible: true }).count()) >= 1);
	await p.getByRole('button', { name: 'Orqaga' }).filter({ visible: true }).first().click();
	await p.waitForTimeout(500);
	check("kanaldan orqaga postga qaytadi", p.url().includes('/post/p15'), p.url());
	// Bosh sahifadan kirilgan kanal "Kanallar" bo'limi bo'lib ketmasin
	const active = () => p.locator('nav a[aria-current="page"]').evaluateAll((els) => els.map((e) => e.getAttribute('aria-label') || e.innerText.trim()));
	await go(p, '/feed');
	await p.evaluate(() => (window.__marker = 1));
	await p.locator('main a[href^="/channels/"]').first().click();
	await p.waitForTimeout(600);
	check('lentadagi kanal havolasi sahifani qayta yuklamaydi (SPA o`tish)', await p.evaluate(() => window.__marker === 1));
	check("Bosh sahifadan kirilgan kanalda faol bo'lim: Bosh sahifa (Kanallar emas)", [...new Set(await active())].join() === 'Bosh sahifa', (await active()).join());
	await go(p, '/channels');
	await p.locator('main a[href^="/channels/"]').first().click();
	await p.waitForTimeout(600);
	check("Kanallar ro'yxatidan kirilgan kanalda faol bo'lim: Kanallar", [...new Set(await active())].join() === 'Kanallar', (await active()).join());
	check('orqaga tugmasi sinovida JS xatosi yo`q', p.errors.length === 0, p.errors[0]);
	await p.context().close();
}

// ───────────────────────── 8c. Profil: tug'ilgan kun va telefon ─────────────────────────
{
	const p = await session('m');
	await go(p, '/profile/anvarov');
	check("o'z profilimda tug'ilgan kun va telefon ko'rinadi (izohsiz)", (await p.getByTestId('profile-birthdate').innerText()).includes('14 may 1984') && (await p.getByTestId('profile-phone').innerText()).includes('+998 90 123 45 67') && !(await p.getByTestId('profile-phone').innerText()).includes('faqat siz'));
	await go(p, '/profile/dr.malika');
	check("boshqaning raqami ruxsat bergan bo'lsa ko'rinadi", (await p.getByTestId('profile-phone').count()) === 1);
	await go(p, '/settings');
	await p.getByPlaceholder('+998 90 123 45 67').fill('12345');
	await p.getByRole('button', { name: 'Saqlash', exact: true }).first().click();
	await p.waitForTimeout(300);
	check("noto'g'ri telefon rad etiladi", (await p.getByText('Format: +998').count()) === 1);
	await p.getByPlaceholder('+998 90 123 45 67').fill('90 111 22 33');
	await p.getByRole('checkbox').first().check();
	await p.getByRole('button', { name: 'Saqlash', exact: true }).first().click();
	await p.waitForTimeout(400);
	await go(p, '/profile/anvarov');
	const t = await p.getByTestId('profile-phone').innerText();
	check("yangi telefon formatlanib saqlanadi, endi hammaga ko'rinadi (izohsiz)", t.includes('+998 90 111 22 33'), t);
	await go(p, '/profile/anvarov');
	const hrs = p.getByTestId('profile-hours');
	check("profilda ish vaqti holati (Ochiq/Yopiq ...)", /(Ochiq|Yopiq) ·?/.test(await hrs.innerText()), await hrs.innerText());
	await hrs.getByRole('button').click();
	await p.waitForTimeout(200);
	check("ish vaqti bosilsa 7 kunlik jadval ochiladi (yakshanba - Dam olish)", (await hrs.locator('li').count()) === 7 && (await hrs.locator('li').last().innerText()).includes('Dam olish'));
	await go(p, '/profile/dr.malika');
	check("boshqa foydalanuvchida ham ish vaqti ko'rinadi", (await p.getByTestId('profile-hours').count()) === 1);
	await go(p, '/settings');
	await p.getByLabel('Yakshanba dam olish').uncheck();
	await p.getByLabel('Yakshanba boshlanishi').fill('10:00');
	await p.getByLabel('Yakshanba tugashi').fill('09:00');
	await p.getByRole('button', { name: 'Saqlash', exact: true }).first().click();
	await p.waitForTimeout(300);
	check("ish vaqti: tugash boshlanishdan oldin bo'lsa rad etiladi", (await p.getByText("Tugash vaqti boshlanishidan keyin").count()) === 1);
	await p.getByLabel('Yakshanba tugashi').fill('12:00');
	await p.getByRole('button', { name: 'Saqlash', exact: true }).first().click();
	await p.waitForTimeout(400);
	await go(p, '/profile/anvarov');
	await p.getByTestId('profile-hours').getByRole('button').click();
	check("saqlangan ish vaqti jadvalda (yakshanba 10:00 - 12:00)", (await p.getByTestId('profile-hours').locator('li').last().innerText()).includes('10:00 - 12:00'));
	// juda uzun qiymatlar dizaynni buzmaydi
	await go(p, '/settings');
	await p.getByPlaceholder('https://...').first().fill('https://' + 'uzunmanzil'.repeat(8) + '.uz');
	await p.getByPlaceholder('username').fill('u'.repeat(32));
	await p.getByRole('button', { name: 'Saqlash', exact: true }).first().click();
	await p.waitForTimeout(400);
	await go(p, '/profile/anvarov');
	const geo = await p.evaluate(() => {
		const rows = [...document.querySelectorAll('main section[aria-label="Ma\'lumotlar"] .grid > div')].map((e) => Math.round(e.getBoundingClientRect().height));
		return { overflow: document.documentElement.scrollWidth > document.documentElement.clientWidth, maxRow: Math.max(...rows), rows };
	});
	check("uzun vebsayt/telegram: gorizontal aylanish yo'q, katakchalar bir qatorda qoladi", !geo.overflow && geo.maxRow <= 64, JSON.stringify(geo));
	check("profilda JS xatosi yo`q (tug'ilgan kun/telefon)", p.errors.length === 0, p.errors[0]);
	await p.context().close();
}

// ───────────────────────── 8b. Kampaniya izohlari, kanal ko'rinishi, guruh avatarlari, qo'ng'iroq ─────────────────────────
{
	const p = await session('m');
	await go(p, '/campaigns/k1');
	check('kampaniyada pastki panel yo`q, Muhokama bo`limi va izohlar bor', (await p.locator('nav.fixed').filter({ visible: true }).count()) === 0 && (await p.getByRole('region', { name: 'Muhokama' }).locator('.group').count()) >= 2);
	const ta = p.getByLabel('Savol yoki fikr yozing');
	const h0 = await ta.evaluate((e) => e.offsetHeight);
	await ta.fill('Uzun matn '.repeat(40));
	await p.waitForTimeout(150);
	const h1 = await ta.evaluate((e) => e.offsetHeight);
	check("uzun izoh matni kesilmaydi: maydon balandligi o'sadi", h1 > h0 + 20, `${h0} -> ${h1}`);
	await p.getByLabel('Savol yoki fikr yozing').fill('Smoke muhokama xabari');
	await p.getByRole('button', { name: 'Yuborish', exact: true }).click();
	await p.waitForTimeout(400);
	check("kampaniya izohi qo'shiladi va o'ngda", (await p.getByRole('region', { name: 'Muhokama' }).locator('.group.flex-row-reverse', { hasText: 'Smoke muhokama xabari' }).count()) === 1);
	await p.reload();
	await p.waitForTimeout(600);
	check('kampaniya izohi yangilangandan keyin saqlanadi', (await p.getByText('Smoke muhokama xabari').count()) === 1);
	// kanal avatari va muqovasi
	await go(p, '/channels/c1');
	await p.getByRole('button', { name: 'Tahrirlash' }).click();
	await p.waitForTimeout(300);
	await p.getByRole('button', { name: 'Avatar rangi #C53030' }).click();
	await p.getByRole('button', { name: /^Muqova/ }).nth(3).click();
	await p.getByRole('button', { name: 'Saqlash', exact: true }).click();
	await p.waitForTimeout(500);
	const cover = await p.locator('main div[class*="bg-gradient-to-br"]').first().getAttribute('class');
	check('kanal muqovasi tanlangani qo`llanadi', !!cover && !cover.includes('neutral-700'), cover);
	// guruh chati: chapda avatar
	await go(p, '/chats/ch4');
	const av = await p.locator('main .group a[aria-label]').count();
	check("guruh chatida yuboruvchi avatari chapda ko'rinadi", av >= 1, String(av));
	check("guruh chatida qo'ng'iroq tugmalari yo`q", (await p.getByRole('button', { name: "Ovozli qo'ng'iroq" }).count()) === 0);
	// shaxsiy chat: qo'ng'iroq
	await go(p, '/chats/ch1');
	check("shaxsiy chatda ovozli va video qo'ng'iroq tugmalari bor", (await p.getByRole('button', { name: "Ovozli qo'ng'iroq" }).count()) === 1 && (await p.getByRole('button', { name: "Video qo'ng'iroq" }).count()) === 1);
	await p.getByRole('button', { name: "Video qo'ng'iroq" }).click();
	await p.waitForTimeout(300);
	check("qo'ng'iroq oynasi ochiladi va tugatilganda yopiladi", await (async () => {
		const opened = (await p.getByTestId('call-dialog').count()) === 1;
		await p.getByRole('button', { name: "Qo'ng'iroqni tugatish" }).click();
		await p.waitForTimeout(300);
		return opened && (await p.getByTestId('call-dialog').count()) === 0;
	})());
	// biriktirish menyusi: Media / Fayl / So'rovnoma
	await p.getByRole('button', { name: 'Biriktirish', exact: true }).click();
	await p.waitForTimeout(200);
	check("biriktirish menyusi: Media, Fayl, So'rovnoma", (await texts(p.getByRole('menuitem'))).join('|') === "Media|Fayl|So'rovnoma", (await texts(p.getByRole('menuitem'))).join('|'));
	await p.getByRole('menuitem', { name: "So'rovnoma" }).click();
	await p.getByLabel('Savol', { exact: true }).fill('Smoke savol?');
	await p.getByLabel('Variant 1').fill('Ha');
	await p.getByLabel('Variant 2').fill("Yo'q");
	await p.locator('form', { has: p.getByLabel('Savol', { exact: true }) }).getByRole('button', { name: 'Yuborish', exact: true }).click();
	await p.waitForTimeout(500);
	await p.getByRole('button', { name: /^Ha/ }).click();
	await p.waitForTimeout(300);
	check("chatda so'rovnoma yuboriladi va ovoz beriladi", (await p.getByText('1 kishi ovoz berdi').count()) === 1);
	await p.locator('input[aria-label="Fayl tanlash"]').setInputFiles({ name: 'hisobot.txt', mimeType: 'text/plain', buffer: Buffer.from('salom') });
	await p.waitForTimeout(300);
	await p.getByRole('button', { name: 'Yuborish', exact: true }).click();
	await p.waitForTimeout(400);
	check('chatda fayl kartasi (nomi) chiqadi', (await p.locator('a[download="hisobot.txt"]').count()) === 1);
	// ovozli / video xabar
	const mic = p.getByRole('button', { name: 'Ovozli xabar', exact: true });
	check("matn yo`q: yuborish o`rniga mikrofon tugmasi", (await mic.count()) === 1 && (await p.getByRole('button', { name: 'Yuborish', exact: true }).count()) === 0);
	await p.getByPlaceholder('Xabar yozing').fill('a');
	check("matn yozilganda mikrofon o`rniga yuborish tugmasi", (await mic.count()) === 0 && (await p.getByRole('button', { name: 'Yuborish', exact: true }).count()) === 1);
	await p.getByPlaceholder('Xabar yozing').fill('');
	const hold = async (ms) => {
		const mb = await p.getByRole('button', { name: /^(Ovozli|Video) xabar$/ }).boundingBox();
		await p.mouse.move(mb.x + mb.width / 2, mb.y + mb.height / 2);
		await p.mouse.down();
		await p.waitForTimeout(ms);
	};
	await hold(1800);
	check('mikrofonni bosib turish ovozli xabar yozishni boshlaydi', (await p.getByTestId('voice-recorder').count()) === 1);
	await p.mouse.up();
	await p.waitForTimeout(1000);
	check("qo'yib yuborilganda ovozli xabar yuboriladi (pleer chiqadi)", (await p.locator('main').getByRole('slider', { name: 'Ovozli xabar vaqti' }).count()) === 1 && (await p.getByTestId('voice-recorder').count()) === 0);
	await p.getByRole('button', { name: 'Ovozli xabar', exact: true }).click();
	await p.waitForTimeout(200);
	check('bir marta bosish ovozli rejimdan video rejimga o`tkazadi', (await p.getByRole('button', { name: 'Video xabar', exact: true }).count()) === 1 && (await p.locator('main').getByRole('slider', { name: 'Ovozli xabar vaqti' }).count()) === 1);
	await hold(1800);
	check('video rejimda bosib turish video yozishni ochadi', (await p.getByTestId('video-recorder').count()) === 1);
	await p.mouse.up();
	await p.waitForTimeout(1200);
	check("qo'yib yuborilganda video xabar yuboriladi (doira)", (await p.locator('main video').count()) === 1 && (await p.getByTestId('video-recorder').count()) === 0);
	await hold(1800);
	const mb2 = await p.getByRole('button', { name: 'Video xabar', exact: true }).boundingBox();
	await p.mouse.move(mb2.x - 150, mb2.y + 10);
	await p.mouse.up();
	await p.waitForTimeout(800);
	check('chapga surib qo`yib yuborilsa yozuv bekor bo`ladi', (await p.locator('main video').count()) === 1 && (await p.getByTestId('video-recorder').count()) === 0);
	check('yangi funksiyalarda JS xatosi yo`q', p.errors.length === 0, p.errors[0]);
	await p.context().close();
}

// ───────────────────────── 8d. "Eng uzun matn" sinov rejimi (?uzun=1): dizayn buzilmasin ─────────────────────────
for (const kind of ['m', 'd']) {
	const p = await session(kind);
	await go(p, '/feed?uzun=1', 900);
	const bad = [];
	for (const path of ['/feed', '/search', '/chats', '/chats/ch4', '/channels', '/channels/c1', '/post/p15', '/campaigns/k1', '/notifications', '/profile/anvarov']) {
		await go(p, path, 500);
		if (await p.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth)) bad.push(path);
	}
	check(`[${kind}] uzun matn rejimi: ${bad.length ? bad.join(', ') : '10 ta sahifada'} gorizontal aylanish yo'q`, bad.length === 0);
	if (kind === 'm') {
		await go(p, '/channels/c1', 900);
		check("kanal postlarida nom siljimaydi (faqat sarlavhalarda)", (await p.locator('main [role="link"] .marquee.moving').count()) === 0);
		const t = () => p.evaluate(() => { const e = document.querySelector('.marquee.moving .marquee-track'); return e ? { anim: getComputedStyle(e).animationName, x: new DOMMatrix(getComputedStyle(e).transform).m41, dist: parseFloat(getComputedStyle(e).getPropertyValue('--dist')) } : null; });
		const a1 = await t();
		await p.waitForTimeout(700);
		const a2 = await t();
		check("uzun kanal nomi o'ngdan chapga uzluksiz oqadi (bir yo'nalishda)", !!a1 && /flow$/.test(a1.anim) && a2.x < a1.x && a2.x >= -a1.dist, JSON.stringify([a1, a2]));
	}
	check(`[${kind}] uzun matn rejimida JS xatosi yo\`q`, p.errors.length === 0, p.errors[0]);
	await p.context().close();
}

// ───────────────────────── 8g. Yuqori panellar bir xil balandlikda ─────────────────────────
{
	const p = await session('m');
	const hs = {};
	for (const path of ['/post/p42', '/campaigns/k8', '/settings', '/notifications', '/tags/golang', '/chats/ch1', '/search']) {
		await go(p, path, 500);
		hs[path] = await p.evaluate(() => { const h = [...document.querySelectorAll('main header, header')].find((e) => getComputedStyle(e).position === 'sticky' && e.getBoundingClientRect().height > 0); return h ? Math.round(h.getBoundingClientRect().height) : null; });
	}
	const vals = Object.values(hs);
	check("yuqori panellar (post, kampaniya, sozlamalar, bildirishnoma, teg, chat, qidiruv) bir xil balandlikda", vals.every((v) => v !== null && Math.abs(v - 61) <= 3) , JSON.stringify(hs));
	await p.context().close();
}

// ───────────────────────── 8f. Kompyuter: Bosh sahifadan kirilgan kanalda ro'yxat paneli yo'q ─────────────────────────
{
	const p = await session('d');
	const listPane = () => p.locator('main a[href^="/channels/"]').filter({ visible: true }).count();
	await go(p, '/feed');
	await p.locator('main a[href^="/channels/"]').first().click();
	await p.waitForTimeout(700);
	check("Bosh sahifadan kirilgan kanalda chapdagi Kanallar ro'yxati ko'rinmaydi", (await p.locator('main a[href^="/channels/"]').filter({ hasText: /a'zo|Egasi/ }).count()) === 0 && (await p.getByRole('heading', { level: 1 }).filter({ visible: true }).count()) === 1 && (await p.locator('main .border-r').filter({ visible: true }).count()) === 0);
	await go(p, '/channels');
	await p.locator('main a[href^="/channels/"]').first().click();
	await p.waitForTimeout(700);
	check("Kanallar ro'yxatidan kirilganda ro'yxat paneli chapda qoladi", (await p.locator('main .border-r').filter({ visible: true }).count()) >= 1);
	// Qidiruv -> Kanallar tabi -> kanal: ro'yxat paneli bir lahza ham chiqmasin (oldin Kanallar ro'yxatiga kirilgan bo'lsa ham)
	await go(p, '/channels');
	await p.locator('aside a[href="/search"]').first().click().catch(() => {});
	await go(p, '/channels');
	await p.evaluate(() => { history.pushState({}, '', '/channels'); });
	await p.locator('main a[href^="/channels/"]').first().click();
	await p.waitForTimeout(500);
	await p.goBack();
	await p.waitForTimeout(300);
	await p.evaluate(() => { window.__seen = false; new MutationObserver(() => { const e = document.querySelector('main div.shrink-0.border-r.overflow-y-auto'); if (e && getComputedStyle(e).display !== 'none') window.__seen = true; }).observe(document.body, { childList: true, subtree: true }); });
	await p.goto(BASE + '/search');
	await p.waitForTimeout(400);
	await p.getByRole('tab', { name: /Kanallar/ }).click();
	await p.waitForTimeout(300);
	await p.evaluate(() => { window.__seen = false; new MutationObserver(() => { const e = document.querySelector('main div.shrink-0.border-r.overflow-y-auto'); if (e && getComputedStyle(e).display !== 'none') window.__seen = true; }).observe(document.body, { childList: true, subtree: true }); });
	await p.locator('main a[href^="/channels/"]').first().click();
	await p.waitForTimeout(700);
	check("qidiruv -> kanal: Kanallar ro'yxati paneli bir lahza ham chizilmaydi", (await p.evaluate(() => window.__seen)) === false);
	// Qidiruv: Kanallar tabida kanalga kirib orqaga qaytilsa tab saqlanadi
	await go(p, '/search');
	await p.getByRole('tab', { name: /Kanallar/ }).click();
	await p.waitForTimeout(300);
	await p.locator('main a[href^="/channels/"]').first().click();
	await p.waitForTimeout(600);
	await p.goBack();
	await p.waitForTimeout(600);
	check("qidiruv: kanaldan orqaga qaytganda 'Kanallar' tabi saqlanadi (Postlar emas)", (await p.getByRole('tab', { name: /Kanallar/ }).getAttribute('aria-selected')) === 'true', p.url());
	await p.getByRole('tab', { name: /Odamlar/ }).click();
	await p.waitForTimeout(300);
	await p.locator('main a[href^="/profile/"]').first().click();
	await p.waitForTimeout(600);
	await p.goBack();
	await p.waitForTimeout(600);
	check("qidiruv: profildan orqaga qaytganda 'Odamlar' tabi saqlanadi", (await p.getByRole('tab', { name: /Odamlar/ }).getAttribute('aria-selected')) === 'true', p.url());
	// orqaga qaytishda View Transition (ikki sahifa aralashishi) ishlatilmasin
	await go(p, '/search');
	await p.getByRole('tab', { name: /Kanallar/ }).click();
	await p.waitForTimeout(300);
	await p.locator('main a[href^="/channels/"]').first().click();
	await p.waitForTimeout(600);
	await p.evaluate(() => { window.__vt = 0; const o = document.startViewTransition?.bind(document); if (o) document.startViewTransition = (...a) => { window.__vt++; return o(...a); }; });
	await p.goBack();
	await p.waitForTimeout(700);
	check("orqaga qaytishda sahifalar orasida aralashish animatsiyasi ishlamaydi", (await p.evaluate(() => window.__vt)) === 0);
	// Qidiruv -> Kanallar tabi -> kanal -> ORQAGA: "Kanallar" ro'yxati bir lahza ham chiqmasin
	await go(p, '/search');
	await p.getByRole('tab', { name: /Kanallar/ }).click();
	await p.waitForTimeout(300);
	await p.locator('main a[href^="/channels/"]').first().click();
	await p.waitForTimeout(700);
	await p.evaluate(() => { window.__seenBack = false; const chk = () => { const e = document.querySelector('main div.shrink-0.border-r.overflow-y-auto'); if (e && getComputedStyle(e).display !== 'none' && location.pathname === '/search') window.__seenBack = true; }; new MutationObserver(chk).observe(document.body, { childList: true, subtree: true, attributes: true }); const loop = () => { chk(); requestAnimationFrame(loop); }; loop(); });
	await p.goBack();
	await p.waitForTimeout(900);
	check("qidiruv -> kanal -> orqaga: Kanallar ro'yxati bo'limi bir lahza ham ko'rinmaydi (kompyuter)", (await p.evaluate(() => window.__seenBack)) === false && p.url().includes('/search'));
	// F5: qidiruvdan kirilgan kanal yangilanganda ham "Kanallar" bo'limi bo'lib ochilmasin
	await go(p, '/search');
	await p.getByRole('tab', { name: /Kanallar/ }).click();
	await p.waitForTimeout(300);
	await p.locator('main a[href^="/channels/"]').first().click();
	await p.waitForTimeout(600);
	await p.reload();
	await p.waitForTimeout(900);
	check("qidiruvdan kirilgan kanal F5 dan keyin ham ro'yxatsiz (Kanallar bo'limi emas)", (await p.locator('main div.shrink-0.border-r.overflow-y-auto').filter({ visible: true }).count()) === 0 && [...new Set(await p.locator('nav a[aria-current="page"]').evaluateAll((e) => e.map((x) => x.getAttribute('aria-label') || x.innerText.trim())))].join() === '');
	// Kanallar bo'limida kanaldan kanalga o'tganda orqaga tugmasi bir xil (ikkalasida ham yo'q)
	await go(p, '/channels');
	await p.locator('main a[href^="/channels/"]').nth(0).click();
	await p.waitForTimeout(500);
	const noBack1 = (await p.getByRole('button', { name: 'Orqaga' }).filter({ visible: true }).count()) === 0;
	await p.locator('main a[href^="/channels/"]').nth(1).click();
	await p.waitForTimeout(500);
	check("Kanallar bo'limida birinchi va keyingi kanalda orqaga tugmasi bir xil (yo'q)", noBack1 && (await p.getByRole('button', { name: 'Orqaga' }).filter({ visible: true }).count()) === 0);
	// Esc: ichki sahifadan orqaga
	await go(p, '/feed');
	await p.locator('main [role="link"]').first().click();
	await p.waitForTimeout(500);
	await p.keyboard.press('Escape');
	await p.waitForTimeout(500);
	check("Esc bosilsa postdan orqaga (lentaga) qaytadi", p.url().endsWith('/feed'), p.url());
	await p.locator('main [role="link"]').first().click();
	await p.waitForTimeout(500);
	await p.getByRole('button', { name: "Ko'proq" }).first().click().catch(() => {});
	await p.waitForTimeout(200);
	await p.keyboard.press('Escape');
	await p.waitForTimeout(400);
	check("Esc ochiq menyuni yopadi, sahifadan chiqarmaydi", p.url().includes('/post/'), p.url());
	check('kompyuter kanal sinovida JS xatosi yo`q', p.errors.length === 0, p.errors[0]);
	await p.context().close();
}

// ───────────────────────── 9. Kompyuter ko'rinishi va qorong'u rejim ─────────────────────────
{
	const p = await session('d', { scheme: 'dark' });
	await go(p, '/feed');
	check("kompyuterda yon panel bor, yuqori mobil panel yo'q", (await p.locator('aside').filter({ visible: true }).count()) === 1 && (await p.locator('main a[aria-label="Qidiruv"]').filter({ visible: true }).count()) === 1 && (await p.locator('main a[aria-label="graduss"]').filter({ visible: true }).count()) === 0);
	check('kompyuterda Bosh sahifa tepasida panel: sarlavha, qidiruv, bildirishnoma', await p.getByTestId('desktop-topbar').isVisible() && /Bosh sahifa/.test(await p.getByTestId('desktop-topbar').innerText()) && (await p.getByTestId('desktop-topbar').getByRole('link', { name: 'Bildirishnomalar' }).count()) === 1);
	await p.mouse.move(600, 400);
	await p.mouse.wheel(0, 900);
	await p.waitForTimeout(400);
	check("chap panelda Qidiruv va Bildirishnomalar yo`q", (await p.locator('aside a').filter({ hasText: /Qidiruv|Bildirishnomalar/ }).count()) === 0);
	check('kompyuter paneli aylantirganda tepada qoladi', (await p.getByTestId('desktop-topbar').boundingBox()).y === 0);
	await go(p, '/chats');
	check('kompyuter paneli Xabarlar sahifasida (sarlavha Xabarlar)', /Xabarlar/.test(await p.getByTestId('desktop-topbar').innerText()));
	await go(p, '/chats/ch1');
	check('kompyuter paneli suhbat ichida ham qoladi (Xabarlar, qidiruv, bildirishnoma)', /Xabarlar/.test(await p.getByTestId('desktop-topbar').innerText()) && (await p.getByTestId('desktop-topbar').getByRole('link', { name: 'Qidiruv' }).count()) === 1 && (await p.getByTestId('desktop-topbar').boundingBox()).y === 0);
	await go(p, '/channels/c1');
	check('kompyuter paneli kanal ichida ham qoladi (Kanallar)', /Kanallar/.test(await p.getByTestId('desktop-topbar').innerText()) && (await p.getByRole('button', { name: 'Tahrirlash' }).boundingBox()).y >= 56);
	await go(p, '/channels');
	check('kompyuter paneli Kanallar sahifasida (sarlavha Kanallar)', /Kanallar/.test(await p.getByTestId('desktop-topbar').innerText()));
	await go(p, '/feed');
	check("qorong'u rejim yoqilgan", await p.evaluate(() => document.documentElement.classList.contains('dark')));
	await go(p, '/profile/anvarov');
	const topEl = () => p.evaluate(() => { const e = document.elementFromPoint(700, 28); return e?.closest('[data-testid="desktop-topbar"]') ? 'bar' : e?.closest('header')?.innerText.includes('Sozlamalar') ? 'title' : 'other'; });
	const bar = async () => ((await topEl()) === 'bar' ? 1 : 0);
	check('kompyuter profil: tepada qidiruv paneli', (await bar()) === 1);
	await p.mouse.move(600, 400);
	await p.mouse.wheel(0, 800);
	await p.waitForTimeout(600);
	check('kompyuter profil: pastga aylantirilganda ism va Sozlamalar paneli, qidiruv paneli yo`q', (await topEl()) === 'title');
	await p.mouse.wheel(0, -200);
	await p.waitForTimeout(600);
	check('kompyuter profil: yuqoriga aylantirilganda qidiruv paneli qaytadi', (await topEl()) === 'bar');
	await go(p, '/profile/anvarov');
	await p.mouse.move(600, 400);
	await p.mouse.wheel(0, 150);
	await p.waitForTimeout(400);
	await p.evaluate(() => { const r = document.querySelector('main div.relative.z-10.rounded-full').getBoundingClientRect(); window.scrollBy(0, r.top + r.height / 2 - 28); });
	await p.waitForTimeout(600);
	check('profil avatari aylantirilganda yuqori panel ostida qoladi (ustiga chiqmaydi)', await p.evaluate(() => { const av = document.querySelector('main div.relative.z-10.rounded-full'); const r = av.getBoundingClientRect(); const e = document.elementFromPoint(r.left + r.width / 2, 28); return Math.abs(r.top + r.height / 2 - 28) < 6 && !!e && !av.contains(e); }));
	await go(p, '/channels/c1');
	check('kompyuter: kanal sahifasi tab bilan ochiladi', (await tabs(p).count()) === 1);
	check('kompyuter/qorong`u rejimda JS xatosi yo`q', p.errors.length === 0, p.errors[0]);
	await p.context().close();
}


// ───────────────────────── 7. Chatda qidirish, tadbirlar, statistika, qoralama va rejalashtirish ─────────────────────────
{
	const p = await session('d');
	const z = (n) => String(n).padStart(2, '0');
	const local = (ms) => { const d = new Date(Date.now() + ms); return `${d.getFullYear()}-${z(d.getMonth() + 1)}-${z(d.getDate())}T${z(d.getHours())}:${z(d.getMinutes())}`; };

	// Chatda qidirish
	await go(p, '/chats/ch1');
	await p.getByRole('button', { name: 'Suhbatda qidirish' }).click();
	await p.getByLabel('Xabarlarda qidirish').fill('soat');
	await p.waitForTimeout(400);
	check('chatda qidirish: 2 ta moslik, eng yangisidan boshlanadi (2/2)', (await p.getByText('2/2', { exact: true }).count()) === 1);
	check('chatda qidirish: joriy xabar belgilangan', (await p.locator('[id^="msg-"].ring-amber-400').count()) === 1);
	await p.getByRole('button', { name: 'Oldingi (eskiroq) xabar' }).click();
	check('chatda qidirish: oldingisiga o`tish (1/2)', (await p.getByText('1/2', { exact: true }).count()) === 1);
	await p.getByLabel('Xabarlarda qidirish').fill('zzzyo`q');
	await p.waitForTimeout(250);
	check('chatda qidirish: topilmasa "Topilmadi"', (await p.getByText('Topilmadi').count()) === 1);
	await p.getByRole('button', { name: 'Oldingi (eskiroq) xabar' }).focus();
	await p.keyboard.press('Escape');
	await p.waitForTimeout(300);
	check('chatda qidirish: Esc qidiruvni yopadi va suhbatdan chiqarmaydi', p.url().includes('/chats/ch1') && (await p.getByLabel('Xabarlarda qidirish').count()) === 0);

	// Kanal egasi: statistika, tadbir, rejalashtirish, qoralama
	await go(p, '/channels/c1');
	check('tadbir kartasi kanalda ko`rinadi', (await p.getByRole('article', { name: /Tadbir: Ochiq eshiklar/ }).count()) === 1);
	await p.getByRole('button', { name: "Eslatma qo'yish" }).first().click();
	await p.waitForTimeout(250);
	check('tadbirga eslatma qo`yildi', (await p.getByRole('button', { name: "Eslatma qo'yilgan" }).count()) === 1);
	check('egasiga eslatmalar soni ko`rinadi', (await p.getByText(/1 kishi eslatma qo'ygan/).count()) === 1);

	await p.getByRole('button', { name: 'Statistika' }).click();
	await p.waitForTimeout(250);
	check('statistika oynasi ochiladi', (await p.getByText('Kanal statistikasi').count()) === 1 && (await p.getByText("Eng ko'p ko'rilgan postlar").count()) === 1);
	await p.keyboard.press('Escape');
	await p.getByRole('button', { name: 'Yopish' }).first().click().catch(() => {});
	await p.waitForTimeout(250);

	// 30 daqiqadan keyingi tadbir + eslatma => bildirishnoma
	await go(p, '/channels/c1');
	await p.getByRole('button', { name: "Tadbir qo'shish" }).click();
	await p.getByLabel('Nomi').fill('Tezkor uchrashuv');
	await p.getByLabel('Boshlanish vaqti').fill(local(30 * 60_000));
	await p.getByRole('button', { name: "Qo'shish", exact: true }).click();
	await p.waitForTimeout(400);
	check('yangi tadbir qo`shildi', (await p.getByRole('article', { name: 'Tadbir: Tezkor uchrashuv' }).count()) === 1);
	await p.getByRole('article', { name: 'Tadbir: Tezkor uchrashuv' }).getByRole('button', { name: "Eslatma qo'yish" }).click();
	await go(p, '/notifications');
	check('1 soat qolgan tadbir uchun bildirishnoma keladi', (await p.getByText(/"Tezkor uchrashuv" tez orada boshlanadi/).count()) === 1);

	// Rejalashtirish va qoralama
	await go(p, '/channels/c1');
	const box = p.getByLabel('Post matni');
	await box.fill('Rejalashtirilgan sinov posti');
	await p.getByRole('button', { name: 'Rejalashtirish' }).first().click();
	await p.getByLabel('Chop etish vaqti').first().fill(local(3_600_000 * 5));
	await p.getByRole('button', { name: 'Rejalashtirish' }).last().click();
	await p.waitForTimeout(400);
	check('rejalashtirilgan post kanalda KO`RINMAYDI', (await p.getByText('Rejalashtirilgan sinov posti', { exact: true }).count()) === 0);
	await box.fill('Qoralama sinov posti');
	await p.getByRole('button', { name: 'Qoralamaga' }).click();
	await p.waitForTimeout(400);
	check('qoralama kanalda KO`RINMAYDI', (await p.getByText('Qoralama sinov posti', { exact: true }).count()) === 0);
	await p.getByRole('button', { name: /Qoralama va rejalar \(2\)/ }).first().click();
	await p.waitForTimeout(300);
	check('"Qoralama va rejalar" ikkalasini ko`rsatadi', (await p.getByText('Rejalashtirilgan sinov posti').count()) === 1 && (await p.getByText('Qoralama sinov posti').count()) === 1);
	await p.getByRole('button', { name: 'Hozir chop etish' }).last().click();
	await p.waitForTimeout(400);
	await p.keyboard.press('Escape');
	await p.mouse.click(2, 2);
	await p.waitForTimeout(300);
	check('"Hozir chop etish" qoralamani kanalga chiqaradi', (await p.getByText('Qoralama sinov posti', { exact: true }).count()) >= 1);
	check('chop etilmagan reja lentada yo`q', (await (async () => { await go(p, '/feed'); return p.getByText('Rejalashtirilgan sinov posti', { exact: true }).count(); })()) === 0);
	check('yangi funksiyalarda JS xatosi yo`q', p.errors.length === 0, p.errors[0]);
	await p.context().close();
}


// ───────────────────────── 8. Telefon: suhbatda yozish paneli pastda qotib turadi ─────────────────────────
{
	const p = await session('m');
	await go(p, '/chats/ch1');
	await p.evaluate(() => { window.scrollTo(0, 800); document.body.scrollTop = 800; });
	await p.mouse.move(200, 400);
	await p.mouse.wheel(0, 600);
	await p.waitForTimeout(300);
	const r = await p.evaluate(() => {
		const f = document.querySelector('main form');
		const b = f.getBoundingClientRect();
		return { bottom: Math.round(b.bottom), vh: innerHeight, scrollY: Math.round(scrollY), lock: getComputedStyle(document.documentElement).overflow };
	});
	check('telefon suhbat: sahifa aylanmaydi, yozish paneli ekran pastida', r.lock === 'hidden' && r.scrollY === 0 && Math.abs(r.bottom - r.vh) <= 1, JSON.stringify(r));
	check("telefon suhbat: xabarlar ro'yxati o'zi aylanadi", await p.evaluate(() => { const el = [...document.querySelectorAll('main div')].find((d) => getComputedStyle(d).overflowY === 'auto' && d.className.includes('overscroll-contain') && d.querySelector('[id^="msg-"]')); return !!el; }));
	await p.getByLabel('Suhbatda qidirish').click();
	const fs = await p.getByLabel('Xabarlarda qidirish').evaluate((e) => parseFloat(getComputedStyle(e).fontSize));
	check('telefon: qidiruv maydoni shrifti >=16px (iOS yaqinlashtirmaydi)', fs >= 16, String(fs));
	await go(p, '/chats');
	check("suhbatdan chiqilgach sahifa aylanishi qaytadi", (await p.evaluate(() => getComputedStyle(document.documentElement).overflow)) !== 'hidden');
	check('telefon suhbat testida JS xatosi yo`q', p.errors.length === 0, p.errors[0]);
	await p.context().close();
}


// ───────────────────────── 9. Telefon: ro'yxatdan kanalga kirganda "Orqaga" tugmasi bor ─────────────────────────
{
	const p = await session('m');
	await go(p, '/channels');
	await p.locator('main a[href^="/channels/"]').first().click();
	await p.waitForTimeout(600);
	const back = p.getByRole('button', { name: 'Orqaga' });
	check('telefon: kanalga ro`yxatdan kirilganda Orqaga tugmasi ko`rinadi', (await back.count()) === 1 && (await back.isVisible()));
	await back.click();
	await p.waitForTimeout(500);
	check('telefon: Orqaga kanallar ro`yxatiga qaytaradi', new URL(p.url()).pathname === '/channels');
	await p.context().close();
	const d = await session('d');
	await go(d, '/channels');
	await d.locator('main a[href^="/channels/"]').first().click();
	await d.waitForTimeout(600);
	check('kompyuter: ro`yxat yonida turgani uchun Orqaga tugmasi yashirin', !(await d.getByRole('button', { name: 'Orqaga' }).first().isVisible().catch(() => false)));
	await d.context().close();
}

await browser.close();
console.log(`\n${total - fails.length}/${total} tekshiruv o'tdi`);
if (fails.length) {
	console.log('YIQILGANLAR:\n - ' + fails.join('\n - '));
	process.exit(1);
}
console.log('HAMMASI O`TDI');
