import { NextRequest, NextResponse } from 'next/server';

// API para gerar números aleatórios únicos para um sorteio
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { sorteioId, quantidade, totalNumeros } = body;

    // Validações
    if (!sorteioId || !quantidade || !totalNumeros) {
      return NextResponse.json(
        { error: 'Dados incompletos' },
        { status: 400 }
      );
    }

    if (quantidade > totalNumeros) {
      return NextResponse.json(
        { error: 'Quantidade solicitada maior que total disponível' },
        { status: 400 }
      );
    }

    // Gerar números aleatórios únicos
    const numeros = new Set<number>();
    while (numeros.size < quantidade) {
      const numeroAleatorio = Math.floor(Math.random() * totalNumeros) + 1;
      numeros.add(numeroAleatorio);
    }

    const numerosArray = Array.from(numeros).sort((a, b) => a - b);

    return NextResponse.json({ 
      numeros: numerosArray,
      quantidade: numerosArray.length,
      sorteioId 
    });
  } catch (error: any) {
    console.error('Erro ao gerar números:', error);
    return NextResponse.json(
      { error: error.message || 'Erro ao gerar números' },
      { status: 500 }
    );
  }
}
