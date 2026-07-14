# create-fsd-app

CLI que gera projetos front-end já estruturados em **Feature-Sliced Design (FSD)**, com lint de arquitetura configurado desde o primeiro commit — nada de deixar a estrutura de pastas se corromper com o tempo.

Suporta três stacks: **Vite + React**, **Next.js** e **Expo (React Native)**.

## Por quê

FSD organiza o front-end em camadas (`app → pages → widgets → features → entities → shared`), onde cada camada só pode importar das camadas abaixo dela, e cada slice só expõe o que quer via uma "public API" (`index.ts`). Isso é fácil de explicar e fácil de violar sem querer — um import direto num arquivo interno de outro slice, ou um import "pra cima" na hierarquia, passa despercebido em review e corrói a arquitetura aos poucos.

Este gerador cria o projeto já com:

- a estrutura de pastas FSD pronta;
- um slice de exemplo (`entities/user`) mostrando o padrão de public API;
- **`eslint-plugin-boundaries`** configurado pra bloquear, no lint normal do dia a dia, tanto imports entre camadas na direção errada quanto imports que furam a public API de um slice;
- **`steiger`** (linter oficial do FSD) configurado pra pegar violações estruturais que o ESLint não cobre (slice sem referência, index de camada indevido, etc).

## Instalação e uso

Publicado no npm como `@leviutima/create-fsd-app` (com escopo — o nome sem escopo `create-fsd-app` já pertence a outro pacote). Não precisa instalar nada antes, é só rodar via `npx`:

```bash
npx @leviutima/create-fsd-app meu-projeto
```

Sem argumento, ele pergunta o nome do projeto e a stack via prompt interativo. Também dá pra passar tudo direto:

```bash
npx @leviutima/create-fsd-app meu-projeto --template next
```

Se preferir instalar global em vez de usar `npx` toda vez:

```bash
npm install -g @leviutima/create-fsd-app
create-fsd-app meu-projeto
```

### Opções

| Flag | Valores | Descrição |
|---|---|---|
| `[project-name]` | texto livre | Nome do projeto e da pasta criada (no diretório atual). Se omitido, é perguntado. |
| `-t, --template <name>` | `vite` \| `next` \| `expo` | Qual stack usar. Se omitido, é perguntado. |

## Stacks suportadas

| Stack | O que é | Scripts gerados |
|---|---|---|
| **Vite** | SPA React puro | `dev`, `build`, `lint`, `lint:arch`, `check` |
| **Next.js** | App Router (v14), com `src/app` fazendo dupla função: roteamento do Next + camada `app` do FSD | `dev`, `build`, `start`, `lint`, `lint:arch`, `check` |
| **Expo** | React Native, entrada clássica (`App.tsx` na raiz + `expo/AppEntry.js`) | `start`, `android`, `ios`, `web`, `lint`, `lint:arch`, `check` |

Detalhes por stack:

- **Vite**: `src/main.tsx` monta `<App />` no `#root` do `index.html`.
- **Next**: `src/app/layout.tsx` e `src/app/page.tsx` são os arquivos especiais do App Router; `src/app/App.tsx` é a camada de composição FSD de fato e está marcada com `"use client"` porque o slice de exemplo usa `useState` (o Next trata tudo como Server Component por padrão).
- **Expo**: a UI do slice de exemplo usa `<View>`/`<Text>` em vez de `<div>`. O `tsconfig.json` restringe o `include` a `App.tsx` + `src/**` porque `expo/tsconfig.base` usa `moduleResolution: "node"`, que não resolve os tipos do `steiger` (não afeta o app rodando, só o `tsc --noEmit`).

> **Limitação conhecida**: o template Expo foi validado com `npm install`, lint, `lint:arch` e `tsc --noEmit`, mas não foi testado num simulador/dispositivo real (esse ambiente não tem Expo Go). Rode `npx expo start` numa máquina com Expo Go pra confirmar visualmente antes de depender dele em produção.

## Estrutura gerada

```
meu-projeto/
├── src/
│   ├── app/         # composição raiz — providers, entry point
│   ├── pages/        # (vazia) telas/rotas
│   ├── widgets/      # (vazia) blocos de UI compostos de features/entities
│   ├── features/     # (vazia) casos de uso interativos
│   ├── entities/
│   │   └── user/      # slice de exemplo
│   │       ├── index.ts        # public API — só isso pode ser importado de fora
│   │       ├── model/
│   │       │   ├── store.ts
│   │       │   └── types.ts
│   │       └── ui/
│   │           └── UserCard.tsx
│   └── shared/       # (vazia) código sem regra de negócio (ui kit, libs, utils)
├── eslint.config.js  # regras de fronteira entre camadas
├── steiger.config.ts # linter de arquitetura FSD
└── tsconfig.json
```

Regra de import entre camadas (de cima pra baixo, cada uma só enxerga as de baixo):

```
app → pages → widgets → features → entities → shared
```

`shared` não importa de nenhuma outra camada. Um slice (ex.: `entities/user`) só pode ser importado através do seu `index.ts` — importar direto `entities/user/model/store` de fora do slice é bloqueado pelo lint.

Rode `npm run check` (ou `lint` + `lint:arch` separados) dentro do projeto gerado pra validar isso.

## Como funciona por dentro

```
create-fsd-app/
├── src/
│   └── index.ts       # CLI: parseia args, pergunta nome/stack, copia o template e substitui {{PROJECT_NAME}}
└── templates/
    ├── vite/           # cada pasta é um projeto completo e auto-contido
    ├── next/
    └── expo/
```

O `src/index.ts` só faz três coisas: pergunta nome e stack (via `commander` + `prompts`), copia `templates/<stack>` para o diretório de destino, e substitui o placeholder `{{PROJECT_NAME}}` nos arquivos que precisam dele (`package.json`, `app.json`, `index.html`, `src/app/App.tsx` — os que existirem em cada template).

Os três templates são independentes entre si (arquivos duplicados, não compartilhados) — é proposital: cada um precisa evoluir conforme a stack correspondente muda, e compartilhar via symlink ou build step adicionaria complexidade desproporcional pra um gerador de escopo pessoal.

## Desenvolvendo o CLI

```bash
npm run dev     # tsup em watch mode
npm run build   # build de produção (dist/index.js)
```

Pra testar uma mudança sem publicar:

```bash
npm run build
create-fsd-app teste --template vite   # usa o link global feito com `npm link`
```

Se o comando `create-fsd-app` parar de funcionar depois de mexer no `bin` do `package.json`, rode `npm unlink -g @leviutima/create-fsd-app && npm link` de novo pra regenerar os shims globais.

## Licença

MIT
