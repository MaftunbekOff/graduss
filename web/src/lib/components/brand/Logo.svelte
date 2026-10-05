<script lang="ts">
	// graduss belgisi: o'sib boruvchi pog'onalar (gradus = pog'ona), tepada amber "keyingi qadam".
	let {
		size = 28,
		wordmark = true,
		wordClass = ''
	}: { size?: number; wordmark?: boolean; wordClass?: string } = $props();
</script>

<span class="inline-flex items-center gap-2">
	<svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true" class="shrink-0">
		<rect x="2" y="15" width="5.5" height="7" rx="1.6" fill="currentColor" fill-opacity="0.4" />
		<rect x="9.25" y="11" width="5.5" height="11" rx="1.6" fill="currentColor" fill-opacity="0.7" />
		<rect x="16.5" y="7" width="5.5" height="15" rx="1.6" fill="currentColor" />
		<rect x="16.5" y="2" width="5.5" height="3" rx="1.5" class="fill-amber-500 dark:fill-amber-400" />
	</svg>
	{#if wordmark}
		<span class="font-extrabold lowercase leading-none tracking-tight {wordClass}"
			>gradu<span class="text-amber-500 dark:text-amber-400">ss</span></span
		>
	{/if}
</span>
