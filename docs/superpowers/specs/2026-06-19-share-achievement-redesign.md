# Share Achievement Engine — Redesign Completo

**Data:** 2026-06-19  
**Status:** Aprovado

---

## Problema

O sistema atual gera imagens que parecem dashboards/analytics, não conquistas pessoais. Causas identificadas:

- `TplWeek` usa grid 2×2 de `StatCell` com bordas e fundos → parece widget de SaaS
- `DaysPill` tem borda e container arredondado → parece badge de sistema
- Número principal em 90px num card de 360px (25% da largura) — não é dominante
- Muita informação simultânea dilui o impacto emocional

---

## Objetivo

Transformar cada conquista em uma peça visual que pareça um poster premium, não uma tela do sistema. Referência de qualidade: Strava Share Cards, Apple Fitness Awards, Spotify Wrapped.

---

## Arquitetura de Arquivos

### `components/StoryCard.tsx` — novo arquivo

Responsabilidade única: visual do card exportável.

**Exporta:**
- `StoryCard` (forwardRef — necessário para html2canvas no DrawerPi)
- `TemplateType` — union dos 6 tipos
- `TEMPLATES` — array `{ key, emoji, label }[]` para o seletor de pills no drawer

**Contém:**
- Os 6 sub-componentes de template (`TplWeight`, `TplGoal`, `TplRecord`, `TplStreak`, `TplBA`, `TplMilestone`)
- Zero lógica de export, share ou estado

### `components/ShareProgressDrawer.tsx` — cirurgia mínima

**Remove:**
- `StoryCard`, todos os templates antigos inline
- `StatCell`, `DaysPill`, `Timeline` (sub-componentes visuais)
- Template `"week"` da lista `TEMPLATES`

**Adiciona:**
- Import de `StoryCard`, `TEMPLATES`, `TemplateType` de `./StoryCard`
- Templates `"streak"` e `"milestone"` na lista de pills

---

## Especificação Visual

### Dimensões

- Preview no drawer: **360×640px**
- Export via html2canvas scale 3×: **1080×1920px** (Instagram Stories)
- Fundo: `transparent` (PNG sem background — cola como figurinha no Story)

### Regras Absolutas

**Proibido em qualquer template:**
- Containers com background
- Borders/bordas
- Glassmorphism
- Grids de métricas
- Componentes com `border-radius` + `border` + `background` juntos
- Mais de 4 elementos visuais por template

### Paleta

| Token | Valor |
|---|---|
| Principal | `#FF6B00` |
| Branco | `#FFFFFF` |
| Branco suave | `rgba(255,255,255,0.6)` |
| Branco muted | `rgba(255,255,255,0.35)` |

### Hierarquia Tipográfica (tamanhos no preview 360px)

| Elemento | Tamanho | Cor |
|---|---|---|
| Número principal | **220px** | `#fff` ou `#FF6B00` |
| Unidade (kg, dias) | **72px** | `rgba(255,255,255,0.5)` |
| Título/label | **52px** | `#FF6B00` |
| Info secundária | **24px** | `rgba(255,255,255,0.6)` |
| Logo topo | 14px | `rgba(255,255,255,0.7)` |
| `momo.app` rodapé | 12px | `#FF6B00` |

Fontes: `Syne` (números, títulos) · `Outfit` (labels, rodapé)

### Layout — 3 Zonas Verticais

```
┌─────────────────────────────┐
│  momo            JUN 2026   │  ← topo: 48px
│                             │
│                             │
│    [ELEMENTO PRINCIPAL]     │  ← hero: 65–75% da altura
│                             │    número gigante + label
│                             │
│                             │
│  [info secundária]          │  ← rodapé: 80px
│  ───────────────────        │    linha 1px gradiente laranja
│  momo.app                   │
└─────────────────────────────┘
```

O divisor do rodapé é uma `div` height 1px, `background: linear-gradient(90deg, #FF6B00, rgba(255,107,0,0.25), transparent)`. Sem bordas em nenhum outro elemento.

---

## Os 6 Templates

### 1. `weight` — Peso Perdido

