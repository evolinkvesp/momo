# Testing Checklist - Login & Signup "Proof Before Promise"

## 🚀 Como Testar

### 1. Start Dev Server
```bash
cd D:\baixados\monjaro
npm run dev
```

Acesso: http://localhost:3000

---

## ✅ Testes Funcionais

### LOGIN PAGE - http://localhost:3000/login

**Visual Checks:**
- [ ] Social proof box visível (com fundo orange claro)
- [ ] Título: "2.340 mulheres com Monjaro já começaram"
- [ ] Subtítulo: "Receitas testadas que funcionam"
- [ ] 3 histórias listadas (Carla -2,4kg, Paula -1,8kg, Marina -3,1kg)
- [ ] Estrelas ⭐⭐⭐⭐⭐ visíveis
- [ ] Texto: "Comunidade que entende"
- [ ] Form de login abaixo (email, senha, botões)

**Functional Checks:**
- [ ] Pode fazer login com credenciais válidas
- [ ] Social proof box NÃO interfere com formulário
- [ ] Responsive em mobile (social proof se adapta)

**Expected Result:**
```
┌─────────────────────────────────┐
│     Social Proof Box (trust)     │  ← NOVO
│  2.340 women | Carla | Paula etc │
│  ⭐⭐⭐⭐⭐ Comunidade        │
└─────────────────────────────────┘
         ↓
┌─────────────────────────────────┐
│   Form (Email/Senha/Botão)      │
└─────────────────────────────────┘
```

---

### SIGNUP PAGE - http://localhost:3000/cadastro

#### STEP 1 - Dados Pessoais

**Visual Checks:**
- [ ] Header: "Dados pessoais | Comece sua jornada"
- [ ] Social proof box visível (NOVO) antes dos inputs
- [ ] Mesma box do login (2.340 pessoas, histórias)
- [ ] 4 inputs: Nome, Email, Telefone, Senha (abaixo)
- [ ] Progresso visual (barra de 4 steps no topo)

**Functional Checks:**
- [ ] Pode digitar em todos os campos
- [ ] Botão "Próximo" funciona (validação funciona)
- [ ] Botão voltar volta para login
- [ ] Sem erros de console

**Expected Result:**
```
Step Indicator: ●▭▭▭

📋 Dados Pessoais - Comece sua jornada

┌──────────────────────────────────┐
│  Social Proof Box (trust)  ← NOVO│
│  2.340 women | Histórias...      │
└──────────────────────────────────┘

Nome: [___________]
Email: [___________]
Telefone: [___________]
Senha: [___________]

[◀ Voltar] [Próximo ▶]
```

---

#### STEP 2 - Seu Tratamento

**Visual Checks:**
- [ ] Header: "Seu tratamento | Personalize seu acompanhamento"
- [ ] Urgency banner visível (NOVO, fundo amarelo)
- [ ] Ícone: ⚠️
- [ ] Título: "Primeiras 2-3 semanas com Monjaro definem seu resultado"
- [ ] Subtexto: "Nutricionistas dizem: receitas certas agora = resultado..."
- [ ] Inputs: Data, Dose (grid de 6 opções), Altura, Peso inicial
- [ ] Progresso: ●●▭▭ (2 de 4)

**Functional Checks:**
- [ ] Urgency box não interfere com inputs
- [ ] Pode selecionar dose (visual feedback)
- [ ] Pode digitar altura/peso
- [ ] Botão próximo funciona
- [ ] Sem erros

**Expected Result:**
```
Step Indicator: ●●▭▭

🏥 Seu Tratamento - Personalize seu acompanhamento

┌──────────────────────────────────┐
│ ⚠️ Primeiras 2-3 semanas definem  │ ← NOVO (Urgency)
│ Nutricionistas dizem: receitas... │
└──────────────────────────────────┘

Data: [___/___/___]
Dose: [2.5] [5] [7.5] [10] [12.5] [15]
Altura: [__] Peso: [__]

[◀ Voltar] [Próximo ▶]
```

---

#### STEP 3 - Metas e Rotina

**Visual Checks:**
- [ ] Header: "Metas e rotina | Onde você quer chegar?"
- [ ] Objection crusher box visível (NOVO, fundo verde claro)
- [ ] Checkmarks: ✓ (4 items)
- [ ] Item 1: "Receitas testadas (2.340 pessoas..."
- [ ] Item 2: "Comunidade responde em <1h (5.234..."
- [ ] Item 3: "7 dias grátis, sem cartão"
- [ ] Item 4: "Cancela quando quiser, sem justificativa"
- [ ] Mensagem: "Você não está sozinha. Próximo passo: criar conta."
- [ ] Abaixo: Peso meta (input) e Dia de aplicação (buttons)
- [ ] Progresso: ●●●▭ (3 de 4)

**Functional Checks:**
- [ ] Objection box não interfere
- [ ] Pode selecionar dia (visual feedback - buttons)
- [ ] Botão "Próximo" = "Criar conta agora"
- [ ] Sem erros

**Expected Result:**
```
Step Indicator: ●●●▭

🎯 Metas e Rotina - Onde você quer chegar?

Peso Meta: [__]

┌──────────────────────────────────┐
│ Tudo o que você precisa: ← NOVO  │
│ ✓ Receitas testadas...           │
│ ✓ Comunidade responde <1h...     │
│ ✓ 7 dias grátis, sem cartão      │
│ ✓ Cancela quando quiser...       │
│ Você não está sozinha...          │
└──────────────────────────────────┘

Dia Aplicação: [Dom] [Seg] [Ter]...

[◀ Voltar] [Próximo ▶] (será "Criar Conta")
```

---

#### STEP 4 - Confirmação Email

