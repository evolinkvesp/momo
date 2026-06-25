# Task 5 Report — Favoritar receitas no Supabase

## Status: DONE

## Commit hash
`319612763b97ecdbfd2464f58a39da0b14002980`

## Summary
feat(dieta): favoritar receitas no Supabase com sincronização entre dispositivos

## What was done

### ReceitasTab.tsx
- Added `favIds` (Set<string>), `filtrando` (boolean), and `receitasFavoritas` (ReceitaIA[]) state
- Added `carregarFavoritos(uid)` that fetches from `receitas_favoritas` on mount when userId is available
- Added `toggleFavorito(receita)` that inserts/deletes from Supabase and keeps local state in sync
- Added "Favoritas" filter pill (with Heart icon, filled when active) before the restriction pills; toggling it switches displayed list to `receitasFavoritas`
- Added Heart icon button on each recipe card (filled when favorited); click stops propagation and calls `toggleFavorito`
- EmptyState messaging adapts to favorites mode

### ReceitaDrawer.tsx
- Props extended with `favIds: Set<string>` and `onToggleFavorito: (r: ReceitaIA) => void`
- Heart button added in the drawer header (top-left, opposite close button); filled when recipe is favorited

### TypeScript
- `npx tsc --noEmit` passes clean (fixed Set spread → `Array.from(...).concat(...)` for ES target compatibility)
