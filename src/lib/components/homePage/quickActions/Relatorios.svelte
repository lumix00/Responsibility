<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import * as Dialog from '$lib/components/ui/dialog';
	import * as Select from '$lib/components/ui/select';
	import { SquareChartGantt } from 'lucide-svelte';

	// Importações do LayerChart puro
	import { Chart, Layer, Pie, Tooltip } from 'layerchart';

	let open = $state(false);
	let availableYears = $state<number[]>([]);
	let selectedYear = $state<string>('');

	const CHART_COLORS = [
		'#e76e50',
		'#2a9d8f',
		'#e9c46a',
		'#f4a261',
		'#264653',
		'#d62828',
		'#023047',
		'#8ecae6'
	];

	let receitasData = $state<{ categoria: string; value: number; fill: string }[]>([]);
	let despesasData = $state<{ categoria: string; value: number; fill: string }[]>([]);

	async function loadYears() {
		const res = await fetch('/api/transacoes/buscaAnos');
		if (res.ok) {
			availableYears = await res.json();
			if (availableYears.length > 0) {
				selectedYear = availableYears[0].toString();
			}
		}
	}

	async function loadData(yearStr: string) {
		const year = parseInt(yearStr);
		if (isNaN(year)) return;
		const res = await fetch(`/api/transacoes/relatorio/${year}`);
		if (res.ok) {
			const { receitas, despesas } = await res.json();
			receitasData = receitas.map((r: any, idx: number) => ({
				categoria: r.nome,
				value: Number(r.total),
				fill: CHART_COLORS[idx % CHART_COLORS.length]
			}));
			despesasData = despesas.map((d: any, idx: number) => ({
				categoria: d.nome,
				value: Number(d.total),
				fill: CHART_COLORS[idx % CHART_COLORS.length]
			}));
		}
	}

	$effect(() => {
		if (open && availableYears.length === 0) loadYears();
	});

	$effect(() => {
		if (selectedYear) loadData(selectedYear);
	});

	const selectedYearLabel = $derived(selectedYear ? selectedYear : 'Selecione o ano');
</script>

<Dialog.Root bind:open>
	<Dialog.Trigger>
		<Button variant="outline" class="w-full justify-start" onclick={() => (open = true)}>
			<SquareChartGantt class="mr-2 h-5 w-5" />
			Relatórios
		</Button>
	</Dialog.Trigger>

	<Dialog.Content class="max-h-[90vh] overflow-y-auto sm:max-w-[90vw] md:max-w-200 lg:max-w-225">
		<Dialog.Header>
			<Dialog.Title>Relatórios por Ano - {selectedYear}</Dialog.Title>
		</Dialog.Header>

		<div class="px-2 py-4">
			{#if availableYears.length > 0}
				<Select.Root type="single" bind:value={selectedYear}>
					<Select.Trigger class="w-full max-w-50">
						{selectedYearLabel}
					</Select.Trigger>
					<Select.Content>
						{#each availableYears as year}
							<Select.Item value={year.toString()}>{year}</Select.Item>
						{/each}
					</Select.Content>
				</Select.Root>

				<div class="mt-6 grid grid-cols-1 gap-8 md:grid-cols-2">
					<div class="flex flex-col items-center">
						<h3 class="mb-4 font-semibold text-emerald-600">Receitas</h3>
						<div class="h-75 w-full">
							<Chart
								data={receitasData}
								x="value"
								c="categoria"
								cRange={receitasData.map((d) => d.fill)}
							>
								{#snippet children({ context })}
									<Layer type="svg" center>
										<Pie
											innerRadius={-50}
											cornerRadius={4}
											padAngle={0.02}
											tooltipContext={context.tooltip}
										/>
									</Layer>

									<Tooltip.Root>
										{#snippet children({ data })}
											<Tooltip.Header class="text-black" value={data.categoria} />
											<Tooltip.List class="text-black">
												<Tooltip.Item
													label="Valor:"
													value={data.value}
													format="integer"
													valueAlign="right"
												/>
											</Tooltip.List>
										{/snippet}
									</Tooltip.Root>
								{/snippet}
							</Chart>
						</div>
					</div>

					<div class="flex flex-col items-center">
						<h3 class="mb-4 font-semibold text-red-600">Despesas</h3>
						<div class="h-75 w-full">
							<Chart
								data={despesasData}
								x="value"
								c="categoria"
								cRange={despesasData.map((d) => d.fill)}
							>
								{#snippet children({ context })}
									<Layer type="svg" center>
										<Pie
											innerRadius={-50}
											cornerRadius={4}
											padAngle={0.02}
											tooltipContext={context.tooltip}
										/>
									</Layer>
									<Tooltip.Root>
										{#snippet children({ data })}
											<Tooltip.Header class="text-black" value={data.categoria} />
											<Tooltip.List class="text-black">
												<Tooltip.Item
													label="Valor:"
													value={data.value}
													format="integer"
													valueAlign="right"
												/>
											</Tooltip.List>
										{/snippet}
									</Tooltip.Root>
								{/snippet}
							</Chart>
						</div>
					</div>
				</div>
			{:else}
				<p class="py-8 text-center">Carregando dados...</p>
			{/if}
		</div>
	</Dialog.Content>
</Dialog.Root>
