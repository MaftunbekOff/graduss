export const SECTORS = [
	'Dasturchi',
	"O'yin ishlab chiquvchi",
	'Dizayner',
	'Muhandis',
	'Arxitektor',
	'Shifokor',
	"O'qituvchi",
	'Huquqshunos',
	'Iqtisodchi',
	'Tadbirkor',
	'Jurnalist',
	'Siyosatchi',
	"San'atkor",
	'Musiqachi',
	'Kino va video'
] as const;

export type Sector = (typeof SECTORS)[number];

// Foydalanuvchiga KASB beriladi (Siyosatchi), kanalga esa shu kasbning SOHASI/YO'NALISHI (Siyosat).
export const SECTOR_FIELD: Record<Sector, string> = {
	Dasturchi: 'Dasturlash',
	"O'yin ishlab chiquvchi": "O'yin ishlab chiqish",
	Dizayner: 'Dizayn',
	Muhandis: 'Muhandislik',
	Arxitektor: 'Arxitektura',
	Shifokor: 'Tibbiyot',
	"O'qituvchi": "Ta'lim",
	Huquqshunos: 'Huquq',
	Iqtisodchi: 'Iqtisodiyot',
	Tadbirkor: 'Tadbirkorlik',
	Jurnalist: 'Jurnalistika',
	Siyosatchi: 'Siyosat',
	"San'atkor": "San'at",
	Musiqachi: 'Musiqa',
	'Kino va video': 'Kino va video'
};

export const fieldOf = (sector: Sector) => SECTOR_FIELD[sector];
