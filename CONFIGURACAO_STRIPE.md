# 🎯 Configuração dos Produtos no Stripe

## 📋 Metadados Necessários por Produto

Para cada produto no Stripe Dashboard, adicione estes metadados:

### **Metadados Obrigatórios:**

| Campo | Descrição | Exemplo |
|-------|-----------|---------|
| `totalNumeros` | Total de números disponíveis | `10000` |
| `numeroInicial` | Número inicial do intervalo | `0` ou `1` |
| `numeroFinal` | Número final do intervalo | `9999` ou `10000` |
| `valorPremio` | Valor do prêmio em reais | `10000` |
| `dataSorteio` | Data do sorteio (ISO 8601) | `2026-02-15T20:00:00Z` |

### **Metadados Opcionais:**

| Campo | Descrição | Exemplo |
|-------|-----------|---------|
| `destaque` | Destacar na página principal | `true` ou `false` |
| `numerosVendidos` | Números já vendidos (atualizado automaticamente) | `0` |
| `pacotes` | Pacotes personalizados (JSON) | Ver abaixo |

---

## 🎨 Exemplos de Configuração

### **Exemplo 1: Sorteio Básico (0000-9999)**
```
totalNumeros: 10000
numeroInicial: 0
numeroFinal: 9999
valorPremio: 10000
dataSorteio: 2026-02-15T20:00:00Z
destaque: true
```

### **Exemplo 2: Sorteio Pequeno (0001-1000)**
```
totalNumeros: 1000
numeroInicial: 1
numeroFinal: 1000
valorPremio: 5000
dataSorteio: 2026-01-20T20:00:00Z
```

### **Exemplo 3: Sorteio Grande (00000-99999)**
```
totalNumeros: 100000
numeroInicial: 0
numeroFinal: 99999
valorPremio: 50000
dataSorteio: 2026-03-01T20:00:00Z
destaque: true
```

---

## 📦 Configuração de Pacotes Personalizados (Opcional)

Se quiser pacotes específicos por produto, adicione o metadado `pacotes` como JSON:

```json
[
  {"id": "p1", "quantidade": 1, "preco": 5},
  {"id": "p2", "quantidade": 5, "preco": 23.75, "desconto": 5},
  {"id": "p3", "quantidade": 10, "preco": 45, "desconto": 10, "popular": true},
  {"id": "p4", "quantidade": 25, "preco": 106.25, "desconto": 15},
  {"id": "p5", "quantidade": 50, "preco": 200, "desconto": 20},
  {"id": "p6", "quantidade": 100, "preco": 375, "desconto": 25}
]
```

**Se não adicionar o metadado `pacotes`, o sistema gera automaticamente baseado no preço por número!**

---

## 🔧 Passos para Adicionar Metadados no Stripe

1. Acesse: https://dashboard.stripe.com/products
2. Clique no produto desejado
3. Role até a seção **"Metadata"**
4. Clique em **"Add metadata"**
5. Adicione cada campo com sua chave e valor
6. Clique em **"Save product"**

---

## ✅ Sistema Funcionando

### **Fluxo Completo:**

1. **Produtos carregam do Stripe** → API `/api/sorteios`
2. **Sincronização automática** → Dados salvos no Supabase
3. **Números gerados** → Dentro do intervalo `numeroInicial` até `numeroFinal`
4. **Pagamento confirmado** → Números salvos no Supabase como `confirmado`
5. **Extração de dados** → Você pode exportar do Supabase para fazer sorteio

### **Onde ver os números no Supabase:**

```sql
-- Ver todos os números confirmados de um sorteio
SELECT * FROM numeros_sorteio 
WHERE sorteio_id = 'prod_XXXXX' 
AND status = 'confirmado'
ORDER BY numero;

-- Ver quantos números já foram vendidos
SELECT COUNT(*) as total_vendidos 
FROM numeros_sorteio 
WHERE sorteio_id = 'prod_XXXXX' 
AND status = 'confirmado';

-- Ver todos os compradores e seus números
SELECT 
  usuarios.nome,
  usuarios.cpf,
  pedidos.id as pedido_id,
  array_agg(numeros_sorteio.numero ORDER BY numeros_sorteio.numero) as numeros
FROM numeros_sorteio
JOIN usuarios ON numeros_sorteio.cpf = usuarios.cpf
JOIN pedidos ON numeros_sorteio.pedido_id = pedidos.id
WHERE numeros_sorteio.sorteio_id = 'prod_XXXXX'
AND numeros_sorteio.status = 'confirmado'
GROUP BY usuarios.nome, usuarios.cpf, pedidos.id;
```

---

## 🎲 Como Fazer o Sorteio Manualmente

Depois que vender os números, você pode:

1. **Exportar CSV do Supabase** com todos os números confirmados
2. **Usar site de sorteio** como sorteador.com.br
3. **Atualizar resultado** no Supabase:

```sql
UPDATE sorteios 
SET 
  numero_ganhador = 1234,
  cpf_ganhador = '12345678900',
  status = 'sorteado',
  data_realizacao = NOW()
WHERE id = 'prod_XXXXX';
```

---

## 🚀 Tudo Pronto!

- ✅ Supabase configurado e conectado
- ✅ Produtos carregam do Stripe
- ✅ Números são salvos no Supabase após pagamento
- ✅ Intervalo configurável por produto
- ✅ Sistema pronto para produção

**Próximos passos:**
1. Adicionar metadados nos produtos do Stripe
2. Testar uma compra completa
3. Verificar números no Supabase
4. Fazer um sorteio de teste!
