# OIDC Keycloak Auth — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Sécuriser life-web et life-reborn avec auth OIDC Keycloak client-side — le frontend obtient un access token via `oidc-client-ts` et l'envoie en Bearer à l'API gateway.

**Architecture:** life-web utilise `oidc-client-ts` pour le flow Authorization Code + PKCE vers Keycloak (`auth.saillant.cc/realms/electro_life`). Un `AuthProvider` React context wraps l'app et injecte le token dans tous les appels `api.*`. Côté life-reborn, le JWT middleware existant (`src/middleware/jwt.ts`) est étendu à toutes les routes sauf `/health`, `/doc`, `/`.

**Tech Stack:** oidc-client-ts, React 19 Context, jose (déjà installé), Keycloak 24.0

**Prérequis vérifié :**
- Keycloak 24.0 tourne sur Tower (`suite-keycloak` healthy)
- Realm `electro_life` opérationnel (`auth.saillant.cc/realms/electro_life/.well-known/openid-configuration` OK)
- JWT middleware life-reborn existant et testé (`src/middleware/jwt.ts`)
- Client Keycloak `life-reborn` configuré dans docker-compose.prod.yml

---

## File Structure

### life-web (frontend)

| Action | File | Responsabilité |
|--------|------|----------------|
| Create | `src/lib/auth.ts` | Config OIDC, UserManager singleton, helpers (login, logout, getToken) |
| Create | `src/components/AuthProvider.tsx` | React context provider — gère le cycle auth, expose user + token |
| Create | `src/components/__tests__/AuthProvider.test.tsx` | Tests du provider (authenticated, unauthenticated, loading) |
| Modify | `src/lib/api.ts` | Injecter le Bearer token dans toutes les requêtes |
| Modify | `src/lib/__tests__/api.test.ts` | Adapter les tests pour le Bearer token |
| Modify | `src/main.tsx` | Wrapper l'app avec `AuthProvider` |
| Modify | `src/components/layout/Sidebar.tsx` | Afficher l'utilisateur connecté + bouton logout |
| Modify | `package.json` | Ajouter `oidc-client-ts` |

### life-reborn (API gateway)

| Action | File | Responsabilité |
|--------|------|----------------|
| Modify | `src/app.ts` | Étendre JWT auth à toutes les routes sauf whitelist |
| Modify | `src/__tests__/jwt.test.ts` | Tester la protection globale |

---

## Task 1: Installer oidc-client-ts dans life-web

**Files:**
- Modify: `life-web/package.json`

- [ ] **Step 1: Installer la dépendance**

```bash
cd "/Users/electron/Documents/Projets/Factory 4 Life/life-web" && pnpm add oidc-client-ts
```

- [ ] **Step 2: Vérifier l'installation**

Run: `cd "/Users/electron/Documents/Projets/Factory 4 Life/life-web" && pnpm ls oidc-client-ts`
Expected: `oidc-client-ts` listé avec une version >= 3.x

- [ ] **Step 3: Commit**

```bash
cd "/Users/electron/Documents/Projets/Factory 4 Life/life-web"
git add package.json pnpm-lock.yaml
git commit -m "feat(auth): add oidc-client-ts dependency"
```

---

## Task 2: Créer le module auth (`src/lib/auth.ts`)

**Files:**
- Create: `life-web/src/lib/auth.ts`

- [ ] **Step 1: Écrire le module auth**

