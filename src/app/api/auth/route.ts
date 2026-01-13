import { NextRequest, NextResponse } from 'next/server';
import { salvarUsuario, obterUsuarioPorCpf } from '@/lib/database';
import { Usuario } from '@/lib/types';

// API para autenticação simples por CPF
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { cpf, nome, telefone, email } = body;

    // Validações básicas
    if (!cpf || !nome) {
      return NextResponse.json(
        { error: 'CPF e nome são obrigatórios' },
        { status: 400 }
      );
    }

    // Validar formato do CPF
    const cpfLimpo = cpf.replace(/\D/g, '');
    if (cpfLimpo.length !== 11) {
      return NextResponse.json(
        { error: 'CPF inválido' },
        { status: 400 }
      );
    }

    // Preparar dados do usuário
    let usuarioDados: Usuario;
    
    // Verificar se já existe
    const usuarioExistente = await obterUsuarioPorCpf(cpfLimpo);
    
    if (usuarioExistente) {
      // Login - retornar dados existentes
      usuarioDados = usuarioExistente;
    } else {
      // Cadastro - validar campos obrigatórios
      if (!telefone || !email) {
        return NextResponse.json(
          { error: 'Telefone e email são obrigatórios para cadastro' },
          { status: 400 }
        );
      }

      // Validar email
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return NextResponse.json(
          { error: 'Email inválido' },
          { status: 400 }
        );
      }

      // Validar telefone
      const telefoneLimpo = telefone.replace(/\D/g, '');
      if (telefoneLimpo.length < 10 || telefoneLimpo.length > 11) {
        return NextResponse.json(
          { error: 'Telefone inválido' },
          { status: 400 }
        );
      }

      // Criar novo usuário
      usuarioDados = {
        cpf: cpfLimpo,
        nome,
        telefone: telefoneLimpo,
        email,
        dataCadastro: new Date(),
      };

      await salvarUsuario(usuarioDados);
      console.log('✅ Novo usuário cadastrado:', cpfLimpo);
    }

    console.log('👤 Usuário autenticado:', usuarioDados.cpf);

    return NextResponse.json({ 
      success: true,
      usuario: {
        cpf: usuarioDados.cpf,
        nome: usuarioDados.nome,
        telefone: usuarioDados.telefone,
        email: usuarioDados.email,
      }
    });
  } catch (error: any) {
    console.error('❌ Erro na autenticação:', error);
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

    // Buscar usuário no database
    const usuario = obterUsuarioPorCpf(cpfLimpo);
    console.log('🔍 Verificando usuário:', cpfLimpo, usuario ? 'encontrado' : 'não encontrado');

    return NextResponse.json({ 
      existe: !!usuario,
      usuario: usuario || null
    });
  } catch (error: any) {
    console.error('Erro ao verificar usuário:', error);
    return NextResponse.json(
      { error: error.message || 'Erro ao verificar usuário' },
      { status: 500 }
    );
  }
}
