<script lang="ts">
	let {
		name,
		color,
		size = 'md'
	}: { name: string; color: string; size?: 'sm' | 'md' | 'lg' | 'xl' } = $props();

	const sizeClasses = {
		sm: 'size-8 text-xs',
		md: 'size-10 text-sm',
		lg: 'size-14 text-lg',
		xl: 'size-20 text-2xl'
	};

	const initials = $derived(
		name
			.trim()
			.split(/\s+/)
			.slice(0, 2)
			.map((part) => part[0]?.toUpperCase() ?? '')
			.join('')
	);
</script>

<span
	class="inline-flex shrink-0 select-none items-center justify-center rounded-full font-semibold tracking-wide text-white ring-2 ring-white dark:ring-neutral-950 {sizeClasses[
		size
	]}"
	style:background-color={color}
	style:background-image="linear-gradient(145deg, rgba(255,255,255,.28), rgba(0,0,0,.12))"
	style:box-shadow="inset 0 0 0 1px rgba(0,0,0,.06)"
>
	{initials}
</span>
