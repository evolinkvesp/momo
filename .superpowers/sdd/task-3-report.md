# Task 3 Report — Alertas de Alto IG

## Status: COMPLETE

## Changes Made

### 1. `lib/diet-plans.ts`
Added `SUBSTITUICOES_IG` constant (exported) mapping 8 high-GI ingredients to healthier substitutes, placed before `analisarRefeicao`.

### 2. `components/dieta/types.ts`
- Added import for `ALIMENTOS_ALTO_IG` and `SUBSTITUICOES_IG` from `@/lib/diet-plans`
- Added exported `detectarIngredientesIG(receita: ReceitaIA)` function that joins ingredient strings, filters against `ALIMENTOS_ALTO_IG`, and maps each match to its substitute from `SUBSTITUICOES_IG`.

### 3. `components/dieta/ReceitasTab.tsx`
- Imported `detectarIngredientesIG` from `./types`
- Added `⚠️ Alto IG` chip (ember-colored pill) below the macro line in each recipe card, rendered only when `detectarIngredientesIG(r).length > 0`.

### 4. `components/dieta/ReceitaDrawer.tsx`
- Imported `detectarIngredientesIG` from `./types`
- Computed `igIngredientes` at top of component body (after mounted guard)
- Added amber warning banner above the ingredients section listing each flagged ingredient and its suggested substitute.

## TypeScript
`npx tsc --noEmit` — passed with zero errors.

## One-line Summary
Wired ALIMENTOS_ALTO_IG to flag high-GI recipe ingredients with an IG chip on cards and a substitution banner inside the drawer.
