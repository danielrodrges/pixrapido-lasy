import { NextRequest, NextResponse } from 'next/server';

// API para verificar disponibilidade de números
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { sorteioId, numeros } = body;

    // Validações
    if (!sorteioId || !numeros || !Array.isArray(numeros)) {
      return NextResponse.json(
        { error: 'Dados incompletos ou inválidos' },
        { status: 400 }
      );
    }

    // Em produção, verificar no banco de dados
    // Por enquanto, considerar todos disponíveis
    const disponibilidade = numeros.map(numero => ({
      numero,
      disponivel: true
    }));

    const todosDisponiveis = disponibilidade.every(d => d.disponivel);

    return NextResponse.json({ 
      disponibilidade,
      todosDisponiveis,
      sorteioId 
    });
  } catch (error: any) {
    console.error('Erro ao verificar disponibilidade:', error);
    return NextResponse.json(
      { error: error.message || 'Erro ao verificar disponibilidade' },
      { status: 500 }
    );
  }
}
