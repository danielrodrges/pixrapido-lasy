// Cliente PagHiper para processar pagamentos PIX
// Documentação: https://dev.paghiper.com/reference/emissao-de-pix-paghiper

const PAGHIPER_API_URL = 'https://pix.paghiper.com/invoice/create/';

interface PagHiperPixRequest {
  apiKey: string;
  order_id: string;
  payer_email: string;
  payer_name: string;
  payer_cpf_cnpj: string;
  days_due_date: string;
  notification_url?: string;
  discount_cents?: string;
  shipping_price_cents?: string;
  shipping_methods?: string;
  fixed_description?: boolean;
  type_bank_slip?: string;
  partners_id?: string;
  items: Array<{
    description: string;
    quantity: string;
    item_id: string;
    price_cents: string;
  }>;
}

interface PagHiperPixResponse {
  result: string;
  response_message: string;
  transaction_id: string;
  order_id: string;
  created_date: string;
  status: string;
  url_slip: string;
  url_slip_pdf: string;
  digitable_line: string;
  bar_code_number_to_image: string;
  pix_code: {
    qrcode_base64: string;
    qrcode_image_url: string;
    emv: string;
    bacen_url: string;
    pix_url: string;
  };
  due_date: string;
  num_cart_selected: string;
  value_cents: string;
  open_after_day_due: string;
}

/**
 * Cria uma transação PIX no PagHiper
 */
export async function criarPixPagHiper(params: {
  pedidoId: string;
  nomeCliente: string;
  cpfCliente: string;
  emailCliente?: string;
  valorTotal: number;
  descricao: string;
  quantidade: number;
}): Promise<PagHiperPixResponse> {
  const apiKey = process.env.PAGHIPER_API_KEY;

  if (!apiKey) {
    throw new Error('PAGHIPER_API_KEY não configurada no .env.local');
  }

  const valorEmCentavos = Math.round(params.valorTotal * 100);
  
  // Obter URL pública do Codespace
  const baseUrl = process.env.NEXT_PUBLIC_URL || 'http://localhost:3002';
  const webhookUrl = `${baseUrl}/api/webhook/paghiper`;

  const requestData: PagHiperPixRequest = {
    apiKey: apiKey,
    order_id: params.pedidoId,
    payer_email: params.emailCliente || `${params.cpfCliente}@pixrapido.com.br`,
    payer_name: params.nomeCliente,
    payer_cpf_cnpj: params.cpfCliente.replace(/\D/g, ''),
    days_due_date: '1',
    notification_url: webhookUrl,
    items: [
      {
        description: params.descricao,
        quantity: params.quantidade.toString(),
        item_id: params.pedidoId,
        price_cents: valorEmCentavos.toString(),
      },
    ],
  };

  console.log('📤 Criando PIX no PagHiper:', {
    pedidoId: params.pedidoId,
    valor: params.valorTotal,
    valorCentavos: valorEmCentavos,
    webhook: webhookUrl,
  });
  console.log('📤 Dados da requisição:', JSON.stringify(requestData, null, 2));

  const response = await fetch(PAGHIPER_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
    body: JSON.stringify(requestData),
  });

  const responseText = await response.text();
  
  if (!response.ok) {
    console.error('❌ Erro PagHiper HTTP:', response.status);
    console.error('❌ Resposta:', responseText);
    throw new Error(`Erro HTTP ${response.status}: ${responseText}`);
  }

  let data;
  try {
    data = JSON.parse(responseText);
  } catch (e) {
    console.error('❌ Resposta não é JSON:', responseText);
    throw new Error('Resposta inválida da API PagHiper');
  }

  console.log('📥 Resposta PagHiper:', JSON.stringify(data, null, 2));

  if (data.result !== 'success') {
    console.error('❌ PagHiper retornou erro:', data);
    throw new Error(data.response_message || 'Erro ao criar PIX no PagHiper');
  }

  console.log('✅ PIX criado:', {
    transactionId: data.transaction_id,
    orderId: data.order_id,
    status: data.status,
  });

  return data;
}

/**
 * Verifica o status de uma transação no PagHiper
 */
export async function verificarStatusPix(transactionId: string, token: string): Promise<any> {
  const apiKey = process.env.PAGHIPER_API_KEY;

  if (!apiKey || !token) {
    throw new Error('Credenciais PagHiper não configuradas');
  }

  const response = await fetch('https://pix.paghiper.com/invoice/status/', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
    body: JSON.stringify({
      apiKey: apiKey,
      token: token,
      transaction_id: transactionId,
    }),
  });

  if (!response.ok) {
    throw new Error(`Erro ao verificar status: ${response.status}`);
  }

  const data = await response.json();
  return data;
}
