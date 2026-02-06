<script lang="ts">
	import { Button } from '$lib/components/ui/button/index.js';
	import { LogOut } from 'lucide-svelte';

	import * as Card from '$lib/components/ui/card/index.js';
	import { ScrollArea } from '$lib/components/ui/scroll-area/index.js';

	import CardSummary from '$lib/components/homePage/CardSummary.svelte';
	import TransactionItem from '$lib/components/homePage/TransactionItem.svelte';
	import ChartPlaceholder from '@/components/homePage/ChartAnual.svelte';

	import NovaTransacao from '@/components/homePage/quickActions/NovaTransacao.svelte';
	import NovoTipo from '@/components/homePage/quickActions/NovoTipo.svelte';
	import GerenciarCategorias from '@/components/homePage/quickActions/GerenciarCategorias.svelte';
	import GerenciarTransacoes from '@/components/homePage/quickActions/GerenciarTransacoes.svelte';
	import Relatorios from '@/components/homePage/quickActions/Relatorios.svelte';
	import LançarExcel from '@/components/homePage/quickActions/LancarExcel.svelte';

	import { Wallet, Plus, Minus, Moon, Sun } from 'lucide-svelte';
	import { theme } from '$lib/stores/theme';
	import { Switch } from '$lib/components/ui/switch';

	import { transactionsStore } from '$lib/stores/transacoes';
	import type { TransacaoDTO } from '$lib/stores/transacoes';

	const quickActions = [
		{ component: NovaTransacao, key: 'transacao' },
		{ component: GerenciarCategorias, key: 'gerenciar-categorias' },
		{ component: NovoTipo, key: 'tipo' },
		{ component: GerenciarTransacoes, key: 'gerenciar-transacoes' },
		{ component: Relatorios, key: 'relatorios' },
		{ component: LançarExcel, key: 'LançarExcel' }
	];

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

	const summary = $derived(
		(() => {
			let receitas = 0;
			let despesas = 0;

			for (const tx of transactions) {
				const valor = Number(tx.valor);

				if (tx.movimentoTipo === 'receita') {
					receitas += valor;
				} else {
					despesas += valor;
				}
			}

			const saldo = receitas - despesas;

			const format = (v: number) =>
				v.toLocaleString('pt-BR', {
					style: 'currency',
					currency: 'BRL'
				});

			return [
				{
					title: 'Saldo Atual',
					value: format(saldo),
					icon: Wallet,
					color: saldo >= 0 ? 'text-blue-500' : 'text-red-500'
				},
				{
					title: 'Receitas',
					value: format(receitas),
					icon: Plus,
					color: 'text-green-500'
				},
				{
					title: 'Despesas',
					value: format(despesas),
					icon: Minus,
					color: 'text-red-500'
				}
			];
		})()
	);
</script>

<div class="space-y-6 p-6">
	<!-- Header -->
	<div class="flex items-center justify-between">
		<h1 class="text-2xl font-bold">Painel Financeiro</h1>

		<div class="flex items-center gap-3">
			<div class="flex items-center gap-2">
				{#if $theme === 'dark'}
					<Moon class="h-4 w-4" />
				{:else}
					<Sun class="h-4 w-4" />
				{/if}

				<Switch
					checked={$theme === 'dark'}
					onCheckedChange={(checked) => theme.set(checked ? 'dark' : 'light')}
				/>
			</div>

			<form action="/api/logout" method="post">
				<Button type="submit" variant="destructive" size="sm" class="gap-2">
					<LogOut class="h-4 w-4" />
					Sair
				</Button>
			</form>
		</div>
	</div>

	<!-- Cards de resumo -->
	<div class="grid grid-cols-1 gap-4 sm:grid-cols-3">
		{#each summary as item}
			<CardSummary {...item} />
		{/each}
	</div>

	<!-- Gráfico -->
	<Card.Root class="col-span-3">
		<Card.Header>
			<Card.Title>Despesas por Categoria</Card.Title>
		</Card.Header>
		<Card.Content>
			<ChartPlaceholder />
		</Card.Content>
	</Card.Root>

	<!-- Transações + Ações rápidas -->
	<div class="grid grid-cols-1 gap-4 md:grid-cols-3">
		<!-- Lista de Transações -->
		<Card.Root class="md:col-span-2">
			<Card.Header>
				<Card.Title>Últimas Transações</Card.Title>
			</Card.Header>
			<Card.Content class="space-y-2">
				<ScrollArea class="h-48">
					{#each transactions as tx (tx.id)}
						<TransactionItem {tx} />
					{/each}
				</ScrollArea>
			</Card.Content>
		</Card.Root>

		<!-- Ações Rápidas -->
		<Card.Root>
			<Card.Header>
				<Card.Title>Ações Rápidas</Card.Title>
			</Card.Header>

			<Card.Content class="space-y-3">
				{#each quickActions as act}
					<act.component />
				{/each}
			</Card.Content>
		</Card.Root>
	</div>
</div>
