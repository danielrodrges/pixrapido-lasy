import { NextRequest, NextResponse } from 'next/server';
import { enviarParaActiveCampaign, isActiveCampaignConfigurado } from '@/lib/activecampaign';
import { 
  atualizarStatusPedido, 
  confirmarNumerosReservados, 
  atualizarNumerosVendidos, 
  obterPedidoPorId,
  obterSorteio
} from '@/lib/database';

/**
 * API para aprovar pagamento manualmente (DESENVOLVIMENTO/TESTES)
 * Em produção, usar webhook do gateway de pagamento
 * 
 * POST /api/aprovar-pagamento
 * Body: { pedidoId: "PED123456" }
 */
export async function POST(request: NextRequest) {
  try {
    const { pedidoId } = await request.json();

    if (!pedidoId) {
      return NextResponse.json(
        { error: 'pedidoId é obrigatório' },
        { status: 400 }
      );
    }

    console.log(`💰 Aprovando pagamento manual para pedido: ${pedidoId}`);

    // Buscar pedido
    const pedido = await obterPedidoPorId(pedidoId);
    
    if (!pedido) {
      return NextResponse.json(
        { error: 'Pedido não encontrado' },
        { status: 404 }
      );
    }

    if (pedido.status === 'pago') {
      return NextResponse.json(
        { error: 'Pedido já está pago' },
        { status: 400 }
      );
    }

    // Atualizar status para pago
    await atualizarStatusPedido(pedidoId, 'pago');
    
    // Confirmar números reservados
    await confirmarNumerosReservados(pedidoId);
    
    // Atualizar contador de vendidos
    await atualizarNumerosVendidos(pedido.sorteioId, pedido.numeros.length);

    console.log(`✅ Pagamento aprovado! Pedido: ${pedidoId}`);

    // Buscar sorteio para pegar informações completas
    const sorteio = await obterSorteio(pedido.sorteioId);

    // Integrar com ActiveCampaign
    if (isActiveCampaignConfigurado()) {
      try {
        // Extrair email e telefone (mock se não existir)
        const email = `${pedido.cpf}@pixrapido.com.br`;
        const telefone = '11999999999'; // Mock

        await enviarParaActiveCampaign({
          email,
          nome: pedido.nome,
          telefone,
          numerosGerados: pedido.numeros,
          pedidoId: pedido.id,
          sorteioId: pedido.sorteioId,
          valorPago: pedido.valorTotal,
        });
        
        console.log(`📧 Dados enviados para ActiveCampaign`);
      } catch (error) {
        console.error('⚠️ Erro ao enviar para ActiveCampaign:', error);
      }
    }

    return NextResponse.json({
      success: true,
      pedidoId,
      status: 'pago',
      numeros: pedido.numeros,
      mensagem: 'Pagamento aprovado com sucesso! Cliente será notificado por email.',
    });

  } catch (error: any) {
    console.error('❌ Erro ao aprovar pagamento:', error);
    return NextResponse.json(
      { error: error.message || 'Erro ao aprovar pagamento' },
      { status: 500 }
    );
  }
}

/**
 * GET - Retorna instruções de uso
 */
export async function GET() {
  return NextResponse.json({
    mensagem: 'API de Aprovação Manual de Pagamento (Desenvolvimento)',
    uso: {
      metodo: 'POST',
      body: {
        pedidoId: 'ID do pedido a ser aprovado'
      },
      exemplo: `
        curl -X POST http://localhost:3000/api/aprovar-pagamento \\
          -H "Content-Type: application/json" \\
          -d '{"pedidoId":"PED123456"}'
      `
    },
    fluxo: [
      '1. Cliente gera PIX no checkout',
      '2. PIX é exibido (QR Code)',
      '3. Chamar esta API manualmente para simular pagamento',
      '4. Sistema confirma números e envia email via ActiveCampaign',
      '5. Em produção: webhook do gateway fará isso automaticamente'
    ]
  });
}
