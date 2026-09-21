# FocusFlame

Extensão de navegador de foco baseada no conceito do Yeolpunta: sessões divididas em
blocos de 10 minutos, com recompensa a cada bloco concluído e conta de usuário para
guardar o progresso.

## Stack

- **Extensão**: React + TypeScript + Vite, empacotada com [CRXJS](https://crxjs.dev/vite-plugin) (Manifest V3)
- **Conta e dados**: [Supabase](https://supabase.com/) (Auth + Postgres)

## Como rodar

```bash
npm install
cp .env.example .env   # preencha VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY
npm run dev
```

Para carregar a extensão no Chrome:

1. `npm run build` (ou deixe `npm run dev` rodando — o CRXJS suporta HMR)
2. Abra `chrome://extensions`, ative o **Modo do desenvolvedor**
3. **Carregar sem compactação** → selecione a pasta `dist/`

## Scripts

| Comando                | Ação                                                 |
| ---------------------- | ---------------------------------------------------- |
| `npm run dev`          | Build de desenvolvimento com hot reload              |
| `npm run build`        | Type-check (`tsc -b`) + build de produção em `dist/` |
| `npm run lint`         | Lint com ESLint (typescript-eslint)                  |
| `npm run format`       | Formata o projeto com Prettier                       |
| `npm run format:check` | Verifica formatação sem alterar arquivos             |
| `npm run preview`      | Preview do build de produção                         |

## Estrutura

Organização em MVC (ver [AGENTS.md](./AGENTS.md#arquitetura) para detalhes e
como o SOLID se aplica a cada camada):

```
manifest.config.ts    # Manifest V3 (nome, permissões, popup, background)
src/
  models/             # Model: tipos de domínio + funções puras (FocusBlock, Reward, FocusSession)
  repositories/        # Acesso a sistemas externos por interface (AuthRepository -> SupabaseAuthRepository)
  services/            # Regra de negócio sem I/O (RewardStrategy -> FlameRewardStrategy)
  controllers/          # Controller: hooks React (useAuthController, useFocusSessionController, useBlockTimer)
  views/                # View: componentes apresentacionais (AuthView, TimerView, BlockGridView, RewardsListView)
  popup/                # Composition root exibido ao clicar no ícone da extensão
    App.tsx
  background/           # Service worker (MV3)
  lib/
    supabase.ts          # Fábrica do cliente Supabase
```
