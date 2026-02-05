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

import { toast } from 'svelte-sonner';

export type TipoTransacao = {
	id: number;
	nome: string;
	movimentoTipo: 'receita' | 'despesa';
};

let tipos = $state<TipoTransacao[]>([]);
let loading = $state(false);
let loaded = false;

async function fetchTipos() {
	if (loaded || loading) return;

	loading = true;
	try {
		const res = await fetch('/api/tipos-transacao/buscarTipos');
		if (!res.ok) throw new Error();

		tipos = await res.json();
		loaded = true;
	} catch {
		toast.error('Não foi possível carregar as categorias');
		tipos = [];
	} finally {
		loading = false;
	}
}

function refreshTipos() {
	loaded = false;
	fetchTipos();
}

export const tiposStore = {
	get tipos() {
		return tipos;
	},
	get loading() {
		return loading;
	},
	fetchTipos,
	refreshTipos
};
