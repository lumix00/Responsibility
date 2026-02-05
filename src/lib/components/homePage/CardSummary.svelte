<script lang="ts">
	import * as Card from '$lib/components/ui/card/index.js';

	export let title;
	export let value;
	export let icon;
	export let color;
</script>

<Card.Root class="flex items-center space-x-4 p-4">
	<svelte:component this={icon} class={`mr-2 h-5 w-5 ${color}`} />

	<div>
		<div class="text-sm text-muted-foreground uppercase">
			{title}
		</div>

		<div class={`text-lg font-bold ${color}`}>
			{value}
		</div>
	</div>
</Card.Root>
