<script lang="ts">
	import { goto } from '$app/navigation';
	import { session } from '$lib/stores/session.svelte';

	$effect(() => {
		if (!session.ready) return;
		goto(session.loggedIn ? '/feed' : '/login', { replaceState: true });
	});
</script>
