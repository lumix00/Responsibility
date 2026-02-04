import { redirect } from '@sveltejs/kit';
import * as auth from '$lib/server/auth';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async (event) => {
	const sessionId = event.locals.session?.id;

	if (sessionId) {
		await auth.invalidateSession(sessionId);
	}

	auth.deleteSessionTokenCookie(event);

	throw redirect(302, '/login');
};
