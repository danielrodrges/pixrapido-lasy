# 🚀 Fluxo de Pagamento - Kirvano + ActiveCampaign

## 📋 Arquitetura Atual

```
Frontend (Checkout)
       ↓
   Kirvano SDK (JavaScript)
       ↓
   Processa Pagamento PIX
       ↓
Webhook: /api/webhook/kirvano
       ↓
   Gera Números Aleatórios
       ↓
   Salva no Supabase
       ↓
   ActiveCampaign API
       ↓
   Email Automático para Cliente
```

---

## ✅ Integrações Ativas

### 1. **Kirvano** (Gateway de Pagamento PIX)
- ✅ SDK JavaScript integrado no frontend
- ✅ Webhook configurado: `https://www.pixrapido-oficial.com/api/webhook/kirvano`
- ✅ Gera números aleatórios automaticamente
- ✅ Salva pedido no Supabase

### 2. **ActiveCampaign** (Automação de Marketing)
- ✅ Cria/atualiza contatos automaticamente
- ✅ Envia números do sorteio
- ✅ Aplica tags para automações
- ✅ Dispara email com números da sorte

### 3. **Supabase** (Banco de Dados)
- ✅ Armazena sorteios
- ✅ Armazena pedidos
- ✅ Armazena números reservados

---

## 🔄 Fluxo Detalhado

### Passo 1: Cliente no Checkout
1. Cliente seleciona quantidade de números
2. Preenche dados (nome, email, telefone, CPF)
3. Sistema **reserva os números** no Supabase (status: `reservado`)
4. Sistema cria pedido (status: `pendente`)

### Passo 2: Pagamento via Kirvano
1. Frontend chama SDK da Kirvano
2. Kirvano gera PIX (QR Code)
3. Cliente paga via PIX
4. Kirvano processa pagamento

### Passo 3: Webhook Recebe Notificação
**Evento:** `SALE_APPROVED`

```json
{
  "event": "SALE_APPROVED",
  "sale_id": "ABC123",
  "amount": 1000,
  "customer": {
    "name": "João Silva",
    "email": "joao@email.com",
    "phone_number": "11999999999",
    "document": "12345678900"
  },
  "metadata": {
    "sorteio_id": "sorteio_real_001",
    "quantidade": 7,
    "pedido_id": "PED123456"
  }
}
```

### Passo 4: Webhook Processa
1. ✅ Valida dados do webhook
2. ✅ Confirma números reservados (status: `confirmado`)
3. ✅ Atualiza pedido (status: `pago`)
4. ✅ Atualiza contador de vendidos do sorteio

### Passo 5: Integração ActiveCampaign
1. ✅ Busca contato pelo email (ou cria novo)
2. ✅ Atualiza dados (nome, telefone)
3. ✅ Adiciona números ao campo personalizado "Números do Sorteio"
4. ✅ Aplica tag "Compra Realizada" → **dispara automação**
5. ✅ Aplica tag "sorteio_participante" → **segmentação**

### Passo 6: Email Automático
- Automação do ActiveCampaign é disparada pela tag
- Cliente recebe email com seus números da sorte
- Template pode incluir: `%NUMEROS_SORTEIO%`

---

## 🎯 Endpoint de Checkout

**URL:** `/api/checkout`

**Método:** `POST`

**Body:**
```json
{
  "sorteioId": "sorteio_real_001",
  "sorteioTitulo": "Honda CG 160 + R$5.000",
  "quantidade": 7,
  "valorTotal": 70.00,
  "cpf": "12345678900",
  "nome": "João Silva",
  "email": "joao@email.com",
  "telefone": "11999999999",
  "numeros": [20000001, 20000002, ...]
}
```

