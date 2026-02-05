// src/routes/api/tipos-transacao/[id]/+server.ts
import { db } from '$lib/server/db';
import { tiposTransacao, transacoes } from '$lib/server/db/schema';
import { eq, and, sql } from 'drizzle-orm';
import { json, error } from '@sveltejs/kit';

export async function DELETE({ params, locals }) {
	const user = locals.user;
	if (!user) {
		throw error(401, { message: 'Não autenticado' });
	}

	const id = Number(params.id);
	if (isNaN(id) || id <= 0) {
		throw error(400, { message: 'ID inválido' });
	}

	// Verifica se a categoria existe e pertence ao usuário
	const [categoria] = await db
		.select()
		.from(tiposTransacao)
		.where(and(eq(tiposTransacao.id, id), eq(tiposTransacao.userId, user.id)))
		.limit(1);

	if (!categoria) {
		throw error(404, { message: 'Categoria não encontrada ou não pertence a você' });
	}

	// Verifica se há transações associadas (para evitar deleção acidental de dados importantes)
	const [temTransacoes] = await db
		.select({ count: sql`count(*)` })
		.from(transacoes)
		.where(eq(transacoes.tipoTransacaoId, id))
		.limit(1);

	if (Number(temTransacoes?.count) > 0) {
		throw error(409, {
			message: 'Não é possível excluir esta categoria porque ela já possui transações associadas.'
		});
	}

	// Deleta
	await db
		.delete(tiposTransacao)
		.where(and(eq(tiposTransacao.id, id), eq(tiposTransacao.userId, user.id)));

	return json({ success: true, message: `Categoria "${categoria.nome}" excluída com sucesso` });
}
