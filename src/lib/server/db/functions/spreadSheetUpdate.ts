// src/lib/server/db/functions/spreadSheetUpdate.ts

import { db } from '$lib/server/db';
import { tiposTransacao, transacoes } from '$lib/server/db/schema';
import { eq, and, inArray } from 'drizzle-orm';
import type { InferInsertModel } from 'drizzle-orm';

type NewTransacao = InferInsertModel<typeof transacoes>;
type NewTipoTransacao = InferInsertModel<typeof tiposTransacao>;

interface PlanilhaMovimento {
	comentario: string | null;
	categoria: string | null;
	data: string | Date | null;
	saida?: number | string | null;
	entrada?: number | string | null;
}

interface PlanilhaData {
	saidas: PlanilhaMovimento[];
	entradas: PlanilhaMovimento[];
}

/**
 * Processa os dados da planilha de forma eficiente:
 * - Padroniza nomes de categorias em UPPERCASE
 * - Coleta todas categorias únicas → busca + cria em batch
 * - Coleta todas transações válidas → insere tudo de uma vez (bulk insert)
 */
export async function spreadSheetUpdate(
	userId: string,
	planilhaData: Record<string, PlanilhaData>
): Promise<{ inserted: number; createdCategories: number }> {
	// ─── Estruturas de apoio ─────────────────────────────────────────────────────
	const transacoesToInsert: NewTransacao[] = [];
	const categoriaMap = new Map<string, number>(); // chave: "NOME_UPPER|tipo" → id

	let createdCategoriesCount = 0;

	// ─── 1. Coletar todas as categorias únicas usadas na planilha ────────────────
	const categoriaSet = new Set<string>(); // "NOME_UPPER|tipo"

	for (const sheetName in planilhaData) {
		const { saidas, entradas } = planilhaData[sheetName];

		for (const row of saidas) {
			if (!row.categoria?.trim() || !row.data || !row.saida) continue;
			const valor = Number(row.saida);
			if (isNaN(valor) || valor <= 0) continue;

			const nomeUpper = row.categoria.trim().toUpperCase();
			categoriaSet.add(`${nomeUpper}|despesa`);
		}

		for (const row of entradas) {
			if (!row.categoria?.trim() || !row.data || !row.entrada) continue;
			const valor = Number(row.entrada);
			if (isNaN(valor) || valor <= 0) continue;

			const nomeUpper = row.categoria.trim().toUpperCase();
			categoriaSet.add(`${nomeUpper}|receita`);
		}
	}

	if (categoriaSet.size === 0) {
		return { inserted: 0, createdCategories: 0 };
	}

	// Converter Set → array de objetos
	const uniqueCategorias = Array.from(categoriaSet).map((key) => {
		const [nomeUpper, tipo] = key.split('|');
		return { nomeUpper, tipo: tipo as 'despesa' | 'receita' };
	});

	const nomesUpper = uniqueCategorias.map((c) => c.nomeUpper);

	// ─── 2. Buscar categorias existentes (uma única query) ───────────────────────
	const existentes = await db
		.select({
			id: tiposTransacao.id,
			nome: tiposTransacao.nome,
			movimentoTipo: tiposTransacao.movimentoTipo
		})
		.from(tiposTransacao)
		.where(and(eq(tiposTransacao.userId, userId), inArray(tiposTransacao.nome, nomesUpper)));

	// Popular o mapa com as existentes
	for (const cat of existentes) {
		const key = `${cat.nome}|${cat.movimentoTipo}`;
		categoriaMap.set(key, cat.id);
	}

	// ─── 3. Criar as categorias que ainda não existem (bulk insert) ─────────────
	const toCreate = uniqueCategorias.filter((c) => !categoriaMap.has(`${c.nomeUpper}|${c.tipo}`));

	if (toCreate.length > 0) {
		const newCategorias: NewTipoTransacao[] = toCreate.map((c) => ({
			userId,
			nome: c.nomeUpper, // já em UPPERCASE
			movimentoTipo: c.tipo
			// createdAt / updatedAt → se tiver default no schema, pode omitir
		}));

		const created = await db.insert(tiposTransacao).values(newCategorias).returning({
			id: tiposTransacao.id,
			nome: tiposTransacao.nome,
			movimentoTipo: tiposTransacao.movimentoTipo
		});

		for (const cat of created) {
			const key = `${cat.nome}|${cat.movimentoTipo}`;
			categoriaMap.set(key, cat.id);
		}

		createdCategoriesCount = created.length;
	}

	// ─── 4. Agora montar todas as transações (com tipoTransacaoId resolvido) ─────
	for (const sheetName in planilhaData) {
		const { saidas, entradas } = planilhaData[sheetName];

		for (const row of saidas) {
			if (!row.categoria?.trim() || !row.data || !row.saida) continue;
			const valor = Number(row.saida);
			if (isNaN(valor) || valor <= 0) continue;

			const nomeUpper = row.categoria.trim().toUpperCase();
			const key = `${nomeUpper}|despesa`;
			const tipoId = categoriaMap.get(key);

			if (tipoId === undefined) continue; // segurança (não deve ocorrer)

			transacoesToInsert.push({
				userId,
				tipoTransacaoId: tipoId,
				valor: valor.toFixed(2),
				data: normalizarData(row.data),
				comentario: row.comentario?.trim() ?? null
			});
		}

		for (const row of entradas) {
			if (!row.categoria?.trim() || !row.data || !row.entrada) continue;
			const valor = Number(row.entrada);
			if (isNaN(valor) || valor <= 0) continue;

			const nomeUpper = row.categoria.trim().toUpperCase();
			const key = `${nomeUpper}|receita`;
			const tipoId = categoriaMap.get(key);

			if (tipoId === undefined) continue;

			transacoesToInsert.push({
				userId,
				tipoTransacaoId: tipoId,
				valor: valor.toFixed(2),
				data: normalizarData(row.data),
				comentario: row.comentario?.trim() ?? null
			});
		}
	}

	// ─── 5. Um único INSERT com todas as transações válidas ──────────────────────
	let insertedCount = 0;
	if (transacoesToInsert.length > 0) {
		await db.insert(transacoes).values(transacoesToInsert);
		insertedCount = transacoesToInsert.length;
	}

	return {
		inserted: insertedCount,
		createdCategories: createdCategoriesCount
	};
}

// ─── Helpers ────────────────────────────────────────────────────────────────────

function normalizarData(data: string | Date | null): Date {
	if (!data) {
		console.warn('Data ausente na planilha → usando data atual');
		return new Date();
	}

	if (data instanceof Date && !isNaN(data.getTime())) {
		return data;
	}

	// Tenta parsear string (dd/mm/yyyy ou outros formatos comuns)
	const parsed = new Date(data);
	if (!isNaN(parsed.getTime())) {
		return parsed;
	}

	// Tentativa explícita para formato brasileiro dd/mm/yyyy
	if (typeof data === 'string') {
		const parts = data.split(/[-/]/);
		if (parts.length === 3) {
			// Tenta dd/mm/yyyy
			const [dia, mes, ano] = parts.map(Number);
			if (dia && mes && ano) {
				const d = new Date(ano, mes - 1, dia);
				if (!isNaN(d.getTime())) return d;
			}

			// Tenta yyyy-mm-dd
			const [ano2, mes2, dia2] = parts.map(Number);
			const d2 = new Date(ano2, mes2 - 1, dia2);
			if (!isNaN(d2.getTime())) return d2;
		}
	}

	console.warn(`Data inválida na planilha: ${data} → usando data atual`);
	return new Date();
}