**Response:**
```json
{
  "success": true,
  "pedidoId": "PED1768334543312",
  "sorteioId": "sorteio_real_001",
  "quantidade": 7,
  "valorTotal": 70.00,
  "numeros": [20000001, 20000002, ...],
  "cliente": {
    "nome": "João Silva",
    "email": "joao@email.com",
    "telefone": "11999999999",
    "cpf": "12345678900"
  },
  "metadata": {
    "pedido_id": "PED1768334543312",
    "sorteio_id": "sorteio_real_001",
    "quantidade": 7
  }
}
```

**Importante:** O frontend deve enviar os `metadata` para a Kirvano!

---

## 🔧 Configuração Frontend (Kirvano SDK)

```javascript
// Exemplo de integração
const response = await fetch('/api/checkout', {
  method: 'POST',
  body: JSON.stringify(checkoutData)
});

const data = await response.json();

// Enviar para Kirvano com metadata
window.KirvanoSDK.createPayment({
  amount: data.valorTotal * 100, // em centavos
  customer: data.cliente,
  metadata: data.metadata, // ← IMPORTANTE!
  callback_url: 'https://www.pixrapido-oficial.com/api/webhook/kirvano'
});
```

---

## 📊 Variáveis de Ambiente Necessárias

```bash
# Supabase
SUPABASE_URL=https://yimepunibxjjfpjuvihs.supabase.co
SUPABASE_ANON_KEY=ey...

# ActiveCampaign
ACTIVECAMPAIGN_API_URL=https://proton31341.api-us1.com
ACTIVECAMPAIGN_API_KEY=c9f94a...
ACTIVECAMPAIGN_FIELD_NUMEROS_ID=2
ACTIVECAMPAIGN_TAG_COMPRA_ID=1
ACTIVECAMPAIGN_TAG_PARTICIPANTE_ID=4
```

**Não precisa de variáveis para Kirvano!** O webhook é público.

---

## ❌ Integrações Removidas

- ~~PagHiper~~ - REMOVIDO COMPLETAMENTE
- ~~Stripe~~ - Não utilizado no fluxo PIX

---

## 🧪 Testar o Fluxo

### 1. Fazer Pedido de Teste
```bash
curl -X POST https://www.pixrapido-oficial.com/api/checkout \
  -H "Content-Type: application/json" \
  -d '{
    "sorteioId": "sorteio_real_001",
    "sorteioTitulo": "Honda CG 160",
    "quantidade": 5,
    "valorTotal": 50.00,
    "cpf": "12345678900",
    "nome": "Teste",
    "email": "teste@email.com",
    "telefone": "11999999999",
    "numeros": [20000001, 20000002, 20000003, 20000004, 20000005]
  }'
```

### 2. Simular Pagamento Aprovado
```bash
curl -X POST https://www.pixrapido-oficial.com/api/webhook/kirvano \
  -H "Content-Type: application/json" \
  -d '{
    "event": "SALE_APPROVED",
    "sale_id": "TEST123",
    "amount": 5000,
    "customer": {
      "name": "Teste",
      "email": "teste@email.com",
      "phone_number": "11999999999"
    },
    "metadata": {
      "sorteio_id": "sorteio_real_001",
      "quantidade": 5
    }
  }'
```

### 3. Verificar no ActiveCampaign
- Vá em **Contatos**
- Busque por `teste@email.com`
- Verifique se tem os números e as tags aplicadas

---

## 📚 Arquivos do Sistema

| Arquivo | Função |
|---------|--------|
| `/api/checkout/route.ts` | Cria pedido e reserva números |
| `/api/webhook/kirvano/route.ts` | Processa webhook e confirma pagamento |
| `/lib/activecampaign.ts` | Integração com ActiveCampaign |
| `/lib/database.ts` | Operações com Supabase |

---

## ✅ Status Final

- 🟢 **Kirvano:** Totalmente integrado
- 🟢 **ActiveCampaign:** Totalmente integrado
- 🟢 **Supabase:** Totalmente integrado
- ❌ **PagHiper:** REMOVIDO
- ⚪ **Stripe:** Não utilizado

**Sistema pronto para produção!** 🚀
