# 🎲 Sorteios Criados - Sistema PixRápido

## ✅ Sorteios Ativos

### 1. 🧪 Sorteio TESTE - iPhone 15 Pro Max

**ID:** `sorteio_teste_001`

**Detalhes:**
- 📱 Prêmio: iPhone 15 Pro Max 256GB + AirPods Pro
- 💰 Valor do prêmio: R$ 12.000,00
- 🎫 Preço por número: R$ 5,00
- 🔢 Total de números: **5.000**
- 📊 Números: **10000000** até **10004999** (8 algarismos)
- 📅 Data do sorteio: 30 dias a partir de hoje
- 🎯 Status: Ativo
- 🔖 Destaque: Não

**Uso:** Testes e validação do sistema

---

### 2. 🏆 Sorteio REAL - Moto Honda CG 160 0KM

**ID:** `sorteio_real_001`

**Detalhes:**
- 🏍️ Prêmio: Moto Honda CG 160 0KM + R$ 5.000,00 em dinheiro
- 💰 Valor do prêmio: R$ 20.000,00
- 🎫 Preço por número: R$ 10,00
- 🔢 Total de números: **5.000**
- 📊 Números: **20000000** até **20004999** (8 algarismos)
- 📅 Data do sorteio: 45 dias a partir de hoje
- 🎯 Status: Ativo
- 🔖 Destaque: SIM ⭐

**Uso:** Sorteio real de produção

---

## 🔧 Como Usar no Webhook Kirvano

Configure o `metadata` no pagamento da Kirvano:

### Para Testes:
```json
{
  "metadata": {
    "sorteio_id": "sorteio_teste_001",
    "quantidade": 10
  }
}
```

### Para Produção (Real):
```json
{
  "metadata": {
    "sorteio_id": "sorteio_real_001",
    "quantidade": 10
  }
}
```

## ✅ Testes Realizados

### Local (http://localhost:3000)
- ✅ Webhook recebendo e processando
- ✅ Números gerados: 10000722, 10001989, 10004464
- ✅ Pedido criado: PED1768333974757523YAE3XO
- ✅ Salvamento no banco de dados: OK

### Produção (https://www.pixrapido-oficial.com)
- ✅ Sorteios criados no Supabase
- ✅ Webhook testado com sucesso
- ✅ Sistema 100% operacional

## 📊 Exemplo de Webhook Completo

```json
{
  "event": "SALE_APPROVED",
  "sale_id": "kirvano_venda_123",
  "transaction_id": "txn_456",
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
    "sorteio_id": "sorteio_real_001",
    "quantidade": 5
  },
  "created_at": "2026-01-13T19:00:00Z"
}
```

## 🎯 Resultado Esperado

Quando um pagamento for aprovado:
1. ✅ Sistema recebe webhook
2. ✅ Gera números aleatórios únicos (ex: 20001234, 20002567, 20003890...)
3. ✅ Cria pedido no banco
4. ✅ Confirma números reservados
5. ✅ Atualiza contador de vendidos
6. ✅ Cliente recebe seus números

## 🔐 URLs Importantes

- **Webhook:** https://www.pixrapido-oficial.com/api/webhook/kirvano
- **Criar sorteios:** https://www.pixrapido-oficial.com/api/criar-sorteios?secret=criar123
- **Verificar:** https://www.pixrapido-oficial.com/api/webhook/kirvano (GET)

## 📝 Logs de Teste

**Local:**
```
🎉 Novo pedido criado e processado: {
  pedidoId: 'PED1768333974757523YAE3XO',
  saleId: 'test_local_1768333973',
  cliente: 'João Silva Teste',
  quantidade: 3,
  numeros: [ 10000722, 10001989, 10004464 ],
  valorTotal: 15,
  sorteio: '🧪 SORTEIO TESTE - iPhone 15 Pro Max'
}
```

**Produção:**
```json
{
  "success": true,
  "message": "Webhook processado com sucesso",
  "event": "SALE_APPROVED",
  "sale_id": "test_prod_1768334073",
  "timestamp": "2026-01-13T19:54:35.455Z"
}
```

---

## 🚀 Sistema Pronto Para Receber Pagamentos Reais!

✅ Webhook ativo em produção
✅ Sorteios criados no banco
✅ Números de 8 algarismos configurados
✅ Testes completos realizados
✅ Sistema 100% funcional
