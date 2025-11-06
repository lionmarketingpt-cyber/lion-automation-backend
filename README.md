# Lion Board

Lion Board é um painel Kanban inspirado no Trello e pensado para planejamento de marketing. A aplicação ajuda agências e pequenos negócios a:

- Cadastrar clientes;
- Visualizar um board com listas pré-configuradas para feed, stories e outras frentes;
- Movimentar cards via drag & drop;
- Usar a IA da OpenAI para gerar planejamentos mensais, legendas e roteiros de Reels.

## Stack principal

- [Next.js 14 (App Router)](https://nextjs.org/)
- [TypeScript](https://www.typescriptlang.org/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Prisma ORM](https://www.prisma.io/)
- [SQLite](https://www.sqlite.org/) (fácil de trocar para PostgreSQL)
- [NextAuth](https://next-auth.js.org/) com provider de credenciais
- [OpenAI oficial para Node/TypeScript](https://www.npmjs.com/package/openai)

## Pré-requisitos

- Node.js 18+ (recomendado 18.17 ou superior)
- npm 9+
- Conta e chave de API da OpenAI

## Configuração

1. Clone o repositório e instale as dependências:

   ```bash
   git clone <seu-fork-ou-repo>
   cd lion-automation-backend
   npm install
   ```

2. Copie o arquivo `.env.example` para `.env` e ajuste as variáveis:

   ```bash
   cp .env.example .env
   ```

   Campos necessários:

   - `DATABASE_URL` – por padrão `file:./dev.db` (SQLite local).
   - `DATABASE_PROVIDER` – mantenha `sqlite` ou defina `postgresql` quando migrar.
   - `NEXTAUTH_SECRET` – gere um valor seguro (`openssl rand -base64 32`).
   - `OPENAI_API_KEY` – chave da sua conta OpenAI.

3. Execute as migrações do Prisma e gere o banco local:

   ```bash
   npx prisma migrate dev
   ```

4. Rode o script de seed para criar o usuário padrão:

   ```bash
   npm run prisma:seed
   ```

   Usuário de teste:

   - **E-mail:** `admin@lionboard.test`
   - **Senha:** `admin123`

5. Inicie o servidor de desenvolvimento:

   ```bash
   npm run dev
   ```

6. Acesse `http://localhost:3000` no navegador.

## Fluxo sugerido

1. Faça login com o usuário de seed ou crie uma nova conta.
2. Cadastre um cliente para gerar automaticamente o board com listas padrão.
3. Clique em "Assistente de Planejamento (IA)" para enviar o briefing e gerar cards automáticos.
4. Abra qualquer card para editar detalhes, definir status e gerar legendas/roteiros via IA.
5. Arraste cards entre listas para acompanhar o andamento do mês.

## Estrutura de pastas

```
app/
  (auth)/login
  (auth)/register
  (dashboard)/dashboard
  clients/[clientId]/board
  actions.ts
components/
  auth/
  board/
  add-client-dialog.tsx
  client-card.tsx
  logout-button.tsx
lib/
  auth.ts
  board.ts
  hash.ts
  openai.ts
  prisma.ts
prisma/
  schema.prisma
  seed.ts
```

## Migração para PostgreSQL

O projeto utiliza SQLite por padrão. Para migrar para PostgreSQL:

1. Atualize `DATABASE_PROVIDER="postgresql"` e `DATABASE_URL` no `.env`.
2. Ajuste as migrações com `npx prisma migrate deploy`.
3. Rode `npm run build && npm start` para testar o build em produção.

## Deploy

A aplicação está pronta para ser deployada em serviços como [Vercel](https://vercel.com/) ou [Netlify](https://www.netlify.com/). Configure as variáveis de ambiente e o banco (PostgreSQL recomendado) antes do deploy.

## Scripts úteis

- `npm run dev` – inicia o Next.js em modo desenvolvimento.
- `npm run build` – gera a build de produção.
- `npm run start` – sobe o servidor após o build.
- `npm run prisma:migrate` – roda `prisma migrate dev`.
- `npm run prisma:generate` – gera o client Prisma.
- `npm run prisma:seed` – executa o seed (`tsx prisma/seed.ts`).

## Observações

- Para uso em produção, configure HTTPS e um provedor de banco robusto (PostgreSQL gerenciado).
- Garanta que a chave da OpenAI esteja ativa e com limites adequados.
- Ajuste prompts em `lib/openai.ts` conforme o tom desejado da agência.

Bom planejamento! 🦁
