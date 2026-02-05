<script lang="ts">
	import { Button } from '$lib/components/ui/button';

	import { SquareChartGantt } from 'lucide-svelte';
</script>

<a href="/relatorios">
	<Button variant="outline" class="w-full justify-start">
		<svelte:component this={SquareChartGantt} class="mr-2 h-5 w-5" />
		Relatórios
	</Button>
</a>
