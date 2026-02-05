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

function createAllTransacoesStore() {
	const allTransactionsStore = writable<TransacaoDTO[]>([]);
	const loadingStore = writable(false);

	let loaded = false;

	async function fetchAll() {
		if (loaded) return;
		loadingStore.set(true);

		try {
			const res = await fetch('/api/transacoes/buscar-todas');
			if (!res.ok) throw new Error('Falha ao buscar transações');
			const data: TransacaoDTO[] = await res.json();
			allTransactionsStore.set(data);
			loaded = true;
		} catch (err) {
			console.error(err);
			allTransactionsStore.set([]);
		} finally {
			loadingStore.set(false);
		}
	}

	function clear() {
		allTransactionsStore.set([]);
		loaded = false;
	}

	function refresh() {
		loaded = false;
		return fetchAll();
	}

	return {
		allTransactions: allTransactionsStore,
		loadingAll: loadingStore,
		fetchAll,
		refresh,
		clear // ← novo método
	};
}

export const allTransactions = createAllTransacoesStore();

//
import { toast } from 'svelte-sonner';

export type TipoTransacao = {
	id: number;
	nome: string;
	movimentoTipo: 'receita' | 'despesa';
};

// Stores internos
const tipos = writable<TipoTransacao[]>([]);
const loading = writable(false);

let loaded = false;

async function fetchTipos() {
	let isLoading: boolean = false;
	loading.subscribe((value) => (isLoading = value))();
	if (loaded || isLoading) return;

	loading.set(true);
	try {
		const res = await fetch('/api/tipos-transacao/buscarTipos');
		if (!res.ok) throw new Error();

		const data = await res.json();
		tipos.set(data);
		loaded = true;
	} catch {
		toast.error('Não foi possível carregar as categorias');
		tipos.set([]);
	} finally {
		loading.set(false);
	}
}

function refreshTipos() {
	loaded = false;
	fetchTipos();
}

export const tiposStore = {
	tipos,
	loading,
	fetchTipos,
	refreshTipos
};
