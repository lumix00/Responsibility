<script>
	import { Button } from '$lib/components/ui/button/index.js';
	import { LogOut } from 'lucide-svelte';

	import * as Card from '$lib/components/ui/card/index.js';
	import { ScrollArea } from '$lib/components/ui/scroll-area/index.js';

	import CardSummary from '$lib/components/homePage/CardSummary.svelte';
	import TransactionItem from '$lib/components/homePage/TransactionItem.svelte';
	import ChartPlaceholder from '$lib/components/homePage/ChartPlaceholder.svelte';

	import NovaTransacao from '@/components/homePage/quickActions/NovaTransacao.svelte';
	import NovoTipo from '@/components/homePage/quickActions/NovoTipo.svelte';
	import GerenciarCategorias from '@/components/homePage/quickActions/GerenciarCategorias.svelte';
	import Relatorios from '@/components/homePage/quickActions/Relatorios.svelte';

	import { Wallet, Plus, Minus, Moon, Sun } from 'lucide-svelte';
	import { theme } from '$lib/stores/theme';
	import { Switch } from '$lib/components/ui/switch';

	// dados fake pra demo
	const summary = [
		{ title: 'Saldo Atual', value: 'R$ 8.250,00', icon: Wallet, color: 'text-blue-500' },
		{ title: 'Receitas', value: 'R$ 3.450,00', icon: Plus, color: 'text-green-500' },
		{ title: 'Despesas', value: 'R$ 1.980,00', icon: Minus, color: 'text-red-500' }
	];

	const transactions = [
		{ id: 1, desc: 'Supermercado', amount: '- R$ 150,00', date: '02/02/2026' },
		{ id: 2, desc: 'Salário', amount: '+ R$ 3.000,00', date: '01/02/2026' },
		{ id: 3, desc: 'Café', amount: '- R$ 25,00', date: '01/02/2026' }
	];

	const quickActions = [
		{ component: NovaTransacao, key: 'transacao' },
		{ component: GerenciarCategorias, key: 'gerenciar-categorias' },
		{ component: NovoTipo, key: 'tipo' },
		{ component: Relatorios, key: 'relatorios' }
	];
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
					{#each transactions as tx}
						<TransactionItem {...tx} />
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
				{#each quickActions as act (act.key)}
					<svelte:component this={act.component} />
				{/each}
			</Card.Content>
		</Card.Root>
	</div>
</div>
