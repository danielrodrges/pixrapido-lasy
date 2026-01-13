#!/bin/bash

# Script para configurar variáveis de ambiente no Vercel
# Execute: chmod +x configurar-vercel-env.sh && ./configurar-vercel-env.sh

echo "🚀 Configurando variáveis de ambiente do ActiveCampaign no Vercel..."
echo ""

# Verifique se o Vercel CLI está instalado
if ! command -v vercel &> /dev/null; then
    echo "❌ Vercel CLI não encontrado. Instalando..."
    npm i -g vercel
fi

echo "📝 Adicionando variáveis de ambiente..."
echo ""

# ActiveCampaign API URL
vercel env add ACTIVECAMPAIGN_API_URL production <<EOF
https://proton31341.api-us1.com
EOF

# ActiveCampaign API Key
vercel env add ACTIVECAMPAIGN_API_KEY production <<EOF
c9f94a621dfaa4ac651063508d85a03837cb653f45ab7fee789917e769030c39e57b8805
EOF

# ActiveCampaign Field ID
vercel env add ACTIVECAMPAIGN_FIELD_NUMEROS_ID production <<EOF
2
EOF

# ActiveCampaign Tag Compra ID
vercel env add ACTIVECAMPAIGN_TAG_COMPRA_ID production <<EOF
1
EOF

# ActiveCampaign Tag Participante ID
vercel env add ACTIVECAMPAIGN_TAG_PARTICIPANTE_ID production <<EOF
4
EOF

echo ""
echo "✅ Variáveis configuradas com sucesso!"
echo ""
echo "🔄 Fazendo redeploy do projeto..."
vercel --prod

echo ""
echo "✅ Deploy concluído!"
echo ""
echo "🎉 Integração ActiveCampaign ativa em produção!"
