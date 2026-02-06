<script lang="ts">
	import * as Dialog from '$lib/components/ui/dialog/index.js';
	import { Button } from '$lib/components/ui/button/index.js';
	import { Input } from '$lib/components/ui/input/index.js';
	import { Label } from '$lib/components/ui/label/index.js';
	import { Badge } from '$lib/components/ui/badge/index.js'; // opcional, para mostrar o nome do arquivo

	import { FileSpreadsheet, Upload, X } from 'lucide-svelte';

	let open = $state(false);
	let isSubmitting = $state(false);
	let selectedFile = $state<File | null>(null);

	$effect(() => {
		if (!open) {
			selectedFile = null;
		}
	});

	// Quando o usuário seleciona um arquivo
	function onFileChange(event: Event) {
		const input = event.target as HTMLInputElement;
		if (input.files && input.files[0]) {
			const file = input.files[0];

			// Validação básica (opcional)
			if (!file.name.toLowerCase().endsWith('.xlsx')) {
				alert('Por favor, selecione apenas arquivos .xlsx');
				input.value = ''; // limpa o input
				selectedFile = null;
				return;
			}

			if (file.size > 10 * 1024 * 1024) {
				// exemplo: máx 10 MB
				alert('O arquivo é muito grande (máximo 10 MB)');
				input.value = '';
				selectedFile = null;
				return;
			}

			selectedFile = file;
		}
	}

	async function handleSubmit() {
		if (!selectedFile) {
			alert('Selecione uma planilha antes de continuar.');
			return;
		}

		isSubmitting = true;

		try {
			const formData = new FormData();
			formData.append('planilha', selectedFile);

			// Exemplo de envio (ajuste para sua API)
			const res = await fetch('/api/transacoes/anexarPlanilha', {
				method: 'POST',
				body: formData
			});

			if (!res.ok) throw new Error('Falha no upload');

			const result = await res.json();
			console.log('Sucesso:', result);

			// feedback de sucesso
			alert('Planilha enviada com sucesso!');
			open = false; // fecha o dialog
		} catch (err) {
			alert('Erro ao enviar a planilha. Tente novamente.');
		} finally {
			isSubmitting = false;
		}
	}

	function cancelar() {
		open = false;
	}

	function removerArquivo() {
		selectedFile = null;
		// também limpa o input file (opcional)
		const input = document.getElementById('file-upload') as HTMLInputElement;
		if (input) input.value = '';
	}

	function handleDragOver(event: DragEvent) {
		event.preventDefault(); // ← essencial para permitir o drop
		event.stopPropagation(); // opcional, mas ajuda em alguns casos
		// dragActive = true;            // se você estiver usando highlight
	}

	function handleDragLeave(event: DragEvent) {
		event.preventDefault();
		event.stopPropagation();
		// dragActive = false;
	}

	function handleDrop(event: DragEvent) {
		event.preventDefault(); // ← impede o navegador de abrir/baixar o arquivo
		event.stopPropagation();

		const files = event.dataTransfer?.files;
		if (!files || files.length === 0) return;

		const file = files[0]; // ou loop se quiser múltiplos

		if (!file.name.toLowerCase().endsWith('.xlsx')) {
			alert('Por favor, selecione apenas arquivos .xlsx');
			return;
		}

		if (file.size > 10 * 1024 * 1024) {
			alert('O arquivo é muito grande (máximo 10 MB)');
			return;
		}

		selectedFile = file;
	}
</script>

<Dialog.Root bind:open>
	<Dialog.Trigger>
		<Button variant="outline" class="w-full justify-start" disabled={isSubmitting}>
			<FileSpreadsheet class="mr-2 h-4 w-4" />
			Planilhas
		</Button>
	</Dialog.Trigger>

	<Dialog.Content class="sm:max-w-106.25 md:max-w-137.5">
		<Dialog.Header>
			<Dialog.Title>Lançar Planilha</Dialog.Title>
			<Dialog.Description>
				Registre uma nova movimentação financeira a partir de uma planilha (.xlsx).
			</Dialog.Description>
		</Dialog.Header>

		<div class="py-6">
			{#if selectedFile}
				<!-- arquivo já selecionado -->
				<div class="flex items-center justify-between rounded-lg border bg-muted/40 px-4 py-3">
					<div class="flex items-center gap-3">
						<FileSpreadsheet class="h-8 w-8 text-primary" />
						<div>
							<p class="font-medium">{selectedFile.name}</p>
							<p class="text-xs text-muted-foreground">
								{(selectedFile.size / 1024 / 1024).toFixed(2)} MB
							</p>
						</div>
					</div>
					<Button
						variant="ghost"
						size="icon"
						class="h-8 w-8"
						onclick={removerArquivo}
						disabled={isSubmitting}
					>
						<X class="h-4 w-4" />
					</Button>
				</div>

				<p class="mt-4 text-center text-sm text-muted-foreground">Arquivo pronto para envio</p>
			{:else}
				<!-- área de drop / clique -->
				<Label
					for="file-upload"
					class="flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-input bg-muted/30 p-10 text-center transition hover:bg-muted/50"
					ondragover={handleDragOver}
					ondragleave={handleDragLeave}
					ondrop={handleDrop}
				>
					<Upload class="mb-4 h-10 w-10 text-muted-foreground" />
					<div class="mb-2 text-lg font-semibold">Clique ou arraste a planilha aqui</div>
					<p class="text-sm text-muted-foreground">
						Apenas arquivos <strong>.xlsx</strong> • Máx. 10 MB
					</p>

					<Input
						id="file-upload"
						type="file"
						accept=".xlsx,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
						class="hidden"
						onchange={onFileChange}
						disabled={isSubmitting}
					/>
				</Label>
			{/if}
		</div>

		<Dialog.Footer>
			<Button variant="outline" onclick={cancelar} disabled={isSubmitting}>Cancelar</Button>
			<Button onclick={handleSubmit} disabled={isSubmitting || !selectedFile}>
				{isSubmitting ? 'Lançando...' : 'Lançar Planilha'}
			</Button>
		</Dialog.Footer>
	</Dialog.Content>
</Dialog.Root>
