# Finanças do Casal

App de gerenciamento financeiro para casais — Next.js + Prisma + PostgreSQL (Neon) + NextAuth.

## Passo a passo para publicar (sem instalar nada no seu computador)

### 1. Banco de dados (Neon)
1. Entre em https://neon.tech e crie um projeto novo (qualquer nome).
2. Na tela do projeto, copie a **Connection string** (começa com `postgresql://`).
3. Guarde esse link — você vai colar na Vercel no passo 3.

### 2. Subir o código para o GitHub
1. Entre em https://github.com/new e crie um repositório novo, por exemplo `casal-financas` (pode deixar privado).
2. Na página do repositório recém-criado, clique em **"uploading an existing file"**.
3. Arraste a pasta inteira `casal-financas-app` (todo o conteúdo dela) para a área de upload.
4. Clique em **Commit changes**.

### 3. Publicar na Vercel
1. Entre em https://vercel.com/new e escolha **Import Git Repository**.
2. Selecione o repositório que você acabou de criar.
3. Antes de clicar em Deploy, abra **Environment Variables** e adicione:
   - `DATABASE_URL` → cole a connection string do Neon (passo 1)
   - `NEXTAUTH_SECRET` → qualquer texto aleatório longo (ex: gere em https://generate-secret.vercel.app/32)
   - `NEXTAUTH_URL` → deixe em branco por enquanto, você ajusta depois do primeiro deploy
4. Clique em **Deploy** e aguarde. Na primeira vez ele já cria as tabelas no banco automaticamente.
5. Quando terminar, copie a URL que a Vercel te deu (ex: `https://casal-financas.vercel.app`).
6. Volte em **Project Settings → Environment Variables**, edite `NEXTAUTH_URL` com essa URL, e clique em **Redeploy**.

### 4. Usar
1. Acesse a URL do seu site.
2. Clique em **Criar conta** → escolha **Criar casal**, preencha seu nome, e-mail, senha e o nome da conta (ex: "Beatriz & João").
3. No Dashboard, copie o **código de convite** e mande para seu parceiro(a).
4. Seu parceiro(a) acessa a mesma URL, clica em **Criar conta → Entrar com código**, e usa esse código.
5. Prontos — os dois já compartilham os mesmos lançamentos, contas e saldo.

## Rodando localmente (opcional, se quiser mexer no código)
```bash
npm install
cp .env.example .env   # edite com sua DATABASE_URL do Neon
npx prisma db push
npm run dev
```

## Estrutura
- `prisma/schema.prisma` — modelo do banco (usuários, casal, contas, cartões, categorias, lançamentos, orçamentos, metas)
- `app/actions.js` — todas as regras de negócio (criar conta, lançar despesa/entrada, marcar como pago)
- `app/dashboard` — resumo do mês
- `app/lancamentos` — lista e formulário de lançamentos
- `lib/auth.js` — login (NextAuth, e-mail + senha)

## Próximos passos sugeridos
Esta é a base funcional (Fase 1 do planejamento original: login, casal, dashboard, entradas, despesas, contas, categorias). As próximas fases — cartões de crédito, orçamento por categoria, calendário, metas, previsões e insights — usam a mesma estrutura de banco (`Budget`, `Goal`, `CreditCard` já estão no schema) e podem ser adicionadas como novas páginas/telas seguindo o mesmo padrão dos arquivos existentes.
