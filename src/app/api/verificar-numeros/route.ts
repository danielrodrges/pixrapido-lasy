import { NextRequest, NextResponse } from 'next/server';
import { verificarNumeroDisponivel } from '@/lib/database';

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

    // Verificar disponibilidade real no database
    const disponibilidade = numeros.map(numero => ({
      numero,
      disponivel: verificarNumeroDisponivel(numero, sorteioId)
    }));

    const todosDisponiveis = disponibilidade.every(d => d.disponivel);
    
    console.log(`🔍 Verificados ${numeros.length} números - Todos disponíveis: ${todosDisponiveis}`);

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
