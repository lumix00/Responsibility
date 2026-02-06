import { json, error } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import { transacoes } from '$lib/server/db/schema';
import { eq, sql, desc } from 'drizzle-orm';

export async function GET({ locals }) {
	const user = locals.user;

	if (!user) {
		throw error(401, 'Unauthorized');
	}

	// Alias correto: dê nome 'ano' ao extract
	const anos = await db
		.selectDistinct({
			ano: sql<number>`extract(year from ${transacoes.data})::int`.as('ano')
		})
		.from(transacoes)
		.where(eq(transacoes.userId, user.id))
		.orderBy(desc(sql`ano`)); // ou desc('ano') se preferir, mas sql`ano` funciona

	return json(anos.map((a) => a.ano));
}
