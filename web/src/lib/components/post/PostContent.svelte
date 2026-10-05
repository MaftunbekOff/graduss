<script lang="ts">
	import { TAG_CHARS, tagHref } from '$lib/hashtag';
	// plain: rangli pufak ichida (rang meros olinadi, havolalar tagiga chiziladi)
	let { content, plain = false }: { content: string; plain?: boolean } = $props();

	// Tokenize content into words and tags
	const tokens = $derived.by(() => {
		if (!content) return [];
		// Bo'shliq bo'yicha bo'lamiz; so'z oxiridagi tinish belgilari (.,;:!?)) havoladan tashqarida qoladi.
		const parts = content.split(/(\s+)/);
		return parts.map((part) => {
			let m: RegExpMatchArray | null;
			if (/^https?:\/\/\S+$/i.test(part)) {
				return { type: 'url', text: part };
			} else if ((m = part.match(new RegExp(`^#([${TAG_CHARS}]+)([.,;:!?)]*)$`, 'u')))) {
				return { type: 'hashtag', text: '#' + m[1], tag: m[1], rest: m[2] };
			} else if ((m = part.match(/^@([a-zA-Z][a-zA-Z0-9._-]*[a-zA-Z0-9])([.,;:!?)]*)$/))) {
				return { type: 'mention', text: '@' + m[1], username: m[1], rest: m[2] };
			} else {
				return { type: 'text', text: part };
			}
		});
	});
</script>

<p class="whitespace-pre-wrap [overflow-wrap:anywhere] leading-relaxed {plain ? '' : 'text-neutral-900 dark:text-neutral-100'}">
	{#each tokens as token}
		{#if token.type === 'url'}
			<a
				href={token.text}
				target="_blank"
				rel="noopener noreferrer nofollow ugc"
				class="break-all font-medium underline underline-offset-2 {plain ? 'decoration-current' : 'text-brand-600 decoration-brand-300 hover:decoration-brand-600 dark:text-brand-400'}"
			>
				{token.text}
			</a>
		{:else if token.type === 'hashtag'}
			<a
				href={tagHref(token.tag ?? "")}
				class="font-semibold hover:underline {plain ? 'underline' : 'text-brand-600 dark:text-brand-400'}"
			>
				{token.text}
			</a>{token.rest}
		{:else if token.type === 'mention'}
			<a
				href="/profile/{token.username}"
				class="font-semibold hover:underline {plain ? 'underline' : 'text-indigo-600 dark:text-indigo-400'}"
			>
				{token.text}
			</a>{token.rest}
		{:else}
			{token.text}
		{/if}
	{/each}
</p>
