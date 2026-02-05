import { db } from '$lib/server/db';
import { tiposTransacao } from '$lib/server/db/schema';
import { eq, and, ilike } from 'drizzle-orm';
import { json } from '@sveltejs/kit';

export async function POST({ request, locals }) {
	const user = locals.user;
	if (!user) {
		return json({ message: 'Não autenticado' }, { status: 401 });
	}

	const body = await request.json();
	const { nome, movimentoTipo } = body;

	if (!nome?.trim() || !['receita', 'despesa'].includes(movimentoTipo)) {
		return json({ message: 'Dados inválidos' }, { status: 400 });
	}

	const nomeUpper = nome.trim().toUpperCase();

	const existente = await db
		.select()
		.from(tiposTransacao)
		.where(and(eq(tiposTransacao.userId, user.id), ilike(tiposTransacao.nome, nomeUpper)))
		.limit(1);
	if (existente.length > 0) {
		return json({ message: `A categoria "${existente[0].nome}" já existe` }, { status: 409 });
	}

	const [novo] = await db
		.insert(tiposTransacao)
		.values({
			userId: user.id,
			nome: nomeUpper,
			movimentoTipo
		})
		.returning();

	return json(novo);
}
