<script lang="ts">
	import * as Dialog from '$lib/components/ui/dialog/index.js';
	import { Button } from '$lib/components/ui/button/index.js';
	import { Input } from '$lib/components/ui/input/index.js';
	import { Label } from '$lib/components/ui/label/index.js';
	import * as Select from '$lib/components/ui/select/index.js';
	import { CirclePlus } from 'lucide-svelte';
	import { toast } from 'svelte-sonner';

	// Estado do dialog
	let open = $state(false);

	// Formulário
	let nome = $state('');
	let movimentoTipo = $state<'receita' | 'despesa'>('receita');

	// Loading state
	let isSubmitting = $state(false);

	// Texto exibido no select
	const tipoLabel = $derived(movimentoTipo === 'receita' ? 'Receita' : 'Despesa');

	// Opções fixas
	const opcoes = [
		{ value: 'receita', label: 'Receita' },
		{ value: 'despesa', label: 'Despesa' }
	];

	async function handleSubmit() {
		if (!nome.trim()) {
			toast.error('O nome da categoria é obrigatório');
			return;
		}

		isSubmitting = true;

		try {
			const response = await fetch('/api/tipos-transacao/adicionarTipo', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					nome: nome.trim(),
					movimentoTipo
				})
			});

			if (!response.ok) {
				const err = await response.json();
				throw new Error(err.message || 'Erro ao salvar categoria');
			}

			const novoTipo = await response.json();

			toast.success(`Categoria "${nome.trim()}" adicionada com sucesso!`);

			// Reset e fecha
			nome = '';
			movimentoTipo = 'receita';
			open = false;
		} catch (err: any) {
			toast.error(err.message || 'Falha ao adicionar categoria');
		} finally {
			isSubmitting = false;
		}
	}

	function cancelar() {
		nome = '';
		movimentoTipo = 'receita';
		open = false;
	}
</script>

<Dialog.Root bind:open>
	<Dialog.Trigger>
		<Button variant="outline" class="w-full justify-start">
			<CirclePlus class="mr-2 h-5 w-5" />
			Nova Categoria
		</Button>
	</Dialog.Trigger>

	<Dialog.Content class="sm:max-w-106.25">
		<Dialog.Header>
			<Dialog.Title>Adicionar Nova Categoria</Dialog.Title>
			<Dialog.Description>
				Crie uma nova categoria para organizar suas receitas e despesas.
			</Dialog.Description>
		</Dialog.Header>

		<div class="grid gap-6 py-4">
			<!-- Nome -->
			<div class="grid gap-2">
				<Label for="nome">Nome da categoria</Label>
				<Input
					id="nome"
					placeholder="Ex: Salário, Aluguel, Mercado, Freelance..."
					bind:value={nome}
					autofocus
					disabled={isSubmitting}
				/>
			</div>

			<!-- Tipo -->
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

		<Dialog.Footer>
			<Button type="button" variant="outline" onclick={cancelar} disabled={isSubmitting}>
				Cancelar
			</Button>
			<Button type="button" onclick={handleSubmit} disabled={isSubmitting || !nome.trim()}>
				{#if isSubmitting}
					Adicionando...
				{:else}
					Adicionar
				{/if}
			</Button>
		</Dialog.Footer>
	</Dialog.Content>
</Dialog.Root>
