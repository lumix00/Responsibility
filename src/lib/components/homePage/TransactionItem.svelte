<script>
	export let desc;
	export let amount;
	export let date;
</script>

<div class="flex items-center justify-between border-b py-2">
	<div class="text-sm">
		<div class="font-medium">{desc}</div>
		<div class="text-xs text-muted-foreground">{date}</div>
	</div>
	<div class="font-medium">{amount}</div>
</div>
