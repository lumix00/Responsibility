<script lang="ts">
	import * as Dialog from '$lib/components/ui/dialog/index.js';
	import { Button } from '$lib/components/ui/button/index.js';
	import { FileSpreadsheet } from 'lucide-svelte';

	let open = $state(false);

	let isSubmitting = $state(false);

	async function handleSubmit() {}

	function cancelar() {
		open = false;
	}
</script>

<Dialog.Root bind:open>
	<Dialog.Trigger>
		<Button variant="outline" class="w-full justify-start" disabled={isSubmitting}>
			<FileSpreadsheet />
			Planilhas
		</Button>
	</Dialog.Trigger>

	<Dialog.Content class="sm:max-w-106.25">
		<Dialog.Header>
			<Dialog.Title>Lançar Planilha</Dialog.Title>
			<Dialog.Description
				>Registre uma nova movimentação financeira a partir de uma planilha.</Dialog.Description
			>
		</Dialog.Header>

		<Dialog.Footer>
			<Button variant="outline" onclick={cancelar} disabled={isSubmitting}>Cancelar</Button>
			<Button onclick={handleSubmit} disabled={isSubmitting}>
				{isSubmitting ? 'Lançando...' : 'Lançar'}
			</Button>
		</Dialog.Footer>
	</Dialog.Content>
</Dialog.Root>
