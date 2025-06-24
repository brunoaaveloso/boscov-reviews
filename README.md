# BoscovFilmes

Bem-vindo ao projeto **BoscovFilmes**!

Este repositório contém o código-fonte de um aplicativo web desenvolvido com **Vite**, **TypeScript**, **React**, **shadcn-ui** e **Tailwind CSS**.

---

## 🚀 Como rodar este projeto localmente

### 1. Clone o repositório

```bash
git clone https://github.com/Kitotsui/boscov-reviews.git
cd boscov-reviews
```

### 2. Instale as dependências

```bash
npm install
```

### 3. Configure as variáveis de ambiente

Crie um arquivo `.env` na raiz do projeto e configure suas variáveis de ambiente (você pode usar um arquivo `.env.example` como base).

### 4. ⚠️ PULAR ESTA ETAPA! BANCO JÁ CONFIGURADO NO SUPABASE

O banco de dados já está configurado e populado no Supabase, portanto **não é necessário rodar migrations ou seed localmente**.

Caso haja alterações no schema do Prisma e você seja o responsável por aplicar as mudanças, pode executar:

```bash
npx prisma migrate dev --name init
```

> **Atenção:** este comando cria e aplica migrations no banco e pode alterar dados existentes.

Para popular o banco com dados iniciais (seed):

```bash
npx prisma db seed
```

> **Nota:** o comando `db seed` pode limpar dados existentes, use com cuidado.

### 5. Gere o Prisma Client

```bash
npx prisma generate
```

### 6. Inicie o projeto

- Para rodar o frontend:

```bash
npm run dev
```

- Para rodar o backend:

```bash
npm run dev:server
```

O servidor iniciará em modo desenvolvimento com recarregamento automático (hot reload).

---

## 🛠 Tecnologias utilizadas

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS
- Prisma
- PostgreSQL

---
