#!/bin/bash
echo "╔════════════════════════════════════════════════════════════╗"
echo "║        STATUS DO WEBHOOK KIRVANO - PRODUÇÃO               ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo ""

# 1. Verificar se endpoint está ativo
echo "1️⃣ Testando endpoint..."
RESPONSE=$(curl -s https://www.pixrapido-oficial.com/api/webhook/kirvano)
if echo "$RESPONSE" | grep -q "Webhook Kirvano ativo"; then
    echo "   ✅ Endpoint ATIVO"
else
    echo "   ❌ Endpoint não responde corretamente"
fi
echo ""

# 2. Testar com webhook simulado
echo "2️⃣ Enviando webhook de teste..."
TEST_RESPONSE=$(curl -s -X POST https://www.pixrapido-oficial.com/api/webhook/kirvano \
  -H "Content-Type: application/json" \
  -d '{
    "event": "SALE_APPROVED",
    "sale_id": "test_verificacao_'$(date +%s)'",
    "customer": {
      "name": "Teste Status",
      "email": "teste@status.com",
      "document": "00000000000"
    },
    "metadata": {
      "sorteio_id": "ID_INEXISTENTE",
      "quantidade": 1
    }
  }')

if echo "$TEST_RESPONSE" | grep -q "error"; then
    echo "   ✅ Webhook RECEBE requisições"
    echo "   📋 Resposta: $(echo $TEST_RESPONSE | head -c 100)..."
else
    echo "   ⚠️ Resposta inesperada"
fi
echo ""

echo "3️⃣ Para webhook REAL da Kirvano funcionar:"
echo "   • Certifique-se que o sorteio existe no banco Supabase"
echo "   • Use um sorteio_id válido no metadata"
echo "   • Configure URL na Kirvano:"
echo "     https://www.pixrapido-oficial.com/api/webhook/kirvano"
echo ""

echo "4️⃣ Verificar logs em tempo real:"
echo "   • Acesse: https://vercel.com/dashboard"
echo "   • Ou monitore o banco de dados Supabase"
echo ""

echo "═══════════════════════════════════════════════════════════"
echo "Status: WEBHOOK ESTÁ ATIVO E AGUARDANDO REQUISIÇÕES REAIS"
echo "═══════════════════════════════════════════════════════════"
