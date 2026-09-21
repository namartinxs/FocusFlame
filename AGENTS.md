# AGENTS.md

Guia para agentes de IA (e humanos) trabalhando neste repositório.

## Visão geral

FocusFlame é uma extensão de navegador (Manifest V3) para sessões de foco
divididas em blocos de 10 minutos, inspirada no app Yeolpunta. Cada bloco
concluído gera uma recompensa. O usuário cria uma conta para que o progresso
persista entre dispositivos.

## Regras

- **Nunca commitar segredos.** `.env` já está no `.gitignore` — antes de
  qualquer `git add -A`, rode `git status` e confira que nenhuma chave do
  Supabase (`VITE_SUPABASE_URL`/`VITE_SUPABASE_ANON_KEY`) foi staged.
- **Sempre validar com `npm run build`** (não só `tsc` ou `vite build`
  isolados) antes de considerar uma mudança pronta — ele roda o type-check
  completo via project references (`tsconfig.app.json` + `tsconfig.node.json`)
  e depois o bundle da extensão. Rode também `npm run lint`.
- **Peça confirmação antes de**: dar push, criar/alterar o repositório remoto,
  ou qualquer ação que afete o GitHub público (`github.com/namartinxs/FocusFlame`).
- **Permissões do manifest mínimas.** Só adicione uma entrada em
  `permissions` (`manifest.config.ts`) quando uma feature realmente precisar
  dela. Hoje: `storage` e `alarms` (`alarms` ainda não é usado — está
  reservado para o timer continuar rodando em background).
- **Não persista dados sensíveis do usuário fora do Supabase** (ex.: nada de
  guardar senha/token em `chrome.storage` além do necessário para a sessão
  do Supabase Auth).
- Sem suíte de testes automatizados ainda — `npm run build` + `npm run lint`
  são as únicas verificações de correção disponíveis. Se adicionar testes,
  documente aqui o comando para rodá-los.
- **Proibido usar `any`.** A regra `@typescript-eslint/no-explicit-any` está
  configurada como `error` em `eslint.config.js` — tipar de verdade (ou usar
  `unknown` + narrowing) em vez de `any`.

## Stack

