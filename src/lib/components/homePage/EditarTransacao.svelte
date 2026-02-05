<script lang="ts">
	import * as Dialog from '$lib/components/ui/dialog';
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import { Loader2 } from 'lucide-svelte';
	import { allTransactions } from '$lib/stores/transacoes';
	import { toast } from 'svelte-sonner';
	import type { TransacaoDTO } from '$lib/stores/transacoes';
	import { format } from 'date-fns';

	import * as Popover from '$lib/components/ui/popover/index.js';
	import { Calendar } from '$lib/components/ui/calendar/index.js';
	import { cn } from '$lib/utils.js';
	import { CalendarIcon } from 'lucide-svelte';
	import { transactionsStore } from '$lib/stores/transacoes';

	// Para Calendar
	import { CalendarDate, getLocalTimeZone, parseDate, today } from '@internationalized/date';

	type Props = {
		open?: boolean;
		transacao?: TransacaoDTO | null;
	};

	let { open = $bindable(false), transacao = $bindable<TransacaoDTO | null>(null) }: Props =
		$props();

	let form = $state({
		valor: transacao?.valor ?? '',
		data: transacao ? new Date(transacao.data).toISOString().slice(0, 16) : '',
		comentario: transacao?.comentario ?? ''
	});

	let loading = $state(false);

	$effect(() => {
		if (transacao) {
			form.valor = transacao.valor;
			form.data = new Date(transacao.data).toISOString().slice(0, 16);
			form.comentario = transacao.comentario ?? '';
		}
	});

	async function salvarEdicao() {
		if (!transacao?.id) return;

		loading = true;

		try {
			const res = await fetch(`/api/transacoes/editar-excluir/${transacao.id}`, {
				method: 'PATCH',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					valor: form.valor,
					data: new Date(form.data).toISOString(),
					comentario: form.comentario || null
					// adicione tipoTransacaoId se quiser editar categoria
				})
			});

			if (!res.ok) {
				const err = await res.json();
				throw new Error(err.error || 'Falha ao atualizar');
			}

			const data = await res.json();
			allTransactions.refresh();
			toast.success('Transação atualizada');
			open = false;
		} catch (err: any) {
			toast.error(err.message || 'Erro ao atualizar transação');
		} finally {
			await transactionsStore.refresh();
			loading = false;
		}
	}

	let calendarValue = $state(
		form.data ? parseDate(form.data.split('T')[0]) : today(getLocalTimeZone())
	);

	$effect(() => {
		if (calendarValue) {
			form.data = calendarValue.toString() + 'T00:00:00'; // ou sem hora se o schema aceitar
		}
	});

	$effect(() => {
		if (form.data) {
			const dateStr = form.data.split('T')[0];
			if (dateStr) calendarValue = parseDate(dateStr);
		}
	});

	function formatDate(value: CalendarDate | undefined): string {
		if (!value) return 'Selecione uma data';
		const jsDate = value.toDate(getLocalTimeZone());
		return format(jsDate, 'dd/MM/yyyy');
	}
</script>

<Dialog.Root bind:open>
	<Dialog.Content class="sm:max-w-106.25">
		<Dialog.Header>
			<Dialog.Title>Editar transação</Dialog.Title>
		</Dialog.Header>

		<div class="grid gap-4 py-4">
			<div class="grid gap-2">
				<Label for="valor">Valor (R$)</Label>
				<Input id="valor" type="number" step="0.01" bind:value={form.valor} />
			</div>

			<div class="grid gap-2">
				<Label>Data</Label>
				<Popover.Root>
					<Popover.Trigger>
						<Button
							variant="outline"
							class={cn(
								'w-full justify-start text-left font-normal',
								!form.data && 'text-muted-foreground'
							)}
						>
							<CalendarIcon class="mr-2 h-4 w-4" />
							{formatDate(calendarValue)}
						</Button>
					</Popover.Trigger>
					<Popover.Content class="w-auto p-0">
						<Calendar type="single" initialFocus bind:value={calendarValue} />
					</Popover.Content>
				</Popover.Root>
			</div>

			<div class="grid gap-2">
				<Label for="comentario">Comentário</Label>
				<Input id="comentario" bind:value={form.comentario} />
			</div>
		</div>

		<Dialog.Footer>
			<Button variant="outline" disabled={loading} onclick={() => (open = false)}>Cancelar</Button>
			<Button disabled={loading} onclick={salvarEdicao}>
				{#if loading}
					<Loader2 class="mr-2 h-4 w-4 animate-spin" />
					Salvando...
				{:else}
					Salvar alterações
				{/if}
			</Button>
		</Dialog.Footer>
	</Dialog.Content>
</Dialog.Root>
