import { pgTable, text, integer, decimal, timestamp, pgEnum, serial } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

export const movimentoTipoEnum = pgEnum('movimento_tipo', ['receita', 'despesa']);

export const user = pgTable('user', {
	id: text('id').primaryKey(),
	age: integer('age'),
	username: text('username').notNull().unique(),
	passwordHash: text('password_hash').notNull()
});

export const session = pgTable('session', {
	id: text('id').primaryKey(),
	userId: text('user_id')
		.notNull()
		.references(() => user.id),
	expiresAt: timestamp('expires_at', { withTimezone: true, mode: 'date' }).notNull()
});

export type Session = typeof session.$inferSelect;
export type User = typeof user.$inferSelect;

export const tiposTransacao = pgTable('tipos_transacao', {
	id: serial('id').primaryKey(),

	userId: text('user_id')
		.notNull()
		.references(() => user.id, { onDelete: 'cascade' }),

	nome: text('nome').notNull(), // ex: "Salário", "Aluguel", "Mercado", "Freelance"

	movimentoTipo: movimentoTipoEnum('movimento_tipo').notNull(), // 'receita' ou 'despesa'

	createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
	updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull()
});

// Nova tabela: transações
export const transacoes = pgTable('transacoes', {
	id: serial('id').primaryKey(),

	userId: text('user_id')
		.notNull()
		.references(() => user.id, { onDelete: 'cascade' }),

	tipoTransacaoId: integer('tipo_transacao_id')
		.notNull()
		.references(() => tiposTransacao.id, { onDelete: 'restrict' }),

	valor: decimal('valor', { precision: 12, scale: 2 }).notNull(),

	data: timestamp('data', { withTimezone: true, mode: 'date' }).notNull(),

	comentario: text('comentario'),

	createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
	updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull()
});

// Relações (adicione no final do arquivo)
export const userRelations = relations(user, ({ many }) => ({
	sessions: many(session), // se quiser, opcional
	tiposTransacao: many(tiposTransacao),
	transacoes: many(transacoes)
}));

export const tiposTransacaoRelations = relations(tiposTransacao, ({ one, many }) => ({
	user: one(user, {
		fields: [tiposTransacao.userId],
		references: [user.id]
	}),
	transacoes: many(transacoes)
}));

export const transacoesRelations = relations(transacoes, ({ one }) => ({
	user: one(user, {
		fields: [transacoes.userId],
		references: [user.id]
	}),
	tipoTransacao: one(tiposTransacao, {
		fields: [transacoes.tipoTransacaoId],
		references: [tiposTransacao.id]
	})
}));

// Tipos inferidos (úteis para tipagem forte)
export type TipoTransacao = typeof tiposTransacao.$inferSelect;
export type NewTipoTransacao = typeof tiposTransacao.$inferInsert;

export type Transacao = typeof transacoes.$inferSelect;
export type NewTransacao = typeof transacoes.$inferInsert;