```typescript
import { UserManager, WebStorageStateStore, type User } from "oidc-client-ts";

const KEYCLOAK_URL = import.meta.env.VITE_KEYCLOAK_URL || "https://auth.saillant.cc";
const REALM = import.meta.env.VITE_KEYCLOAK_REALM || "electro_life";
const CLIENT_ID = import.meta.env.VITE_KEYCLOAK_CLIENT_ID || "life-web";
const REDIRECT_URI = `${window.location.origin}/`;
const AUTHORITY = `${KEYCLOAK_URL}/realms/${REALM}`;

export const userManager = new UserManager({
  authority: AUTHORITY,
  client_id: CLIENT_ID,
  redirect_uri: REDIRECT_URI,
  post_logout_redirect_uri: REDIRECT_URI,
  response_type: "code",
  scope: "openid profile email",
  automaticSilentRenew: true,
  userStore: new WebStorageStateStore({ store: window.sessionStorage }),
});

export async function getAccessToken(): Promise<string | null> {
  const user = await userManager.getUser();
  if (!user || user.expired) return null;
  return user.access_token;
}

export async function login(): Promise<void> {
  await userManager.signinRedirect();
}

export async function logout(): Promise<void> {
  await userManager.signoutRedirect();
}

export async function handleCallback(): Promise<User> {
  return userManager.signinRedirectCallback();
}

export type { User };
```

- [ ] **Step 2: Vérifier le typecheck**

Run: `cd "/Users/electron/Documents/Projets/Factory 4 Life/life-web" && pnpm run typecheck`
Expected: PASS, pas d'erreur de types

- [ ] **Step 3: Commit**

```bash
cd "/Users/electron/Documents/Projets/Factory 4 Life/life-web"
git add src/lib/auth.ts
git commit -m "feat(auth): add OIDC UserManager config for Keycloak"
```

---

## Task 3: Créer AuthProvider React context

**Files:**
- Create: `life-web/src/components/AuthProvider.tsx`
- Create: `life-web/src/components/__tests__/AuthProvider.test.tsx`

- [ ] **Step 1: Écrire le test du AuthProvider**

```typescript
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { AuthProvider, useAuth } from "../AuthProvider";

// Mock oidc-client-ts
vi.mock("../../lib/auth", () => {
  const mockUser = {
    access_token: "mock-token-123",
    expired: false,
    profile: { sub: "user-1", preferred_username: "electron", email: "e@test.com" },
  };
  return {
    userManager: {
      getUser: vi.fn().mockResolvedValue(mockUser),
      signinRedirectCallback: vi.fn().mockResolvedValue(mockUser),
      events: {
        addUserLoaded: vi.fn(),
        addUserUnloaded: vi.fn(),
        removeUserLoaded: vi.fn(),
        removeUserUnloaded: vi.fn(),
      },
    },
    login: vi.fn(),
    logout: vi.fn(),
    getAccessToken: vi.fn().mockResolvedValue("mock-token-123"),
  };
});

function TestConsumer() {
  const { user, isAuthenticated, isLoading } = useAuth();
  if (isLoading) return <div>loading</div>;
  if (!isAuthenticated) return <div>unauthenticated</div>;
  return <div>hello {user?.profile.preferred_username}</div>;
}

describe("AuthProvider", () => {
  it("shows loading then authenticated user", async () => {
    render(
      <AuthProvider>
        <TestConsumer />
      </AuthProvider>,
    );
    await waitFor(() => {
      expect(screen.getByText("hello electron")).toBeDefined();
    });
  });

  it("shows unauthenticated when no user", async () => {
    const { userManager } = await import("../../lib/auth");
    vi.mocked(userManager.getUser).mockResolvedValueOnce(null);
    render(
      <AuthProvider>
        <TestConsumer />
      </AuthProvider>,
    );
    await waitFor(() => {
      expect(screen.getByText("unauthenticated")).toBeDefined();
    });
  });
});
```

- [ ] **Step 2: Lancer le test pour vérifier qu'il échoue**

Run: `cd "/Users/electron/Documents/Projets/Factory 4 Life/life-web" && pnpm test -- src/components/__tests__/AuthProvider.test.tsx`
Expected: FAIL — module `../AuthProvider` introuvable

- [ ] **Step 3: Écrire le AuthProvider**

