import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { Sorteio } from '@/lib/types';
import { sincronizarSorteio } from '@/lib/database';

// API para buscar sorteios (produtos do Stripe) e sincronizar com Supabase
export async function GET(request: NextRequest) {
  try {
    // Buscar todos os produtos ativos do Stripe
    const products = await stripe.products.list({
      active: true,
      expand: ['data.default_price'],
      limit: 100,
    });

    console.log(`📦 ${products.data.length} produto(s) encontrado(s) no Stripe`);

    // Mapear produtos do Stripe para formato de Sorteios
    const sorteios: Sorteio[] = await Promise.all(products.data.map(async (product) => {
      const price = product.default_price as any;
      const precoPorNumero = price ? (price.unit_amount / 100) : 5; // Converter de centavos para reais
      
      // Extrair metadados ou usar valores padrão
      const metadata = product.metadata || {};
      const totalNumeros = parseInt(metadata.totalNumeros || '10000');
      const numeroInicial = parseInt(metadata.numeroInicial || '0');
      const numeroFinal = parseInt(metadata.numeroFinal || totalNumeros.toString());
      const numerosVendidos = parseInt(metadata.numerosVendidos || '0');
      const valorPremio = parseInt(metadata.valorPremio || '10000');
      const dataSorteio = metadata.dataSorteio 
        ? new Date(metadata.dataSorteio) 
        : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 dias a partir de hoje

      const sorteio: Sorteio = {
        id: product.id,
        titulo: product.name,
        descricao: product.description || 'Participe e concorra a prêmios incríveis!',
        imagemUrl: product.images[0] || 'https://images.unsplash.com/photo-1607863680198-23d4b2565df0?w=800&h=600&fit=crop',
        valorPremio,
        precoPorNumero,
        totalNumeros,
        numeroInicial,
        numeroFinal,
        numerosVendidos,
        dataSorteio,
        status: 'ativo' as const,
        destaque: metadata.destaque === 'true',
        stripeProductId: product.id,
      };

      // Sincronizar com Supabase
      await sincronizarSorteio(sorteio);

      return sorteio;
    }));

    // Buscar pacotes dos metadados ou usar padrão
    let pacotes = [];
    
    // Tentar buscar pacotes do primeiro produto (ou criar endpoint separado)
    if (products.data.length > 0 && products.data[0].metadata.pacotes) {
      try {
        pacotes = JSON.parse(products.data[0].metadata.pacotes);
        console.log('📦 Pacotes carregados dos metadados do Stripe');
      } catch (e) {
        console.log('⚠️ Erro ao parsear pacotes, usando padrão');
      }
    }
    
    // Se não houver pacotes nos metadados, usar padrão
    if (pacotes.length === 0) {
      // Buscar o preço base do primeiro produto
      const precoPorNumero = sorteios.length > 0 ? sorteios[0].precoPorNumero : 5;
      
      pacotes = [
        { id: 'p1', quantidade: 1, preco: precoPorNumero * 1 },
        { id: 'p2', quantidade: 5, preco: precoPorNumero * 5 * 0.95, desconto: 5 }, // 5% desconto
        { id: 'p3', quantidade: 10, preco: precoPorNumero * 10 * 0.90, desconto: 10 }, // 10% desconto
        { id: 'p4', quantidade: 25, preco: precoPorNumero * 25 * 0.85, desconto: 15 }, // 15% desconto
        { id: 'p5', quantidade: 50, preco: precoPorNumero * 50 * 0.80, desconto: 20 }, // 20% desconto
        { id: 'p6', quantidade: 100, preco: precoPorNumero * 100 * 0.75, desconto: 25 }, // 25% desconto
      ];
      console.log('📦 Pacotes gerados automaticamente baseado no preço por número');
    }

    console.log(`✅ ${sorteios.length} sorteio(s) sincronizado(s) e ${pacotes.length} pacote(s) retornados`);

    return NextResponse.json({ sorteios, pacotes });
  } catch (error: any) {
    console.error('❌ Erro ao buscar produtos do Stripe:', error);
    return NextResponse.json(
      { error: error.message || 'Erro ao buscar sorteios' },
      { status: 500 }
    );
  }
}
