<script lang="ts">
	import { Button } from '$lib/components/ui/button';

	export let label;
	export let icon;
	export let href;
</script>

<a {href}>
	<Button variant="outline" class="w-full justify-start">
		<svelte:component this={icon} class="mr-2 h-5 w-5" />
		{label}
	</Button>
</a>
