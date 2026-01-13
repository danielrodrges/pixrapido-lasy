import { NextRequest, NextResponse } from 'next/server';
import { gerarNumerosAleatoriosUnicos, reservarNumeros, gerarIdPedido } from '@/lib/database';

// API para gerar números aleatórios únicos para um sorteio
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { sorteioId, quantidade, cpf } = body;

    // Validações
    if (!sorteioId || !quantidade || !cpf) {
      return NextResponse.json(
        { error: 'Dados incompletos' },
        { status: 400 }
      );
    }

    // Gerar números aleatórios únicos (verifica disponibilidade e usa intervalo do sorteio)
    const numerosArray = await gerarNumerosAleatoriosUnicos(quantidade, sorteioId);
    
    // Criar pedido temporário
    const pedidoId = gerarIdPedido();
    
    // Reservar números temporariamente
    await reservarNumeros(numerosArray, sorteioId, pedidoId, cpf);
    
    console.log(`🎲 ${numerosArray.length} números gerados e reservados para pedido ${pedidoId}`);

    return NextResponse.json({ 
      numeros: numerosArray,
      quantidade: numerosArray.length,
      sorteioId,
      pedidoId // Retornar pedidoId para usar no checkout
    });
  } catch (error: any) {
    console.error('Erro ao gerar números:', error);
    return NextResponse.json(
      { error: error.message || 'Erro ao gerar números' },
      { status: 500 }
    );
  }
}
