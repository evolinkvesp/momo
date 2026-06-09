# Design: Fornecedor Media Uploads + Sistema de Avaliação

**Data:** 2026-06-09  
**Status:** Aprovado  
**Escopo:** Portal do fornecedor (upload de logo, banner, foto de produto) + avaliação de fornecedor pelo paciente

---

## 1. Banco de Dados e Storage

### Migrations

**1a. `banner_url` na tabela `fornecedores`:**
```sql
ALTER TABLE fornecedores ADD COLUMN IF NOT EXISTS banner_url TEXT;
```

**1b. Bucket `fornecedor-media` (público):**
```sql
INSERT INTO storage.buckets (id, name, public) VALUES ('fornecedor-media', 'fornecedor-media', true)
ON CONFLICT (id) DO NOTHING;

-- Qualquer um pode ver
CREATE POLICY "Public can view fornecedor media"
ON storage.objects FOR SELECT TO public
USING (bucket_id = 'fornecedor-media');

-- Só o dono do fornecedor faz upload
CREATE POLICY "Fornecedor owner can upload media"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (
  bucket_id = 'fornecedor-media'
  AND EXISTS (
    SELECT 1 FROM fornecedores
    WHERE id::text = (storage.foldername(name))[1]
    AND user_id = auth.uid()
  )
);

-- Só o dono deleta
CREATE POLICY "Fornecedor owner can delete media"
ON storage.objects FOR DELETE TO authenticated
USING (
  bucket_id = 'fornecedor-media'
  AND EXISTS (
    SELECT 1 FROM fornecedores
    WHERE id::text = (storage.foldername(name))[1]
    AND user_id = auth.uid()
  )
);
```

**1c. Constraint única em `avaliacoes` e trigger de média:**
```sql
ALTER TABLE avaliacoes ADD CONSTRAINT avaliacoes_pedido_id_key UNIQUE (pedido_id);

CREATE OR REPLACE FUNCTION update_fornecedor_avaliacao_media()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE fornecedores SET
    avaliacao_media = (
      SELECT ROUND(AVG(nota)::numeric, 1)
      FROM avaliacoes WHERE fornecedor_id = NEW.fornecedor_id
    )
  WHERE id = NEW.fornecedor_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_avaliacao_media
AFTER INSERT OR UPDATE ON avaliacoes
FOR EACH ROW EXECUTE FUNCTION update_fornecedor_avaliacao_media();
```

### Paths no Storage

```
fornecedor-media/
  {fornecedor_id}/logo.{ext}
  {fornecedor_id}/banner.{ext}

produto-fotos/           ← bucket já existente
  {fornecedor_id}/{produto_id}.{ext}
```

O bucket `produto-fotos` e a coluna `foto_url` em `fornecedor_produtos` já existem — sem mudança necessária.

---

## 2. Upload de Logo e Banner (Portal do Fornecedor)

### Páginas afetadas
- `/fornecedor/configuracoes` — seção "Imagens da Loja" adicionada no topo
- `/fornecedor/perfil` — página nova com foco visual no banner + logo (nova entrada no menu do portal)

### Layout do bloco de imagens

```
┌─────────────────────────────────────┐
│  [    BANNER — toque para alterar   ]  ← 160px altura, rounded-2xl
│  ┌──┐                               │
│  │  │ LOGO                          │  ← 80x80px, sobreposto no canto inferior esquerdo
│  └──┘                               │
└─────────────────────────────────────┘
```

Em `/fornecedor/perfil`: botões explícitos "Alterar logo" e "Alterar banner" abaixo do bloco.  
Em `/configuracoes`: o bloco completo é clicável com ícone de câmera sobre cada área.

### Componente `FornecedorMediaUpload`

Interface:
```tsx
interface FornecedorMediaUploadProps {
  fornecedorId: string;
  field: "logo_url" | "banner_url";
  currentUrl: string | null;
  onUpload: (newUrl: string) => void;
}
```

Comportamento:
- Toque → abre `<input type="file" accept="image/*">` nativo
- Limite: 5MB — toast de erro se exceder
- Upload para `fornecedor-media/{fornecedor_id}/{field_sem_sufixo}.{ext}`
- Após upload: `UPDATE fornecedores SET {field} = {url}` via supabase client
- Spinner durante o upload sobre a área clicada
- Preview atualiza imediatamente após sucesso

### Navegação

Adicionar "Perfil da Loja" no layout do portal fornecedor (`app/fornecedor/layout.tsx`) como nova entrada no tab bar ou menu.

---

