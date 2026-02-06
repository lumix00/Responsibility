import { json, error } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import { transacoes, tiposTransacao } from '$lib/server/db/schema';
import { eq, sql, and } from 'drizzle-orm';

export async function GET({ locals, params }) {
	const user = locals.user;

	if (!user) {
		throw error(401, 'Unauthorized');
	}

	const year = parseInt(params.year);
	if (isNaN(year)) {
		throw error(400, 'Invalid year');
	}

	const receitas = await db
		.select({
			nome: tiposTransacao.nome,
			total: sql`sum(${transacoes.valor})::decimal`.as('total')
		})
		.from(transacoes)
		.innerJoin(tiposTransacao, eq(transacoes.tipoTransacaoId, tiposTransacao.id))
		.where(
			and(
				eq(transacoes.userId, user.id),
				eq(tiposTransacao.movimentoTipo, 'receita'),
				sql`extract(year from ${transacoes.data}) = ${year}`
			)
		)
		.groupBy(tiposTransacao.nome);

	const despesas = await db
		.select({
			nome: tiposTransacao.nome,
			total: sql`sum(${transacoes.valor})::decimal`.as('total')
		})
		.from(transacoes)
		.innerJoin(tiposTransacao, eq(transacoes.tipoTransacaoId, tiposTransacao.id))
		.where(
			and(
				eq(transacoes.userId, user.id),
				eq(tiposTransacao.movimentoTipo, 'despesa'),
				sql`extract(year from ${transacoes.data}) = ${year}`
			)
		)
		.groupBy(tiposTransacao.nome);

	return json({
		receitas: receitas.map((r) => ({ nome: r.nome, total: r.total })),
		despesas: despesas.map((d) => ({ nome: d.nome, total: d.total }))
	});
}
