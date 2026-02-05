<script lang="ts">
	import * as Dialog from '$lib/components/ui/dialog';
	import { Button } from '$lib/components/ui/button';
	import { Loader2, Trash2 } from 'lucide-svelte';
	import { allTransactions } from '$lib/stores/transacoes';
	import { toast } from 'svelte-sonner';
	import { transactionsStore } from '$lib/stores/transacoes';

	type Props = {
		open?: boolean;
		transacaoId?: number | null;
		transacaoDescricao?: string;
	};

	let {
		open = $bindable(false),
		transacaoId = $bindable<number | null>(null),
		transacaoDescricao = ''
	}: Props = $props();

	let loading = $state(false);

	async function confirmarExclusao() {
		if (!transacaoId) return;

		loading = true;

		try {
			const res = await fetch(`/api/transacoes/editar-excluir/${transacaoId}`, {
				method: 'DELETE',
				headers: { 'Content-Type': 'application/json' }
			});

			if (!res.ok) {
				const err = await res.json();
				throw new Error(err.error || 'Falha ao excluir');
			}

			allTransactions.refresh();
			toast.success('Transação excluída com sucesso');
			open = false;
		} catch (err: any) {
			toast.error(err.message || 'Erro ao excluir transação');
		} finally {
			await transactionsStore.refresh();
			loading = false;
		}
	}
</script>

<Dialog.Root bind:open>
	<Dialog.Content>
		<Dialog.Header>
			<Dialog.Title>Excluir transação</Dialog.Title>
			<Dialog.Description>
				Tem certeza que deseja excluir esta transação?<br />
				<span class="font-medium">“{transacaoDescricao || 'sem comentário'}”</span>
			</Dialog.Description>
		</Dialog.Header>

		<Dialog.Footer class="gap-3">
			<Button variant="outline" disabled={loading} onclick={() => (open = false)}>Cancelar</Button>
			<Button variant="destructive" disabled={loading} onclick={confirmarExclusao}>
				{#if loading}
					<Loader2 class="mr-2 h-4 w-4 animate-spin" />
					Excluindo...
				{:else}
					<Trash2 class="mr-2 h-4 w-4" />
					Excluir
				{/if}
			</Button>
		</Dialog.Footer>
	</Dialog.Content>
</Dialog.Root>
