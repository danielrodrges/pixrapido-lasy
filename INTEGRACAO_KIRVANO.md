# Integração com Kirvano - Webhook de Pagamentos

## 📋 Visão Geral

A integração com a Kirvano permite processar pagamentos automaticamente através de webhooks. Quando um pagamento é aprovado, o sistema gera automaticamente os números do sorteio e registra a compra no banco de dados.

## 🔧 Configuração

### 1. URL do Webhook

Configure na plataforma Kirvano a seguinte URL de webhook:

```
https://seusite.com.br/api/webhook/kirvano
```

### 2. Eventos Suportados

O webhook processa os seguintes eventos:

- `SALE_APPROVED` - Pagamento aprovado ✅
- `SALE_REFUSED` - Pagamento recusado ❌
- `SALE_CANCELED` - Pagamento cancelado 🚫
- `SALE_REFUNDED` - Pagamento reembolsado 💰
- `SALE_PENDING` - Pagamento pendente ⏳
- `SALE_PROCESSING` - Pagamento em processamento ⚙️

## 📨 Estrutura do Payload

A Kirvano envia um payload JSON com a seguinte estrutura:

```json
{
  "event": "SALE_APPROVED",
  "sale_id": "abc123def456",
  "transaction_id": "txn_789xyz",
  "amount": 5000,
  "currency": "BRL",
  "payment_method": "pix",
  "customer": {
    "name": "João Silva",
    "email": "joao@email.com",
    "phone_number": "+5511999999999",
    "document": "12345678900"
  },
  "metadata": {
    "sorteio_id": "sorteio-123",
    "quantidade": 10,
    "pedido_id": "ped-xyz789"
  },
  "created_at": "2026-01-13T10:30:00Z"
}
```

### Campos Importantes

| Campo | Tipo | Descrição |
|-------|------|-----------|
| `event` | string | Tipo do evento (SALE_APPROVED, SALE_REFUSED, etc) |
| `sale_id` | string | ID único da venda na Kirvano |
| `customer.name` | string | Nome completo do cliente |
| `customer.email` | string | Email do cliente |
| `customer.phone_number` | string | Telefone do cliente (opcional) |
| `customer.document` | string | CPF/CNPJ do cliente |
| `metadata.sorteio_id` | string | ID do sorteio (obrigatório) |
| `metadata.quantidade` | number | Quantidade de números (padrão: 10) |
| `metadata.pedido_id` | string | ID do pedido existente (opcional) |

## 🔄 Fluxo de Processamento

### Pagamento Aprovado (SALE_APPROVED)

1. **Validação**: Verifica se todos os dados obrigatórios foram recebidos
2. **Verificação de Pedido**: 
   - Se `metadata.pedido_id` existe, busca o pedido existente
   - Caso contrário, cria um novo pedido
3. **Geração de Números**:
   - Gera números aleatórios únicos do sorteio
   - Quantidade definida em `metadata.quantidade` (padrão: 10)
4. **Salvamento**:
   - Salva o pedido no banco de dados
   - Reserva os números gerados
   - Confirma a reserva (status: confirmado)
   - Atualiza contador de números vendidos
5. **Logs**: Registra todas as informações para auditoria

### Pagamento Recusado/Cancelado

1. Busca o pedido associado ao `sale_id`
2. Atualiza o status para "cancelado"
3. Registra o evento nos logs

## 🗄️ Estrutura do Banco de Dados

### Tabela: pedidos

