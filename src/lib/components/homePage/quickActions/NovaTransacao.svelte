<script lang="ts">
	import * as Dialog from '$lib/components/ui/dialog/index.js';
	import { Button } from '$lib/components/ui/button/index.js';
	import { Input } from '$lib/components/ui/input/index.js';
	import { Label } from '$lib/components/ui/label/index.js';
	import * as Command from '$lib/components/ui/command/index.js';
	import * as Popover from '$lib/components/ui/popover/index.js';
	import { Calendar } from '$lib/components/ui/calendar/index.js';
	import { cn } from '$lib/utils.js';
	import { format } from 'date-fns';
	import { CalendarIcon, Check, ChevronsUpDown, Loader2 } from 'lucide-svelte';
	import { toast } from 'svelte-sonner';
	import { tick } from 'svelte';
	import { transactionsStore } from '$lib/stores/transacoes';

	// Para Calendar
	import { CalendarDate, getLocalTimeZone, today } from '@internationalized/date';
	import { tiposStore } from '$lib/stores/transacoes';

	const tipos = $derived(tiposStore.tipos);
	const loadingTipos = $derived(tiposStore.loading);

	$effect(() => {
		if (open) {
			tiposStore.fetchTipos();
		}
	});

	let open = $state(false);
	let valor = $state<number | null>(null);
	let data = $state<CalendarDate | undefined>(today(getLocalTimeZone()));
	let comentario = $state('');
	let selectedTipoId = $state<string>('');

	let isSubmitting = $state(false);
	let popoverOpen = $state(false);
	let triggerRef = $state<HTMLButtonElement | null>(null);

	const selectedLabel = $derived(
		tipos.find((t) => t.id === Number(selectedTipoId))?.nome || 'Selecione uma categoria...'
	);

	async function handleSubmit() {
		console.log('handleSubmit foi chamado!');
		if (!valor || !data || !selectedTipoId) {
			toast.error('Preencha os campos obrigatórios');
			return;
		}

		isSubmitting = true;

		const jsDate = data.toDate(getLocalTimeZone());

		try {
			const res = await fetch('/api/transacoes/adicionar', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					tipoTransacaoId: Number(selectedTipoId),
					valor: valor,
					data: jsDate.toISOString(),
					comentario: comentario.trim() || null
				})
			});

			if (!res.ok) {
				const err = await res.json();
				throw new Error(err.message || 'Erro ao salvar transação');
			}

			toast.success('Transação adicionada com sucesso!');

			valor = null;
			data = today(getLocalTimeZone());
			comentario = '';
			selectedTipoId = '';
		} catch (err: any) {
			toast.error(err.message || 'Falha ao adicionar transação');
		} finally {
			await transactionsStore.refresh();
			isSubmitting = false;
		}
	}

	function formatDate(value: CalendarDate | undefined): string {
		if (!value) return 'Selecione uma data';
		const jsDate = value.toDate(getLocalTimeZone());
		return format(jsDate, 'dd/MM/yyyy');
	}

	function cancelar() {
		open = false;
	}

	function closeAndFocusTrigger() {
		popoverOpen = false;
		tick().then(() => triggerRef?.focus());
	}
</script>

<Dialog.Root bind:open>
	<Dialog.Trigger>
		<Button variant="outline" class="w-full justify-start" disabled={isSubmitting}>
			<CalendarIcon class="mr-2 h-5 w-5" />
			Nova Transação
		</Button>
	</Dialog.Trigger>

	<Dialog.Content class="sm:max-w-106.25">
		<Dialog.Header>
			<Dialog.Title>Nova Transação</Dialog.Title>
			<Dialog.Description>Registre uma nova movimentação financeira.</Dialog.Description>
		</Dialog.Header>

		<div class="grid gap-6 py-4">
			<!-- Valor -->
			<div class="grid gap-2">
				<Label for="valor">Valor (R$)</Label>
				<Input
					id="valor"
					type="number"
					step="0.01"
					placeholder="0,00"
					bind:value={valor}
					disabled={isSubmitting}
				/>
			</div>

			<!-- Data -->
			<div class="grid gap-2">
				<Label>Data</Label>
				<Popover.Root>
					<Popover.Trigger disabled={isSubmitting}>
						<Button
							variant="outline"
							class={cn(
								'w-full justify-start text-left font-normal',
								!data && 'text-muted-foreground'
							)}
						>
							<CalendarIcon class="mr-2 h-4 w-4" />
							{formatDate(data)}
						</Button>
					</Popover.Trigger>
					<Popover.Content class="w-auto p-0">
						<Calendar type="single" initialFocus bind:value={data} />
					</Popover.Content>
				</Popover.Root>
			</div>

			<!-- Categoria (Combobox pesquisável) -->
			<div class="grid gap-2">
				<Label>Categoria</Label>

				{#if loadingTipos}
					<Button variant="outline" class="w-full justify-start" disabled>
						<Loader2 class="mr-2 h-4 w-4 animate-spin" />
						Carregando...
					</Button>
				{:else}
					<Popover.Root bind:open={popoverOpen}>
						<Popover.Trigger bind:ref={triggerRef}>
							<Button
								variant="outline"
								role="combobox"
								aria-expanded={popoverOpen}
								class="w-full justify-between"
								disabled={isSubmitting || tipos.length === 0}
							>
								{selectedLabel}
								<ChevronsUpDown class="ml-2 h-4 w-4 shrink-0 opacity-50" />
							</Button>
						</Popover.Trigger>

						<Popover.Content class="w-full p-0">
							<Command.Root>
								<Command.Input placeholder="Pesquisar categoria..." class="h-9" />
								<Command.List>
									<Command.Empty>Nenhuma categoria encontrada.</Command.Empty>
									<Command.Group>
										{#each tipos as t (t.id)}
											<Command.Item
												value={t.nome}
												onSelect={() => {
													selectedTipoId = t.id.toString();
													closeAndFocusTrigger();
												}}
											>
												<Check
													class={cn(
														'mr-2 h-4 w-4',
														Number(selectedTipoId) === t.id ? 'opacity-100' : 'opacity-0'
													)}
												/>
												{t.nome}
												<span class="ml-2 text-xs text-muted-foreground">({t.movimentoTipo})</span>
											</Command.Item>
										{/each}
									</Command.Group>
								</Command.List>
							</Command.Root>
						</Popover.Content>
					</Popover.Root>

					{#if tipos.length === 0 && !loadingTipos}
						<p class="mt-1 text-sm text-muted-foreground">Nenhuma categoria cadastrada ainda.</p>
					{/if}
				{/if}
			</div>

			<!-- Comentário -->
			<div class="grid gap-2">
				<Label for="comentario">Comentário</Label>
				<Input
					id="comentario"
					placeholder="Ex: Salário de fevereiro, pagamento Netflix..."
					bind:value={comentario}
					disabled={isSubmitting}
				/>
			</div>
		</div>

		<Dialog.Footer>
			<Button variant="outline" onclick={cancelar} disabled={isSubmitting}>Cancelar</Button>
			<Button onclick={handleSubmit} disabled={isSubmitting}>
				{isSubmitting ? 'Salvando...' : 'Salvar'}
			</Button>
		</Dialog.Footer>
	</Dialog.Content>
</Dialog.Root>
