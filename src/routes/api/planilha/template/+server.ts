import { error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';

const TEMPLATE_PATH = join(
	process.cwd(),
	'src',
	'lib',
	'server',
	'planilha',
	'Responsabilty-six.xlsx'
);

export const GET: RequestHandler = async () => {
	try {
		const buffer = await readFile(TEMPLATE_PATH);

		return new Response(buffer, {
			status: 200,
			headers: {
				'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
				'Content-Disposition': 'attachment; filename="Modelo_Responsability_Six.xlsx"',
				'Content-Length': buffer.byteLength.toString(),
				'Cache-Control': 'public, max-age=3600' // cache de 1 hora é ok para template
			}
		});
	} catch (err) {
		console.error('[Template Download]', err);
		throw error(500, { message: 'Falha ao carregar o modelo de planilha' });
	}
};
