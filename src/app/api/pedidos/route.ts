import { NextRequest, NextResponse } from 'next/server';

// API para criar/atualizar pedido
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      sorteioId, 
      sorteioTitulo, 
      numeros, 
      valorTotal, 
      cpf, 
      nome,
      metodoPagamento = 'pix'
    } = body;

    // Validações
    if (!sorteioId || !sorteioTitulo || !numeros || !valorTotal || !cpf || !nome) {
      return NextResponse.json(
        { error: 'Dados incompletos' },
        { status: 400 }
      );
    }

    // Gerar ID único do pedido
    const pedidoId = `PED${Date.now()}${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

    const pedido = {
      id: pedidoId,
      sorteioId,
      sorteioTitulo,
      numeros,
      valorTotal,
      dataPedido: new Date().toISOString(),
      status: 'pendente',
      metodoPagamento,
      cpf,
      nome,
    };

    // Em produção, salvar no banco de dados
    // Por enquanto, retornar o pedido criado
    console.log('📝 Pedido criado:', pedido);

    return NextResponse.json({ 
      success: true,
      pedido 
    });
  } catch (error: any) {
    console.error('Erro ao criar pedido:', error);
    return NextResponse.json(
      { error: error.message || 'Erro ao criar pedido' },
      { status: 500 }
    );
  }
}

// API para buscar pedidos por CPF
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const cpf = searchParams.get('cpf');

    if (!cpf) {
      return NextResponse.json(
        { error: 'CPF não fornecido' },
        { status: 400 }
      );
    }

    // Em produção, buscar do banco de dados
    // Por enquanto, retornar array vazio
    console.log('🔍 Buscando pedidos para CPF:', cpf);

    return NextResponse.json({ 
      pedidos: [] 
    });
  } catch (error: any) {
    console.error('Erro ao buscar pedidos:', error);
    return NextResponse.json(
      { error: error.message || 'Erro ao buscar pedidos' },
      { status: 500 }
    );
  }
}