| Camada                               | Tecnologia                                                    |
| ------------------------------------ | ------------------------------------------------------------- |
| UI / lógica da extensão              | React 19 + TypeScript                                         |
| Build / bundling                     | Vite 8                                                        |
| Empacotamento como extensão MV3      | [CRXJS](https://crxjs.dev/vite-plugin) (`@crxjs/vite-plugin`) |
| Conta de usuário                     | Supabase Auth                                                 |
| Dados (sessões, blocos, recompensas) | Supabase Postgres                                             |
| Lint                                 | ESLint + typescript-eslint                                    |
| Formatação                           | Prettier                                                      |

## Comandos

```bash
npm install
npm run dev       # build de dev com HMR (CRXJS recarrega a extensão sozinho)
npm run build         # tsc -b (type-check) + vite build -> dist/
npm run lint          # ESLint (typescript-eslint)
npm run format        # Prettier --write
npm run format:check  # Prettier --check (usar em CI)
npm run preview       # preview de um build de produção
```

Para verificar manualmente no navegador: `npm run build`, depois carregar a
pasta `dist/` como extensão não compactada em `chrome://extensions`
(Modo do desenvolvedor → Carregar sem compactação).

## Arquitetura

O código de domínio/UI segue **MVC**, organizado em módulos por
responsabilidade sob `src/` (não por feature) — cada camada só conhece a
camada abaixo dela:

```
views ──uses──▶ controllers ──uses──▶ services / repositories ──uses──▶ models
(React)         (hooks)               (regra de negócio / I/O)          (dados puros)
```

- **`src/models/`** (Model) — tipos de domínio + funções puras de
  transformação, sem React e sem I/O: `FocusBlock.ts` (`createFocusBlocks`,
  `completeBlock`), `Reward.ts`, `FocusSession.ts`.
- **`src/repositories/`** — abstração sobre sistemas externos.
  `AuthRepository.ts` é a interface (`getSession`, `onAuthStateChange`,
  `signIn`, `signUp`); `SupabaseAuthRepository.ts` é a única implementação
  hoje, usando o cliente de `src/lib/supabase.ts`. Controllers dependem da
  interface, nunca do Supabase diretamente.
- **`src/services/`** — regra de negócio que não é acesso a dados nem
  estado de UI. `RewardService.ts` define `RewardStrategy` (interface) e
  `FlameRewardStrategy` (implementação atual de "qual recompensa dar ao
  concluir um bloco").
- **`src/controllers/`** (Controller) — hooks React que ligam
  models/services/repositories às views e expõem estado + ações prontos
  para renderizar:
  - `useBlockTimer.ts` — contagem regressiva de um bloco
    (`BLOCK_DURATION_SECONDS` = 600s), dispara `onBlockComplete` ao zerar.
  - `useAuthController.ts` — estado de sessão/loading/erro, chama
    `AuthRepository` (recebido por parâmetro, com `SupabaseAuthRepository`
    como default).
  - `useFocusSessionController.ts` — compõe `useBlockTimer` + os models de
    bloco + `RewardStrategy` (idem, injetada com default) para expor
    blocos, bloco ativo e recompensas.
- **`src/views/`** (View) — componentes React puramente apresentacionais:
  `AuthView`, `TimerView`, `BlockGridView`, `RewardsListView`. Recebem tudo
  por props; não importam `lib/supabase` nem repositórios/services
  diretamente. `AuthView` mantém apenas estado efêmero de formulário
  (email/senha/modo) — estado de domínio vive no controller.
- **`src/popup/App.tsx`** — composition root do popup: chama
  `useAuthController`/`useFocusSessionController` e decide qual view
  renderizar. Fino de propósito — não deve ganhar lógica de negócio própria.
- **`src/background/index.ts`** — o service worker MV3. Hoje só loga no
  install; é aqui que deve morar a lógica de timer/alarm entre ciclos de
  vida do popup, quando implementada (usando `chrome.alarms`).
- **`src/lib/supabase.ts`** — só a fábrica do cliente Supabase, a partir de
  `import.meta.env.VITE_SUPABASE_URL` / `VITE_SUPABASE_ANON_KEY` (o Vite só
  expõe env vars prefixadas com `VITE_`). Copie `.env.example` para `.env`
  (gitignored) e preencha URL/anon key de um projeto para rodar auth local.
  Ainda não existe schema no Postgres — desenhar as tabelas de
  sessões/blocos/recompensas (e um `SessionRepository` para persisti-las,
  seguindo o mesmo padrão de `AuthRepository`) é trabalho em aberto.
- **`manifest.config.ts`** — o manifest MV3, definido com `defineManifest`
  do CRXJS em vez de um `manifest.json` estático, para puxar a versão do
  `package.json` e ter type-check. Importado por `vite.config.ts` como
  `./manifest.config.ts` — a extensão explícita é obrigatória porque
  `tsconfig.node.json` usa `module: nodenext`.
- **`vite.config.ts`** — registra `@vitejs/plugin-react` e
  `crx({ manifest })`. O CRXJS lê o manifest, empacota cada entry point
  (HTML do popup, service worker de background) e reescreve
  `dist/manifest.json`; também cuida do HMR compatível com MV3 durante
  `npm run dev`, algo que um Vite puro não faz para extensões.
- **`public/icons/*.png`** — ícones placeholder de cor sólida, gerados
  programaticamente (não é arte final); substituir antes de publicar na
  Chrome Web Store.

## SOLID

Como os cinco princípios se aplicam concretamente neste projeto — use como
referência ao adicionar código novo, não como checklist a repetir em cada
arquivo:

- **S — Single Responsibility.** Cada arquivo tem um único motivo para
  mudar: `useBlockTimer` só sabe contar segundos; `RewardService` só sabe
  decidir a recompensa; `SupabaseAuthRepository` só sabe falar com o
  Supabase Auth; views só sabem renderizar. Se uma mudança de regra de
  negócio te fizer editar uma view, é sinal de que a lógica vazou pra
  camada errada.
- **O — Open/Closed.** Novas recompensas (streak, por horário, etc.) ou
  novos provedores de auth entram como uma **nova implementação** de
  `RewardStrategy`/`AuthRepository`, sem alterar
  `useFocusSessionController`/`useAuthController`.
- **L — Liskov Substitution.** Qualquer implementação de `AuthRepository`
  ou `RewardStrategy` deve poder substituir a atual sem quebrar o
  controller que a consome — respeite os tipos de retorno da interface
  (ex.: `signUp` pode retornar `null`, então quem implementa não pode
  lançar nesse caso, e quem consome precisa tratar o `null`).
- **I — Interface Segregation.** `AuthRepository` só tem os quatro métodos
  que os controllers realmente chamam — evite adicionar métodos "por via
  das dúvidas" a uma interface existente; crie uma interface nova se um
  consumidor precisar de um recorte diferente.
- **D — Dependency Inversion.** Controllers dependem das interfaces
  (`AuthRepository`, `RewardStrategy`), nunca de `@supabase/supabase-js`
  diretamente. A implementação concreta entra como parâmetro com valor
  default (`authRepository: AuthRepository = new SupabaseAuthRepository()`),
  então trocar a implementação (ex.: em um teste) não exige mudar a
  assinatura nem o corpo do controller.

## Boas práticas

- Respeite a direção de dependência do MVC acima: views nunca importam
  `repositories`/`services`/`lib` diretamente, e models nunca importam
  React nem controllers/services/repositories.
- Sem path aliases configurados: os imports entre `src/models`,
  `src/repositories`, `src/services`, `src/controllers`, `src/views` e
  `src/popup` usam caminhos relativos — siga o padrão dos arquivos
  existentes em vez de introduzir um alias novo sem necessidade.
- Arquivos consumidos sob `tsconfig.node.json` (`module: nodenext`, ex.:
  `vite.config.ts`) exigem extensão explícita em imports relativos
  (`./manifest.config.ts`, não `./manifest.config`).
- Import de JSON sob `nodenext` precisa do atributo
  `with { type: 'json' }` (veja `manifest.config.ts` importando
  `package.json`).
- Novo estado/regra de negócio vai em um controller (ou em um service, se
  não depender de React) — não em `App.tsx` nem dentro de uma view.
- Não adicione abstrações (contexto global, gerenciador de estado, camada
  de API própria) além do que já existe até que a persistência real no
  Supabase exija — o scaffold atual é intencionalmente simples.
