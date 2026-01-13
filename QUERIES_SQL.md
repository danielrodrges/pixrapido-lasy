# 📊 Queries SQL Úteis - Supabase

## 🔍 Consultas para Administração

### **1. Ver todos os sorteios ativos**
```sql
SELECT 
  id,
  titulo,
  valor_premio,
  numero_inicial,
  numero_final,
  numeros_vendidos,
  data_sorteio,
  status
FROM sorteios
WHERE status = 'ativo'
ORDER BY data_sorteio;
```

### **2. Ver números vendidos por sorteio**
```sql
SELECT 
  s.titulo,
  COUNT(n.numero) as total_vendidos,
  s.total_numeros,
  ROUND((COUNT(n.numero)::numeric / s.total_numeros) * 100, 2) as percentual_vendido
FROM sorteios s
LEFT JOIN numeros_sorteio n ON s.id = n.sorteio_id AND n.status = 'confirmado'
WHERE s.status = 'ativo'
GROUP BY s.id, s.titulo, s.total_numeros
ORDER BY percentual_vendido DESC;
```

### **3. Ver todos os compradores de um sorteio**
```sql
SELECT 
  u.nome,
  u.cpf,
  u.telefone,
  u.email,
  p.id as pedido_id,
  p.valor_total,
  p.quantidade_numeros,
  p.data_pagamento,
  array_agg(n.numero ORDER BY n.numero) as numeros_comprados
FROM usuarios u
JOIN pedidos p ON u.cpf = p.cpf
JOIN numeros_sorteio n ON p.id = n.pedido_id
WHERE n.sorteio_id = 'prod_XXXXX'  -- Substitua pelo ID do produto
AND n.status = 'confirmado'
AND p.status = 'pago'
GROUP BY u.nome, u.cpf, u.telefone, u.email, p.id, p.valor_total, p.quantidade_numeros, p.data_pagamento
ORDER BY p.data_pagamento DESC;
```

### **4. Exportar números para sorteio (formato CSV)**
```sql
SELECT 
  n.numero,
  u.nome,
  u.cpf,
  p.data_pagamento
FROM numeros_sorteio n
JOIN usuarios u ON n.cpf = u.cpf
JOIN pedidos p ON n.pedido_id = p.id
WHERE n.sorteio_id = 'prod_XXXXX'  -- Substitua pelo ID do produto
AND n.status = 'confirmado'
ORDER BY n.numero;
```

### **5. Ver faturamento por sorteio**
```sql
SELECT 
  s.titulo,
  COUNT(DISTINCT p.id) as total_pedidos,
  SUM(p.valor_total) as faturamento_total,
  AVG(p.valor_total) as ticket_medio,
  SUM(p.quantidade_numeros) as total_numeros_vendidos
FROM sorteios s
LEFT JOIN pedidos p ON s.id = p.sorteio_id
WHERE p.status = 'pago'
GROUP BY s.id, s.titulo
ORDER BY faturamento_total DESC;
```

### **6. Ver números disponíveis em um sorteio**
```sql
WITH numeros_vendidos AS (
  SELECT numero 
  FROM numeros_sorteio 
  WHERE sorteio_id = 'prod_XXXXX' 
  AND status = 'confirmado'
),
sorteio_config AS (
  SELECT numero_inicial, numero_final 
  FROM sorteios 
  WHERE id = 'prod_XXXXX'
)
SELECT 
  generate_series(
    (SELECT numero_inicial FROM sorteio_config),
    (SELECT numero_final FROM sorteio_config)
  ) as numero_disponivel
EXCEPT
SELECT numero FROM numeros_vendidos
ORDER BY numero_disponivel
LIMIT 100;  -- Limita a 100 resultados para não travar
```

### **7. Ver últimas vendas (últimas 24h)**
```sql
SELECT 
  p.id,
  u.nome,
  s.titulo,
  p.quantidade_numeros,
  p.valor_total,
  p.metodo_pagamento,
  p.data_pagamento,
  array_agg(n.numero ORDER BY n.numero) as numeros
FROM pedidos p
JOIN usuarios u ON p.cpf = u.cpf
JOIN sorteios s ON p.sorteio_id = s.id
JOIN numeros_sorteio n ON p.id = n.pedido_id
WHERE p.data_pagamento >= NOW() - INTERVAL '24 hours'
AND p.status = 'pago'
GROUP BY p.id, u.nome, s.titulo, p.quantidade_numeros, p.valor_total, p.metodo_pagamento, p.data_pagamento
ORDER BY p.data_pagamento DESC;
```

### **8. Ver clientes que mais compraram**
```sql
SELECT 
  u.nome,
  u.cpf,
  u.telefone,
  COUNT(DISTINCT p.id) as total_compras,
  SUM(p.quantidade_numeros) as total_numeros,
  SUM(p.valor_total) as total_gasto
FROM usuarios u
JOIN pedidos p ON u.cpf = p.cpf
WHERE p.status = 'pago'
GROUP BY u.cpf, u.nome, u.telefone
ORDER BY total_gasto DESC
LIMIT 20;
```

---

## 🎲 Sorteio - Declarar Ganhador

