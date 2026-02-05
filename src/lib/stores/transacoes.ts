import { writable } from 'svelte/store';

export type TransacaoDTO = {
	id: number;
	valor: string;
	data: string;
	nome: string;
	movimentoTipo: 'receita' | 'despesa';
	comentario: string | null;
};

function createTransacoesStore() {
	const { subscribe, set } = writable<TransacaoDTO[]>([]);

	let loaded = false;

	async function load() {
		if (loaded) return;

		const res = await fetch('/api/transacoes/buscar1ano');
		const data = await res.json();

		set(data);
		loaded = true;
	}

	function refresh() {
		loaded = false;
		return load();
	}

	return {
		subscribe,
		load,
		refresh
	};
}

export const transactionsStore = createTransacoesStore();
