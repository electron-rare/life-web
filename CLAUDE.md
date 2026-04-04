# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Vue d'ensemble

life-web est le cockpit opérateur React 19 de la plateforme FineFab. Il fournit dashboards, chat, monitoring et UIs d'outillage qui consomment la gateway API `life-reborn`. Design system dark glassmorphism avec tokens Tailwind CSS custom.

## Commandes

```bash
pnpm install                        # packageManager: pnpm@9.15.0 — PAS npm
pnpm dev                            # serveur dev vite sur port 5173
pnpm test                           # vitest run (jsdom)
pnpm test -- --watch                # vitest mode watch
pnpm test -- src/hooks/__tests__/hooks.test.ts  # un seul fichier de test
pnpm run build                      # tsc -b && vite build
pnpm run typecheck                  # tsc --noEmit (aussi aliasé `pnpm lint`)
```

## Architecture

### Flux d'entrée

`index.html` → `src/main.tsx` monte React 19 StrictMode avec deux providers :
- `QueryClientProvider` (TanStack React Query) — fetching/cache de données
- `RouterProvider` (TanStack React Router) — routing déclaratif

### Routing (`src/router.tsx`)

Toutes les routes sont définies dans un seul fichier via `createRouter`/`createRoute`. Chaque section a un composant layout avec `SubTabs` + `<Outlet/>` et des pages lazy-loadées via `React.lazy()`.

9 sections top-level : Dashboard, Chat, Providers, RAG, Traces, Infra, Governance, Monitoring, Schematic. Pour ajouter une section : ajouter le lazy import, créer layout + routes, enregistrer dans `routeTree`, et ajouter une entrée nav dans `Sidebar.tsx`.

### Couche API (`src/lib/api.ts`)

Objet `api` unique avec méthodes typées pour tous les endpoints backend. URL de base depuis la variable d'env `VITE_API_URL` (défaut : `https://api.saillant.cc`). Toutes les requêtes utilisent `fetch` avec `credentials: "include"`. Les endpoints CAD (`api.cad.*`) tapent directement `cad.saillant.cc`, pas via la gateway.

### Pattern de fetching

Les hooks dans `src/hooks/` wrappent `useQuery`/`useMutation` de React Query autour des appels `api.*`. Les hooks de polling utilisent `refetchInterval` (health : 10s, stats : 30s). Le streaming chat utilise SSE via `useChatStream` (ReadableStream + parsing lignes `data:`). Le hook WebSocket (`useWebSocket`) a un auto-reconnect avec backoff exponentiel.

### Layout

`AppShell` = sidebar icônes étroite (56px) + zone de contenu principale. `Sidebar` utilise des icônes `lucide-react`. La sous-navigation dans les sections utilise le composant `SubTabs`. Toutes les pages se rendent dans le `<Outlet/>` de leur layout de section.

### Design system (tokens Tailwind)

Thème dark-only avec tokens sémantiques custom dans `tailwind.config.ts` :
- Surfaces : `surface-bg` (#0a0a0f), `surface-card` (glass), `surface-hover`
- Bordures : `border-glass`, `border-active`
- Accents : `accent-green` (#00ff88), `accent-blue`, `accent-amber`, `accent-red`
- Texte : `text-primary`, `text-muted`, `text-dim`
- Police : JetBrains Mono / Fira Code monospace

Primitives UI réutilisables dans `src/components/ui/` : `GlassCard`, `MetricCard`, `Spinner`, `StatusDot`, `Terminal`.

### Intégration KiCanvas

`src/pages/schematic/SchematicViewer.tsx` embarque le web component `<kicanvas-embed>` (chargé via CDN dans `index.html`). Types JSX déclarés dans `src/vite-env.d.ts`.

## Tests

Vitest + jsdom + Testing Library. Les tests sont colocalisés dans des dossiers `__tests__/` à côté de leurs sources. Les assertions doivent cibler les éléments visibles par l'utilisateur (texte, rôles, interactions), pas les détails d'implémentation. Couvrir les états `error` et `empty` pour les composants qui chargent des données.

## Environnement

| Variable | Usage |
|----------|-------|
| `VITE_API_URL` | URL de base de la gateway API (build-time, intégrée au bundle) |

## Docker

Build multi-stage : pnpm install + build → nginx:alpine servant `dist/`. Le `VITE_API_URL` est défini au build via Docker build arg.