**Dados:** `pesoPerdido`, `pesoInicial`, `pesoAtual`, `semanas`  
**Derivado:** `dias = Math.round(semanas × 7)`

**Layout:**
```
−13.4        ← 220px, cor: #fff, sinal "−" em #FF6B00
kg           ← 72px, rgba(255,255,255,0.5)

PERDIDOS     ← 52px, #FF6B00, letter-spacing 0.08em

115kg ─────────────────▶ 101.6kg   ← timeline pura: 2 textos + linha + seta SVG
                                      zero container/border

42 dias      ← 24px, rgba(255,255,255,0.6)
```

**Regra de hierarquia:** olho bate em `−13.4`, depois `PERDIDOS`, depois timeline, depois dias.

---

### 2. `goal` — Meta Alcançada

**Dados:** `pesoMeta ?? pesoAtual`

**Layout:**
```
🎯           ← 60px

META         ← 52px, #FF6B00, line-height 0.9
ALCANÇADA

90           ← 220px, #fff
kg           ← 72px
```

---

### 3. `record` — Novo Recorde

**Dados:** `pesoAtual`

**Layout:**
```
🏆           ← 60px

NOVO         ← 52px, #FF6B00, line-height 0.9
MENOR PESO

97           ← 220px, #fff
kg           ← 72px
```

---

### 4. `streak` — Sequência *(substitui "week")*

**Dados:** `semanas`  
**Derivado:** `dias = Math.round(semanas × 7)`

**Layout:**
```
🔥           ← 60px

45           ← 220px, #FF6B00
DIAS         ← 52px, #fff, line-height 0.9
SEGUIDOS
```

O número é laranja aqui (não branco) para contrastar com o emoji e destacar o esforço.

---

### 5. `beforeafter` — Antes e Agora

**Dados:** `pesoInicial`, `pesoAtual`, `pesoPerdido`

**Layout:**
```
ANTES         AGORA       ← 18px: cinza / laranja
115            97          ← 120px: rgba(255,255,255,0.4) / #fff
kg             kg          ← 32px

↓              ← seta SVG centralizada, #FF6B00, 32px

−18kg perdidos ← 52px, #FF6B00
```

Os dois números ficam lado a lado com espaço negativo entre eles — sem container, sem divisória.

---

### 6. `milestone` — Milestone

**Dados:** `pesoPerdido`  
**Derivado:** `milestoneKg = Math.floor(pesoPerdido / 5) × 5`

**Layout:**
```
🏆           ← 60px

10KG         ← 180px, #FF6B00 (tamanho menor pois inclui "KG")
ELIMINADOS   ← 48px, #fff
```

`10KG` em 180px porque a string é mais longa. `ELIMINADOS` em branco abaixo.

---

## Animações (preview only — não afetam o PNG exportado)

| Animação | Elemento | Duração | Easing |
|---|---|---|---|
| `fadeIn` | Card inteiro ao abrir drawer | 0.5s | ease |
| `scaleIn` | Número principal | 0.7s | cubic-bezier(0.34, 1.56, 0.64, 1) |
| Counter | Números de peso animados | 1.5s | ease-out cubic |

O counter já existe no `ShareProgressDrawer` — mantido como está.  
`fadeIn` e `scaleIn` são `@keyframes` definidas dentro do `StoryCard.tsx`.

---

## Dados Derivados

Nenhum novo campo em `ShareProgressData`. Tudo calculado inline:

```ts
const dias        = Math.round(data.semanas * 7);
const milestoneKg = Math.floor(data.pesoPerdido / 5) * 5;
```

---

## Checklist de Qualidade por Template

Antes de considerar um template aprovado, executar mentalmente:

- [ ] Parece um poster premium ou conquista pessoal? → APROVADO
- [ ] Parece dashboard / widget / tela do sistema? → REJEITAR

---

## Fora de Escopo

- Export animado (GIF/vídeo) — PNG estático é suficiente
- Server-side render com Satori — complexidade desnecessária
- Novas rotas de API
- Mudanças no `ShareProgressData` (tipo público)
