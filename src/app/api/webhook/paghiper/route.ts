import { NextRequest, NextResponse } from 'next/server';
import { atualizarStatusPedido, confirmarNumerosReservados, atualizarNumerosVendidos, obterPedidoPorId } from '@/lib/database';

// Webhook do PagHiper para processar notificações de pagamento
// Documentação: https://dev.paghiper.com/reference/notificacao-de-status

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    console.log('📨 Webhook PagHiper recebido:', body);

    const {
      notification_id,
      transaction_id,
      order_id,
      status,
      value_cents,
    } = body;

    // Validar dados do webhook
    if (!order_id || !status) {
      console.error('❌ Webhook inválido - faltam dados');
      return NextResponse.json(
        { error: 'Dados incompletos' },
        { status: 400 }
      );
    }

    const pedidoId = order_id;

    // Processar status do pagamento
    switch (status) {
      case 'paid':
      case 'completed':
        console.log('✅ Pagamento confirmado:', pedidoId);
        
        // Buscar pedido para pegar dados do sorteio
        const pedido = await obterPedidoPorId(pedidoId);
        
        if (pedido) {
          // 1. Atualizar status do pedido para "pago"
          await atualizarStatusPedido(pedidoId, 'pago');
          
          // 2. Confirmar números reservados
          await confirmarNumerosReservados(pedidoId);
          
          // 3. Atualizar contador de números vendidos
          await atualizarNumerosVendidos(pedido.sorteioId, pedido.numeros.length);
          
          console.log('🎉 Pedido processado com sucesso:', {
            pedidoId,
            transactionId: transaction_id,
            quantidade: pedido.numeros.length,
            numeros: pedido.numeros,
          });
        } else {
          console.error('❌ Pedido não encontrado:', pedidoId);
        }
        break;

      case 'canceled':
      case 'refunded':
        console.log('❌ Pagamento cancelado/reembolsado:', pedidoId);
        await atualizarStatusPedido(pedidoId, 'cancelado');
        break;

      case 'pending':
      case 'processing':
        console.log('⏳ Pagamento pendente:', pedidoId);
        // Não fazer nada, aguardar confirmação
        break;

      default:
        console.log('⚠️ Status desconhecido:', status);
    }

    return NextResponse.json({ 
      success: true,
      message: 'Webhook processado com sucesso'
    });
  } catch (error: any) {
    console.error('❌ Erro no webhook PagHiper:', error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}

// GET para teste de conectividade
export async function GET() {
  return NextResponse.json({ 
    message: 'Webhook PagHiper ativo',
    timestamp: new Date().toISOString()
  });
}
