/**
 * Serviço de Integração com ActiveCampaign
 * 
 * Este serviço é responsável por sincronizar informações de pedidos
 * com o ActiveCampaign para automação de marketing e notificações.
 */

interface DadosCliente {
  email: string;
  nome: string;
  telefone?: string;
  numerosGerados: number[]; // Array de números
  pedidoId: string;
  sorteioId: string;
  valorPago: number;
}

interface ActiveCampaignContact {
  contact: {
    email: string;
    firstName?: string;
    phone?: string;
    fieldValues?: Array<{
      field: string;
      value: string;
    }>;
  };
}

interface ActiveCampaignTag {
  contactTag: {
    contact: string;
    tag: string;
  };
}

/**
 * Verifica se o ActiveCampaign está configurado
 */
export function isActiveCampaignConfigurado(): boolean {
  const apiUrl = process.env.ACTIVECAMPAIGN_API_URL;
  const apiKey = process.env.ACTIVECAMPAIGN_API_KEY;
  return !!(apiUrl && apiKey);
}

/**
 * Função principal que envia dados do pedido para o ActiveCampaign
 */
export async function enviarParaActiveCampaign(dados: DadosCliente): Promise<void> {
  if (!isActiveCampaignConfigurado()) {
    console.log('ActiveCampaign não configurado. Pulando integração.');
    return;
  }

  try {
    console.log(`Enviando dados para ActiveCampaign: ${dados.email}`);

    // Passo 1: Criar ou atualizar contato
    const contatoId = await criarOuAtualizarContato(dados);
    console.log(`Contato criado/atualizado: ${contatoId}`);

    // Passo 2: Adicionar números do sorteio como campo personalizado
    if (process.env.ACTIVECAMPAIGN_FIELD_NUMEROS_ID) {
      await adicionarCampoPersonalizado(
        contatoId,
        process.env.ACTIVECAMPAIGN_FIELD_NUMEROS_ID,
        dados.numerosGerados.join(', ')
      );
      console.log('Números do sorteio adicionados ao contato');
    }

    // Passo 3: Aplicar tag para disparar automação
    if (process.env.ACTIVECAMPAIGN_TAG_COMPRA_ID) {
      await aplicarTag(contatoId, process.env.ACTIVECAMPAIGN_TAG_COMPRA_ID);
      console.log('Tag de compra aplicada ao contato');
    }

    // Passo 4: Aplicar tag de participante para segmentação
    if (process.env.ACTIVECAMPAIGN_TAG_PARTICIPANTE_ID) {
      await aplicarTag(contatoId, process.env.ACTIVECAMPAIGN_TAG_PARTICIPANTE_ID);
      console.log('Tag de participante aplicada ao contato');
    }

    console.log('Integração com ActiveCampaign concluída com sucesso');
  } catch (error) {
    // Não falhar o webhook por erro no ActiveCampaign
    console.error('Erro ao integrar com ActiveCampaign:', error);
    console.error('O pedido foi processado, mas a notificação pode não ter sido enviada.');
  }
}

/**
 * Cria ou atualiza um contato no ActiveCampaign
 */
async function criarOuAtualizarContato(dados: DadosCliente): Promise<string> {
  const apiUrl = process.env.ACTIVECAMPAIGN_API_URL!;
  const apiKey = process.env.ACTIVECAMPAIGN_API_KEY!;

  // Primeiro, buscar se o contato já existe
  const searchUrl = `${apiUrl}/api/3/contacts?email=${encodeURIComponent(dados.email)}`;
  
  const searchResponse = await fetch(searchUrl, {
    method: 'GET',
    headers: {
      'Api-Token': apiKey,
      'Content-Type': 'application/json',
    },
  });

  if (!searchResponse.ok) {
    throw new Error(`Erro ao buscar contato: ${searchResponse.statusText}`);
  }

  const searchData = await searchResponse.json();
  
  // Se o contato existe, retornar o ID
  if (searchData.contacts && searchData.contacts.length > 0) {
    const contatoExistente = searchData.contacts[0];
    console.log(`Contato existente encontrado: ${contatoExistente.id}`);
    
    // Atualizar o contato existente se necessário
    const updateUrl = `${apiUrl}/api/3/contacts/${contatoExistente.id}`;
    const updateBody: ActiveCampaignContact = {
      contact: {
        email: dados.email,
        firstName: dados.nome,
        phone: dados.telefone,
      },
    };

    const updateResponse = await fetch(updateUrl, {
      method: 'PUT',
      headers: {
        'Api-Token': apiKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updateBody),
    });

    if (!updateResponse.ok) {
      console.warn(`Erro ao atualizar contato: ${updateResponse.statusText}`);
    }

    return contatoExistente.id;
  }

  // Se não existe, criar novo contato
  const createUrl = `${apiUrl}/api/3/contacts`;
  const createBody: ActiveCampaignContact = {
    contact: {
      email: dados.email,
      firstName: dados.nome,
      phone: dados.telefone,
    },
  };

  const createResponse = await fetch(createUrl, {
    method: 'POST',
    headers: {
      'Api-Token': apiKey,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(createBody),
  });

  if (!createResponse.ok) {
    const errorText = await createResponse.text();
    throw new Error(`Erro ao criar contato: ${createResponse.statusText} - ${errorText}`);
  }

  const createData = await createResponse.json();
  return createData.contact.id;
}

/**
 * Adiciona ou atualiza um campo personalizado do contato
 */
async function adicionarCampoPersonalizado(
  contatoId: string,
  fieldId: string,
  valor: string
): Promise<void> {
  const apiUrl = process.env.ACTIVECAMPAIGN_API_URL!;
  const apiKey = process.env.ACTIVECAMPAIGN_API_KEY!;

  const url = `${apiUrl}/api/3/fieldValues`;
  const body = {
    fieldValue: {
      contact: contatoId,
      field: fieldId,
      value: valor,
    },
  };

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Api-Token': apiKey,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Erro ao adicionar campo personalizado: ${response.statusText} - ${errorText}`);
  }
}

/**
 * Aplica uma tag ao contato para disparar automações
 */
async function aplicarTag(contatoId: string, tagId: string): Promise<void> {
  const apiUrl = process.env.ACTIVECAMPAIGN_API_URL!;
  const apiKey = process.env.ACTIVECAMPAIGN_API_KEY!;

  const url = `${apiUrl}/api/3/contactTags`;
  const body: ActiveCampaignTag = {
    contactTag: {
      contact: contatoId,
      tag: tagId,
    },
  };

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Api-Token': apiKey,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Erro ao aplicar tag: ${response.statusText} - ${errorText}`);
  }
}
