import { redirect } from '@sveltejs/kit';
import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async ({ locals, url }) => {
	if (!locals.user && !['/login', '/signup'].includes(url.pathname)) {
		throw redirect(302, '/login');
	}

	// Opcional: se quiser passar o usuário para todas as páginas protegidas
	return {
		user: locals.user
	};
};