### **1. Atualizar ganhador após sorteio**
```sql
-- Primeiro, encontre o CPF do dono do número sorteado
SELECT u.cpf, u.nome 
FROM numeros_sorteio n
JOIN usuarios u ON n.cpf = u.cpf
WHERE n.sorteio_id = 'prod_XXXXX'
AND n.numero = 1234  -- Número sorteado
AND n.status = 'confirmado';

-- Depois, atualize o sorteio com o ganhador
UPDATE sorteios 
SET 
  numero_ganhador = 1234,
  cpf_ganhador = '12345678900',  -- CPF do ganhador
  status = 'sorteado',
  data_realizacao = NOW()
WHERE id = 'prod_XXXXX';
```

### **2. Ver todos os sorteios realizados**
```sql
SELECT 
  s.titulo,
  s.valor_premio,
  s.numero_ganhador,
  u.nome as nome_ganhador,
  u.telefone,
  s.data_realizacao
FROM sorteios s
LEFT JOIN usuarios u ON s.cpf_ganhador = u.cpf
WHERE s.status = 'sorteado'
ORDER BY s.data_realizacao DESC;
```

---

## 🧹 Limpeza e Manutenção

### **1. Limpar reservas expiradas (executado automaticamente)**
```sql
DELETE FROM numeros_sorteio
WHERE status = 'reservado'
AND data_reserva < NOW() - INTERVAL '15 minutes';
```

### **2. Ver reservas pendentes**
```sql
SELECT 
  sorteio_id,
  COUNT(*) as total_reservados,
  MIN(data_reserva) as reserva_mais_antiga
FROM numeros_sorteio
WHERE status = 'reservado'
GROUP BY sorteio_id;
```

### **3. Cancelar pedido e liberar números**
```sql
-- Atualizar status do pedido
UPDATE pedidos
SET status = 'cancelado'
WHERE id = 'PED123456789';

-- Deletar números reservados
DELETE FROM numeros_sorteio
WHERE pedido_id = 'PED123456789';
```

---

## 📈 Relatórios Gerenciais

### **1. Dashboard resumo**
```sql
SELECT 
  COUNT(DISTINCT s.id) as total_sorteios_ativos,
  COUNT(DISTINCT p.id) as total_vendas_hoje,
  SUM(CASE WHEN p.data_pagamento::date = CURRENT_DATE THEN p.valor_total ELSE 0 END) as faturamento_hoje,
  COUNT(DISTINCT u.cpf) as total_clientes,
  SUM(CASE WHEN n.status = 'confirmado' THEN 1 ELSE 0 END) as total_numeros_vendidos
FROM sorteios s
LEFT JOIN pedidos p ON s.id = p.sorteio_id AND p.status = 'pago'
LEFT JOIN usuarios u ON p.cpf = u.cpf
LEFT JOIN numeros_sorteio n ON p.id = n.pedido_id
WHERE s.status = 'ativo';
```

### **2. Faturamento por dia (últimos 30 dias)**
```sql
SELECT 
  data_pagamento::date as dia,
  COUNT(id) as total_vendas,
  SUM(valor_total) as faturamento,
  SUM(quantidade_numeros) as numeros_vendidos
FROM pedidos
WHERE status = 'pago'
AND data_pagamento >= NOW() - INTERVAL '30 days'
GROUP BY data_pagamento::date
ORDER BY dia DESC;
```

### **3. Pacotes mais vendidos**
```sql
SELECT 
  quantidade_numeros as pacote,
  COUNT(*) as total_vendas,
  SUM(valor_total) as faturamento_total
FROM pedidos
WHERE status = 'pago'
GROUP BY quantidade_numeros
ORDER BY total_vendas DESC;
```

---

## 🔐 Backup e Segurança

### **Backup manual (copiar resultado)**
```sql
-- Backup de todos os números vendidos de um sorteio
SELECT * FROM numeros_sorteio 
WHERE sorteio_id = 'prod_XXXXX' 
AND status = 'confirmado'
ORDER BY numero;

-- Backup de todos os pedidos pagos
SELECT * FROM pedidos 
WHERE status = 'pago'
ORDER BY data_pagamento DESC;
```

---

## 💡 Dicas

1. **Sempre use transações** para operações críticas
2. **Faça backup antes de deletar** qualquer dado
3. **Use índices** para queries frequentes (já criados no schema)
4. **Monitore o tamanho** da tabela `numeros_sorteio` regularmente
5. **Exporte relatórios** em CSV direto do Supabase Dashboard

---

## 🚀 Queries para Teste

### **Inserir sorteio de teste**
```sql
INSERT INTO sorteios (
  id, titulo, descricao, imagem_url, valor_premio, 
  preco_por_numero, total_numeros, numero_inicial, numero_final,
  data_sorteio, status
) VALUES (
  'teste_001',
  'Sorteio Teste',
  'Sorteio para testes',
  'https://via.placeholder.com/800x600',
  1000.00,
  5.00,
  100,
  1,
  100,
  NOW() + INTERVAL '7 days',
  'ativo'
);
```

### **Criar usuário de teste**
```sql
INSERT INTO usuarios (cpf, nome, telefone, email)
VALUES ('12345678900', 'Usuário Teste', '11999999999', 'teste@email.com')
ON CONFLICT (cpf) DO NOTHING;
```
