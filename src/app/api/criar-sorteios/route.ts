import { NextRequest, NextResponse } from 'next/server';
import { sincronizarSorteio } from '@/lib/database';
import { Sorteio } from '@/lib/types';

// Endpoint para criar sorteios de teste e real
// Acesse: GET /api/criar-sorteios?secret=SEU_SECRET

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const secret = searchParams.get('secret');

    // Segurança básica (remova em produção ou use variável de ambiente)
    if (secret !== 'criar123') {
      return NextResponse.json(
        { error: 'Não autorizado' },
        { status: 401 }
      );
    }

    console.log('🎲 Criando sorteios de teste e real...\n');

    const sorteios: Sorteio[] = [
      {
        id: 'sorteio_teste_001',
        titulo: '🧪 SORTEIO TESTE - iPhone 15 Pro Max',
        descricao: 'Sorteio de teste para validação do sistema. iPhone 15 Pro Max 256GB + AirPods Pro.',
        imagemUrl: 'https://images.unsplash.com/photo-1696446702183-cbd0674e39f8?w=800&h=600&fit=crop',
        valorPremio: 12000.00,
        precoPorNumero: 5.00,
        totalNumeros: 5000,
        numeroInicial: 10000000,
        numeroFinal: 10004999,
        numerosVendidos: 0,
        dataSorteio: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 dias
        status: 'ativo',
        destaque: false,
      },
      {
        id: 'sorteio_real_001',
        titulo: '🏆 MOTO HONDA CG 160 0KM + R$ 5.000',
        descricao: 'Sorteio real! Moto Honda CG 160 zero quilômetro + R$ 5.000 em dinheiro para você começar o ano com tudo!',
        imagemUrl: 'https://images.unsplash.com/photo-1558981403-c5f9899a28bc?w=800&h=600&fit=crop',
        valorPremio: 20000.00,
        precoPorNumero: 10.00,
        totalNumeros: 5000,
        numeroInicial: 20000000,
        numeroFinal: 20004999,
        numerosVendidos: 0,
        dataSorteio: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000), // 45 dias
        status: 'ativo',
        destaque: true,
      },
    ];

    const resultados = [];

    for (const sorteio of sorteios) {
      console.log(`📝 Criando sorteio: ${sorteio.titulo}`);
      console.log(`   ID: ${sorteio.id}`);
      console.log(`   Números: ${sorteio.numeroInicial} até ${sorteio.numeroFinal} (${sorteio.totalNumeros} números)`);
      
      try {
        await sincronizarSorteio(sorteio);
        console.log(`   ✅ Sorteio criado com sucesso!`);
        resultados.push({
          id: sorteio.id,
          titulo: sorteio.titulo,
          status: 'criado',
          numeros: `${sorteio.numeroInicial} - ${sorteio.numeroFinal}`,
          total: sorteio.totalNumeros,
        });
      } catch (error: any) {
        console.error(`   ❌ Erro:`, error.message);
        resultados.push({
          id: sorteio.id,
          titulo: sorteio.titulo,
          status: 'erro',
          erro: error.message,
        });
      }
    }

    console.log('🎉 Processo concluído!\n');

    return NextResponse.json({
      success: true,
      message: 'Sorteios criados com sucesso',
      sorteios: resultados,
      instrucoes: {
        teste: 'Use sorteio_teste_001 para testes',
        real: 'Use sorteio_real_001 para produção',
        webhook: 'Configure metadata.sorteio_id com um desses IDs',
      },
    });
  } catch (error: any) {
    console.error('❌ Erro ao criar sorteios:', error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}
