import { NextRequest, NextResponse } from 'next/server';
import { 
  atualizarStatusPedido, 
  confirmarNumerosReservados, 
  atualizarNumerosVendidos, 
  obterPedidoPorId,
  salvarPedido,
  reservarNumeros,
  gerarNumerosAleatoriosUnicos,
  gerarIdPedido,
  obterSorteio
} from '@/lib/database';
import { Pedido } from '@/lib/types';
import { enviarParaActiveCampaign, isActiveCampaignConfigurado } from '@/lib/activecampaign';

// Webhook da Kirvano para processar notificações de pagamento
// Documentação: https://docs.kirvano.com/webhooks
// URL do webhook: https://seusite.com.br/api/webhook/kirvano

interface KirvanoCustomer {
  name: string;
  email: string;
  phone_number?: string;
  document?: string; // CPF/CNPJ
}

interface KirvanoWebhookPayload {
  event: string; // SALE_APPROVED, SALE_REFUSED, etc.
  sale_id: string;
  transaction_id?: string;
  amount?: number;
  currency?: string;
  payment_method?: string;
  customer: KirvanoCustomer;
  metadata?: {
    sorteio_id?: string;
    quantidade?: number;
    pedido_id?: string;
  };
  created_at?: string;
}

export async function POST(request: NextRequest) {
  try {
    const payload: KirvanoWebhookPayload = await request.json();
    
    console.log('📨 Webhook Kirvano recebido:', JSON.stringify(payload, null, 2));

    const { event, sale_id, customer, metadata } = payload;

    // Validar dados do webhook
    if (!event || !sale_id || !customer) {
      console.error('❌ Webhook inválido - faltam dados obrigatórios');
      return NextResponse.json(
        { error: 'Dados incompletos' },
        { status: 400 }
      );
    }

    // Processar evento
    switch (event) {
      case 'SALE_APPROVED':
        await processarPagamentoAprovado(payload);
        break;

      case 'SALE_REFUSED':
      case 'SALE_CANCELED':
      case 'SALE_REFUNDED':
        await processarPagamentoRecusado(payload);
        break;

      case 'SALE_PENDING':
      case 'SALE_PROCESSING':
        console.log('⏳ Pagamento pendente:', sale_id);
        // Não fazer nada, aguardar confirmação
        break;

      default:
        console.log('⚠️ Evento desconhecido:', event);
        return NextResponse.json(
          { warning: `Evento desconhecido: ${event}` },
          { status: 200 }
        );
    }

    return NextResponse.json({ 
      success: true,
      message: 'Webhook processado com sucesso',
      event,
      sale_id,
      timestamp: new Date().toISOString()
    });
  } catch (error: any) {
    console.error('❌ Erro no webhook Kirvano:', error);
    return NextResponse.json(
      { 
        error: error.message,
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}

async function processarPagamentoAprovado(payload: KirvanoWebhookPayload) {
  const { sale_id, customer, metadata, amount, payment_method } = payload;

  console.log('✅ Pagamento aprovado - Iniciando processamento:', {
    saleId: sale_id,
    cliente: customer.name,
    email: customer.email,
  });

  try {
    // Extrair dados do cliente
    const nome = customer.name;
    const email = customer.email;
    const telefone = customer.phone_number || '';
    const cpf = customer.document || sale_id; // Usar sale_id como fallback se CPF não fornecido

    // Extrair e validar metadados
    const sorteioId = metadata?.sorteio_id;
    let quantidade = 10; // valor padrão
    
    if (metadata?.quantidade) {
      // Garantir que quantidade é um número válido
      quantidade = typeof metadata.quantidade === 'number' 
        ? metadata.quantidade 
        : parseInt(String(metadata.quantidade));
      
      // Validar quantidade (mínimo 1, máximo 100)
      if (isNaN(quantidade) || quantidade < 1) {
        quantidade = 10;
        console.warn('⚠️ Quantidade inválida, usando padrão: 10');
      }
      if (quantidade > 100) {
        quantidade = 100;
        console.warn('⚠️ Quantidade limitada ao máximo: 100');
      }
    }

    console.log('📋 Metadados processados:', {
      sorteioId,
      quantidadeSolicitada: quantidade,
    });

    // Verificar se já existe um pedido com este sale_id
    let pedidoId = metadata?.pedido_id || sale_id;
    let pedido = await obterPedidoPorId(pedidoId);

    if (pedido) {
      // Pedido já existe, apenas confirmar pagamento
      console.log('📦 Pedido existente encontrado:', pedidoId);
      
      await atualizarStatusPedido(pedidoId, 'pago');
      await confirmarNumerosReservados(pedidoId);
      await atualizarNumerosVendidos(pedido.sorteioId, pedido.numeros.length);

      console.log('🎉 Pedido confirmado:', {
        pedidoId,
        saleId: sale_id,
        quantidade: pedido.numeros.length,
        numeros: pedido.numeros,
      });
    } else {
      // Novo pedido - gerar números automaticamente
      console.log('🎲 Criando novo pedido e gerando números...');

      // Validar sorteio_id
      if (!sorteioId) {
        throw new Error('ID do sorteio não fornecido no metadata. Configure metadata.sorteio_id no pagamento da Kirvano.');
      }

      const sorteio = await obterSorteio(sorteioId);
      if (!sorteio) {
        throw new Error(`Sorteio ${sorteioId} não encontrado. IDs válidos: sorteio_teste_001, sorteio_real_001`);
      }

      // Gerar números aleatórios únicos
      const numerosGerados = await gerarNumerosAleatoriosUnicos(quantidade, sorteioId);

      // Criar novo pedido
      pedidoId = gerarIdPedido();
      const valorTotal = amount ? amount / 100 : sorteio.precoPorNumero * quantidade; // Converter centavos para reais

      const novoPedido: Pedido = {
        id: pedidoId,
        sorteioId,
        sorteioTitulo: sorteio.titulo,
        numeros: numerosGerados,
        quantidadeNumeros: quantidade,
        valorTotal,
        dataPedido: new Date(),
        dataPagamento: new Date(),
        status: 'pago',
        metodoPagamento: 'pix', // Ajustar conforme payment_method
        cpf,
        nome,
        stripeSessionId: sale_id, // Usar sale_id da Kirvano
      };

      // Salvar pedido
      await salvarPedido(novoPedido);

      // Reservar e confirmar números
      await reservarNumeros(numerosGerados, sorteioId, pedidoId, cpf);
      await confirmarNumerosReservados(pedidoId);

      // Atualizar contador de vendidos
      await atualizarNumerosVendidos(sorteioId, quantidade);

      console.log('🎉 Novo pedido criado e processado:', {
        pedidoId,
        saleId: sale_id,
        sorteioId,
        sorteioTitulo: sorteio.titulo,
        cliente: nome,
        email,
        telefone,
        cpf,
        quantidadeSolicitada: quantidade,
        quantidadeGerada: numerosGerados.length,
        numeros: numerosGerados,
        valorTotal,
        metodoPagamento: payment_method || 'pix',
      });

      // Integrar com ActiveCampaign (opcional)
      if (isActiveCampaignConfigurado()) {
        try {
          await enviarParaActiveCampaign({
            email,
            nome,
            telefone,
            numerosGerados,
            pedidoId,
            sorteioId,
            valorPago: valorTotal,
          });
        } catch (error) {
          // Não falhar o webhook por erro no ActiveCampaign
          console.error('⚠️ Erro ao enviar para ActiveCampaign (pedido foi salvo com sucesso):', error);
        }
      } else {
        console.log('ℹ️ ActiveCampaign não configurado - notificação não enviada');
      }
    }
  } catch (error: any) {
    console.error('❌ Erro ao processar pagamento aprovado:', error);
    throw error;
  }
}

async function processarPagamentoRecusado(payload: KirvanoWebhookPayload) {
  const { sale_id, event, customer, metadata } = payload;

  // Extrair sorteio_id dos metadados se disponível
  const sorteioId = metadata?.sorteio_id;

  console.log('❌ Pagamento recusado/cancelado:', {
    saleId: sale_id,
    event,
    cliente: customer.name,
    sorteioId: sorteioId || 'não informado',
  });

  try {
    // Verificar se existe pedido associado
    const pedidoId = metadata?.pedido_id || sale_id;
    const pedido = await obterPedidoPorId(pedidoId);

    if (pedido) {
      await atualizarStatusPedido(pedidoId, 'cancelado');
      console.log('📝 Status do pedido atualizado para cancelado:', {
        pedidoId,
        sorteioId: pedido.sorteioId,
      });
    } else {
      console.log('ℹ️ Nenhum pedido encontrado para cancelar:', sale_id);
    }
  } catch (error: any) {
    console.error('❌ Erro ao processar pagamento recusado:', error);
    throw error;
  }
}

// GET para teste de conectividade
export async function GET() {
  return NextResponse.json({ 
    message: 'Webhook Kirvano ativo',
    endpoint: '/api/webhook/kirvano',
    methods: ['POST', 'GET'],
    timestamp: new Date().toISOString()
  });
}
