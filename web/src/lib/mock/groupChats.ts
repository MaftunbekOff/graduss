import type { Message, Poll } from '$lib/types';

// Guruh suhbatlari uchun qo'shimcha demo tarix: bir kishining ketma-ket 2-5 ta xabari, javob, uzatilgan, ovoz, video, fayl, rasm, so'rovnoma.
// Barcha xabarlar mavjud oxirgi xabarlardan ESKI (ro'yxat tartibi va oxirgi xabar ko'rinishi o'zgarmasin).

type Draft = Partial<Omit<Message, 'id' | 'chatId' | 'senderId' | 'createdAt'>> & { from: string; at: string; key?: string };

function build(chatId: string, drafts: Draft[]): Message[] {
	const keyToId: Record<string, string> = {};
	return drafts.map((d, i) => {
		const id = `gm-${chatId}-${String(i + 1).padStart(3, '0')}`;
		if (d.key) keyToId[d.key] = id;
		const { from, at, key: _k, replyToId, content, ...rest } = d;
		return { id, chatId, senderId: from, content: content ?? '', createdAt: `2026-${at}`, replyToId: replyToId ? (keyToId[replyToId] ?? replyToId) : undefined, ...rest } as Message;
	});
}

const poll = (id: string, question: string, opts: [string, string[]][]): Poll => ({
	id,
	question,
	options: opts.map(([text, votes], i) => ({ id: `${id}-${i}`, text, votes }))
});

// ch4 — Infratuzilma ishchi guruhi (u1 = men, u2 Malika, u3 Jasur, u4 Nodira)
const ch4 = build('ch4', [
	{ from: 'u3', at: '08-25T09:00', content: 'Assalomu alaykum, hamkasblar.' },
	{ from: 'u3', at: '08-25T09:01', content: "Ko'cha yoritish loyihasining birinchi bosqichi bo'yicha qisqa hisobot tayyor." },
	{ from: 'u3', at: '08-25T09:02', content: 'Hammasi jadvalga mos ketyapti, faqat 3-hududda kechikish bor.' },
	{ from: 'u3', at: '08-25T09:03', content: '', file: { name: 'yoritish-hisobot-avgust.pdf', size: 482000, url: 'data:application/pdf;base64,AA==' }, key: 'hisobot' },
	{ from: 'u2', at: '08-25T09:10', content: "Rahmat, Jasur. Hozir ko'raman." },
	{ from: 'u2', at: '08-25T09:12', content: "3-hududdagi kechikish sababi nima? Pudratchi tomondanmi yoki ruxsatnomalarmi?", replyToId: 'hisobot' },
	{ from: 'u1', at: '08-25T09:20', content: 'Salom.' },
	{ from: 'u1', at: '08-25T09:21', content: "Ruxsatnomalar bilan bog'liq, men bugun tuman hokimligi bilan gaplashaman." },
	{ from: 'u1', at: '08-25T09:21', content: "Ertagacha aniq muddat aytaman." },
	{ from: 'u4', at: '08-25T10:00', content: 'Byudjet qismini ham yangilab qo‘ydim.' },
	{ from: 'u4', at: '08-25T10:01', images: ['/demo/anim-1.gif', '/demo/anim-2.gif'], imageUrl: '/demo/anim-1.gif' },
	{ from: 'u4', at: '08-25T10:02', content: "Chap tomonda reja, o'ng tomonda haqiqiy xarajat." },
	{ from: 'u3', at: '08-25T11:30', content: '', audio: { url: '/demo/melody-1.wav', duration: 34 } },
	{ from: 'u3', at: '08-25T11:31', content: "Ovozli xabarda tafsilot aytdim, yozishga vaqt yo'q edi." },
	{ from: 'u2', at: '08-26T08:50', content: 'Xayrli tong!' },
	{ from: 'u2', at: '08-26T08:51', content: 'Bugungi yig‘ilishni 15:00 ga ko‘chirsak bo‘ladimi?' },
	{ from: 'u2', at: '08-26T08:52', content: '', poll: poll('gp1', 'Yig‘ilish vaqti?', [['14:00', ['u3']], ['15:00', ['u2', 'u4']], ['16:30', []]]) },
	{ from: 'u1', at: '08-26T09:05', content: '15:00 menga qulay.' },
	{ from: 'u4', at: '08-26T09:10', content: 'Menga ham.' },
	{ from: 'u3', at: '08-26T09:11', content: 'Men ham bo‘laman, 15:00 yaxshi.' },
	{ from: 'u3', at: '08-26T15:40', content: '', video: { url: '/demo/clip-1.webm', duration: 12 } },
	{ from: 'u3', at: '08-26T15:41', content: "Hozir 3-hududdan olib turibman, ko'rdingizlarmi?" },
	{ from: 'u2', at: '08-26T15:45', content: "Ha, ish boshlangan ekan. Yaxshi." },
	{ from: 'u2', at: '08-26T15:46', content: 'Pudratchiga ertaga yana bir bor eslatamiz.' },
	{ from: 'u2', at: '08-26T15:46', content: "Eslatma: har haftaning payshanbasida 15:00 da qisqa yig'ilish.", forwardedFrom: 'Nodira Karimova' },
	{ from: 'u1', at: '08-26T16:20', content: "Kelishdik. Protokolni men yozaman.", replyToId: 'hisobot' },
	{ from: 'u1', at: '08-26T16:21', content: 'Ertaga ertalab hammangizga yuboraman.' },
	{ from: 'u4', at: '08-27T08:30', content: 'Protokolga bitta band qo‘shsak: moliyaviy nazorat muddati.' },
	{ from: 'u4', at: '08-27T08:31', content: '', file: { name: 'nazorat-jadvali.xlsx', size: 94000, url: 'data:application/pdf;base64,AA==' } },
	{ from: 'u3', at: '08-27T08:40', content: 'Qo‘shamiz.' },
	{ from: 'u2', at: '08-27T08:41', content: 'Qo‘llab-quvvatlayman.' },
	{ from: 'u2', at: '08-27T08:41', content: 'Jasur, jadvaldagi sanalarni tekshirib chiq, iltimos.' },
	{ from: 'u3', at: '08-27T08:50', content: '', video: { url: '/demo/clip-3.webm', duration: 9 }, forwardedFrom: 'Malika Yusupova' },
	{ from: 'u3', at: '08-27T17:00', content: 'Bugungi ish tugadi.' },
	{ from: 'u3', at: '08-27T17:01', content: 'Ertaga davom etamiz.' },
	{ from: 'u1', at: '08-27T17:05', content: 'Rahmat, hammaga. Yaxshi dam oling.' }
]);

