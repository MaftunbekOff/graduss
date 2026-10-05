import type { Campaign } from '$lib/types';

const DAY = 86_400_000;
const ago = (days: number) => new Date(Date.now() - days * DAY).toISOString();
const ahead = (days: number) => new Date(Date.now() + days * DAY).toISOString();

export const campaigns: Campaign[] = [
	{
		id: 'k1',
		channelId: 'c3',
		title: "Mahalliy startaplar uchun coworking markazi",
		summary:
			"Toshkentda yosh tadbirkorlar uchun arzon ish joyi, mentor soatlari va haftalik pitch kechalari. Mablag' uch bosqichda ishlatiladi, har bosqich hisoboti a'zolar tomonidan tasdiqlanadi.",
		goal: 60_000_000,
		deadline: ahead(18),
		createdAt: ago(12),
		milestones: [
			{ id: 'm1', title: 'Xona ijarasi va ta\'mir', percent: 40, status: 'locked', approvals: [] },
			{ id: 'm2', title: 'Jihozlar va internet', percent: 35, status: 'locked', approvals: [] },
			{ id: 'm3', title: 'Ochilish va birinchi 3 oy', percent: 25, status: 'locked', approvals: [] }
		],
		pledges: [
			{ id: 'p1', userId: 'u2', amount: 5_000_000, createdAt: ago(10) },
			{ id: 'p2', userId: 'u5', amount: 2_000_000, createdAt: ago(8) },
			{ id: 'p3', userId: 'u6', amount: 10_000_000, createdAt: ago(5) },
			{ id: 'p4', userId: 'u7', amount: 1_500_000, createdAt: ago(2) }
		]
	},
	{
		id: 'k2',
		channelId: 'c1',
		title: "Mahalla bolalar maydonchasi",
		summary: "Shahar chetidagi mahallada xavfsiz bolalar maydonchasi qurish. Pudratchi tanlovi ochiq, hisobotlar shu yerda.",
		goal: 30_000_000,
		deadline: ago(6),
		createdAt: ago(40),
		milestones: [
			{ id: 'm1', title: 'Yer tayyorlash va poydevor', percent: 50, status: 'released', report: "Yer tekislandi, poydevor quyildi. Foto-hisobot kanalda.", approvals: ['u2', 'u5', 'u6'] },
			{ id: 'm2', title: "Jihozlarni o'rnatish", percent: 50, status: 'locked', approvals: [] }
		],
		pledges: [
			{ id: 'p1', userId: 'u2', amount: 12_000_000, createdAt: ago(35) },
			{ id: 'p2', userId: 'u5', amount: 10_000_000, createdAt: ago(30) },
			{ id: 'p3', userId: 'u6', amount: 9_000_000, createdAt: ago(20) }
		]
	},
	{
		id: 'k3',
		channelId: 'c2',
		title: "Qishloq feldsher punkti uchun jihozlar",
		summary: "Uzoq qishloq feldsher punktiga asosiy diagnostika jihozlari.",
		goal: 20_000_000,
		deadline: ago(3),
		createdAt: ago(30),
		milestones: [
			{ id: 'm1', title: 'Asbob-uskunalar xaridi', percent: 70, status: 'voting', report: "Uskunalar sotib olindi, cheklar va foto ilova qilindi.", approvals: ['u4'] },
			{ id: 'm2', title: "O'rnatish va o'qitish", percent: 30, status: 'locked', approvals: [] }
		],
		pledges: [
			{ id: 'p1', userId: 'u1', amount: 3_000_000, createdAt: ago(25) },
			{ id: 'p2', userId: 'u4', amount: 9_000_000, createdAt: ago(20) },
			{ id: 'p3', userId: 'u7', amount: 8_500_000, createdAt: ago(10) }
		]
	},
	{
		id: 'k4',
		channelId: 'c4',
		title: "Bepul yuridik maslahat portali",
		summary: "Fuqarolar uchun sodda tilda bepul huquqiy maslahat platformasi.",
		goal: 50_000_000,
		deadline: ago(2),
		createdAt: ago(35),
		milestones: [{ id: 'm1', title: 'Portal ishlab chiqish', percent: 100, status: 'locked', approvals: [] }],
		pledges: [
			{ id: 'p1', userId: 'u1', amount: 500_000, createdAt: ago(20) },
			{ id: 'p2', userId: 'u3', amount: 4_000_000, createdAt: ago(15) }
		]
	},
	// --- kengaytirilgan mock (2026-10-01) ---
	{
		id: "k5",
		channelId: "c6",
		title: "O'zbek tili uchun ochiq NLP ma'lumotlar to'plami",
		summary: "Mashina o'rganish uchun 500 ming jumlali tozalangan va yorliqlangan o'zbek tili korpusi. Hamma natijalar ochiq litsenziya bilan e'lon qilinadi.",
		goal: 45000000,
		deadline: ahead(24),
		createdAt: ago(9),
		milestones: [
			{ id: "m1", title: "Ma'lumot yig'ish va tozalash", percent: 40, status: "locked", approvals: [] },
			{ id: "m2", title: "Yorliqlash (annotatsiya)", percent: 40, status: "locked", approvals: [] },
			{ id: "m3", title: "Nashr va hujjatlashtirish", percent: 20, status: "locked", approvals: [] }
		],
		pledges: [
			{ id: "p1", userId: "u22", amount: 6000000, createdAt: ago(8) },
			{ id: "p2", userId: "u9", amount: 3000000, createdAt: ago(7) },
			{ id: "p3", userId: "u25", amount: 4000000, createdAt: ago(5) },
			{ id: "p4", userId: "u10", amount: 2500000, createdAt: ago(4) },
			{ id: "p5", userId: "u4", amount: 5000000, createdAt: ago(2) }
		]
	},
	{
		id: "k6",
		channelId: "c13",
		title: "Yangi albom uchun studiya yozuvi",
		summary: "Dutor va elektron bas uchun 6 soatlik studiya sessiyasi, uch ijrochi, mastering. Yig'ilgan mablag' bosqichma-bosqich studiya va mixing uchun to'lanadi.",
		goal: 18000000,
		deadline: ago(4),
		createdAt: ago(31),
		milestones: [
			{ id: "m1", title: "Studiya ijarasi va ijrochilar", percent: 65, status: "released", report: "Sessiya o'tkazildi, xom yozuvlar va ijrochilar ro'yxati kanalda e'lon qilindi.", approvals: ["u15", "u8", "u30", "u10"] },
			{ id: "m2", title: "Mixing va mastering", percent: 35, status: "voting", report: "Mixing tugadi, yakuniy mastering bo'yicha taklif tayyor, hisobot kanalda.", approvals: ["u15", "u8"] }
		],
		pledges: [
			{ id: "p1", userId: "u15", amount: 6000000, createdAt: ago(26) },
			{ id: "p2", userId: "u8", amount: 4000000, createdAt: ago(22) },
			{ id: "p3", userId: "u30", amount: 3500000, createdAt: ago(18) },
			{ id: "p4", userId: "u10", amount: 2500000, createdAt: ago(12) },
			{ id: "p5", userId: "u2", amount: 2500000, createdAt: ago(9) }
		]
	},
	{
		id: "k7",
		channelId: "c14",
		title: "Rishton kulolchilik ustaxonasi uchun pechka",
		summary: "Yosh kulollar o'qitiladigan ustaxonaga yangi gaz pechi va sirlash jihozlari. Ustaxona o'quvchilarga ikki yil bepul ochiq bo'ladi.",
		goal: 36000000,
		deadline: ago(10),
		createdAt: ago(50),
		milestones: [
			{ id: "m1", title: "Pechka va montaj", percent: 70, status: "locked", approvals: [] },
			{ id: "m2", title: "Sirlash va xom ashyo", percent: 30, status: "locked", approvals: [] }
		],
		pledges: [
			{ id: "p1", userId: "u8", amount: 5000000, createdAt: ago(44) },
			{ id: "p2", userId: "u15", amount: 3000000, createdAt: ago(38) },
			{ id: "p3", userId: "u12", amount: 2000000, createdAt: ago(30) },
			{ id: "p4", userId: "u1", amount: 1000000, createdAt: ago(12) }
		]
	},
	{
		id: "k8",
		channelId: "c15",
		title: "Qishloq issiqxonalari uchun suv sarfi datchiklari",
		summary: "20 ta fermer xo'jaligiga namlik datchiklari va avtomatik sug'orish nazoratchilari. Natijalar ochiq hisobot sifatida e'lon qilinadi.",
		goal: 24000000,
		deadline: ahead(12),
		createdAt: ago(6),
		milestones: [
			{ id: "m1", title: "Datchiklar xaridi", percent: 50, status: "locked", approvals: [] },
			{ id: "m2", title: "O'rnatish va o'qitish", percent: 30, status: "locked", approvals: [] },
			{ id: "m3", title: "Natijalar hisoboti", percent: 20, status: "locked", approvals: [] }
		],
		pledges: [
			{ id: "p1", userId: "u3", amount: 4000000, createdAt: ago(5) },
			{ id: "p2", userId: "u18", amount: 3000000, createdAt: ago(4) },
			{ id: "p3", userId: "u4", amount: 2500000, createdAt: ago(3) },
			{ id: "p4", userId: "u13", amount: 2000000, createdAt: ago(1) }
		]
	}
];
