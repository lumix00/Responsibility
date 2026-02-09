import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import * as XLSX from 'xlsx';
import { spreadSheetUpdate } from '@/server/db/functions/spreadSheetUpdate';

export const POST: RequestHandler = async ({ request, locals }) => {
	try {
		const user = locals.user;

		if (!user) {
			return json({ success: false, error: 'Nenhum usuário logado' }, { status: 400 });
		}
		const formData = await request.formData();
		const file = formData.get('planilha') as File | null;

		if (!file) {
			return json({ success: false, error: 'Nenhum arquivo enviado' }, { status: 400 });
		}

		if (!file.name.toLowerCase().endsWith('.xlsx')) {
			return json({ success: false, error: 'Apenas .xlsx permitido' }, { status: 400 });
		}

		const arrayBuffer = await file.arrayBuffer();
		const buffer = Buffer.from(arrayBuffer);

		const workbook = XLSX.read(buffer, {
			type: 'buffer',
			cellDates: true,
			cellNF: false,
			cellText: false,
			dateNF: 'dd/mm/yyyy' // formato desejado para datas
		});

		const result = {
			filename: file.name,
			size: file.size,
			lastModified: file.lastModified,
			sheets: {}
		};

		workbook.SheetNames.forEach((sheetName) => {
			const ws = workbook.Sheets[sheetName];

			const range = XLSX.utils.decode_range(ws['!ref'] || 'A1');

			// ─── Saídas ──────────────────────────────────────────────
			// colunas B até E → índices 1 a 4 (0-based)
			const saidaRange = {
				s: { r: 4, c: 1 }, // linha 5 (índice 4), coluna B (1)
				e: { r: range.e.r, c: 4 } // até coluna E (índice 4)
			};

			const saidaJson = XLSX.utils.sheet_to_json(ws, {
				header: ['comentario', 'categoria', 'data', 'saida'],
				range: saidaRange,
				raw: false,
				defval: null,
				blankrows: false
			});

			// Filtra apenas linhas que têm valor em 'saida' (não vazio/nulo)
			const saidasFiltradas = saidaJson.filter((row) => {
				//@ts-expect-error //REMOVE
				const v = row.saida;
				return v !== null && v !== undefined && v !== '' && v !== 0 && v !== '0';
			});

			// ─── Entradas ─────────────────────────────────────────────
			const entradaRange = {
				s: { r: 4, c: 6 }, // linha 4, coluna G (6)
				e: { r: range.e.r, c: 9 } // até coluna J (9), ajuste se necessário
			};

			const entradaJson = XLSX.utils.sheet_to_json(ws, {
				header: ['comentario', 'categoria', 'data', 'entrada'],
				range: entradaRange,
				raw: false,
				defval: null,
				blankrows: false
			});

			const entradasFiltradas = entradaJson.filter((row) => {
				//@ts-expect-error //REMOVE
				const v = row.entrada;
				return v !== null && v !== undefined && v !== '' && v !== 0 && v !== '0';
			});

			//@ts-expect-error //REMOVE
			result.sheets[sheetName] = {
				saidas: saidasFiltradas,
				entradas: entradasFiltradas
			};
		});

		// A FUNÇÃO IRA VIR AQUI PARA PROCESSAR OS DADOS E SALVAR NO BANCO
		const planilhaData = result.sheets;
		const updateResult = await spreadSheetUpdate(user.id, planilhaData);

		return json({
			success: true,
			updateResult
		});
	} catch (error) {
		console.error('Erro ao processar XLSX:', error);
		return json(
			{
				success: false,
				error: 'Falha ao ler a planilha',
				details: error instanceof Error ? error.message : String(error)
			},
			{ status: 500 }
		);
	}
};
