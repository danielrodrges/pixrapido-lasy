# 🚀 Deploy do Webhook Kirvano

## ⚠️ IMPORTANTE: O webhook está funcionando localmente mas precisa ser deployado para produção!

### Status Atual:
- ✅ Código criado: `/src/app/api/webhook/kirvano/route.ts`
- ✅ Testes locais: Funcionando
- ❌ Produção: Retorna 404 (código não deployado)

### URL do Webhook:
```
https://www.pixrapido-oficial.com/api/webhook/kirvano
```

## 📦 Como Fazer o Deploy

### Opção 1: Git Push (Vercel/Netlify)
```bash
git add .
git commit -m "feat: adicionar webhook Kirvano para processamento de pagamentos PIX"
git push origin main
```

### Opção 2: Deploy Manual
Se estiver usando outra plataforma, siga os passos específicos da sua hospedagem.

### Opção 3: Vercel CLI
```bash
vercel --prod
```

## ✅ Verificar Deploy

Após o deploy, teste o endpoint:
```bash
curl https://www.pixrapido-oficial.com/api/webhook/kirvano
```

**Resposta esperada:**
```json
{
  "message": "Webhook Kirvano ativo",
  "endpoint": "/api/webhook/kirvano",
  "methods": ["POST", "GET"],
  "timestamp": "2026-01-13T19:44:00.000Z"
}
```

## 🔧 Configurar na Kirvano

Após o deploy, configure na plataforma Kirvano:

1. Acesse as configurações de webhook
2. URL do webhook: `https://www.pixrapido-oficial.com/api/webhook/kirvano`
3. Eventos: Selecione `SALE_APPROVED`, `SALE_REFUSED`, etc.
4. **Metadata obrigatório** no payload de pagamento:
   ```json
   {
     "metadata": {
       "sorteio_id": "ID_DO_SORTEIO",
       "quantidade": 10
     }
   }
   ```

## 🧪 Testar em Produção

Simular webhook após deploy:
```bash
curl -X POST https://www.pixrapido-oficial.com/api/webhook/kirvano \
  -H "Content-Type: application/json" \
  -d '{
    "event": "SALE_APPROVED",
    "sale_id": "test_123",
    "customer": {
      "name": "Teste",
      "email": "teste@email.com",
      "document": "12345678900"
    },
    "metadata": {
      "sorteio_id": "SEU_SORTEIO_ID_REAL",
      "quantidade": 5
    }
  }'
```

## 📊 Monitorar Logs

Após receber webhook real da Kirvano, monitore:
- Logs da plataforma de hospedagem
- Supabase logs (banco de dados)
- Confirme que os números foram gerados e salvos
