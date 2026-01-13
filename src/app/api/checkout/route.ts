import { NextRequest, NextResponse } from 'next/server';
import { salvarPedido, gerarIdPedido, reservarNumeros } from '@/lib/database';
import { Pedido } from '@/lib/types';

// ==================== CHECKOUT USANDO KIRVANO ====================
// Fluxo: Frontend → Kirvano (direto) → Webhook → ActiveCampaign
// Não precisa processar pagamento aqui, apenas reservar números

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
    // O webhook da Kirvano vai atualizar para "pago" quando o pagamento for aprovado
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

    // Retornar dados para o frontend processar com Kirvano
    return NextResponse.json({ 
      success: true,
      pedidoId,
      sorteioId,
      quantidade,
      valorTotal,
      numeros,
      cliente: {
        nome,
        email,
        telefone,
        cpf,
      },
      // Frontend deve enviar estes metadados para a Kirvano:
      metadata: {
        pedido_id: pedidoId,
        sorteio_id: sorteioId,
        quantidade,
      }
    });
  } catch (error: any) {
    console.error('❌ Erro ao criar checkout:', error);
    return NextResponse.json(
      { error: error.message || 'Erro ao processar pagamento' },
      { status: 500 }
    );
  }
}
