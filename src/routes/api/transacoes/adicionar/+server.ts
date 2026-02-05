import { db } from '$lib/server/db';
import { tiposTransacao, transacoes } from '$lib/server/db/schema';
import { eq, and } from 'drizzle-orm';
import { json, error } from '@sveltejs/kit';

export async function POST({ request, locals }) {
	const user = locals.user;
	if (!user) {
		throw error(401, { message: 'Não autenticado' });
	}

	const body = await request.json();
	const { tipoTransacaoId, valor, data, comentario } = body;

	if (
		!tipoTransacaoId ||
		typeof valor !== 'number' ||
		isNaN(valor) ||
		!data ||
		typeof data !== 'string'
	) {
		throw error(400, { message: 'Dados inválidos' });
	}

	// Verifica se o tipo pertence ao usuário (segurança extra)
	const [tipoExiste] = await db
		.select()
		.from(tiposTransacao)
		.where(and(eq(tiposTransacao.id, tipoTransacaoId), eq(tiposTransacao.userId, user.id)))
		.limit(1);

	if (!tipoExiste) {
		throw error(403, { message: 'Categoria inválida ou não pertence a você' });
	}

	try {
		const [novaTransacao] = await db
			.insert(transacoes)
			.values({
				userId: user.id,
				tipoTransacaoId: Number(tipoTransacaoId),
				valor: valor.toFixed(2), // decimal como string
				data: new Date(data),
				comentario: comentario || null
			})
			.returning();

		return json({
			success: true,
			transacao: novaTransacao
		});
	} catch (err) {
		console.error(err);
		throw error(500, { message: 'Erro interno ao salvar transação' });
	}
}
