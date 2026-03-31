import { Link, Outlet, useRouterState } from "@tanstack/react-router";

function NavLink({ to, label }: { to: string; label: string }) {
  const pathname = useRouterState({
    select: (state) => state.location.pathname
  });
  const isActive = pathname === to;

  return (
    <Link
      to={to}
      className={isActive ? "nav-link nav-link-active" : "nav-link"}
    >
      {label}
    </Link>
  );
}

export default function App() {
  return (
    <main className="min-h-screen app-bg text-slate-100">
      <section className="mx-auto flex max-w-5xl flex-col gap-6 px-6 py-10">
        <p className="eyebrow">
          FineFab Life
        </p>
        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
          Cockpit Opérations
        </h1>
        <p className="max-w-2xl text-base text-slate-300 sm:text-lg">
          Supervision des services, test conversationnel et statut détaillé des
          dépendances life-core et life-reborn.
        </p>
        <nav className="flex flex-wrap gap-3">
          <NavLink to="/" label="Dashboard" />
          <NavLink to="/chat" label="Chat" />
          <NavLink to="/status" label="Status" />
        </nav>
        <Outlet />
      </section>
    </main>
  );
}
