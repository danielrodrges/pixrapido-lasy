import { NextRequest, NextResponse } from 'next/server';
import { salvarPedido, obterPedidosPorCpf, gerarIdPedido } from '@/lib/database';
import { Pedido } from '@/lib/types';

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
    const pedidoId = gerarIdPedido();

    const pedido: Pedido = {
      id: pedidoId,
      sorteioId,
      sorteioTitulo,
      numeros,
      valorTotal,
      dataPedido: new Date(),
      status: 'pendente',
      metodoPagamento: metodoPagamento as 'pix' | 'cartao',
      cpf,
      nome,
    };

    // Salvar pedido no database
    salvarPedido(pedido);
    console.log('📝 Pedido criado e salvo:', pedidoId);

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

    const cpfLimpo = cpf.replace(/\D/g, '');

    // Buscar pedidos do usuário no Supabase
    const pedidos = await obterPedidosPorCpf(cpfLimpo);
    console.log('📦 Pedidos encontrados para', cpfLimpo, ':', pedidos.length);

    return NextResponse.json({ 
      success: true,
      pedidos 
    });
  } catch (error: any) {
    console.error('Erro ao buscar pedidos:', error);
    return NextResponse.json(
      { error: error.message || 'Erro ao buscar pedidos' },
      { status: 500 }
    );
  }
}
