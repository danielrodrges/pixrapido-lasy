import { NextRequest, NextResponse } from 'next/server';

// API para autenticação simples por CPF
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { cpf, nome, telefone } = body;

    // Validações
    if (!cpf || !nome) {
      return NextResponse.json(
        { error: 'CPF e nome são obrigatórios' },
        { status: 400 }
      );
    }

    // Validar formato do CPF (apenas números)
    const cpfLimpo = cpf.replace(/\D/g, '');
    if (cpfLimpo.length !== 11) {
      return NextResponse.json(
        { error: 'CPF inválido' },
        { status: 400 }
      );
    }

    // Em produção, salvar/atualizar no banco de dados
    const usuario = {
      cpf: cpfLimpo,
      nome,
      telefone: telefone || null,
      dataCadastro: new Date().toISOString(),
    };

    console.log('👤 Usuário autenticado:', usuario);

    return NextResponse.json({ 
      success: true,
      usuario: {
        cpf: cpfLimpo,
        nome,
        telefone: telefone || null,
      }
    });
  } catch (error: any) {
    console.error('Erro na autenticação:', error);
    return NextResponse.json(
      { error: error.message || 'Erro na autenticação' },
      { status: 500 }
    );
  }
}

// API para verificar se usuário existe
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

    // Em produção, buscar no banco de dados
    console.log('🔍 Verificando usuário:', cpfLimpo);

    return NextResponse.json({ 
      existe: false,
      usuario: null
    });
  } catch (error: any) {
    console.error('Erro ao verificar usuário:', error);
    return NextResponse.json(
      { error: error.message || 'Erro ao verificar usuário' },
      { status: 500 }
    );
  }
}
