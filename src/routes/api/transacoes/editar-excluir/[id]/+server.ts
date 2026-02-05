import { json, type RequestHandler } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import { transacoes } from '$lib/server/db/schema';
import { eq, and } from 'drizzle-orm';

export const DELETE: RequestHandler = async ({ params, locals }) => {
	const id = Number(params.id);
	if (!id || isNaN(id)) {
		return json({ error: 'ID inválido' }, { status: 400 });
	}

	const user = locals.user;
	if (!user) {
		return json({ error: 'Não autorizado' }, { status: 401 });
	}

	try {
		const result = await db
			.delete(transacoes)
			.where(and(eq(transacoes.id, id), eq(transacoes.userId, user.id)))
			.returning({ id: transacoes.id });

		if (result.length === 0) {
			return json(
				{ error: 'Transação não encontrada ou não pertence ao usuário' },
				{ status: 404 }
			);
		}

		return json({ success: true, deletedId: id });
	} catch (err) {
		console.error('Erro ao excluir:', err);
		return json({ error: 'Erro interno ao excluir transação' }, { status: 500 });
	}
};

export const PATCH: RequestHandler = async ({ params, request, locals }) => {
	const id = Number(params.id);
	if (!id || isNaN(id)) {
		return json({ error: 'ID inválido' }, { status: 400 });
	}

	const user = locals.user;
	if (!user) {
		return json({ error: 'Não autorizado' }, { status: 401 });
	}

	let body;
	try {
		body = await request.json();
	} catch {
		return json({ error: 'Corpo da requisição inválido' }, { status: 400 });
	}

	// Tipo seguro para updates
	const updates: Partial<{
		valor: string;
		data: Date;
		comentario: string | null;
		tipoTransacaoId: number;
	}> = {};

	if ('valor' in body) {
		const valorStr = String(body.valor).trim();
		if (!/^\d+(\.\d{1,2})?$/.test(valorStr)) {
			return json({ error: 'Valor inválido (use formato 123.45)' }, { status: 400 });
		}
		updates.valor = valorStr;
	}

	if ('data' in body) {
		const dataStr = String(body.data).trim();
		if (isNaN(Date.parse(dataStr))) {
			return json({ error: 'Data inválida' }, { status: 400 });
		}
		updates.data = new Date(dataStr);
	}

	if ('comentario' in body) {
		const comentario = String(body.comentario ?? '').trim();
		if (comentario.length > 500) {
			return json({ error: 'Comentário muito longo (máx 500 caracteres)' }, { status: 400 });
		}
		updates.comentario = comentario || null;
	}

	if ('tipoTransacaoId' in body) {
		const tipoId = Number(body.tipoTransacaoId);
		if (!Number.isInteger(tipoId) || tipoId <= 0) {
			return json({ error: 'tipoTransacaoId inválido' }, { status: 400 });
		}
		updates.tipoTransacaoId = tipoId;
	}

	if (Object.keys(updates).length === 0) {
		return json({ error: 'Nenhum campo válido para atualizar' }, { status: 400 });
	}

	try {
		const updated = await db
			.update(transacoes)
			.set({
				...updates,
				updatedAt: new Date()
			})
			.where(and(eq(transacoes.id, id), eq(transacoes.userId, user.id)))
			.returning({
				id: transacoes.id,
				valor: transacoes.valor,
				data: transacoes.data,
				comentario: transacoes.comentario,
				tipoTransacaoId: transacoes.tipoTransacaoId
			});

		if (updated.length === 0) {
			return json(
				{ error: 'Transação não encontrada ou não pertence ao usuário' },
				{ status: 404 }
			);
		}

		return json({ success: true, transacao: updated[0] });
	} catch (err) {
		console.error('Erro ao atualizar:', err);
		return json({ error: 'Erro interno ao atualizar transação' }, { status: 500 });
	}
};
