import { db } from '$lib/server/db';
import { tiposTransacao } from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';
import { json, error } from '@sveltejs/kit';

export async function GET({ locals }) {
	const user = locals.user;
	if (!user) {
		throw error(401, { message: 'Não autenticado' });
	}

	const categorias = await db
		.select({
			id: tiposTransacao.id,
			nome: tiposTransacao.nome,
			movimentoTipo: tiposTransacao.movimentoTipo
		})
		.from(tiposTransacao)
		.where(eq(tiposTransacao.userId, user.id))
		.orderBy(tiposTransacao.nome);

	return json(categorias);
}
