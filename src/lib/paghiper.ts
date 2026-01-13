// Cliente PagHiper para processar pagamentos PIX
// Documentação: https://dev.paghiper.com/reference/emissao-de-pix-paghiper

const PAGHIPER_API_URL = 'https://pix.paghiper.com/invoice/create/';

interface PagHiperPixRequest {
  apiKey: string;
  order_id: string;
  payer_email: string;
  payer_name: string;
  payer_cpf_cnpj: string;
  payer_phone?: string;
  days_due_date: string;
  notification_url?: string;
  discount_cents?: string;
  shipping_price_cents?: string;
  shipping_methods?: string;
  fixed_description?: boolean;
  items: Array<{
    description: string;
    quantity: string;
    item_id: string;
    price_cents: string;
  }>;
}

// Resposta da API PagHiper (HTTP 201)
interface PagHiperApiResponse {
  result: string;
  response_message: string;
  create_request: {
    transaction_id: string;
    order_id: string;
    created_date: string;
    status: string;
    due_date: string;
    value_cents: string;
    bank_slip: {
      url_slip: string;
      url_slip_pdf: string;
      digitable_line: string;
    };
    pix_code: {
      qrcode_base64: string;
      qrcode_image_url: string;
      emv: string;
      bacen_url: string;
      pix_url: string;
    };
  };
}

// Formato simplificado para uso interno
interface PagHiperPixResponse {
  transaction_id: string;
  order_id: string;
  status: string;
  pix_code: {
    qrcode_base64: string;
    qrcode_image_url: string;
    emv: string;
    bacen_url: string;
    pix_url: string;
  };
  url_slip: string;
  due_date: string;
  value_cents: string;
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
    console.error('❌ PAGHIPER_API_KEY não encontrada');
    throw new Error('PAGHIPER_API_KEY não configurada');
  }

  const valorEmCentavos = Math.round(params.valorTotal * 100);
  
  // Obter URL pública - Vercel fornece VERCEL_URL automaticamente
  const baseUrl = process.env.VERCEL_URL 
    ? `https://${process.env.VERCEL_URL}`
    : process.env.NEXT_PUBLIC_URL || 'http://localhost:3002';
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
    apiKeyPresent: !!apiKey,
  });

  const response = await fetch(PAGHIPER_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json; charset=UTF-8',
      'Accept': 'application/json',
      'Accept-Charset': 'UTF-8',
      'Accept-Encoding': 'application/json',
    },
    body: JSON.stringify(requestData),
  });

  const responseText = await response.text();
  
  console.log('📥 Status HTTP:', response.status);
  console.log('📥 Resposta raw:', responseText);
  
  // HTTP 201 significa sucesso (seguindo exemplo PHP)
  if (response.status !== 201) {
    console.error('❌ Erro PagHiper - Status:', response.status);
    console.error('❌ Resposta:', responseText);
    
    try {
      const errorData = JSON.parse(responseText);
      throw new Error(errorData.response_message || `Erro HTTP ${response.status}`);
    } catch {
      throw new Error(`Erro HTTP ${response.status}: ${responseText}`);
    }
  }

  let apiResponse: PagHiperApiResponse;
  try {
    apiResponse = JSON.parse(responseText);
  } catch (e) {
    console.error('❌ Resposta não é JSON válido:', responseText);
    throw new Error('Resposta inválida da API PagHiper');
  }

  console.log('📥 Resposta PagHiper:', JSON.stringify(apiResponse, null, 2));

  // Verificar se teve sucesso
  if (apiResponse.result !== 'success') {
    console.error('❌ PagHiper retornou erro:', apiResponse);
    throw new Error(apiResponse.response_message || 'Erro ao criar PIX no PagHiper');
  }

  // Verificar se create_request existe
  if (!apiResponse.create_request) {
    console.error('❌ create_request não encontrado na resposta');
    throw new Error('Resposta inválida: create_request não encontrado');
  }

  const createRequest = apiResponse.create_request;

  console.log('✅ PIX criado com sucesso:', {
    transactionId: createRequest.transaction_id,
    orderId: createRequest.order_id,
    status: createRequest.status,
    valueCents: createRequest.value_cents,
  });

  // Retornar formato simplificado
  return {
    transaction_id: createRequest.transaction_id,
    order_id: createRequest.order_id,
    status: createRequest.status,
    pix_code: createRequest.pix_code,
    url_slip: createRequest.bank_slip.url_slip,
    due_date: createRequest.due_date,
    value_cents: createRequest.value_cents,
  };
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
