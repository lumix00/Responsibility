import { json, error } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import { transacoes, tiposTransacao } from '$lib/server/db/schema';
import { eq, desc, gte, and } from 'drizzle-orm';

export async function GET({ locals }) {
	const user = locals.user;

	if (!user) {
		throw error(401, 'Unauthorized');
	}

	const twelveMonthsAgo = new Date();
	twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 12);

	const result = await db
		.select({
			id: transacoes.id,
			valor: transacoes.valor,
			data: transacoes.data,
			nome: tiposTransacao.nome,
			movimentoTipo: tiposTransacao.movimentoTipo,
			comentario: transacoes.comentario
		})
		.from(transacoes)
		.innerJoin(tiposTransacao, eq(transacoes.tipoTransacaoId, tiposTransacao.id))
		.where(and(eq(transacoes.userId, user.id), gte(transacoes.data, twelveMonthsAgo)))
		.orderBy(desc(transacoes.data));

	return json(result);
}
