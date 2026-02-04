<script lang="ts">
	import * as Card from '$lib/components/ui/card/index.js';

	import * as Icons from 'lucide-svelte';

	export let title;
	export let value;
	export let icon;
	import { Icon } from 'lucide-svelte';
</script>

<Card.Root class="flex items-center space-x-4 p-4">
	<Icon class="h-8 w-8 text-primary" />
	<div>
		<div class="text-sm text-muted-foreground uppercase">{title}</div>
		<div class="text-lg font-bold">{value}</div>
	</div>
</Card.Root>
