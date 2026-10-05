<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLButtonAttributes } from 'svelte/elements';

	type Props = HTMLButtonAttributes & {
		variant?: 'primary' | 'secondary' | 'ghost' | 'outline' | 'danger';
		size?: 'sm' | 'md' | 'icon';
		full?: boolean;
		children: Snippet;
	};

	let {
		variant = 'primary',
		size = 'md',
		full = false,
		class: className = '',
		children,
		...rest
	}: Props = $props();

	const variantClasses: Record<string, string> = {
		primary:
			'bg-brand-600 text-white shadow-sm shadow-brand-900/10 hover:bg-brand-700 hover:shadow-md active:bg-brand-800 disabled:bg-brand-300 disabled:shadow-none dark:disabled:bg-brand-900 dark:disabled:text-brand-500',
		secondary:
			'bg-neutral-900 text-white shadow-sm hover:bg-neutral-800 active:bg-neutral-950 dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-200',
		ghost: 'bg-transparent text-neutral-700 hover:bg-neutral-100 dark:text-neutral-300 dark:hover:bg-neutral-800',
		outline:
			'border border-neutral-300 text-neutral-800 hover:bg-neutral-50 dark:border-neutral-700 dark:text-neutral-200 dark:hover:bg-neutral-800',
		danger: 'bg-red-600 text-white shadow-sm hover:bg-red-700 active:bg-red-800'
	};

	const sizeClasses: Record<string, string> = {
		sm: 'px-3 py-1.5 text-sm',
		md: 'px-4 py-2 text-sm',
		icon: 'size-10 p-0 text-sm'
	};
</script>

<button
	{...rest}
	class="inline-flex items-center justify-center gap-1.5 rounded-full font-semibold transition-all duration-150 active:scale-[0.97] disabled:cursor-not-allowed disabled:active:scale-100 {variantClasses[
		variant
	]} {sizeClasses[size]} {full ? 'w-full' : ''} {className}">
	{@render children()}
</button>
