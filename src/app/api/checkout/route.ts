import { NextRequest, NextResponse } from 'next/server';
import { salvarPedido, gerarIdPedido, reservarNumeros } from '@/lib/database';
import { Pedido } from '@/lib/types';
import { criarPixPagHiper } from '@/lib/paghiper';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { sorteioId, sorteioTitulo, quantidade, valorTotal, cpf, nome, numeros, email } = body;

    // Validações
    if (!sorteioId || !quantidade || !valorTotal || !cpf || !nome || !numeros) {
      return NextResponse.json(
        { error: 'Dados incompletos' },
        { status: 400 }
      );
    }

    // Gerar ID do pedido
    const pedidoId = gerarIdPedido();
    
    // Reservar números no Supabase
    await reservarNumeros(numeros, sorteioId, pedidoId, cpf);
    console.log(`📝 ${numeros.length} números reservados para pedido:`, pedidoId);
    
    // Criar PIX no PagHiper
    const pixResponse = await criarPixPagHiper({
      pedidoId,
      nomeCliente: nome,
      cpfCliente: cpf,
      emailCliente: email,
      valorTotal,
      descricao: `${quantidade} número(s) - ${sorteioTitulo}`,
      quantidade: 1,
    });

    // Salvar pedido no Supabase (status pendente)
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
      stripeSessionId: pixResponse.transaction_id, // Usar transaction_id do PagHiper
    };
    
    await salvarPedido(pedido);
    console.log('✅ Pedido salvo:', pedidoId);

    // Retornar dados do PIX para o frontend
    return NextResponse.json({ 
      success: true,
      pedidoId,
      transactionId: pixResponse.transaction_id,
      pixCode: pixResponse.pix_code.emv, // Copia e Cola
      pixQrCodeUrl: pixResponse.pix_code.qrcode_image_url, // URL da imagem QR Code
      pixQrCodeBase64: pixResponse.pix_code.qrcode_base64, // Base64 do QR Code
      valorTotal,
      numeros,
    });
  } catch (error: any) {
    console.error('❌ Erro ao criar checkout:', error);
    return NextResponse.json(
      { error: error.message || 'Erro ao processar pagamento' },
      { status: 500 }
    );
  }
}
