# Task 4 Report — Confidence UI for RegistrarRefeicaoModal

**Status:** DONE

**Commit:** ffdb29f

**Summary:** Added confidence-based UI to `RegistrarRefeicaoModal`: yellow banner for `media`, red banner + editable 2x2 macro grid + muted "Salvar assim mesmo" button for `baixa`; `macrosEditados` state merges user edits into save payload.

## Changes made

File: `components/dieta/RegistrarRefeicaoModal.tsx`

1. Added `macrosEditados` state (typed `{ calorias, proteinas, carboidratos, gorduras } | null`).
2. Reset `macrosEditados` to `null` on each new analysis result.
3. `salvar()` now uses `macrosEditados ? { ...result, ...macrosEditados } : result` so edited values override AI estimates.
4. Inserted confidence UI after the macros card, before the action buttons:
   - `"media"`: amber banner (`rgba(234,179,8,0.1)` bg, `rgba(234,179,8,0.3)` border, `#92400e` text).
   - `"baixa"`: red banner (`rgba(239,68,68,0.08)` bg, `rgba(239,68,68,0.2)` border, `#991b1b` text) + 2x2 grid of number inputs using `var(--color-surface-mid)` / `var(--color-surface-border)` styling + muted primary button.
5. `npx tsc --noEmit` passes clean (no output = no errors).
