<script lang="ts">
	type TransacaoDTO = {
		id: number;
		valor: string;
		data: string;
		nome: string;
		comentario: string | null;
		movimentoTipo: 'receita' | 'despesa';
	};

	const { tx } = $props<{ tx: TransacaoDTO }>();

	const isReceita = $derived(tx.movimentoTipo === 'receita');

	const formattedValue = $derived(
		`${isReceita ? '+' : '-'} ${Number(tx.valor).toLocaleString('pt-BR', {
			style: 'currency',
			currency: 'BRL'
		})}`
	);

	const formattedDate = $derived(new Date(tx.data).toLocaleDateString('pt-BR'));
</script>

<div class="flex items-center justify-between border-b py-2">
	<div class="space-y-0.5 text-sm">
		<div class="font-medium">{tx.nome}</div>

		<div class="text-xs text-muted-foreground">
			{formattedDate}
		</div>

		{#if tx.comentario}
			<div class="text-xs text-muted-foreground italic">
				{tx.comentario}
			</div>
		{/if}
	</div>

	<div class={`font-medium ${isReceita ? 'text-green-600' : 'text-red-600'}`}>
		{formattedValue}
	</div>
</div>
