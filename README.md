# life-web

Front-end principal FineFab pour cockpit produit et parcours utilisateur.

## Role
- Offrir l'interface web unifiee des services FineFab.
- Consommer l'API `life-reborn`.
- Exposer dashboards, workflows et operations metier.

## Stack
- TypeScript
- Vite
- React 19
- pnpm

## Structure cible
- `src/pages/`: pages et parcours
- `src/components/`: UI partagee
- `src/api/`: clients API et adaptateurs

## Demarrage rapide
```bash
pnpm install
pnpm devpnpm devpnpm devpnpm devpnpm devpnpm devpnpm devpnpm devpnpm devpnpm devpnpm devpnpm devpnpm devpnpm devpnpm devpnpm devpnpm devpnpm devpnpm devpnpm devpnpm devpnpm devpnpm devpnpm devpnpm devpnpm devpnpm devpnpm devpnpm devpnpm devpnpm devpnpm devpnpm devpnpm devpnpm devpnpm devpnpm devpnpm devpnpm devpnpm devpnpm devpnpm devpnpm devpnpm devpnpm devpnpm devpnpm devpnpm devpnpm devpnpm devpnpm devpnpm devpnpm devpnpm devpnpm devpnpm devpnpm devpnpm devpnpm devpnpm devpnpm devpnpm devpnpm devpnpm devpnpm devpnpm devpnpm cible
- `gateway/`: backend CAD/API
- `web/`: UI CAD collaborative
- `tools/`: integrations plugin/outillage

## Demarrage rapide
```bash
# backend
python -m venv .venv && source .venv/bin/activate
pip install -e .

# frontend
pnpm install
pnpm dev
```

## Roadmap immediate
- Migrer les routes CAD prioritaires.
- Integrer plugin KiCad et KiCanvas.
- Stabiliser tests E2E collaboration.
