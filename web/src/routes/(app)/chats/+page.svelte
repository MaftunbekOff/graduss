<script lang="ts">
	import EmptyState from '$lib/components/ui/EmptyState.svelte';
	import MessageCircle from '@lucide/svelte/icons/message-circle';
</script>

<div class="hidden h-full w-full items-center justify-center sm:flex">
	<EmptyState icon={MessageCircle} title="Suhbatni tanlang" />
</div>
