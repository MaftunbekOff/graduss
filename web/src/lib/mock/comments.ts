import type { Comment } from '$lib/types';

export const comments: Comment[] = [
	{
		id: 'cm1',
		postId: 'p1',
		authorId: 'u6',
		content: "Namangan tumanlarida ehtiyoj juda katta, ayniqsa qishloq hududlarida.",
		createdAt: '2026-08-31T09:30:00',
	},
	{
		id: 'cm2',
		postId: 'p1',
		authorId: 'u4',
		content: 'Biznes uchun ham malakali kadrlar tayyorlash muhim, texnik maktablarni unutmang.',
		createdAt: '2026-08-31T09:50:00',
	},
	{
		id: 'cm3',
		postId: 'p1',
		authorId: 'u7',
		content: "Loyihaning to'liq smetasini oshkor qilasizmi?",
		createdAt: '2026-08-31T10:05:00',
	},
	{
		id: 'cm4',
		postId: 'p2',
		authorId: 'u3',
		content: "Ish joyida sport zali ochishni rejalashtiryapmiz, maslahatingiz kerak.",
		createdAt: '2026-08-31T08:00:00',
	},
	{
		id: 'cm5',
		postId: 'p5',
		authorId: 'u1',
		content: 'Juda muhim mavzu, threadni kutamiz.',
		createdAt: '2026-08-30T11:20:00',
	},
	{
		id: 'cm6',
		postId: 'p6',
		authorId: 'u5',
		content: 'Huquqiy nuqtai nazardan bu holat tekshiruvni talab qiladi. Yordam bera olaman.',
		createdAt: '2026-08-29T21:10:00',
	},
	// --- kengaytirilgan mock (2026-10-01) ---
	{
		id: "xc1",
		postId: "p15",
		authorId: "u22",
		content: "To'g'ri, ayniqsa HTTP handler'larda r.Context() ni to'g'ridan-to'g'ri ishlatish kerak.",
		createdAt: "2026-10-01T09:10"
	},
	{
		id: "xc2",
		postId: "p15",
		authorId: "u9",
		content: "Struct ichida context saqlash kod ko'rib chiqishda birinchi rad etiladigan narsa bo'lib qoldi.",
		createdAt: "2026-10-01T09:45"
	},
	{
		id: "xc3",
		postId: "p16",
		authorId: "u4",
		content: "Oziq-ovqat bosimi kichik biznesga ham ta'sir qilyapti. Jadvalda tuman kesimi bormi?",
		createdAt: "2026-10-01T08:00"
	},
	{
		id: "xc4",
		postId: "p16",
		authorId: "u25",
		content: "Tahlil uchun rahmat. Metodologiya qismi ayniqsa foydali.",
		createdAt: "2026-10-01T08:30"
	},
	{
		id: "xc5",
		postId: "p17",
		authorId: "u30",
		content: "Progress ko'rsatkichi va aniq xato xabari. Animatsiyada ham aynan shu: foydalanuvchiga holatni tushuntirish.",
		createdAt: "2026-09-30T20:10"
	},
	{
		id: "xc6",
		postId: "p17",
		authorId: "u29",
		content: "Maktab elektron jurnallarida ham shu muammo bor, o'qituvchilar yo'qolib qolishyapti.",
		createdAt: "2026-09-30T21:00"
	},
	{
		id: "xc7",
		postId: "p18",
		authorId: "u2",
		content: "Kardiolog sifatida ham qo'shilaman. Ota-onalar uchun xavf belgilari ro'yxati juda foydali.",
		createdAt: "2026-09-30T17:00"
	},
	{
		id: "xc8",
		postId: "p18",
		authorId: "u28",
		content: "Harorat tushiruvchi dori dozasini kg bo'yicha hisoblash ham alohida muhim mavzu.",
		createdAt: "2026-09-30T17:40"
	},
	{
		id: "xc9",
		postId: "p19",
		authorId: "u3",
		content: "LED chiroqlar bo'yicha kafolat muddati va quvvat ko'rsatkichlari ham hisobotda bo'lsa yaxshi bo'lardi.",
		createdAt: "2026-09-30T13:00"
	},
	{
		id: "xc10",
		postId: "p19",
		authorId: "u1",
		content: "Shaffoflik bo'yicha yaxshi namuna. Boshqa mahallalar ham shu amaliyotni qo'llasa.",
		createdAt: "2026-09-30T14:15"
	},
	{
		id: "xc11",
		postId: "p20",
		authorId: "u27",
		content: "Bilimni hujjatlashtirish bo'yicha video arxiv boshlash mumkin. Zarina bilan gaplashib ko'ring.",
		createdAt: "2026-09-29T19:30"
	},
	{
		id: "xc12",
		postId: "p20",
		authorId: "u15",
		content: "Qiziq. Ustalar bilan intervyu seriyasini suratga olishga tayyorman.",
		createdAt: "2026-09-29T20:10"
	},
	{
		id: "xc13",
		postId: "p21",
		authorId: "u11",
		content: "Ha, egalikni chizish juda yordam beradi. Boshida men ham aynan shuni qilganman.",
		createdAt: "2026-09-29T15:00"
	},
	{
		id: "xc14",
		postId: "p22",
		authorId: "u8",
		content: "62 daqiqa uzun emas, hujjatli filmda ritm hal qiladi. Muvaffaqiyat tilayman.",
		createdAt: "2026-09-29T11:00"
	},
	{
		id: "xc15",
		postId: "p23",
		authorId: "u4",
		content: "Kichik biznes egalari uchun juda foydali. Bu qoida ko'pchilikka noma'lum.",
		createdAt: "2026-09-28T18:00"
	},
	{
		id: "xc16",
		postId: "p23",
		authorId: "u6",
		content: "Nishonlangan muddatlar uchun rahmat. Maktab xodimlari uchun ham ahamiyatli.",
		createdAt: "2026-09-28T18:40"
	},
	{
		id: "xc17",
		postId: "p24",
		authorId: "u6",
		content: "Nargiza opa, men shu usulni sinab ko'rdim. Bolalar kasrni tezroq tushunishdi.",
		createdAt: "2026-09-28T12:00"
	},
	{
		id: "xc18",
		postId: "p25",
		authorId: "u3",
		content: "Tarmoq barqarorligi bo'yicha qaysi akkumulyator turlarini ko'rib chiqyapsizlar?",
		createdAt: "2026-09-28T10:30"
	},
	{
		id: "xc19",
		postId: "p25",
		authorId: "u18",
		content: "Litiy-temir-fosfat asosiy variant, narxi va xavfsizlik nuqtai nazaridan.",
		createdAt: "2026-09-28T11:10"
	},
	{
		id: "xc20",
		postId: "p27",
		authorId: "u4",
		content: "Natijalar ta'sirli. Hisob-kitob jadvalini o'rganib chiqaman, startapimiz uchun foydali bo'ladi.",
		createdAt: "2026-09-27T16:20"
	},
	{
		id: "xc21",
		postId: "p27",
		authorId: "u1",
		content: "Qishloq xo'jaligida suv tejash bo'yicha davlat dasturi ham bor, ma'lumot yuboraman.",
		createdAt: "2026-09-27T17:00"
	},
	{
		id: "xc22",
		postId: "p28",
		authorId: "u13",
		content: "To'g'ri yondashuv. Avtomatik o'tkazma o'rnatish intizomni osonlashtiradi.",
		createdAt: "2026-09-27T14:00"
	},
	{
		id: "xc23",
		postId: "p29",
		authorId: "u5",
		content: "Hujjatlar bilan ishlangan tekshiruv. Huquqiy jihatdan davlat organlariga rasmiy so'rov yuborish ham mumkin.",
		createdAt: "2026-09-26T19:00"
	},
	{
		id: "xc24",
		postId: "p29",
		authorId: "u7",
		content: "Faktchekking nuqtai nazaridan yaxshi ish, manbalar ochiq ko'rsatilgan.",
		createdAt: "2026-09-26T19:30"
	},
	{
		id: "xc25",
		postId: "p31",
		authorId: "u12",
		content: "Samarqandda ham shunday tajriba bor: Registon atrofi piyodalar zonasidan keyin tushum oshgan.",
		createdAt: "2026-09-26T11:30"
	},
	{
		id: "xc26",
		postId: "p31",
		authorId: "u3",
		content: "Transport tashkil etish alohida murakkab masala, ammo muqobil bo'lsa ishlaydi.",
		createdAt: "2026-09-26T12:00"
	},
	{
		id: "xc27",
		postId: "p32",
		authorId: "u2",
		content: "Bo'g'im funksiyasi bo'yicha to'g'ri fikr. Sportchilar buni ko'pincha e'tiborsiz qoldiradi.",
		createdAt: "2026-09-25T17:40"
	},
	{
		id: "xc28",
		postId: "p33",
		authorId: "u6",
		content: "Rost, treninglar qisqa va amaliy bo'lishi kerak. Biz shu formatda o'tkazib ko'rdik.",
		createdAt: "2026-09-25T13:30"
	},
	{
		id: "xc29",
		postId: "p34",
		authorId: "u10",
		content: "Bu fikr interfeys animatsiyasi uchun ham to'g'ri: harakat ma'no berishi kerak.",
		createdAt: "2026-09-24T19:40"
	},
	{
		id: "xc30",
		postId: "p35",
		authorId: "u8",
		content: "Rishton sirlari juda go'zal. Studiyangizni ko'rishni xohlayman.",
		createdAt: "2026-09-24T12:00"
	},
	{
		id: "xc31",
		postId: "p36",
		authorId: "u17",
		content: "Ustoz-amaliyotchi dasturi kasb-hunar maktablari uchun juda dolzarb. Qanday ro'yxatdan o'tiladi?",
		createdAt: "2026-09-23T15:40"
	},
	{
		id: "xc32",
		postId: "p36",
		authorId: "u3",
		content: "Muhandis sifatida ishtirok etishga tayyorman.",
		createdAt: "2026-09-23T16:00"
	},
	{
		id: "xc33",
		postId: "p37",
		authorId: "u16",
		content: "Bolalarda ham qon bosimini o'lchash maktab yoshida muhim, ko'pchilik bilmaydi.",
		createdAt: "2026-09-23T10:30"
	},
	{
		id: "xc34",
		postId: "p38",
		authorId: "u22",
		content: "Monolit va yaxshi modul chegaralari. Keyin kerak bo'lsa ajratish oson.",
		createdAt: "2026-09-22T18:00"
	},
	{
		id: "xc35",
		postId: "p39",
		authorId: "u21",
		content: "Qishloqda moliyalashtirishga kirish haqiqatan ham eng katta muammo.",
		createdAt: "2026-09-22T13:00"
	},
	{
		id: "xc36",
		postId: "p39",
		authorId: "u25",
		content: "Soliq hisoboti murakkabligi tushunarli, ammo hisobot shakllari soddalashgan.",
		createdAt: "2026-09-22T13:40"
	},
	{
		id: "xc37",
		postId: "p41",
		authorId: "u11",
		content: "5 ta real mijoz qoidasi ishlaydi. Biz ham shu yo'l bilan boshlagan edik.",
		createdAt: "2026-09-21T11:30"
	},
	{
		id: "xc38",
		postId: "p42",
		authorId: "u20",
		content: "Asl manbani topish uchun xizmatlar ro'yxatini ulashsam bo'ladimi?",
		createdAt: "2026-09-20T17:00"
	},
	{
		id: "xc39",
		postId: "p44",
		authorId: "u19",
		content: "Depozit qaytarilish muddatini alohida yozish kerak, ko'pincha o'tkazib yuboriladi.",
		createdAt: "2026-09-19T16:00"
	},
	{
		id: "xc40",
		postId: "p45",
		authorId: "u29",
		content: "Yondashuv ajoyib. Maktabimizda o'qituvchilar uchun trening sifatida taklif qilaman.",
		createdAt: "2026-09-19T10:00"
	},
	{
		id: "xc41",
		postId: "p48",
		authorId: "u30",
		content: "Portfolio uchun ishonchli maslahat. Yangi boshlovchilar buni bilishi kerak.",
		createdAt: "2026-09-17T15:00"
	},
	{
		id: "xc42",
		postId: "p49",
		authorId: "u3",
		content: "Shamollatish uchun avtomatik datchiklar ham arzonlashgan, ko'rib chiqishingiz mumkin.",
		createdAt: "2026-09-17T09:30"
	},
	{
		id: "xc43",
		postId: "p50",
		authorId: "u27",
		content: "Harakatlanuvchi devor g'oyasi qiziq. Tovush izolyatsiyasi qanday hal qilindi?",
		createdAt: "2026-09-16T17:20"
	},
	{
		id: "xc44",
		postId: "p50",
		authorId: "u12",
		content: "Ikki qavatli panel bilan, tafsilotlar kanalda.",
		createdAt: "2026-09-16T18:00"
	},
	{
		id: "xc45",
		postId: "p52",
		authorId: "u5",
		content: "Huquq nuqtai nazaridan ham aniq va to'liq. Rahmat.",
		createdAt: "2026-09-15T14:00"
	},
	{
		id: "xc46",
		postId: "p53",
		authorId: "u13",
		content: "'Umumiy qiymat' ko'rsatkichi ko'p mijozlarga yangilik bo'ladi.",
		createdAt: "2026-09-14T11:15"
	},
	{
		id: "xc47",
		postId: "p55",
		authorId: "u1",
		content: "Marshrutlar kundalik yo'lga bog'lanishi kerak, rost. Bu masalani kengashda ko'taraman.",
		createdAt: "2026-09-12T16:00"
	},
	{
		id: "xc48",
		postId: "p56",
		authorId: "u2",
		content: "To'g'ri. Shifokor bilan maslahatlashish muhim, ayniqsa surunkali kasalliklarda.",
		createdAt: "2026-09-11T10:30"
	}
];


export function getCommentsByPost(postId: string): Comment[] {
	return comments.filter((c) => c.postId === postId);
}
