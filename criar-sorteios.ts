// Script para criar sorteios de teste e real
import { supabase } from './src/lib/supabase';

async function criarSorteios() {
  console.log('🎲 Criando sorteios...\n');

  const sorteios = [
    {
      id: 'sorteio_teste_001',
      titulo: '🧪 SORTEIO TESTE - iPhone 15 Pro Max',
      descricao: 'Sorteio de teste para validação do sistema. iPhone 15 Pro Max 256GB + AirPods Pro.',
      imagem_url: 'https://images.unsplash.com/photo-1696446702183-cbd0674e39f8?w=800&h=600&fit=crop',
      valor_premio: 12000.00,
      preco_por_numero: 5.00,
      total_numeros: 5000,
      numero_inicial: 10000000,
      numero_final: 10004999,
      numeros_vendidos: 0,
      data_sorteio: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 dias
      status: 'ativo',
      destaque: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: 'sorteio_real_001',
      titulo: '🏆 MOTO HONDA CG 160 0KM + R$ 5.000',
      descricao: 'Sorteio real! Moto Honda CG 160 zero quilômetro + R$ 5.000 em dinheiro para você começar o ano com tudo!',
      imagem_url: 'https://images.unsplash.com/photo-1558981403-c5f9899a28bc?w=800&h=600&fit=crop',
      valor_premio: 20000.00,
      preco_por_numero: 10.00,
      total_numeros: 5000,
      numero_inicial: 20000000,
      numero_final: 20004999,
      numeros_vendidos: 0,
      data_sorteio: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000).toISOString(), // 45 dias
      status: 'ativo',
      destaque: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
  ];

  for (const sorteio of sorteios) {
    console.log(`📝 Criando sorteio: ${sorteio.titulo}`);
    console.log(`   ID: ${sorteio.id}`);
    console.log(`   Números: ${sorteio.numero_inicial} até ${sorteio.numero_final} (${sorteio.total_numeros} números)`);
    console.log(`   Valor por número: R$ ${sorteio.preco_por_numero.toFixed(2)}`);
    console.log(`   Prêmio: R$ ${sorteio.valor_premio.toFixed(2)}`);
    
    const { data, error } = await supabase
      .from('sorteios')
      .upsert(sorteio, { onConflict: 'id' });

    if (error) {
      console.error(`   ❌ Erro ao criar sorteio:`, error);
    } else {
      console.log(`   ✅ Sorteio criado com sucesso!`);
    }
    console.log('');
  }

  console.log('🎉 Processo concluído!\n');
  console.log('📋 IDs dos sorteios criados:');
  console.log('   • Teste: sorteio_teste_001');
  console.log('   • Real:  sorteio_real_001');
  console.log('\n💡 Use esses IDs no metadata do webhook Kirvano\n');
}

criarSorteios().catch(console.error);
