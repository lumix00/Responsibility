<script lang="ts">
	import * as Dialog from '$lib/components/ui/dialog';
	import * as Table from '$lib/components/ui/table';
	import { Button } from '$lib/components/ui/button';
	import { Trash2, Pencil, Plus, Loader2, BookOpenCheck } from 'lucide-svelte';
	import NovaTransacao from '@/components/homePage/quickActions/NovaTransacao.svelte';
	import DialogExcluirTransacao from '@/components/homePage/ExcluirTransacao.svelte';
	import DialogEditarTransacao from '@/components/homePage/EditarTransacao.svelte';

	import { allTransactions } from '$lib/stores/transacoes';

	let open = $state(false);

	let { allTransactions: transactionsStore, loadingAll: loadingStore } = $state(allTransactions);

	let transacoes = $derived($transactionsStore);

	// 3. Para loading também
	let loading = $derived($loadingStore);

	$effect(() => {
		if (open) {
			allTransactions.fetchAll();
		} else {
			allTransactions.clear();
		}
	});

	function formatCurrency(value: string) {
		return Number(value).toLocaleString('pt-BR', {
			style: 'currency',
			currency: 'BRL'
		});
	}

	function formatDate(date: string) {
		return new Date(date).toLocaleDateString('pt-BR');
	}

	let dialogExcluirOpen = $state(false);
	let dialogEditarOpen = $state(false);
	let transacaoSelecionada: (typeof transacoes)[number] | null = $state(null);

	function excluir(id: number) {
		const tx = transacoes.find((t) => t.id === id);
		if (!tx) return;
		transacaoSelecionada = tx;
		dialogExcluirOpen = true;
	}

	function editar(id: number) {
		const tx = transacoes.find((t) => t.id === id);
		if (!tx) return;
		transacaoSelecionada = tx;
		dialogEditarOpen = true;
	}

	function refreshAfterCreate() {
		allTransactions.refresh();
	}

	let searchTerm = $state('');

	let transacoesFiltradas = $derived(
		$transactionsStore.filter((tx) => {
			if (!searchTerm.trim()) return true;
			const termo = searchTerm.toLowerCase().trim();
			return (
				tx.nome?.toLowerCase().includes(termo) ||
				tx.comentario?.toLowerCase().includes(termo) ||
				formatDate(tx.data).includes(termo) ||
				formatCurrency(tx.valor).includes(termo)
			);
		})
	);
</script>

<Dialog.Root bind:open>
	<Dialog.Trigger>
		<Button variant="outline">
			<BookOpenCheck />
			Gerenciar Transações
		</Button>
	</Dialog.Trigger>

	<Dialog.Content class="flex max-h-[90vh] max-w-[85vw] flex-col gap-0 p-0 sm:max-w-[85vw]">
		<Dialog.Header class="sticky top-0 z-20 border-b bg-background px-6 pt-6 pb-4">
			<Dialog.Title>Transações</Dialog.Title>
			<Dialog.Description>Visualize, edite ou exclua todas as transações.</Dialog.Description>
		</Dialog.Header>

		<!-- Área de busca + botão Nova Transação -->
		<div class="sticky top-0 z-10 border-b bg-background px-6 pt-4 pb-3">
			<div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
				<input
					type="text"
					placeholder="Buscar por categoria, comentário, data ou valor..."
					bind:value={searchTerm}
					class="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50 sm:max-w-100"
				/>

				<div class="flex justify-end">
					<NovaTransacao onSuccess={refreshAfterCreate} />
				</div>
			</div>
		</div>

		<div class="min-h-0 flex-1 overflow-y-auto px-6 py-4">
			{#if loading}
				<div class="flex justify-center py-12">
					<Loader2 class="h-8 w-8 animate-spin" />
				</div>
			{:else if transacoesFiltradas.length === 0}
				<div class="py-12 text-center text-muted-foreground">
					{#if searchTerm.trim()}
						Nenhuma transação encontrada para "{searchTerm}".
					{:else}
						Nenhuma transação encontrada.
					{/if}
				</div>
			{:else}
				<div class="rounded-md border">
					<Table.Root>
						<Table.Header class="sticky top-0 z-10 bg-background">
							<Table.Row>
								<Table.Head class="h-9 px-3 py-2 text-xs">Data</Table.Head>
								<Table.Head class="h-9 px-3 py-2 text-xs">Categoria</Table.Head>
								<Table.Head class="h-9 px-3 py-2 text-xs">Comentario</Table.Head>
								<Table.Head class="h-9 px-3 py-2 text-right text-xs">Valor</Table.Head>
								<Table.Head class="h-9 px-3 py-2 text-right text-xs">Ações</Table.Head>
							</Table.Row>
						</Table.Header>

						<Table.Body>
							{#each transacoesFiltradas as tx (tx.id)}
								<!-- exatamente o mesmo Table.Row que você já tinha -->
								<Table.Row class="h-8 transition-colors hover:bg-muted/50">
									<Table.Cell class="h-8 px-3 py-1.5 text-sm">{formatDate(tx.data)}</Table.Cell>
									<Table.Cell class="h-8 px-3 py-1.5 text-sm">{tx.nome}</Table.Cell>
									<Table.Cell class="h-8 px-3 py-1.5 text-sm capitalize"
										>{tx.comentario ?? ''}</Table.Cell
									>
									<Table.Cell
										class={`h-8 px-3 py-1.5 text-right text-sm font-medium ${
											tx.movimentoTipo === 'receita' ? 'text-green-600' : 'text-red-600'
										}`}
									>
										{formatCurrency(tx.valor)}
									</Table.Cell>
									<Table.Cell class="h-8 px-3 py-1.5 text-right">
										<div class="flex justify-end gap-1">
											<Button
												size="icon"
												variant="ghost"
												class="h-7 w-7"
												onclick={() => editar(tx.id)}
											>
												<Pencil class="h-3.5 w-3.5" />
											</Button>
											<Button
												size="icon"
												variant="ghost"
												class="h-7 w-7 text-destructive"
												onclick={() => excluir(tx.id)}
											>
												<Trash2 class="h-3.5 w-3.5" />
											</Button>
										</div>
									</Table.Cell>
								</Table.Row>
							{/each}
						</Table.Body>
					</Table.Root>
				</div>
			{/if}
		</div>

		<!-- Footer permanece igual -->
		<Dialog.Footer class="mt-auto border-t bg-background px-6 py-4">
			<Button variant="outline" onclick={() => (open = false)}>Fechar</Button>
		</Dialog.Footer>
	</Dialog.Content>
</Dialog.Root>

<DialogExcluirTransacao
	bind:open={dialogExcluirOpen}
	transacaoId={transacaoSelecionada?.id ?? null}
	transacaoDescricao={transacaoSelecionada?.comentario ?? ''}
/>

<DialogEditarTransacao bind:open={dialogEditarOpen} transacao={transacaoSelecionada} />
