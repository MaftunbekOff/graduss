import type { CampaignComment } from '$lib/types';

const DAY = 86_400_000;
const ago = (days: number, extraHours = 0) => new Date(Date.now() - days * DAY - extraHours * 3_600_000).toISOString();

export const campaignComments: CampaignComment[] = [
	{ id: 'kc1', campaignId: 'k1', authorId: 'u2', content: "Mentor soatlari qaysi kunlari bo'ladi? Shifokor sifatida sog'liq startaplariga yordam bera olaman.", createdAt: ago(9) },
	{ id: 'kc2', campaignId: 'k1', authorId: 'u4', content: "Haftada ikki kun kechqurun rejalashtirilgan, jadvalni birinchi bosqich hisobotida e'lon qilamiz.", createdAt: ago(8, 2) },
	{ id: 'kc3', campaignId: 'k1', authorId: 'u6', content: "Xonaning manzili aniq bo'ldimi? Markazga yaqin bo'lsa yaxshi.", createdAt: ago(3) },
	{ id: 'kc4', campaignId: 'k6', authorId: 'u15', content: "Mixing namunasini eshitish mumkinmi? Ovozga fikr bildirmoqchiman.", createdAt: ago(2) },
	{ id: 'kc5', campaignId: 'k6', authorId: 'u14', content: "Ha, mastering tugagach havolani kanalga qo'yaman.", createdAt: ago(1, 4) },
	{ id: 'kc6', campaignId: 'k2', authorId: 'u5', content: "Pudratchi bilan shartnoma nusxasi kanalda bormi?", createdAt: ago(5) }
];
