# Responsibility

[![Deploy Status](https://img.shields.io/badge/Deploy-Vercel-black?logo=vercel)](#)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

**Responsibility** é uma aplicação web moderna construída com SvelteKit. Este projeto foi configurado com um ecossistema robusto para garantir uma excelente experiência de desenvolvimento, performance e segurança.

🌍 **Live Demo:** [responsibility-six.vercel.app](https://responsibility-six.vercel.app/)

---

## 🛠️ Stack Tecnológica

Este projeto foi gerado através do Svelte CLI (`sv`) e utiliza as seguintes tecnologias:

- **Framework:** [SvelteKit](https://kit.svelte.dev/)
- **Linguagem:** [TypeScript](https://www.typescriptlang.org/)
- **Estilos:** [Tailwind CSS](https://tailwindcss.com/) (com os plugins Typography e Forms)
- **Base de Dados & ORM:** [Drizzle ORM](https://orm.drizzle.team/) integrado com PostgreSQL ([Neon](https://neon.tech/))
- **Autenticação:** [Lucia Auth](https://lucia-auth.com/)
- **Linting & Formatação:** ESLint e Prettier
- **Alojamento / Deploy:** [Vercel](https://vercel.com/) (usando o `sveltekit-adapter-vercel`)

---

## 🚀 Como Começar

Segue as instruções abaixo para configurar e rodar o projeto localmente na sua máquina.

### Pré-requisitos

Certifica-te de que tens o [Node.js](https://nodejs.org/) (versão LTS recomendada) instalado no seu sistema.

### Instalação

1. Clona o repositório:

   ```bash
   git clone [https://github.com/lumix00/Responsibility.git](https://github.com/lumix00/Responsibility.git)

   ```

2. Navega para o diretório do projeto:

```bash
cd Responsibility
```

3. Instala as dependências:

```bash
npm install
```

### Configuração do Ambiente

1. Copia o ficheiro de exemplo das variáveis de ambiente:

```bash
cp .env.example .env
```

2. Abre o ficheiro .env recém-criado e preenche as variáveis de ambiente necessárias (como as credenciais da base de dados PostgreSQL/Neon).

### Desenvolvimento Local

Para iniciares o servidor de desenvolvimento, executa:

```bash
npm run dev
```

Se quiser que o servidor abra automaticamente a aplicação num novo separador do teu navegador:

```bash
npm run dev -- --open
```

## 🏗️ Construção (Build)

Para criar uma versão de produção otimizada da sua aplicação, rode o seguinte comando:

```bash
npm run build
```
