# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Overview

life-web is the React 19 / Vite frontend cockpit for FineFab — 6 live sections, Tailwind CSS.

## Commands

```bash
pnpm install       # packageManager: pnpm@9.15.0
pnpm test          # vitest run
pnpm run build     # tsc -b && vite build
pnpm run typecheck # tsc --noEmit
pnpm run dev       # vite dev server
```

## Architecture

React 19 with Vite. Pages in `src/pages/`, components in `src/components/`. Fetches from life-reborn API gateway. Uses pnpm (not npm).
