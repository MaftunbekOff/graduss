import type { Chat, Message } from '$lib/types';
import { groupMessages } from './groupChats';

export const chats: Chat[] = [
	{
		id: 'ch1',
		participantIds: ['u1', 'u2'],
		isGroup: false
	},
	{
		id: 'ch2',
		participantIds: ['u1', 'u4'],
		isGroup: false
	},
	{
		id: 'ch3',
		participantIds: ['u1', 'u5'],
		isGroup: false
	},
	{
		id: 'ch4',
		participantIds: ['u1', 'u2', 'u3', 'u4'],
		isGroup: true,
		title: "Infratuzilma ishchi guruhi"
	},
	// --- kengaytirilgan mock (2026-10-01) ---
	{
		id: "ch5",
		participantIds: ["u1", "u13"],
		isGroup: false
	},
	{
		id: "ch6",
		participantIds: ["u1", "u26"],
		isGroup: false
	},
	{
		id: "ch7",
		participantIds: ["u1", "u12", "u27"],
		isGroup: true,
		title: "Shaharsozlik maslahat guruhi"
	},
	{
		id: "ch8",
		participantIds: ["u1", "u6", "u17", "u29"],
		isGroup: true,
		title: "Kasb ta'limi islohoti"
	},
	{
		id: "ch9",
		participantIds: ["u1", "u10"],
		isGroup: false
	},
	{
		id: "ch10",
		participantIds: ["u1", "u19", "u5"],
		isGroup: true,
		title: "Huquqiy ekspertiza"
	}
];

