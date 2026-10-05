<script lang="ts">
	import BadgeCheck from '@lucide/svelte/icons/badge-check';
	import type { Sector } from '$lib/types';
	import { fieldOf } from '$lib/sectors';

	// channel: kanalda kasb emas, soha/yo'nalish nomi ko'rsatiladi (Siyosatchi -> Siyosat).
	let { sector, channel = false }: { sector: Sector; channel?: boolean } = $props();
</script>

<span
	class="inline-flex items-center gap-1 rounded-full bg-brand-50 px-2 py-0.5 text-xs font-medium text-brand-700 ring-1 ring-inset ring-brand-600/10 dark:bg-brand-400/10 dark:text-brand-300 dark:ring-brand-300/20"
>
	<BadgeCheck class="size-3.5" />
	{channel ? fieldOf(sector) : sector}
</span>
