-- Atualiza a tabela medicoes_saude para o novo formato de humor e energia
ALTER TABLE medicoes_saude DROP CONSTRAINT medicoes_saude_humor_check;
ALTER TABLE medicoes_saude ADD CONSTRAINT medicoes_saude_humor_check CHECK (humor IN ('ruim', 'regular', 'bom', 'otimo', 'excelente'));

ALTER TABLE medicoes_saude DROP CONSTRAINT medicoes_saude_energia_check;
ALTER TABLE medicoes_saude ALTER COLUMN energia TYPE TEXT; -- Mantendo TEXT por enquanto, mas vamos salvar o número como string ou mudar para INT?
-- O prompt diz Slider 1-10. Melhor mudar para INT ou permitir strings numéricas.
-- Vamos mudar para INT se possível, mas como já existe dado, melhor ser cuidadoso.

-- Se houver dados, vamos converter 'baixa'->3, 'media'->6, 'alta'->9
UPDATE medicoes_saude SET energia = '3' WHERE energia = 'baixa';
UPDATE medicoes_saude SET energia = '6' WHERE energia = 'media';
UPDATE medicoes_saude SET energia = '9' WHERE energia = 'alta';

ALTER TABLE medicoes_saude ALTER COLUMN energia TYPE INT USING (energia::integer);
ALTER TABLE medicoes_saude ADD CONSTRAINT medicoes_saude_energia_range CHECK (energia >= 1 AND energia <= 10);