```typescript
import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { userManager, login, logout, type User } from "../lib/auth";

interface AuthContextValue {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: () => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue>({
  user: null,
  isAuthenticated: false,
  isLoading: true,
  login,
  logout,
});

export function useAuth(): AuthContextValue {
  return useContext(AuthContext);
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function init() {
      try {
        // Handle OIDC callback if URL contains auth params
        if (window.location.search.includes("code=") || window.location.search.includes("state=")) {
          const callbackUser = await userManager.signinRedirectCallback();
          setUser(callbackUser);
          // Clean URL
          window.history.replaceState({}, "", window.location.pathname);
        } else {
          const existingUser = await userManager.getUser();
          setUser(existingUser?.expired ? null : existingUser);
        }
      } catch {
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    }
    init();

    const onLoaded = (u: User) => setUser(u);
    const onUnloaded = () => setUser(null);
    userManager.events.addUserLoaded(onLoaded);
    userManager.events.addUserUnloaded(onUnloaded);
    return () => {
      userManager.events.removeUserLoaded(onLoaded);
      userManager.events.removeUserUnloaded(onUnloaded);
    };
  }, []);

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user && !user.expired, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
```

- [ ] **Step 4: Lancer le test pour vérifier qu'il passe**

Run: `cd "/Users/electron/Documents/Projets/Factory 4 Life/life-web" && pnpm test -- src/components/__tests__/AuthProvider.test.tsx`
Expected: PASS — 2 tests

- [ ] **Step 5: Commit**

```bash
cd "/Users/electron/Documents/Projets/Factory 4 Life/life-web"
git add src/components/AuthProvider.tsx src/components/__tests__/AuthProvider.test.tsx
git commit -m "feat(auth): add AuthProvider with OIDC login/logout/token"
```

---

## Task 4: Injecter le Bearer token dans api.ts

**Files:**
- Modify: `life-web/src/lib/api.ts:10-20` (fonction `request`)
- Modify: `life-web/src/lib/__tests__/api.test.ts`

- [ ] **Step 1: Écrire le test vérifiant que le Bearer est envoyé**

Ajouter ce test à la fin du `describe("api client")` dans `src/lib/__tests__/api.test.ts` :

```typescript
  it("sends Bearer token in Authorization header", async () => {
    const { getAccessToken } = await import("../../lib/auth");
    vi.mocked(getAccessToken).mockResolvedValueOnce("test-jwt-token");

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ status: "ok", providers: [], cache_available: true }),
    });

    await api.health();
    expect(mockFetch).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({
        headers: expect.objectContaining({
          Authorization: "Bearer test-jwt-token",
        }),
      }),
    );
  });
```

Et ajouter le mock auth en haut du fichier, après le mock fetch :

```typescript
vi.mock("../auth", () => ({
  getAccessToken: vi.fn().mockResolvedValue(null),
}));
```

- [ ] **Step 2: Lancer le test pour vérifier qu'il échoue**

Run: `cd "/Users/electron/Documents/Projets/Factory 4 Life/life-web" && pnpm test -- src/lib/__tests__/api.test.ts`
Expected: FAIL — le header Authorization n'est pas envoyé

- [ ] **Step 3: Modifier api.ts pour injecter le token**

Remplacer la fonction `request` dans `src/lib/api.ts` :

```typescript
import { getAccessToken } from "./auth";

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const token = await getAccessToken();
  const headers = new Headers(init?.headers);
  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }
  const res = await fetch(`${API_BASE_URL}${path}`, {
    credentials: "include",
    ...init,
    headers,
  });
  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`${res.status}: ${body}`);
  }
  return res.json();
}
```

- [ ] **Step 4: Lancer les tests pour vérifier**

Run: `cd "/Users/electron/Documents/Projets/Factory 4 Life/life-web" && pnpm test -- src/lib/__tests__/api.test.ts`
Expected: PASS — tous les tests existants + le nouveau

- [ ] **Step 5: Commit**

```bash
cd "/Users/electron/Documents/Projets/Factory 4 Life/life-web"
git add src/lib/api.ts src/lib/__tests__/api.test.ts
git commit -m "feat(auth): inject Bearer token in all API requests"
```

