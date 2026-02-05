<script lang="ts">
	import * as Dialog from '$lib/components/ui/dialog/index.js';
	import { Button } from '$lib/components/ui/button/index.js';
	import { Input } from '$lib/components/ui/input/index.js';
	import { Label } from '$lib/components/ui/label/index.js';
	import * as Select from '$lib/components/ui/select/index.js';
	import { Calendar } from '$lib/components/ui/calendar/index.js';
	import { Popover, PopoverContent, PopoverTrigger } from '$lib/components/ui/popover/index.js';
	import { cn } from '$lib/utils.js';
	import { format } from 'date-fns';
	import { CalendarIcon } from 'lucide-svelte';

	// Para Calendar
	import { CalendarDate, getLocalTimeZone, today } from '@internationalized/date';

	let open = $state(false);

	let valor = $state('');
	let data = $state<CalendarDate | undefined>(today(getLocalTimeZone()));
	let comentario = $state('');
	let tipo = $state('');

	const tipos = [
		{ value: 'receita', label: 'Receita' },
		{ value: 'despesa', label: 'Despesa' },
		{ value: 'transferencia', label: 'Transferência' },
		{ value: 'investimento', label: 'Investimento' }
	];

	// Texto exibido no Select Trigger
	const tipoLabel = $derived(tipos.find((t) => t.value === tipo)?.label ?? 'Selecione o tipo');

	function handleSubmit() {
		if (!valor || !data || !tipo) {
			alert('Preencha os campos obrigatórios');
			return;
		}

		const jsDate = data.toDate(getLocalTimeZone());

		console.log({
			valor: Number(valor.replace(',', '.')),
			data: jsDate,
			comentario,
			tipo
		});

		// Reset e fecha
		valor = '';
		data = today(getLocalTimeZone());
		comentario = '';
		tipo = '';
		open = false;
	}

	function formatDate(value: CalendarDate | undefined): string {
		if (!value) return 'Selecione uma data';
		const jsDate = value.toDate(getLocalTimeZone());
		return format(jsDate, 'PPP'); // ou 'dd/MM/yyyy' se preferir
	}

	function cancelar() {
		open = false;
	}
</script>

<Dialog.Root bind:open>
	<Dialog.Trigger>
		<Button variant="outline" class="w-full justify-start">
			<CalendarIcon class="mr-2 h-5 w-5" />
			Nova Receita
		</Button>
	</Dialog.Trigger>

	<Dialog.Content class="sm:max-w-106.25">
		<Dialog.Header>
			<Dialog.Title>Nova Entrada</Dialog.Title>
			<Dialog.Description>
				Adicione uma nova receita, despesa ou outro tipo de movimentação.
			</Dialog.Description>
		</Dialog.Header>

		<div class="grid gap-6 py-4">
			<!-- Valor -->
			<div class="grid gap-2">
				<Label for="valor">Valor</Label>
				<Input id="valor" type="number" step="0.01" placeholder="0,00" bind:value={valor} />
			</div>

			<!-- Data -->
			<div class="grid gap-2">
				<Label>Data</Label>
				<Popover>
					<PopoverTrigger>
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
					</PopoverTrigger>
					<PopoverContent class="w-auto p-0">
						<Calendar type="single" initialFocus bind:value={data} />
					</PopoverContent>
				</Popover>
			</div>

			<!-- Tipo (Select) -->
			<div class="grid gap-2">
				<Label>Tipo</Label>
				<Select.Root type="single" bind:value={tipo}>
					<Select.Trigger class="w-full">
						{tipoLabel}
					</Select.Trigger>
					<Select.Content>
						<Select.Group>
							{#each tipos as item (item.value)}
								<Select.Item value={item.value} label={item.label}>
									{item.label}
								</Select.Item>
							{/each}
						</Select.Group>
					</Select.Content>
				</Select.Root>
			</div>

			<!-- Comentário -->
			<div class="grid gap-2">
				<Label for="comentario">Comentário / Descrição</Label>
				<Input
					id="comentario"
					placeholder="Ex: Salário março, conta de luz..."
					bind:value={comentario}
				/>
			</div>
		</div>

		<Dialog.Footer>
			<Button type="button" variant="outline" onclick={cancelar}>Cancelar</Button>
			<Button type="button" onclick={handleSubmit}>Salvar</Button>
		</Dialog.Footer>
	</Dialog.Content>
</Dialog.Root>
