import type { ChannelEvent } from '$lib/types';

const at = (days: number, hour: number, minute = 0) => {
	const d = new Date();
	d.setDate(d.getDate() + days);
	d.setHours(hour, minute, 0, 0);
	return d.toISOString();
};

// Sanalar bugunga nisbatan (demo har doim "yaqinlashayotgan" tadbirlarni ko'rsatsin).
export const events: ChannelEvent[] = [
	{
		id: 'e1',
		channelId: 'c1',
		title: 'Ochiq eshiklar kuni: kengash yig\'ilishi',
		description: 'Shahar kengashi navbatdagi yig\'ilishi. Savollar oldindan izohlarda qabul qilinadi.',
		startsAt: at(3, 15),
		createdAt: new Date().toISOString(),
		reminderIds: []
	},
	{
		id: 'e2',
		channelId: 'c6',
		title: 'Kod ko\'rib chiqish: jonli seans',
		description: 'Birgalikda real loyihalarni ko\'rib chiqamiz.',
		startsAt: at(1, 19),
		link: 'https://meet.example.org/code-review',
		createdAt: new Date().toISOString(),
		reminderIds: []
	}
];
