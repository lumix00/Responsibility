<script lang="ts">
	import * as Chart from '$lib/components/ui/chart';
	import { scaleBand } from 'd3-scale';
	import { BarChart } from 'layerchart';

	import { transactionsStore } from '$lib/stores/transacoes';
	import type { TransacaoDTO } from '$lib/stores/transacoes';

	let transactions = $state<TransacaoDTO[]>([]);

	$effect(() => {
		transactionsStore.load();
	});

	$effect(() => {
		const unsubscribe = transactionsStore.subscribe((data) => {
			transactions = data;
		});

		return unsubscribe;
	});

	/**
	 * Agrupa por mês e separa receita / despesa
	 */
	const chartData = $derived(
		(() => {
			const map = new Map<string, { receita: number; despesa: number }>();

			for (const tx of transactions) {
				const month = new Date(tx.data).toLocaleDateString('pt-BR', {
					month: 'long'
				});

				if (!map.has(month)) {
					map.set(month, { receita: 0, despesa: 0 });
				}

				const valor = Number(tx.valor);

				if (tx.movimentoTipo === 'receita') {
					map.get(month)!.receita += valor;
				} else {
					map.get(month)!.despesa += valor;
				}
			}

			return Array.from(map.entries()).map(([month, v]) => ({
				month,
				receita: v.receita,
				despesa: v.despesa
			}));
		})()
	);

	const chartConfig = {
		receita: {
			label: 'Receitas',
			color: '#22C55E'
		},
		despesa: {
			label: 'Despesas',
			color: '#EF4444'
		}
	} satisfies Chart.ChartConfig;
</script>

<Chart.Container config={chartConfig} class="h-90 w-full">
	<BarChart
		data={chartData}
		xScale={scaleBand().padding(0.25)}
		x="month"
		axis="x"
		seriesLayout="group"
		tooltip={false}
		series={[
			{
				key: 'receita',
				label: chartConfig.receita.label,
				color: chartConfig.receita.color
			},
			{
				key: 'despesa',
				label: chartConfig.despesa.label,
				color: chartConfig.despesa.color
			}
		]}
	/>
</Chart.Container>