---

## Task 5: Intégrer AuthProvider dans main.tsx

**Files:**
- Modify: `life-web/src/main.tsx`

- [ ] **Step 1: Wrapper l'app avec AuthProvider**

Remplacer le contenu de `src/main.tsx` par :

```typescript
import React from "react";
import ReactDOM from "react-dom/client";
import { QueryClientProvider } from "@tanstack/react-query";
import { RouterProvider } from "@tanstack/react-router";
import { AuthProvider } from "./components/AuthProvider";
import "./index.css";
import { queryClient } from "./queryClient";
import { router } from "./router";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <AuthProvider>
      <QueryClientProvider client={queryClient}>
        <RouterProvider router={router} />
      </QueryClientProvider>
    </AuthProvider>
  </React.StrictMode>,
);
```

- [ ] **Step 2: Vérifier le typecheck**

Run: `cd "/Users/electron/Documents/Projets/Factory 4 Life/life-web" && pnpm run typecheck`
Expected: PASS

- [ ] **Step 3: Commit**

```bash
cd "/Users/electron/Documents/Projets/Factory 4 Life/life-web"
git add src/main.tsx
git commit -m "feat(auth): wrap app with AuthProvider"
```

---

## Task 6: Login gate — rediriger les non-authentifiés

**Files:**
- Modify: `life-web/src/components/layout/AppShell.tsx`

- [ ] **Step 1: Ajouter le gate d'auth dans AppShell**

Remplacer le contenu de `src/components/layout/AppShell.tsx` par :

```typescript
import { Outlet } from "@tanstack/react-router";
import { Sidebar } from "./Sidebar";
import { useAuth } from "../AuthProvider";
import { Spinner } from "../ui/Spinner";

export function AppShell() {
  const { isAuthenticated, isLoading, login } = useAuth();

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-surface-bg">
        <Spinner text="Authentification..." />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="flex h-screen flex-col items-center justify-center gap-4 bg-surface-bg text-text-primary">
        <h1 className="text-2xl font-semibold">FineFab Cockpit</h1>
        <p className="text-sm text-text-muted">Authentification requise</p>
        <button
          onClick={() => login()}
          className="rounded-lg bg-accent-green/10 px-6 py-2 text-sm font-medium text-accent-green transition-colors hover:bg-accent-green/20"
        >
          Se connecter
        </button>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-surface-bg text-text-primary">
      <Sidebar />
      <main className="flex flex-1 flex-col overflow-hidden">
        <Outlet />
      </main>
    </div>
  );
}
```

- [ ] **Step 2: Vérifier le typecheck**

Run: `cd "/Users/electron/Documents/Projets/Factory 4 Life/life-web" && pnpm run typecheck`
Expected: PASS

- [ ] **Step 3: Commit**

```bash
cd "/Users/electron/Documents/Projets/Factory 4 Life/life-web"
git add src/components/layout/AppShell.tsx
git commit -m "feat(auth): add login gate in AppShell"
```

---

## Task 7: Afficher l'utilisateur dans la Sidebar + logout

**Files:**
- Modify: `life-web/src/components/layout/Sidebar.tsx`

- [ ] **Step 1: Modifier la Sidebar pour afficher user + logout**

Remplacer le bloc avatar en bas de la Sidebar (la `div` avec `FL`) par :

```typescript
import { Link, useRouterState } from "@tanstack/react-router";
import { LayoutDashboard, MessageSquare, Zap, BookOpen, Activity, Server, ShieldCheck, Monitor, CircuitBoard, LogOut } from "lucide-react";
import { type ReactNode } from "react";
import { useAuth } from "../AuthProvider";
```

Et remplacer le footer de la sidebar :

