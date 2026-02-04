<script lang="ts">
	import { enhance } from '$app/forms';
	import * as Card from '$lib/components/ui/card/index.js';
	import { Button } from '$lib/components/ui/button/index.js';
	import { Input } from '$lib/components/ui/input/index.js';
	import { Label } from '$lib/components/ui/label/index.js';
	import type { ActionData } from './$types'; // Importe para tipar

	export let form: ActionData & { error?: string }; // Tipagem corrigida
</script>

<div class="flex min-h-screen items-center justify-center bg-gray-100 dark:bg-gray-900">
	<Card.Root class="w-full max-w-md p-6">
		<Card.Header>
			<Card.Title class="text-2xl">Login</Card.Title>
			<Card.Description>Entre com seu usuário e senha.</Card.Description>
		</Card.Header>
		<Card.Content>
			<form method="POST" use:enhance>
				<div class="grid gap-4">
					<div class="grid gap-2">
						<Label for="username">Usuário</Label>
						<Input id="username" name="username" type="text" placeholder="Usuario" required />
					</div>
					<div class="grid gap-2">
						<Label for="password">Senha</Label>
						<Input id="password" name="password" type="password" placeholder="Senha" required />
					</div>
					{#if form?.error}
						<p class="text-sm text-red-500">{form.error}</p>
					{/if}
				</div>
				<Button type="submit" class="mt-4 w-full">Entrar</Button>
			</form>
		</Card.Content>
		<Card.Footer class="flex justify-center">
			<a href="/signup" class="text-sm text-blue-600 hover:underline dark:text-blue-400"
				>Não tem conta? Cadastre-se</a
			>
		</Card.Footer>
	</Card.Root>
</div>
