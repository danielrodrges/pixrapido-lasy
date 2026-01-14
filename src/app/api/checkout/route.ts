import { NextRequest, NextResponse } from 'next/server';
import { salvarPedido, gerarIdPedido, reservarNumeros } from '@/lib/database';
import { Pedido } from '@/lib/types';

// ==================== CHECKOUT COM PIX SIMPLES ====================
// Gera PIX mock para testes ou usa Stripe PIX

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { sorteioId, sorteioTitulo, quantidade, valorTotal, cpf, nome, numeros, email, telefone } = body;

    // Validações
    if (!sorteioId || !quantidade || !valorTotal || !cpf || !nome || !numeros) {
      return NextResponse.json(
        { error: 'Dados incompletos' },
        { status: 400 }
      );
    }

    // Gerar ID do pedido
    const pedidoId = gerarIdPedido();
    
    // Reservar números no Supabase (status: reservado)
    await reservarNumeros(numeros, sorteioId, pedidoId, cpf);
    console.log(`📝 ${numeros.length} números reservados para pedido:`, pedidoId);

    // Salvar pedido no Supabase (status: pendente)
    const pedido: Pedido = {
      id: pedidoId,
      sorteioId,
      sorteioTitulo,
      numeros,
      quantidadeNumeros: numeros.length,
      valorTotal,
      dataPedido: new Date(),
      status: 'pendente',
      metodoPagamento: 'pix',
      cpf,
      nome,
    };
    
    await salvarPedido(pedido);
    console.log('✅ Pedido salvo (pendente):', pedidoId);

    // Gerar PIX Code mock para desenvolvimento
    // Em produção, integrar com gateway de pagamento real
    const pixCodeMock = `00020126580014br.gov.bcb.pix0136${pedidoId}@pixrapido.com52040000530398654${valorTotal.toFixed(2)}5802BR5913PixRapido6009SAO PAULO62070503***6304${Math.random().toString(36).substring(7).toUpperCase()}`;
    
    const pixQrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(pixCodeMock)}`;

    // Retornar dados do PIX
    return NextResponse.json({ 
      success: true,
      pedidoId,
      pixCode: pixCodeMock,
      pixQrCodeUrl,
      valorTotal,
      numeros,
      mensagem: 'PIX gerado! Em produção, será integrado com gateway real.',
    });
  } catch (error: any) {
    console.error('❌ Erro ao criar checkout:', error);
    return NextResponse.json(
      { error: error.message || 'Erro ao processar pagamento' },
      { status: 500 }
    );
  }
}