```typescript
      <div className="flex-1" />
      {(() => {
        const { user, logout } = useAuth();
        const initials = (user?.profile?.preferred_username ?? "?").slice(0, 2).toUpperCase();
        return (
          <div className="flex flex-col items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-accent-green/20 text-xs font-medium text-accent-green" title={user?.profile?.email ?? ""}>
              {initials}
            </div>
            <button onClick={() => logout()} title="Déconnexion" className="flex h-8 w-8 items-center justify-center rounded-lg text-text-muted hover:bg-surface-hover hover:text-accent-red transition-colors">
              <LogOut size={16} />
            </button>
          </div>
        );
      })()}
```

- [ ] **Step 2: Vérifier le typecheck**

Run: `cd "/Users/electron/Documents/Projets/Factory 4 Life/life-web" && pnpm run typecheck`
Expected: PASS

- [ ] **Step 3: Commit**

```bash
cd "/Users/electron/Documents/Projets/Factory 4 Life/life-web"
git add src/components/layout/Sidebar.tsx
git commit -m "feat(auth): show user initials and logout in sidebar"
```

---

## Task 8: Étendre le JWT auth à toutes les routes dans life-reborn

**Files:**
- Modify: `life-reborn/src/app.ts:27-28`
- Modify: `life-reborn/src/__tests__/jwt.test.ts`

- [ ] **Step 1: Écrire le test vérifiant la protection globale**

Ajouter dans `life-reborn/src/__tests__/jwt.test.ts` :

```typescript
  it("should return 401 on proxy routes when auth is enabled", async () => {
    const app = createApp();
    const proxyPaths = ["/models", "/stats", "/conversations", "/rag/stats", "/infra/containers"];
    for (const path of proxyPaths) {
      const res = await app.request(path);
      expect(res.status).toBe(401);
    }
  });
```

- [ ] **Step 2: Lancer le test pour vérifier qu'il échoue**

Run: `cd "/Users/electron/Documents/Projets/Factory 4 Life/life-reborn" && npm test -- --reporter=verbose`
Expected: FAIL — les routes proxy retournent 404 (pas de handler) ou 200 (pas protégées)

- [ ] **Step 3: Modifier app.ts pour protéger globalement**

Remplacer les lignes `app.use("/api/chat", jwtAuth);` et `app.use("/api/browser", jwtAuth);` par une protection globale avec whitelist :

```typescript
  // JWT auth on all routes except health, version, doc, root
  app.use("*", async (c, next) => {
    const path = c.req.path;
    const publicPaths = ["/health", "/api/version", "/doc", "/"];
    if (publicPaths.includes(path)) return next();
    return jwtAuth(c, next);
  });
```

- [ ] **Step 4: Lancer les tests**

