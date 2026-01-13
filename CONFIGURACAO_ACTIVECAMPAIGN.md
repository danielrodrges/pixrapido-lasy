# 🎯 Configuração da Integração com ActiveCampaign

## 📋 Visão Geral

A integração com ActiveCampaign permite enviar automaticamente os dados de compra dos clientes para automação de marketing, incluindo:
- Criação/atualização de contatos
- Adição dos números sorteados em campos personalizados
- Aplicação de tags para disparar automações (envio de emails, SMS, etc.)

---

## 🔑 Passo 1: Obter Credenciais da API

### 1.1 Acessar o ActiveCampaign
1. Faça login em: `https://suaconta.activehosted.com`
2. Vá em **Configurações** (ícone de engrenagem no canto inferior esquerdo)
3. Clique em **Desenvolvedor** → **Acesso à API**

### 1.2 Copiar Credenciais
- **URL da API**: algo como `https://suaconta.api-us1.com`
- **API Key**: uma chave longa começando com letras e números

### 1.3 Adicionar ao `.env.local`
```bash
ACTIVECAMPAIGN_API_URL=https://suaconta.api-us1.com
ACTIVECAMPAIGN_API_KEY=sua_api_key_aqui_muito_longa_123456789
```

---

## 📝 Passo 2: Criar Campo Personalizado para Números

### 2.1 Acessar Campos Personalizados
1. No ActiveCampaign, vá em **Listas** → **Gerenciar Campos**
2. Clique em **Adicionar Campo**

### 2.2 Configurar o Campo
- **Nome do Campo**: `Números do Sorteio`
- **Tipo**: `Texto` ou `Área de Texto`
- **Personalizado**: Marque esta opção
- **Visível**: Sim

### 2.3 Obter o ID do Campo
Após criar o campo, você pode obter o ID de duas formas:

**Opção A - Via Interface:**
1. Clique no campo criado para editar
2. Veja a URL do navegador: `...fields/edit/123` (o número é o ID)

**Opção B - Via API:**
```bash
curl -X GET "https://suaconta.api-us1.com/api/3/fields" \
  -H "Api-Token: SUA_API_KEY"
```

### 2.4 Adicionar ao `.env.local`
```bash
ACTIVECAMPAIGN_FIELD_NUMEROS_ID=123
```

---

## 🏷️ Passo 3: Criar Tag para Automação

### 3.1 Acessar Tags
1. Vá em **Contatos** → **Tags**
2. Clique em **Adicionar Tag**

### 3.2 Configurar a Tag
- **Nome da Tag**: `Compra Realizada` (ou `Pedido Aprovado`)
- **Descrição**: Tag aplicada quando o pagamento é confirmado

### 3.3 Obter o ID da Tag
**Via Interface:**
1. Clique na tag criada
2. Veja a URL: `...tags/123` (o número é o ID)

**Via API:**
```bash
curl -X GET "https://suaconta.api-us1.com/api/3/tags" \
  -H "Api-Token: SUA_API_KEY"
```

### 3.4 Adicionar ao `.env.local`
```bash
ACTIVECAMPAIGN_TAG_COMPRA_ID=456
```

---

## 🤖 Passo 4: Criar Automação de Email

### 4.1 Criar Nova Automação
1. Vá em **Automações** → **Criar Automação**
2. Escolha **Começar do zero**

### 4.2 Configurar Gatilho (Trigger)
- **Gatilho**: `Tag é adicionada ao contato`
- **Tag**: Selecione `Compra Realizada` (a tag criada no Passo 3)

### 4.3 Adicionar Ação de Email
1. Clique em **+** abaixo do gatilho
2. Escolha **Enviar um email**
3. Crie o template do email com as informações:

**Exemplo de Template:**
```html
<h1>🎉 Parabéns pela sua compra!</h1>

<p>Olá %FIRSTNAME%,</p>

<p>Seu pagamento foi confirmado com sucesso!</p>

<h2>Seus números da sorte:</h2>
<p style="font-size: 20px; font-weight: bold; color: #4CAF50;">
  %NUMEROS_DO_SORTEIO%
</p>

<p>Boa sorte! 🍀</p>

<p>Você pode acompanhar o sorteio em: <a href="https://www.pixrapido-oficial.com">www.pixrapido-oficial.com</a></p>
```