## 3. Upload de Foto do Produto

### Onde aparece

Na página `/fornecedor/produtos` — cada card de produto ganha ícone de câmera no canto superior direito.  
Toque no ícone → abre `ProdutoFotoUpload` drawer.

### Componente `ProdutoFotoUpload`

Interface:
```tsx
interface ProdutoFotoUploadProps {
  produtoId: string;
  fornecedorId: string;
  currentUrl: string | null;
  onSuccess: (newUrl: string) => void;
}
```

Comportamento:
- Drawer desliza de baixo (usa `AnimatePresence` do framer-motion, padrão do projeto)
- Mostra preview da foto atual ou placeholder com ícone de câmera
- Botão "Alterar foto" → input file nativo
- Limite: 5MB, apenas `image/*`
- Upload para `produto-fotos/{fornecedor_id}/{produto_id}.{ext}`
- Atualiza `foto_url` em `fornecedor_produtos`
- Preview atualiza após sucesso, drawer fecha

### Lado do paciente

A query em `/estoque/fornecedor/[id]/page.tsx` já precisa incluir `foto_url` no select dos produtos para que os cards mostrem a imagem. O `FornecedorClient` e `ProdutoDetalheClient` já têm a estrutura para renderizar — apenas garantir que o campo é buscado.

---

## 4. Sistema de Avaliação

### Fluxo do paciente

1. Em `/meus-pedidos` — pedido com `status = "entregue"` e sem avaliação existente mostra botão "Avaliar"
2. Toque → abre `AvaliacaoDrawer`
3. Após envio: botão some, badge "Avaliado ★ X.X" aparece no card do pedido

### Componente `AvaliacaoDrawer`

Interface:
```tsx
interface AvaliacaoDrawerProps {
  pedidoId: string;
  fornecedorId: string;
  fornecedorNome: string;
  onSuccess: (nota: number) => void;
}
```

UI:
- 5 estrelas tocáveis, highlight ember ao selecionar (obrigatório selecionar ao menos 1)
- Textarea opcional, máximo 300 caracteres com contador visível
- Botão "Enviar avaliação" desabilitado até nota selecionada
- Submit: `INSERT INTO avaliacoes (pedido_id, paciente_id, fornecedor_id, nota, comentario)`
- Trigger no banco atualiza `avaliacao_media` em `fornecedores` automaticamente
- Toast de sucesso, drawer fecha

### Página do fornecedor (lado do paciente)

`/estoque/fornecedor/[id]` — aba "Avaliações" já existe em `FornecedorClient`:
- Mostrar média com estrelas + total de avaliações no topo
- Lista de avaliações: estrelas, comentário (se houver), data formatada em pt-BR
- Se nenhuma avaliação: estado vazio com mensagem "Ainda sem avaliações"

### Verificação de avaliação existente

Para saber se o paciente já avaliou um pedido, a query de meus-pedidos faz LEFT JOIN em `avaliacoes` por `pedido_id`. Se `avaliacao.id` for null e status for "entregue" → mostrar botão.

---

## 5. Tipos atualizados

Adicionar a `lib/fornecedores.ts`:
```ts
// Fornecedor
banner_url: string | null;   // novo campo

// FornecedorProduto (já tem foto_url, confirmar que está no tipo)
foto_url: string | null;
```

---

## Resumo dos arquivos a criar/modificar

| Arquivo | Ação |
|---|---|
| `supabase/migrations/20260609000000_fornecedor_media.sql` | novo — banner_url + bucket + trigger avaliação |
| `lib/fornecedores.ts` | editar — adicionar banner_url, foto_url nos tipos |
| `components/FornecedorMediaUpload.tsx` | novo |
| `components/ProdutoFotoUpload.tsx` | novo |
| `components/AvaliacaoDrawer.tsx` | novo |
| `app/fornecedor/perfil/page.tsx` | novo |
| `app/fornecedor/configuracoes/ConfigFornecedorClient.tsx` | editar — adicionar bloco de imagens |
| `app/fornecedor/produtos/page.tsx` | editar — ícone câmera + drawer |
| `app/fornecedor/layout.tsx` | editar — nova entrada "Perfil" no menu |
| `app/(app)/meus-pedidos/page.tsx` ou client | editar — botão avaliar + drawer |
| `app/(app)/estoque/fornecedor/[id]/FornecedorClient.tsx` | editar — aba avaliações populada + foto nos produtos |
| `app/(app)/estoque/fornecedor/[id]/page.tsx` | editar — incluir foto_url e avaliacoes na query |
