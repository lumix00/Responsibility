import { json, error } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import { transacoes, tiposTransacao } from '$lib/server/db/schema';
import { eq, desc } from 'drizzle-orm';

export async function GET({ locals }) {
	const user = locals.user;

	if (!user) {
		throw error(401, 'Unauthorized');
	}

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
		.where(eq(transacoes.userId, user.id))
		.orderBy(desc(transacoes.data))
		.limit(10);

	return json(result);
}
