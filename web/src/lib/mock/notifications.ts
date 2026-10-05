import type { AppNotification } from '$lib/types';

export const notifications: AppNotification[] = [
	{
		id: 'n1',
		type: 'comment',
		actorId: 'u7',
		postId: 'p1',
		createdAt: '2026-09-01T08:10:00',
		read: false
	},
	{
		id: 'n3',
		type: 'comment',
		actorId: 'u4',
		postId: 'p1',
		createdAt: '2026-08-31T20:15:00',
		read: false
	},
	{
		id: 'n4',
		type: 'channel',
		actorId: 'u1',
		channelId: 'c1',
		createdAt: '2026-08-31T12:00:00',
		read: true
	},
	{
		id: 'n6',
		type: 'mention',
		actorId: 'u5',
		postId: 'p5',
		createdAt: '2026-08-29T18:05:00',
		read: true
	},
	// --- kengaytirilgan mock (2026-10-01) ---
	{
		id: "xn1",
		type: "comment",
		actorId: "u17",
		postId: "p36",
		createdAt: "2026-09-23T15:40",
		read: true
	},
	{
		id: "xn2",
		type: "comment",
		actorId: "u3",
		postId: "p36",
		createdAt: "2026-09-23T16:00",
		read: true
	},
	{
		id: "xn3",
		type: "mention",
		actorId: "u26",
		postId: "p36",
		createdAt: "2026-09-30T13:05",
		read: false
	},
	{
		id: "xn4",
		type: "channel",
		actorId: "u15",
		channelId: "c12",
		createdAt: "2026-09-29T18:00",
		read: true
	},
	{
		id: "xn5",
		type: "channel",
		actorId: "u21",
		channelId: "c15",
		createdAt: "2026-09-28T08:00",
		read: true
	},
	{
		id: "xn6",
		type: "mention",
		actorId: "u13",
		channelId: "c9",
		createdAt: "2026-09-30T11:00",
		read: false
	},
	{
		id: "xn7",
		type: "comment",
		actorId: "u16",
		postId: "p37",
		createdAt: "2026-09-23T10:30",
		read: true
	},
	{
		id: "xn8",
		type: "channel",
		actorId: "u11",
		channelId: "c6",
		createdAt: "2026-10-01T08:40",
		read: false
	}
];