**Visual Checks (email pendente):**
- [ ] Header: "Confirme seu e-mail | Um link foi enviado"
- [ ] Ícone de email: ✉️ (grande, centered)
- [ ] Mensagem: "Enviamos um link de confirmação para [email]"
- [ ] Instruções: "Clique no link para ativar sua conta"
- [ ] Aviso: "Não encontrou? Verifique spam"
- [ ] Social proof "waiting" box visível (NOVO)
- [ ] Texto: "5.234 mulheres estão salvando receitas..."
- [ ] "Você vai se juntar em breve! 🎉"
- [ ] Progresso: ●●●● (4 de 4)

**Functional Checks:**
- [ ] Botão: "Já confirmei, ir para login"
- [ ] Botão: "Reenviar e-mail de confirmação"
- [ ] Sem erros

**Expected Result:**
```
Step Indicator: ●●●●

✉️ Confirme seu e-mail - Um link foi enviado

Enviamos um link para seu@email.com
Clique no link para ativar sua conta

Não encontrou? Verifique spam.

┌──────────────────────────────────┐
│ Enquanto isso... ← NOVO (waiting) │
│ 5.234 mulheres estão salvando    │
│ receitas e compartilhando...     │
│ Você vai se juntar em breve! 🎉  │
└──────────────────────────────────┘

[Já confirmei, ir para login]
[Reenviar e-mail]
```

---

## 📊 Performance Checks

- [ ] Nenhum erro de console (F12)
- [ ] Nenhum warning em console (exceto Supabase edge runtime - normal)
- [ ] Social proof boxes carregam rápido (<100ms)
- [ ] Responsive em mobile (abrir em DevTools)
- [ ] Responsive em tablet
- [ ] Responsive em desktop (1920px)

---

## 🎯 User Experience Checks

### Login Flow
1. [ ] Visitante vê login page
2. [ ] Social proof visível = credibilidade instantânea
3. [ ] Faz login → vai para home
4. [ ] Copy humanizada ("Carla", "Paula", não "usuários")

### Signup Flow
1. [ ] Visitante vê Step 1 com social proof = confiança
2. [ ] Preenche dados
3. [ ] Step 2 com urgência = "faz sentido, tenho pressa"
4. [ ] Preenche tratamento
5. [ ] Step 3 com objections = "ah, é grátis, sem cartão, posso cancelar?"
6. [ ] Clica "Criar conta"
7. [ ] Step 4 aguardando email com social proof = "enquanto isso, tem gente lá"
8. [ ] Confirma email → vai para home

---

## 🐛 Bug Checklist

- [ ] Nenhum layout quebrado
- [ ] Nenhum texto cortado
- [ ] Nenhum ícone faltando
- [ ] Cores corretas (orange #ff6500, yellow, green)
- [ ] Sem duplicate content
- [ ] Links funcionam corretamente
- [ ] Botões desabilitam quando esperado (loading)

---

## 📱 Mobile Checks (via DevTools)

### iPhone 12 (390px)
- [ ] Social proof box se adapta
- [ ] Histórias não ficam comprimidas
- [ ] Inputs ocupam full width
- [ ] Botões ocupam full width
- [ ] Texto legível

### Pixel 5 (393px)
- [ ] Mesmas verificações

### iPad (768px)
- [ ] Layout se adapta
- [ ] Social proof box proporcional

---

## 🔍 Content Checks

### Verify Exact Copy (não aceitar typos)

#### Trust Box
- [ ] "2.340 mulheres com Monjaro já começaram" (exato)
- [ ] "Carla: -2,4kg em 2 semanas (Frango com Abóbora)" (exato)
- [ ] "Paula: -1,8kg em 3 semanas (Sopa de Legumes)" (exato)
- [ ] "Marina: -3,1kg em 4 semanas (Ovo com Batata Doce)" (exato)
- [ ] "⭐⭐⭐⭐⭐ Comunidade que entende" (5 stars)

#### Urgency Box
- [ ] "⚠️ Primeiras 2-3 semanas com Monjaro definem seu resultado" (exato)
- [ ] "Nutricionistas dizem: receitas certas agora = resultado real depois." (exato)
- [ ] "Cada dia conta." (exato)

#### Objection Box
- [ ] "✓ Receitas testadas (2.340 pessoas já comeram)" (exato)
- [ ] "✓ Comunidade responde em <1h (5.234 mulheres)" (exato)
- [ ] "✓ 7 dias grátis, sem cartão de crédito" (exato)
- [ ] "✓ Cancela quando quiser, sem justificativa" (exato)
- [ ] "Você não está sozinha. Próximo passo: criar conta." (exato)

#### Waiting Box
- [ ] "5.234 mulheres estão salvando receitas e compartilhando histórias de transformação." (exato)
- [ ] "Você vai se juntar em breve! 🎉" (exato)

---

## ✅ Sign-Off Checklist

- [ ] Todas as verificações visuais passaram
- [ ] Todas as funcionalidades funcionam
- [ ] Sem erros de console
- [ ] Copy exato implementado
- [ ] Mobile responsivo
- [ ] Performance OK
- [ ] Pronto para A/B testing

---

## 📋 Próximos Passos

1. ✅ Validar testes acima
2. ⏳ Setup A/B test (Version A = sem, Version B = com social proof)
3. ⏳ Medir conversão durante 2 semanas
4. ⏳ Iterar baseado em dados reais

---

## 📞 Contato / Dúvidas

Se algo não funcionar:
1. Verificar console (F12)
2. Verificar arquivo criado: `components/SocialProofBox.tsx`
3. Verificar imports em login e cadastro
4. Limpar cache: `rm -rf .next && npm run dev`

---