### 4.4 Ativar a Automação
- Certifique-se de que o status está **Ativo**
- Teste enviando manualmente a tag para um contato teste

---

## 🧪 Passo 5: Testar a Integração

### 5.1 Configurar Ambiente de Teste
```bash
# No .env.local, use os valores reais:
ACTIVECAMPAIGN_API_URL=https://suaconta.api-us1.com
ACTIVECAMPAIGN_API_KEY=sua_api_key_real
ACTIVECAMPAIGN_FIELD_NUMEROS_ID=123
ACTIVECAMPAIGN_TAG_COMPRA_ID=456
```

### 5.2 Fazer um Pedido de Teste
1. Acesse o checkout no seu site
2. Faça um pagamento de teste via Kirvano
3. Aguarde o webhook ser processado

### 5.3 Verificar no ActiveCampaign
1. Vá em **Contatos**
2. Busque pelo email usado no teste
3. Verifique se:
   - ✅ Contato foi criado/atualizado
   - ✅ Campo "Números do Sorteio" está preenchido
   - ✅ Tag "Compra Realizada" foi aplicada
   - ✅ Email de confirmação foi enviado (se automação estiver ativa)

### 5.4 Verificar Logs
```bash
# No terminal do projeto, veja os logs do webhook:
npm run dev

# Procure por linhas como:
# "Enviando dados para ActiveCampaign: email@teste.com"
# "Contato criado/atualizado: 12345"
# "Números do sorteio adicionados ao contato"
# "Tag de compra aplicada ao contato"
# "Integração com ActiveCampaign concluída com sucesso"
```

---

## 📄 Resumo dos IDs Necessários

| Variável | Onde Obter | Exemplo |
|----------|-----------|---------|
| `ACTIVECAMPAIGN_API_URL` | Configurações > Desenvolvedor > Acesso à API | `https://conta.api-us1.com` |
| `ACTIVECAMPAIGN_API_KEY` | Configurações > Desenvolvedor > Acesso à API | `abc123def456...` |
| `ACTIVECAMPAIGN_FIELD_NUMEROS_ID` | Listas > Gerenciar Campos > ID do campo criado | `123` |
| `ACTIVECAMPAIGN_TAG_COMPRA_ID` | Contatos > Tags > ID da tag criada | `456` |

---

## ❓ Troubleshooting

### Erro: "ActiveCampaign não configurado"
- **Causa**: Variáveis de ambiente não configuradas
- **Solução**: Verifique se todas as 4 variáveis estão no `.env.local` e reinicie o servidor

### Erro: "Erro ao criar contato"
- **Causa**: API Key inválida ou URL incorreta
- **Solução**: Verifique se copiou corretamente do ActiveCampaign

### Erro: "Erro ao adicionar campo personalizado"
- **Causa**: ID do campo incorreto
- **Solução**: Verifique o ID real do campo no ActiveCampaign

### Email não é enviado
- **Causa**: Automação não está ativa ou tag incorreta
- **Solução**: Verifique se a automação está **Ativa** e se a tag corresponde

### Integração não acontece mas pedido é salvo
- **Comportamento esperado**: O webhook não falha se o ActiveCampaign der erro
- **Verificar**: Logs do servidor para ver o erro específico

---

## 🚀 Deploy em Produção

Quando fizer deploy no Vercel, adicione as variáveis de ambiente:

```bash
# No dashboard do Vercel:
# Settings > Environment Variables

ACTIVECAMPAIGN_API_URL=https://suaconta.api-us1.com
ACTIVECAMPAIGN_API_KEY=sua_api_key_de_producao
ACTIVECAMPAIGN_FIELD_NUMEROS_ID=123
ACTIVECAMPAIGN_TAG_COMPRA_ID=456
```

Após adicionar, faça **Redeploy** do projeto.

---

## 📚 Documentação Oficial

- **ActiveCampaign API v3**: https://developers.activecampaign.com/reference/overview
- **Endpoints de Contatos**: https://developers.activecampaign.com/reference/contacts
- **Campos Personalizados**: https://developers.activecampaign.com/reference/custom-fields
- **Tags**: https://developers.activecampaign.com/reference/tags

---

✅ **Integração Completa!** Agora todos os clientes que comprarem receberão automaticamente um email com seus números da sorte! 🎉
