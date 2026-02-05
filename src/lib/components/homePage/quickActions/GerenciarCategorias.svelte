<script lang="ts">
	import * as Dialog from '$lib/components/ui/dialog/index.js';
	import { Button } from '$lib/components/ui/button/index.js';
	import { Input } from '$lib/components/ui/input/index.js';
	import { Label } from '$lib/components/ui/label/index.js';
	import * as Select from '$lib/components/ui/select/index.js';
	import { Trash2, Loader2, Pencil } from 'lucide-svelte';
	import { toast } from 'svelte-sonner';
	import { tiposStore } from '@/stores/transacoes';

	const { triggerText = 'Gerenciar Categorias' } = $props();

	// Abas / modo atual
	let modo = $state<'lista' | 'adicionar'>('lista');

	// Estados gerais
	let open = $state(false);
	let categorias = $derived(tiposStore.tipos);
	let loading = tiposStore.loading;

	$effect(() => {
		if (open) {
			tiposStore.fetchTipos();
		}
	});

	// Para adicionar
	let nomeNovo = $state('');
	let movimentoTipo = $state<'receita' | 'despesa'>('receita');
	let isSubmitting = $state(false);

	// Para deletar
	let deletingId = $state<number | null>(null);
	let confirmOpen = $state(false);
	let categoriaParaExcluir = $state<{ id: number; nome: string } | null>(null);

	// Adiciona nova categoria
	async function adicionarCategoria() {
		if (!nomeNovo.trim()) {
			toast.error('O nome da categoria é obrigatório');
			return;
		}

		isSubmitting = true;

		try {
			const res = await fetch('/api/tipos-transacao/adicionarTipo', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					nome: nomeNovo.trim().toUpperCase(), // mantendo uppercase como combinado antes
					movimentoTipo
				})
			});

			if (!res.ok) {
				const err = await res.json();
				throw new Error(err.message || 'Erro ao adicionar');
			}

			const novo = await res.json();
			toast.success(`"${novo.nome}" adicionada com sucesso!`);

			// Atualiza lista imediatamente
			categorias.update((current) => [...current, novo]);

			modo = 'lista'; // volta para a lista após adicionar

			// Reseta form
			nomeNovo = '';
			movimentoTipo = 'receita';
		} catch (err: any) {
			toast.error(err.message || 'Falha ao adicionar categoria');
		} finally {
			isSubmitting = false;
		}
	}

	// Deleta categoria
	async function deletarCategoriaConfirmada() {
		if (!categoriaParaExcluir) return;

		const { id, nome } = categoriaParaExcluir;
		deletingId = id;

		try {
			const res = await fetch(`/api/tipos-transacao/deletarTipo/${id}`, {
				method: 'DELETE'
			});

			if (!res.ok) {
				const err = await res.json();
				throw new Error(err.message || 'Erro ao excluir');
			}

			toast.success(`"${nome}" excluída com sucesso`);
			categorias.update((current) => current.filter((c) => c.id !== id));
			confirmOpen = false;
		} catch (err: any) {
			toast.error(err.message || 'Falha ao excluir categoria');
		} finally {
			deletingId = null;
			categoriaParaExcluir = null;
		}
	}

	// Label do select de adicionar
	const tipoLabel = $derived(movimentoTipo === 'receita' ? 'Receita' : 'Despesa');
	const opcoes = [
		{ value: 'receita', label: 'Receita' },
		{ value: 'despesa', label: 'Despesa' }
	];
</script>

