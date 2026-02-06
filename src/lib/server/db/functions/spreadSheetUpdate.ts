// src/lib/server/db/functions/spreadSheetUpdate.ts

import { db } from '$lib/server/db'; // ajuste o import conforme sua estrutura (drizzle db instance)
import { tiposTransacao, transacoes } from '$lib/server/db/schema'; // ajuste o caminho do schema
import { eq, and } from 'drizzle-orm';
import type { InferInsertModel } from 'drizzle-orm';

// Tipos baseados no seu schema
type NewTransacao = InferInsertModel<typeof transacoes>;

// Interface para os dados que vêm da planilha (baseado no seu parsing)
interface PlanilhaMovimento {
	comentario: string | null;
	categoria: string | null;
	data: string | Date | null; // XLSX pode vir como Date ou string
	saida?: number | string | null; // pode ser string por causa do parsing
	entrada?: number | string | null;
}

interface PlanilhaData {
	saidas: PlanilhaMovimento[];
	entradas: PlanilhaMovimento[];
}

/**
 * Processa os dados da planilha e atualiza o banco:
 * - Cria categorias (tipos_transacao) se não existirem
 * - Insere as transações vinculadas
 */
export async function spreadSheetUpdate(
	userId: string,
	planilhaData: Record<string, PlanilhaData> // { [sheetName: string]: { saidas: [], entradas: [] } }
): Promise<{ inserted: number; createdCategories: number }> {
	let totalInserted = 0;
	const totalCreatedCategories = 0;

	// Processa cada aba da planilha
	for (const sheetName in planilhaData) {
		const { saidas, entradas } = planilhaData[sheetName];

		// ─── 1. Processar SAÍDAS (despesas) ───────────────────────────────────────
		for (const row of saidas) {
			if (!row.categoria?.trim() || !row.data || !row.saida) continue;

			const valor = Number(row.saida);
			if (isNaN(valor) || valor <= 0) continue;

			const categoriaNome = row.categoria.trim();

			// Busca ou cria a categoria (despesa)
			const tipoId = await findOrCreateCategoria(userId, categoriaNome, 'despesa');

			// Prepara a transação
			const transacao: NewTransacao = {
				userId,
				tipoTransacaoId: tipoId,
				valor: valor.toFixed(2), // decimal no banco
				data: normalizarData(row.data),
				comentario: row.comentario?.trim() ?? null
			};

			await db.insert(transacoes).values(transacao);
			totalInserted++;
		}

		// ─── 2. Processar ENTRADAS (receitas) ─────────────────────────────────────
		for (const row of entradas) {
			if (!row.categoria?.trim() || !row.data || !row.entrada) continue;

			const valor = Number(row.entrada);
			if (isNaN(valor) || valor <= 0) continue;

			const categoriaNome = row.categoria.trim();

			// Busca ou cria a categoria (receita)
			const tipoId = await findOrCreateCategoria(userId, categoriaNome, 'receita');

			const transacao: NewTransacao = {
				userId,
				tipoTransacaoId: tipoId,
				valor: valor.toFixed(2),
				data: normalizarData(row.data),
				comentario: row.comentario?.trim() ?? null
			};

			await db.insert(transacoes).values(transacao);
			totalInserted++;
		}
	}

	return {
		inserted: totalInserted,
		createdCategories: totalCreatedCategories
	};
}

// ─── Helpers ────────────────────────────────────────────────────────────────

async function findOrCreateCategoria(
	userId: string,
	nome: string,
	movimentoTipo: 'receita' | 'despesa'
): Promise<number> {
	const existing = await db
		.select({ id: tiposTransacao.id })
		.from(tiposTransacao)
		.where(
			and(
				eq(tiposTransacao.userId, userId),
				eq(tiposTransacao.nome, nome),
				eq(tiposTransacao.movimentoTipo, movimentoTipo)
			)
		)
		.limit(1);

	if (existing.length > 0) {
		return existing[0].id;
	}

	// Cria nova categoria
	const [newTipo] = await db
		.insert(tiposTransacao)
		.values({
			userId,
			nome,
			movimentoTipo
		})
		.returning({ id: tiposTransacao.id });

	// totalCreatedCategories++; // se quiser contar no escopo superior, passe como ref ou use outro mecanismo
	return newTipo.id;
}

function normalizarData(data: string | Date | null): Date {
	if (!data) return new Date(); // fallback (ou throw error)

	if (data instanceof Date) {
		return data;
	}

	// Tenta parsear strings comuns (dd/mm/yyyy, etc.)
	const parsed = new Date(data);
	if (!isNaN(parsed.getTime())) {
		return parsed;
	}

	// Caso XLSX tenha vindo como string no formato desejado
	const [dia, mes, ano] = data.split('/');
	if (dia && mes && ano) {
		const d = new Date(Number(ano), Number(mes) - 1, Number(dia));
		if (!isNaN(d.getTime())) return d;
	}

	console.warn(`Data inválida na planilha: ${data} → usando data atual`);
	return new Date();
}
