# CifraWealth — Tela de Cadastro

Recriação em React + TypeScript da tela de cadastro do SmartFinance, com fidelidade visual ao design de referência.

## Stack

- React 18 + TypeScript
- Vite
- React Router (rotas `/register` e `/login`)
- Tailwind CSS
- lucide-react (ícones)

## Como rodar

```bash
npm install
npm run dev
```

Acesse `http://localhost:5173`.

## Scripts

- `npm run dev` — ambiente de desenvolvimento
- `npm run build` — build de produção (`tsc -b && vite build`)
- `npm run preview` — pré-visualiza o build
- `npm run lint` — ESLint

## Integração futura com backend

O formulário (`src/components/RegisterForm/RegisterForm.tsx`) mantém todo o estado localmente via `useRegisterForm` e só chama `handleValidSubmit(data)` quando a validação passa. Não há chamada de API, autenticação ou lógica de negócio — basta substituir `handleValidSubmit` pela chamada real ao backend Node.js + TypeScript.

## Estrutura

```
src/
  components/   componentes reutilizáveis (um por pasta)
  pages/        RegisterPage e LoginPage (placeholder)
  hooks/        useRegisterForm, usePasswordStrength
  utils/        validation.ts
  types/        form.types.ts
  styles/       global.css (Tailwind + fonte Inter)
```

## Responsividade

- Desktop (`lg+`): duas colunas, igual ao design de referência.
- Tablet (`md`): colunas empilhadas, espaçamentos proporcionais.
- Mobile: coluna única, cartão de cadastro em largura total (`max-w-md`).
