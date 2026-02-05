<script lang="ts">
	import { Button } from '$lib/components/ui/button';

	import { CircleMinus } from 'lucide-svelte';
</script>

<a href="/despesa">
	<Button variant="outline" class="w-full justify-start">
		<svelte:component this={CircleMinus} class="mr-2 h-5 w-5" />
		Nova Despesa
	</Button>
</a>
