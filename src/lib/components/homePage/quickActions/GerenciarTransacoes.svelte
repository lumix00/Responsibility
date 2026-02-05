<script lang="ts">
	import * as Dialog from '$lib/components/ui/dialog';
	import * as Table from '$lib/components/ui/table';
	import { Button } from '$lib/components/ui/button';
	import { Trash2, Pencil, Plus, Loader2 } from 'lucide-svelte';
	import NovaTransacao from '@/components/homePage/quickActions/NovaTransacao.svelte';

	import { allTransactions } from '$lib/stores/transacoes';

	let open = $state(false);

	let transacoes = $derived(allTransactions.allTransactions);
	let loading = $derived(allTransactions.loadingAll);

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

	function excluir(id: number) {
		console.log('Excluir', id);
	}

	function editar(id: number) {
		console.log('Editar', id);
	}
</script>

<Dialog.Root bind:open>
	<Dialog.Trigger>
		<Button variant="outline">Gerenciar Transações</Button>
	</Dialog.Trigger>

	<Dialog.Content class="flex max-h-[90vh] max-w-[85vw] flex-col gap-0 p-0 sm:max-w-[85vw]">
		<Dialog.Header class="sticky top-0 z-20 border-b bg-background px-6 pt-6 pb-4">
			<Dialog.Title>Transações</Dialog.Title>
			<Dialog.Description>Visualize, edite ou exclua todas as transações.</Dialog.Description>
		</Dialog.Header>

		<div class="min-h-0 flex-1 overflow-y-auto px-6 py-4">
			<div class="mb-6 flex justify-end">
				<NovaTransacao />
			</div>

			{#if $loading}
				<div class="flex justify-center py-12">
					<Loader2 class="h-8 w-8 animate-spin" />
				</div>
			{:else if $transacoes.length === 0}
				<div class="py-12 text-center text-muted-foreground">Nenhuma transação encontrada.</div>
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
							{#each $transacoes as tx (tx.id)}
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

		<Dialog.Footer class="mt-auto border-t bg-background px-6 py-4">
			<Button variant="outline" onclick={() => (open = false)}>Fechar</Button>
		</Dialog.Footer>
	</Dialog.Content>
</Dialog.Root>