export const messages: Message[] = [
	...groupMessages,
	{
		id: 'm1',
		chatId: 'ch1',
		senderId: 'u2',
		content: "Assalomu alaykum. Ertangi sog'liqni saqlash forumida ishtirok eta olasizmi?",
		createdAt: '2026-08-31T10:00:00'
	},
	{
		id: 'm2',
		chatId: 'ch1',
		senderId: 'u1',
		content: 'Va alaykum assalom. Albatta, soat nechida boshlanadi?',
		createdAt: '2026-08-31T10:02:00'
	},
	{
		id: 'm3',
		chatId: 'ch1',
		senderId: 'u2',
		content: "Soat 15:00 da, viloyat hokimligi majlislar zalida.",
		createdAt: '2026-08-31T10:03:00'
	},
	{
		id: 'm4',
		chatId: 'ch1',
		senderId: 'u1',
		content: "Yaxshi, kelaman. Taqdimot materiallarini yuborasizmi?",
		createdAt: '2026-08-31T10:05:00'
	},
	{
		id: 'm5',
		chatId: 'ch2',
		senderId: 'u4',
		content: "Soliq yengilligi dasturi haqida yozganingizni ko'rdim, rahmat!",
		createdAt: '2026-08-30T19:00:00'
	},
	{
		id: 'm6',
		chatId: 'ch2',
		senderId: 'u1',
		content: 'Arzimaydi, tadbirkorlarga foydali bo‘lsa xursandman.',
		createdAt: '2026-08-30T19:05:00'
	},
	{
		id: 'm7',
		chatId: 'ch3',
		senderId: 'u5',
		content: "Fuqarolar murojaati bo'yicha yangi qonun loyihasini ko'rib chiqdingizmi?",
		createdAt: '2026-08-29T12:00:00'
	},
	{
		id: 'm8',
		chatId: 'ch4',
		senderId: 'u3',
		content: "Ko'cha yoritish loyihasi bo'yicha hisobotni guruhga yukladim.",
		createdAt: '2026-08-28T09:00:00'
	},
	{
		id: 'm9',
		chatId: 'ch4',
		senderId: 'u2',
		content: "Ko'rib chiqaman, rahmat.",
		createdAt: '2026-08-28T09:15:00'
	},
	{
		id: 'm10',
		chatId: 'ch4',
		senderId: 'u4',
		content: "Keyingi yig'ilish qachon bo'ladi?",
		createdAt: '2026-08-28T09:20:00'
	},
	// --- kengaytirilgan mock (2026-10-01) ---
	{
		id: "xm1",
		chatId: "ch5",
		senderId: "u13",
		content: "Anvar aka, viloyat byudjeti bo'yicha ochiq ma'lumotlar to'plamini tahlil qilmoqchiman. Ruxsat bo'lsa, hisobot nusxasini yuborasizmi?",
		createdAt: "2026-09-30T11:00"
	},
	{
		id: "xm2",
		chatId: "ch5",
		senderId: "u1",
		content: "Assalomu alaykum, Dilfuza. Ochiq qismi sayt orqali mavjud, yig'ma hisobotni bugun yuboraman.",
		createdAt: "2026-09-30T11:12"
	},
	{
		id: "xm3",
		chatId: "ch5",
		senderId: "u13",
		content: "Rahmat. Tahlilni tayyorlab, kanalda e'lon qilaman, sizdan fikr so'rayman.",
		createdAt: "2026-09-30T11:15"
	},
	{
		id: "xm4",
		chatId: "ch5",
		senderId: "u1",
		content: "Albatta. Natijalarni ko'rishga qiziqaman.",
		createdAt: "2026-09-30T11:20"
	},
	{
		id: "xm5",
		chatId: "ch6",
		senderId: "u26",
		content: "Anvar aka, mahallamizdagi nasos stansiyasi masalasi bo'yicha viloyat kengashida ovoz berish qachon?",
		createdAt: "2026-09-29T09:00"
	},
	{
		id: "xm6",
		chatId: "ch6",
		senderId: "u1",
		content: "Keyingi haftaning payshanbasida. Hujjatlar to'plamini bugun ko'rib chiqaman.",
		createdAt: "2026-09-29T09:40"
	},
	{
		id: "xm7",
		chatId: "ch6",
		senderId: "u26",
		content: "Yaxshi. Pudratchilarning narx taklifini ham qo'shib yuboraman.",
		createdAt: "2026-09-29T09:42"
	},
	{
		id: "xm8",
		chatId: "ch7",
		senderId: "u27",
		content: "Hamkasblar, yangi piyodalar zonasi loyihasi uchun maslahat kerak: markaziy ko'cha uzunligi 800 metr.",
		createdAt: "2026-09-28T14:00"
	},
	{
		id: "xm9",
		chatId: "ch7",
		senderId: "u12",
		content: "Samarqandda shunga o'xshash 600 metrlik qismda yaxshi natija bo'ldi, tajribani yuboraman.",
		createdAt: "2026-09-28T14:10"
	},
	{
		id: "xm10",
		chatId: "ch7",
		senderId: "u1",
		content: "Kengashda muhokamaga qo'yish uchun qisqa texnik asos kerak. Bir sahifalik hujjat tayyorlay olasizmi?",
		createdAt: "2026-09-28T14:25"
	},
	{
		id: "xm11",
		chatId: "ch7",
		senderId: "u27",
		content: "Albatta, ertaga yuboraman.",
		createdAt: "2026-09-28T14:30"
	},
	{
		id: "xm12",
		chatId: "ch8",
		senderId: "u17",
		content: "Kasb ta'limi islohotida amaliyotchi ustozlar bo'yicha o'qituvchilar fikrini yig'dim. Asosiy xavotir: dars soatlari jadvaliga moslashish.",
		createdAt: "2026-09-27T16:00"
	},
	{
		id: "xm13",
		chatId: "ch8",
		senderId: "u29",
		content: "Bizda ham shu: amaliyotchilar faqat kechqurun bo'sh. Moslashuvchan jadval kerak.",
		createdAt: "2026-09-27T16:15"
	},
	{
		id: "xm14",
		chatId: "ch8",
		senderId: "u6",
		content: "Birinchi bosqichda bir tumanda sinov o'tkazish mumkin, natijaga qarab kengaytiramiz.",
		createdAt: "2026-09-27T16:20"
	},
	{
		id: "xm15",
		chatId: "ch8",
		senderId: "u1",
		content: "Yaxshi taklif. Sinov tumanini tanlash bo'yicha takliflaringizni yuboring.",
		createdAt: "2026-09-27T16:40"
	},
	{
		id: "xm16",
		chatId: "ch9",
		senderId: "u10",
		content: "Anvar aka, portal dizayn tizimi uchun texnik topshiriq tayyor. Ko'rib chiqishga yuboraymi?",
		createdAt: "2026-09-26T13:00"
	},
	{
		id: "xm17",
		chatId: "ch9",
		senderId: "u1",
		content: "Ha, yuboring. Birinchi navbatda mobil versiyani ko'ramiz.",
		createdAt: "2026-09-26T13:10"
	},
	{
		id: "xm18",
		chatId: "ch10",
		senderId: "u19",
		content: "Yangi ijara qoidalari loyihasi bo'yicha huquqiy xulosa tayyorladim.",
		createdAt: "2026-09-25T10:00"
	},
	{
		id: "xm19",
		chatId: "ch10",
		senderId: "u5",
		content: "Men ham qo'shimcha bandlar bo'yicha izoh qo'shdim. Depozit qismini aniqlashtirish kerak.",
		createdAt: "2026-09-25T10:20"
	},
	{
		id: "xm20",
		chatId: "ch10",
		senderId: "u1",
		content: "Rahmat. Ikkala xulosani birlashtirib, kengashda taqdim etamiz.",
		createdAt: "2026-09-25T10:45"
	}
];

// O'qilgan vaqt (har bir suhbat uchun). Yozuvi yo'q suhbat — hali o'qilmagan: ch6 va ch8 demo uchun o'qilmagan qoldirilgan.
export const chatReadSeed: Record<string, string> = Object.fromEntries(
	['ch1', 'ch2', 'ch3', 'ch4', 'ch5', 'ch7', 'ch9', 'ch10'].map((id) => [id, '2026-12-31T00:00:00.000Z'])
);