<Dialog.Root bind:open>
	<Dialog.Trigger>
		<Button variant="outline"><Pencil class="mr-2 h-5 w-5" /> {triggerText}</Button>
	</Dialog.Trigger>

	<Dialog.Content class="max-h-[85vh] overflow-y-auto sm:max-w-137.5">
		<Dialog.Header>
			<Dialog.Title>Gerenciar Categorias</Dialog.Title>
			<Dialog.Description>Adicione, visualize e exclua suas categorias.</Dialog.Description>
		</Dialog.Header>

		<!-- Button Group / Tabs -->
		<div class="my-4 flex justify-center">
			<div class="inline-flex rounded-md shadow-sm" role="group">
				<Button
					variant={modo === 'lista' ? 'default' : 'outline'}
					class="rounded-r-none"
					onclick={() => (modo = 'lista')}
				>
					Lista de Categorias
				</Button>
				<Button
					variant={modo === 'adicionar' ? 'default' : 'outline'}
					class="rounded-l-none"
					onclick={() => (modo = 'adicionar')}
				>
					Adicionar Nova
				</Button>
			</div>
		</div>

		<div class="py-4">
			{#if modo === 'lista'}
				{#if $loading}
					<div class="flex justify-center py-10">
						<Loader2 class="h-8 w-8 animate-spin text-primary" />
					</div>
				{:else if $categorias.length === 0}
					<p class="py-8 text-center text-muted-foreground">
						Você ainda não tem categorias cadastradas.
					</p>
				{:else}
					<div class="space-y-3">
						{#each $categorias as cat (cat.id)}
							<div class="flex items-center justify-between rounded-md border p-3">
								<div>
									<p class="font-medium">{cat.nome}</p>
									<p class="text-sm text-muted-foreground capitalize">{cat.movimentoTipo}</p>
								</div>
								<Button
									variant="ghost"
									size="icon"
									class="text-destructive hover:bg-destructive/10"
									onclick={() => {
										categoriaParaExcluir = { id: cat.id, nome: cat.nome };
										confirmOpen = true;
									}}
									disabled={deletingId === cat.id}
								>
									{#if deletingId === cat.id}
										<Loader2 class="h-4 w-4 animate-spin" />
									{:else}
										<Trash2 class="h-4 w-4" />
									{/if}
								</Button>
							</div>
						{/each}
					</div>
				{/if}
			{:else}
				<!-- Formulário de adicionar -->
				<div class="grid gap-6">
					<div class="grid gap-2">
						<Label for="nomeNovo">Nome da categoria</Label>
						<Input
							id="nomeNovo"
							placeholder="Ex: SALÁRIO, ALUGUEL, MERCADO..."
							bind:value={nomeNovo}
							autofocus
							disabled={isSubmitting}
						/>
					</div>

					<div class="grid gap-2">
						<Label>Tipo de movimentação</Label>
						<Select.Root type="single" bind:value={movimentoTipo} disabled={isSubmitting}>
							<Select.Trigger class="w-full">
								{tipoLabel}
							</Select.Trigger>
							<Select.Content>
								<Select.Group>
									{#each opcoes as opcao (opcao.value)}
										<Select.Item value={opcao.value} label={opcao.label}>
											{opcao.label}
										</Select.Item>
									{/each}
								</Select.Group>
							</Select.Content>
						</Select.Root>
					</div>
				</div>
			{/if}
		</div>

		<Dialog.Footer class="flex justify-between">
			{#if modo === 'adicionar'}
				<Button variant="outline" onclick={() => (modo = 'lista')} disabled={isSubmitting}>
					Voltar para lista
				</Button>
				<Button
					variant="default"
					onclick={adicionarCategoria}
					disabled={isSubmitting || !nomeNovo.trim()}
				>
					{isSubmitting ? 'Adicionando...' : 'Adicionar Categoria'}
				</Button>
			{:else}
				<Button variant="outline" onclick={() => (open = false)}>Fechar</Button>
			{/if}
		</Dialog.Footer>
	</Dialog.Content>
</Dialog.Root>

<Dialog.Root bind:open={confirmOpen}>
	<Dialog.Content class="sm:max-w-md">
		<Dialog.Header>
			<Dialog.Title>Excluir categoria</Dialog.Title>
			<Dialog.Description>
				Tem certeza que deseja excluir
				<strong> "{categoriaParaExcluir?.nome}"</strong>? Essa ação não pode ser desfeita.
			</Dialog.Description>
		</Dialog.Header>

		<Dialog.Footer class="flex justify-end gap-2">
			<Button
				variant="outline"
				onclick={() => {
					confirmOpen = false;
					categoriaParaExcluir = null;
				}}
			>
				Cancelar
			</Button>

			<Button
				variant="destructive"
				onclick={deletarCategoriaConfirmada}
				disabled={deletingId === categoriaParaExcluir?.id}
			>
				{deletingId === categoriaParaExcluir?.id ? 'Excluindo...' : 'Confirmar exclusão'}
			</Button>
		</Dialog.Footer>
	</Dialog.Content>
</Dialog.Root>
