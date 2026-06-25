# Task 2 Report — exibir dica_mounjaro no drawer de receita

**Status:** DONE
**Commit:** 8b41c6b
**Summary:** Adicionada seção "Dica Mounjaro" no ReceitaDrawer, renderizada condicionalmente abaixo do Modo de Preparo.

---

## Changes

### `components/dieta/ReceitaDrawer.tsx`
- Added `Pill` import from `lucide-react`
- Added conditional block after the "Preparo" section that renders only when `receita.dica_mounjaro` is truthy
- Styled with `var(--color-ember-glow)` background, `var(--color-ember-glow-strong)` border, `rounded-2xl`, ember-colored header with Pill icon, and muted body text

### No changes needed to:
- `components/dieta/types.ts` — `dica_mounjaro?: string` was already present (line 34)
- `app/api/receitas/gerar/route.ts` — field already requested in OpenAI prompt and returned in JSON

## TypeScript
`npx tsc --noEmit` — passed clean (no output).
