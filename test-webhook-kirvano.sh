#!/bin/bash
# Script de teste para simular webhook da Kirvano

echo "🧪 Testando Webhook Kirvano..."
echo ""
echo "📨 Enviando payload de teste (SALE_APPROVED)..."
echo ""

# Payload de exemplo - ajuste o sorteio_id conforme necessário
curl -X POST http://localhost:3000/api/webhook/kirvano \
  -H "Content-Type: application/json" \
  -d '{
    "event": "SALE_APPROVED",
    "sale_id": "test_kirvano_123456",
    "transaction_id": "txn_test_789xyz",
    "amount": 5000,
    "currency": "BRL",
    "payment_method": "pix",
    "customer": {
      "name": "João da Silva Teste",
      "email": "joao.teste@email.com",
      "phone_number": "+5511999887766",
      "document": "12345678900"
    },
    "metadata": {
      "sorteio_id": "prod_RaTp2WC2xaxsyj",
      "quantidade": 5
    },
    "created_at": "2026-01-13T19:00:00Z"
  }' | jq '.'

echo ""
echo ""
echo "✅ Teste concluído!"
echo "📋 Verifique os logs do servidor para mais detalhes"
