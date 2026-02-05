CREATE TYPE "public"."movimento_tipo" AS ENUM('receita', 'despesa');--> statement-breakpoint
CREATE TABLE "tipos_transacao" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"nome" text NOT NULL,
	"movimento_tipo" "movimento_tipo" NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "transacoes" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"tipo_transacao_id" integer NOT NULL,
	"valor" numeric(12, 2) NOT NULL,
	"data" timestamp with time zone NOT NULL,
	"comentario" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
DROP TABLE "session" CASCADE;--> statement-breakpoint
ALTER TABLE "tipos_transacao" ADD CONSTRAINT "tipos_transacao_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "transacoes" ADD CONSTRAINT "transacoes_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "transacoes" ADD CONSTRAINT "transacoes_tipo_transacao_id_tipos_transacao_id_fk" FOREIGN KEY ("tipo_transacao_id") REFERENCES "public"."tipos_transacao"("id") ON DELETE restrict ON UPDATE no action;