```sql
CREATE TABLE pedidos (
  id VARCHAR(50) PRIMARY KEY,
  sorteio_id VARCHAR(50) NOT NULL,
  sorteio_titulo VARCHAR(255) NOT NULL,
  cpf VARCHAR(14) NOT NULL,
  nome VARCHAR(255) NOT NULL,
  valor_total DECIMAL(10,2) NOT NULL,
  quantidade_numeros INTEGER NOT NULL,
  status VARCHAR(20) NOT NULL, -- 'pendente', 'pago', 'cancelado'
  metodo_pagamento VARCHAR(20) NOT NULL, -- 'pix', 'cartao'
  stripe_session_id VARCHAR(255), -- Usado para armazenar sale_id da Kirvano
  data_pedido TIMESTAMP NOT NULL,
  data_pagamento TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Tabela: numeros_sorteio

```sql
CREATE TABLE numeros_sorteio (
  id BIGSERIAL PRIMARY KEY,
  numero INTEGER NOT NULL,
  sorteio_id VARCHAR(50) NOT NULL,
  pedido_id VARCHAR(50) NOT NULL,
  cpf VARCHAR(14) NOT NULL,
  data_reserva TIMESTAMP NOT NULL,
  status VARCHAR(20) NOT NULL, -- 'reservado', 'confirmado'
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(numero, sorteio_id)
);
```

### Tabela: usuarios

```sql
CREATE TABLE usuarios (
  cpf VARCHAR(14) PRIMARY KEY,
  nome VARCHAR(255) NOT NULL,
  data_cadastro TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## 🧪 Testes

### Testar Conectividade

```bash
curl https://seusite.com.br/api/webhook/kirvano
```

Resposta esperada:
```json
{
  "message": "Webhook Kirvano ativo",
  "endpoint": "/api/webhook/kirvano",
  "methods": ["POST", "GET"],
  "timestamp": "2026-01-13T10:30:00.000Z"
}
```

### Simular Pagamento Aprovado

```bash
curl -X POST https://seusite.com.br/api/webhook/kirvano \
  -H "Content-Type: application/json" \
  -d '{
    "event": "SALE_APPROVED",
    "sale_id": "test_123",
    "customer": {
      "name": "Teste Silva",
      "email": "teste@email.com",
      "document": "12345678900"
    },
    "metadata": {
      "sorteio_id": "sorteio-123",
      "quantidade": 5
    },
    "amount": 2500
  }'
```

## 📊 Logs e Monitoramento

O webhook registra logs detalhados de todas as operações:

- 📨 Webhook recebido
- ✅ Pagamento aprovado
- 🎲 Números gerados
- 📦 Pedido criado/atualizado
- ❌ Erros e falhas

### Exemplo de Log

```
📨 Webhook Kirvano recebido: { event: "SALE_APPROVED", sale_id: "abc123" }
✅ Pagamento aprovado - Iniciando processamento: { saleId: "abc123", cliente: "João Silva" }
🎲 Criando novo pedido e gerando números...
🎉 Novo pedido criado e processado: {
  pedidoId: "ped-xyz789",
  saleId: "abc123",
  cliente: "João Silva",
  quantidade: 10,
  numeros: [5, 23, 47, 89, 102, ...],
  sorteio: "iPhone 15 Pro Max"
}
```

## ⚠️ Tratamento de Erros

O webhook trata os seguintes cenários de erro:

1. **Dados incompletos**: Retorna erro 400
2. **Sorteio não encontrado**: Lança exceção
3. **Números insuficientes**: Lança exceção
4. **Pedido não encontrado** (ao confirmar): Retorna erro 404
5. **Erros de banco de dados**: Retorna erro 500

## 🔒 Segurança

### Recomendações

1. ✅ Configure HTTPS obrigatório
2. ✅ Valide a assinatura do webhook (se a Kirvano fornecer)
3. ✅ Limite a taxa de requisições (rate limiting)
4. ✅ Implemente whitelist de IPs da Kirvano
5. ✅ Monitore logs para detectar anomalias

### Validação de Assinatura (Opcional)

Se a Kirvano fornecer uma chave secreta para validação:

```typescript
const signature = request.headers.get('x-kirvano-signature');
const secret = process.env.KIRVANO_WEBHOOK_SECRET;

// Validar assinatura antes de processar
if (!validateSignature(payload, signature, secret)) {
  return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
}
```

## 🚀 Próximos Passos

- [ ] Integração com ActiveCampaign para envio de emails
- [ ] Notificações via WhatsApp com os números gerados
- [ ] Dashboard de monitoramento de webhooks
- [ ] Retry automático para falhas temporárias
- [ ] Webhook de teste em ambiente de desenvolvimento

## 📞 Suporte

Para dúvidas sobre a integração:
- Documentação Kirvano: https://docs.kirvano.com
- Suporte técnico: suporte@seusite.com.br