Run: `cd "/Users/electron/Documents/Projets/Factory 4 Life/life-reborn" && npm test`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
cd "/Users/electron/Documents/Projets/Factory 4 Life/life-reborn"
git add src/app.ts src/__tests__/jwt.test.ts
git commit -m "feat(auth): extend JWT protection to all routes"
```

---

## Task 9: Ajouter les variables d'env et configurer le client Keycloak

**Files:**
- Modify: `life-web/.env.example`

- [ ] **Step 1: Mettre à jour .env.example**

```
ENV=dev
VITE_API_URL=https://api.saillant.cc
VITE_KEYCLOAK_URL=https://auth.saillant.cc
VITE_KEYCLOAK_REALM=electro_life
VITE_KEYCLOAK_CLIENT_ID=life-web
```

- [ ] **Step 2: Créer le client `life-web` dans Keycloak**

Depuis Tower, créer le client public OIDC pour le SPA :

```bash
ssh clems@192.168.0.120 'docker exec suite-keycloak /opt/keycloak/bin/kcadm.sh config credentials --server http://localhost:8080 --realm master --user admin --password "${KEYCLOAK_ADMIN_PASSWORD:-admin-secret-2026}" && docker exec suite-keycloak /opt/keycloak/bin/kcadm.sh create clients -r electro_life -s clientId=life-web -s "redirectUris=[\"https://life.saillant.cc/*\",\"http://localhost:5173/*\"]" -s "webOrigins=[\"https://life.saillant.cc\",\"http://localhost:5173\"]" -s publicClient=true -s directAccessGrantsEnabled=false -s standardFlowEnabled=true'
```

Expected: Client ID retourné (UUID)

- [ ] **Step 3: Vérifier que le client existe**

```bash
ssh clems@192.168.0.120 'docker exec suite-keycloak /opt/keycloak/bin/kcadm.sh config credentials --server http://localhost:8080 --realm master --user admin --password "${KEYCLOAK_ADMIN_PASSWORD:-admin-secret-2026}" && docker exec suite-keycloak /opt/keycloak/bin/kcadm.sh get clients -r electro_life -q clientId=life-web --fields clientId,publicClient,redirectUris'
```

Expected: JSON montrant `clientId: "life-web"`, `publicClient: true`

- [ ] **Step 4: Commit**

```bash
cd "/Users/electron/Documents/Projets/Factory 4 Life/life-web"
git add .env.example
git commit -m "feat(auth): add Keycloak OIDC env vars"
```

---

## Task 10: Désactiver le bypass public sur Tower

**Files:**
- Modify: variables d'environnement Docker sur Tower

- [ ] **Step 1: Vérifier l'état actuel du bypass**

```bash
ssh clems@192.168.0.120 "docker inspect life-reborn --format '{{range .Config.Env}}{{println .}}{{end}}' | grep -i public"
```

- [ ] **Step 2: Supprimer `LIFE_REBORN_ALLOW_PUBLIC_API=true`**

Dans `docker-compose.prod.yml` ou le `.env` sur Tower, s'assurer que `LIFE_REBORN_ALLOW_PUBLIC_API` n'est **pas** défini ou est `false`.

- [ ] **Step 3: Redéployer life-reborn**

```bash
ssh clems@192.168.0.120 "cd /opt/finefab && docker compose -f docker-compose.prod.yml up -d life-reborn"
```

- [ ] **Step 4: Vérifier que l'API demande un token**

```bash
curl -s -o /dev/null -w "%{http_code}" https://api.saillant.cc/models
```

Expected: `401`

```bash
curl -s -o /dev/null -w "%{http_code}" https://api.saillant.cc/health
```

Expected: `200`

---

## Task 11: Build, deploy et test end-to-end

- [ ] **Step 1: Lancer tous les tests life-web**

```bash
cd "/Users/electron/Documents/Projets/Factory 4 Life/life-web" && pnpm test
```

Expected: PASS — tous les tests

- [ ] **Step 2: Lancer tous les tests life-reborn**

```bash
cd "/Users/electron/Documents/Projets/Factory 4 Life/life-reborn" && npm test
```

Expected: PASS — tous les tests

- [ ] **Step 3: Build life-web**

```bash
cd "/Users/electron/Documents/Projets/Factory 4 Life/life-web" && pnpm run build
```

Expected: PASS — bundle généré dans `dist/`

- [ ] **Step 4: Déployer sur Tower**

```bash
ssh clems@192.168.0.120 "cd /opt/finefab && docker compose -f docker-compose.prod.yml build life-web life-reborn && docker compose -f docker-compose.prod.yml up -d life-web life-reborn"
```

- [ ] **Step 5: Test E2E**

1. Ouvrir `https://life.saillant.cc/` — doit afficher la page de login
2. Cliquer "Se connecter" — redirigé vers `auth.saillant.cc` (Keycloak)
3. S'authentifier — redirigé vers le cockpit
4. Vérifier que le dashboard charge les données (health, stats)
5. Vérifier les initiales utilisateur dans la sidebar
6. Cliquer le bouton logout — retour à la page de login

- [ ] **Step 6: Commit final**

```bash
cd "/Users/electron/Documents/Projets/Factory 4 Life"
git add life-web life-reborn
git commit -m "feat(auth): complete OIDC Keycloak integration for life-web + life-reborn"
```