// ch7 — Shaharsozlik maslahat guruhi (u1 = men, u12, u27)
const ch7 = build('ch7', [
	{ from: 'u12', at: '09-20T10:00', content: 'Assalomu alaykum.' },
	{ from: 'u12', at: '09-20T10:01', content: 'Yangi bosh reja bo‘yicha hududiy chegaralar loyihasini yubordim.' },
	{ from: 'u12', at: '09-20T10:02', content: '', file: { name: 'bosh-reja-chegaralar.pdf', size: 1280000, url: 'data:application/pdf;base64,AA==' } },
	{ from: 'u27', at: '09-20T10:30', content: 'Ko‘rib chiqdim.' },
	{ from: 'u27', at: '09-20T10:31', content: 'Yashil hududlar ulushi 18% — me’yordan past, 25% ga yetkazish kerak.' },
	{ from: 'u1', at: '09-20T11:00', content: 'To‘g‘ri aytasiz, Shuhrat.' },
	{ from: 'u1', at: '09-20T11:02', content: '', audio: { url: '/demo/melody-2.wav', duration: 7 } },
	{ from: 'u12', at: '09-21T09:15', content: 'Bir variant taklif qilaman: sanoat zonasini 2 km shimolga surish.' },
	{ from: 'u12', at: '09-21T09:16', content: '', poll: poll('gp2', 'Sanoat zonasini surishni qo‘llaysizmi?', [['Ha', ['u12', 'u27']], ['Yo‘q', []], ['Qo‘shimcha o‘rganish kerak', ['u1']]]) },
	{ from: 'u27', at: '09-21T10:00', content: 'Ha.' },
	{ from: 'u27', at: '09-21T10:00', content: 'Faqat transport yo‘llarini ham qayta ko‘rib chiqish shart.' },
	{ from: 'u27', at: '09-21T10:01', content: 'Aks holda yuk mashinalari turar-joy ichidan o‘tadi.' },
	{ from: 'u1', at: '09-22T14:00', content: 'Transport bo‘limi bilan uchrashuv belgilayman.' },
	{ from: 'u1', at: '09-22T14:01', content: 'Payshanba kuni 11:00 ga mos keladimi?' },
	{ from: 'u12', at: '09-22T14:10', content: 'Mos.' },
	{ from: 'u27', at: '09-22T14:12', content: 'Men ham bo‘laman.' }
]);

// ch10 — Huquqiy ekspertiza (u1 = men, u19, u5)
const ch10 = build('ch10', [
	{ from: 'u19', at: '09-20T09:00', content: 'Hamkasblar, salom.' },
	{ from: 'u19', at: '09-20T09:01', content: 'Ijara shartnomalari bo‘yicha amaldagi me’yorlarni jamladim.' },
	{ from: 'u19', at: '09-20T09:02', content: '', file: { name: 'ijara-meyorlar.docx', size: 356000, url: 'data:application/pdf;base64,AA==' } },
	{ from: 'u5', at: '09-20T09:40', content: 'Rahmat.' },
	{ from: 'u5', at: '09-20T09:41', content: 'Depozit va muddatdan oldin bekor qilish bandlariga alohida e’tibor beraylik.' },
	{ from: 'u1', at: '09-20T10:20', content: 'Kelishdik.' },
	{ from: 'u1', at: '09-20T10:21', imageUrl: '/demo/anim-2.gif', spoiler: true },
	{ from: 'u1', at: '09-20T10:22', content: 'Bu jadval — ikki davlat tajribasi taqqoslangan.' },
	{ from: 'u19', at: '09-21T12:00', content: '', video: { url: '/demo/clip-2.webm', duration: 5 } },
	{ from: 'u19', at: '09-21T12:01', content: 'Qisqacha tushuntirdim.' },
	{ from: 'u5', at: '09-22T16:00', content: 'Xulosa qoralamasini yozdim.', captionUp: true },
	{ from: 'u5', at: '09-22T16:01', content: 'Ertaga ikkalangiz ham ko‘rib chiqing.' },
	{ from: 'u5', at: '09-22T16:02', content: 'Izohlaringizni hujjat ichida qoldiring.' },
	{ from: 'u5', at: '09-22T16:02', content: 'Rahmat!' }
]);

export const groupMessages: Message[] = [...ch4, ...ch7, ...ch10];
