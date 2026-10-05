import type { Channel } from '$lib/types';

export const channels: Channel[] = [
	{
		id: 'c1',
		name: "Shahar Kengashi Yangiliklari",
		handle: 'shaharkengash',
		sector: 'Siyosatchi',
		avatar: '#2F855A',
		description: "Viloyat va shahar kengashi qarorlari, ochiq eshiklar kuni e'lonlari.",
		memberCount: 15230,
		categories: [{ id: "qarorlar", name: "Qarorlar" }, { id: "hisobotlar", name: "Hisobotlar" }],
		joined: true,
		ownerId: 'u1',
		showOwner: true
	},
	{
		id: 'c2',
		name: "Sog'liqni Saqlash Forumi",
		handle: 'sogliqforum',
		sector: 'Shifokor',
		avatar: '#2B6CB0',
		description: "Shifokorlar va bemorlar uchun foydali ma'lumotlar, tibbiy islohotlar.",
		memberCount: 8940,
		joined: true,
		ownerId: 'u2'
	},
	{
		id: 'c3',
		name: 'Startap Hamjamiyati',
		handle: 'startaphub',
		sector: 'Tadbirkor',
		avatar: '#C53030',
		description: "Tadbirkorlar va investorlar uchun networking va mentorlik kanali.",
		memberCount: 6120,
		joined: false,
		ownerId: 'u4',
		showOwner: true
	},
	{
		id: 'c4',
		name: "Huquqiy Savodxonlik",
		handle: 'huquqsavod',
		sector: 'Huquqshunos',
		avatar: '#6B46C1',
		description: "Fuqarolarning huquqlari, qonun o'zgarishlari sodda tilda.",
		memberCount: 4310,
		joined: false,
		ownerId: 'u5'
	}
	,{
		id: 'c5',
		name: 'Gamedev Uzbekistan',
		handle: 'gamedevuz',
		sector: "O'yin ishlab chiquvchi",
		avatar: '#DD6B20',
		description: "O'zbek o'yin ishlab chiquvchilari: loyihalar, playtest va birgalikda ishlash.",
		memberCount: 2140,
		joined: false,
		ownerId: 'u9'
	},
	// --- kengaytirilgan mock (2026-10-01) ---
	{
		id: "c6",
		name: "Dasturchilar Uyi",
		handle: "dasturchilaruyi",
		sector: "Dasturchi",
		avatar: "#2C5282",
		description: "Backend, tizimli dasturlash va ochiq kodli loyihalar: kod ko'rib chiqish, maslahatlar, ish bo'yicha tajriba.",
		memberCount: 6420,
		categories: [{ id: "maslahat", name: "Maslahatlar" }, { id: "savol", name: "Savollar" }, { id: "kod", name: "Kod ko'rib chiqish" }],
		joined: true,
		ownerId: "u11"
	},
	{
		id: "c7",
		name: "Raqamli Mahsulot Dizayni",
		handle: "mahsulotdizayni",
		sector: "Dizayner",
		avatar: "#C05621",
		description: "UX tadqiqotlari, interfeys tahlillari va portfolio muhokamalari.",
		memberCount: 3980,
		joined: true,
		ownerId: "u10"
	},
	{
		id: "c8",
		name: "Me'morlik va Shahar Muhiti",
		handle: "memorlikshahar",
		sector: "Arxitektor",
		avatar: "#744210",
		description: "Shaharsozlik, tarixiy binolarni asrash va yangi turar-joy loyihalari.",
		memberCount: 4750,
		joined: false,
		ownerId: "u12"
	},
	{
		id: "c9",
		name: "Iqtisod Tahlili",
		handle: "iqtisodtahlil",
		sector: "Iqtisodchi",
		avatar: "#276749",
		description: "Oylik makroiqtisodiy sharhlar, byudjet va kichik biznes siyosati.",
		memberCount: 9310,
		joined: true,
		ownerId: "u13"
	},
	{
		id: "c10",
		name: "Matematika Ustozlari",
		handle: "matematikaustozlari",
		sector: "O'qituvchi",
		avatar: "#B7791F",
		description: "Olimpiada masalalari, dars rejalari va tushuntirish metodikasi.",
		memberCount: 3150,
		joined: false,
		ownerId: "u17"
	},
	{
		id: "c11",
		name: "Energetika Muhandislari",
		handle: "energetikamuhandis",
		sector: "Muhandis",
		avatar: "#975A16",
		description: "Quyosh va tarmoq muhandisligi: loyihalar, hisob-kitoblar, xavfsizlik.",
		memberCount: 2680,
		joined: false,
		ownerId: "u18"
	},
	{
		id: "c12",
		name: "Mustaqil Kino",
		handle: "mustaqilkino",
		sector: "Kino va video",
		avatar: "#97266D",
		description: "Hujjatli va qisqa metrajli kino: ssenariy, suratga olish va tarqatish tajribasi.",
		memberCount: 5420,
		categories: [{ id: "jarayon", name: "Suratga olish jarayoni" }, { id: "moliya", name: "Moliyalashtirish" }],
		joined: true,
		ownerId: "u15"
	},
	{
		id: "c13",
		name: "Jonli Musiqa Studiyasi",
		handle: "jonlimusiqa",
		sector: "Musiqachi",
		avatar: "#702459",
		description: "Aranjirovka, yozuv va ijro: studiya ishlari haqida ochiq suhbatlar.",
		memberCount: 2890,
		joined: false,
		ownerId: "u14"
	},
	{
		id: "c14",
		name: "Hunarmandlar Davrasi",
		handle: "hunarmandlar",
		sector: "San'atkor",
		avatar: "#9C4221",
		description: "Kulolchilik, kashtachilik, yog'och o'ymakorligi ustalari uchun maslahatlar va hamkorlik.",
		memberCount: 3640,
		joined: false,
		ownerId: "u23"
	},
	{
		id: "c15",
		name: "Agrobiznes Amaliyoti",
		handle: "agrobiznes",
		sector: "Tadbirkor",
		avatar: "#2F855A",
		description: "Issiqxona, sug'orish va hosilni sotish: fermerlar tajribasi.",
		memberCount: 4260,
		joined: false,
		ownerId: "u21"
	},
	{
		id: "c16",
		name: "Mahalla Yangiliklari",
		handle: "mahallayangilik",
		sector: "Siyosatchi",
		avatar: "#22543D",
		description: "Mahalla darajasidagi qarorlar, hisobotlar va aholi murojaatlari.",
		memberCount: 2310,
		joined: false,
		ownerId: "u26"
	},
	{
		id: "c17",
		name: "Pediatriya Amaliyoti",
		handle: "pediatriya",
		sector: "Shifokor",
		avatar: "#2B6CB0",
		description: "Bolalar salomatligi: emlash, ovqatlanish va kasalliklarni erta aniqlash.",
		memberCount: 7040,
		joined: true,
		ownerId: "u16"
	},
	{
		id: "c18",
		name: "Mustaqil Jurnalistika",
		handle: "mustaqiljurnalistika",
		sector: "Jurnalist",
		avatar: "#2D3748",
		description: "Tekshiruv, faktchekking va mintaqaviy hisobotlar.",
		memberCount: 3770,
		joined: false,
		ownerId: "u20"
	}
];


export function getChannel(id: string): Channel | undefined {
	return channels.find((c) => c.id === id);
}
