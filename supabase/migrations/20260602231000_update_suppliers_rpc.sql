-- Migration: 20260602231000_update_suppliers_rpc.sql
-- Description: Update RPC to filter by city instead of state.

DROP FUNCTION IF EXISTS get_active_suppliers_with_prices(text);

CREATE OR REPLACE FUNCTION get_active_suppliers_with_prices(p_cidade text, p_estado text)
RETURNS TABLE (
    id uuid,
    razao_social text,
    nome_fantasia text,
    cnpj text,
    tipo text,
    endereco_cidade text,
    endereco_estado text,
    logo_url text,
    avaliacao_media decimal,
    total_pedidos int,
    oferece_frete_full boolean,
    tempo_entrega_minutos int,
    aceita_cod boolean,
    raio_entrega_km int,
    cidades_entrega text[],
    preco_minimo decimal
) 
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        f.id,
        f.razao_social,
        f.nome_fantasia,
        f.cnpj,
        f.tipo,
        f.endereco_cidade,
        f.endereco_estado,
        f.logo_url,
        f.avaliacao_media,
        f.total_pedidos,
        f.oferece_frete_full,
        f.tempo_entrega_minutos,
        f.aceita_cod,
        f.raio_entrega_km,
        f.cidades_entrega,
        MIN(p.preco) as preco_minimo
    FROM fornecedores f
    LEFT JOIN fornecedor_produtos p ON p.fornecedor_id = f.id AND p.ativo = true
    WHERE f.status = 'ativo'
    AND (
        p_cidade IS NULL 
        OR f.endereco_cidade ILIKE p_cidade
        OR f.cidades_entrega @> ARRAY[p_cidade]
    )
    GROUP BY f.id
    ORDER BY f.avaliacao_media DESC NULLS LAST;
END;
$$;
