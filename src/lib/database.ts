// Sistema de banco de dados usando Supabase com fallback para cache em memória
import { Pedido, NumeroReservado, Usuario, Sorteio } from './types';
import { supabase, toSnakeCase, toCamelCase, isSupabaseAvailable } from './supabase';

// Caches em memória como fallback
let PEDIDOS_CACHE: Pedido[] = [];
let NUMEROS_CACHE: NumeroReservado[] = [];
let USUARIOS_CACHE: Usuario[] = [];
let SORTEIOS_CACHE: Sorteio[] = [];
let SUPABASE_AVAILABLE = true;

// Verificar disponibilidade do Supabase na inicialização
if (typeof window === 'undefined') {
  isSupabaseAvailable().then(available => {
    SUPABASE_AVAILABLE = available;
    if (!available) {
      console.warn('⚠️ Supabase indisponível, usando cache em memória');
    } else {
      console.log('✅ Supabase conectado com sucesso');
    }
  });
}

// ==================== SORTEIOS ====================

export async function sincronizarSorteio(sorteio: Sorteio): Promise<void> {
  if (!SUPABASE_AVAILABLE) {
    SORTEIOS_CACHE.push(sorteio);
    return;
  }

  try {
    const sorteioSnake = toSnakeCase(sorteio);
    const { error } = await supabase
      .from('sorteios')
      .upsert(sorteioSnake, { onConflict: 'id' });

    if (error) throw error;
    console.log('✅ Sorteio sincronizado no Supabase:', sorteio.id);
  } catch (error) {
    console.error('❌ Erro ao sincronizar sorteio:', error);
    SORTEIOS_CACHE.push(sorteio);
  }
}

export async function obterSorteio(sorteioId: string): Promise<Sorteio | null> {
  if (!SUPABASE_AVAILABLE) {
    return SORTEIOS_CACHE.find(s => s.id === sorteioId) || null;
  }

  try {
    const { data, error } = await supabase
      .from('sorteios')
      .select('*')
      .eq('id', sorteioId)
      .single();

    if (error) throw error;
    return data ? toCamelCase(data) : null;
  } catch (error) {
    console.error('❌ Erro ao buscar sorteio:', error);
    return SORTEIOS_CACHE.find(s => s.id === sorteioId) || null;
  }
}

export async function atualizarNumerosVendidos(sorteioId: string, quantidade: number): Promise<void> {
  if (!SUPABASE_AVAILABLE) {
    const sorteio = SORTEIOS_CACHE.find(s => s.id === sorteioId);
    if (sorteio) {
      sorteio.numerosVendidos += quantidade;
    }
    return;
  }

  try {
    const { data: sorteio } = await supabase
      .from('sorteios')
      .select('numeros_vendidos')
      .eq('id', sorteioId)
      .single();

    if (sorteio) {
      const { error } = await supabase
        .from('sorteios')
        .update({ numeros_vendidos: (sorteio.numeros_vendidos || 0) + quantidade })
        .eq('id', sorteioId);

      if (error) throw error;
      console.log(`✅ Números vendidos atualizados: ${sorteioId} +${quantidade}`);
    }
  } catch (error) {
    console.error('❌ Erro ao atualizar números vendidos:', error);
  }
}

// ==================== USUÁRIOS ====================

export async function salvarUsuario(usuario: Usuario): Promise<void> {
  if (!SUPABASE_AVAILABLE) {
    const index = USUARIOS_CACHE.findIndex(u => u.cpf === usuario.cpf);
    if (index !== -1) {
      USUARIOS_CACHE[index] = usuario;
    } else {
      USUARIOS_CACHE.push(usuario);
    }
    console.log('✅ Usuário salvo no cache:', usuario.cpf);
    return;
  }

  try {
    const usuarioSnake = toSnakeCase(usuario);
    const { error } = await supabase
      .from('usuarios')
      .upsert(usuarioSnake, { onConflict: 'cpf' });

    if (error) throw error;
    console.log('✅ Usuário salvo no Supabase:', usuario.cpf);
  } catch (error) {
    console.error('❌ Erro ao salvar usuário:', error);
    const index = USUARIOS_CACHE.findIndex(u => u.cpf === usuario.cpf);
    if (index !== -1) {
      USUARIOS_CACHE[index] = usuario;
    } else {
      USUARIOS_CACHE.push(usuario);
    }
  }
}

export async function obterUsuarioPorCpf(cpf: string): Promise<Usuario | null> {
  if (!SUPABASE_AVAILABLE) {
    return USUARIOS_CACHE.find(u => u.cpf === cpf) || null;
  }

  try {
    const { data, error } = await supabase
      .from('usuarios')
      .select('*')
      .eq('cpf', cpf)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return data ? toCamelCase(data) : null;
  } catch (error) {
    console.error('❌ Erro ao buscar usuário:', error);
    return USUARIOS_CACHE.find(u => u.cpf === cpf) || null;
  }
}

// ==================== PEDIDOS ====================

export async function salvarPedido(pedido: Pedido): Promise<void> {
  if (!SUPABASE_AVAILABLE) {
    PEDIDOS_CACHE.push(pedido);
    console.log('✅ Pedido salvo no cache:', pedido.id);
    return;
  }

  try {
    // Salvar usuário primeiro
    await salvarUsuario({
      cpf: pedido.cpf,
      nome: pedido.nome,
      dataCadastro: new Date(),
    });

    // Preparar pedido para o banco (sem o array de números)
    const pedidoParaBanco = {
      id: pedido.id,
      sorteioId: pedido.sorteioId,
      sorteioTitulo: pedido.sorteioTitulo,
      cpf: pedido.cpf,
      nome: pedido.nome,
      valorTotal: pedido.valorTotal,
      quantidadeNumeros: pedido.numeros.length,
      status: pedido.status,
      metodoPagamento: pedido.metodoPagamento,
      stripeSessionId: pedido.stripeSessionId,
      dataPedido: pedido.dataPedido,
      dataPagamento: pedido.dataPagamento,
    };

    const pedidoSnake = toSnakeCase(pedidoParaBanco);
    const { error } = await supabase
      .from('pedidos')
      .upsert(pedidoSnake, { onConflict: 'id' });

    if (error) throw error;
    console.log('✅ Pedido salvo no Supabase:', pedido.id);
  } catch (error) {
    console.error('❌ Erro ao salvar pedido:', error);
    PEDIDOS_CACHE.push(pedido);
  }
}

export async function obterPedidos(): Promise<Pedido[]> {
  if (!SUPABASE_AVAILABLE) {
    return PEDIDOS_CACHE;
  }

  try {
    const { data, error } = await supabase
      .from('pedidos')
      .select('*')
      .order('data_pedido', { ascending: false });

    if (error) throw error;

    // Buscar números de cada pedido
    const pedidosComNumeros = await Promise.all(
      data.map(async (pedidoSnake: any) => {
        const pedido = toCamelCase(pedidoSnake);
        const numeros = await obterNumerosDoPedido(pedido.id);
        return { ...pedido, numeros };
      })
    );

    return pedidosComNumeros;
  } catch (error) {
    console.error('❌ Erro ao buscar pedidos:', error);
    return PEDIDOS_CACHE;
  }
}

export async function obterPedidosPorCpf(cpf: string): Promise<Pedido[]> {
  if (!SUPABASE_AVAILABLE) {
    return PEDIDOS_CACHE.filter(p => p.cpf === cpf);
  }

  try {
    const { data, error } = await supabase
      .from('pedidos')
      .select('*')
      .eq('cpf', cpf)
      .order('data_pedido', { ascending: false });

    if (error) throw error;

    // Buscar números de cada pedido
    const pedidosComNumeros = await Promise.all(
      data.map(async (pedidoSnake: any) => {
        const pedido = toCamelCase(pedidoSnake);
        const numeros = await obterNumerosDoPedido(pedido.id);
        return { ...pedido, numeros };
      })
    );

    return pedidosComNumeros;
  } catch (error) {
    console.error('❌ Erro ao buscar pedidos por CPF:', error);
    return PEDIDOS_CACHE.filter(p => p.cpf === cpf);
  }
}

export async function obterPedidoPorId(id: string): Promise<Pedido | null> {
  if (!SUPABASE_AVAILABLE) {
    return PEDIDOS_CACHE.find(p => p.id === id) || null;
  }

  try {
    const { data, error } = await supabase
      .from('pedidos')
      .select('*')
      .eq('id', id)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    if (!data) return null;

    const pedido = toCamelCase(data);
    const numeros = await obterNumerosDoPedido(id);
    return { ...pedido, numeros };
  } catch (error) {
    console.error('❌ Erro ao buscar pedido:', error);
    return PEDIDOS_CACHE.find(p => p.id === id) || null;
  }
}

export async function atualizarStatusPedido(pedidoId: string, status: Pedido['status']): Promise<void> {
  if (!SUPABASE_AVAILABLE) {
    const index = PEDIDOS_CACHE.findIndex(p => p.id === pedidoId);
    if (index !== -1) {
      PEDIDOS_CACHE[index].status = status;
      if (status === 'pago') {
        PEDIDOS_CACHE[index].dataPagamento = new Date();
      }
    }
    console.log('✅ Status do pedido atualizado no cache:', pedidoId, status);
    return;
  }

  try {
    const updateData: any = { status };
    if (status === 'pago') {
      updateData.data_pagamento = new Date().toISOString();
    }

    const { error } = await supabase
      .from('pedidos')
      .update(updateData)
      .eq('id', pedidoId);

    if (error) throw error;
    console.log('✅ Status do pedido atualizado no Supabase:', pedidoId, status);
  } catch (error) {
    console.error('❌ Erro ao atualizar status do pedido:', error);
    const index = PEDIDOS_CACHE.findIndex(p => p.id === pedidoId);
    if (index !== -1) {
      PEDIDOS_CACHE[index].status = status;
    }
  }
}

// ==================== NÚMEROS RESERVADOS ====================

export async function reservarNumeros(
  numeros: number[],
  sorteioId: string,
  pedidoId: string,
  cpf: string
): Promise<void> {
  const novasReservas: NumeroReservado[] = numeros.map(numero => ({
    numero,
    sorteioId,
    pedidoId,
    cpf,
    dataReserva: new Date(),
    status: 'reservado' as const,
  }));

  if (!SUPABASE_AVAILABLE) {
    NUMEROS_CACHE.push(...novasReservas);
    console.log(`✅ ${numeros.length} números reservados no cache`);
    return;
  }

  try {
    const reservasSnake = novasReservas.map(toSnakeCase);
    const { error } = await supabase
      .from('numeros_sorteio')
      .insert(reservasSnake);

    if (error) throw error;
    console.log(`✅ ${numeros.length} números reservados no Supabase:`, numeros);
  } catch (error) {
    console.error('❌ Erro ao reservar números:', error);
    NUMEROS_CACHE.push(...novasReservas);
  }
}

export async function confirmarNumerosReservados(pedidoId: string): Promise<void> {
  if (!SUPABASE_AVAILABLE) {
    NUMEROS_CACHE.forEach(reserva => {
      if (reserva.pedidoId === pedidoId) {
        reserva.status = 'confirmado';
        reserva.dataConfirmacao = new Date();
      }
    });
    console.log('✅ Números confirmados no cache:', pedidoId);
    return;
  }

  try {
    const { error } = await supabase
      .from('numeros_sorteio')
      .update({
        status: 'confirmado',
        data_confirmacao: new Date().toISOString(),
      })
      .eq('pedido_id', pedidoId);

    if (error) throw error;
    console.log('✅ Números confirmados no Supabase:', pedidoId);
  } catch (error) {
    console.error('❌ Erro ao confirmar números:', error);
    NUMEROS_CACHE.forEach(reserva => {
      if (reserva.pedidoId === pedidoId) {
        reserva.status = 'confirmado';
      }
    });
  }
}

export async function obterNumerosReservados(): Promise<NumeroReservado[]> {
  if (!SUPABASE_AVAILABLE) {
    return NUMEROS_CACHE;
  }

  try {
    const { data, error } = await supabase
      .from('numeros_sorteio')
      .select('*');

    if (error) throw error;
    return data.map(toCamelCase);
  } catch (error) {
    console.error('❌ Erro ao buscar números reservados:', error);
    return NUMEROS_CACHE;
  }
}

export async function obterNumerosReservadosPorSorteio(sorteioId: string): Promise<number[]> {
  if (!SUPABASE_AVAILABLE) {
    return NUMEROS_CACHE
      .filter(r => r.sorteioId === sorteioId && r.status === 'confirmado')
      .map(r => r.numero);
  }

  try {
    const { data, error } = await supabase
      .from('numeros_sorteio')
      .select('numero')
      .eq('sorteio_id', sorteioId)
      .eq('status', 'confirmado');

    if (error) throw error;
    return data.map(item => item.numero);
  } catch (error) {
    console.error('❌ Erro ao buscar números por sorteio:', error);
    return NUMEROS_CACHE
      .filter(r => r.sorteioId === sorteioId && r.status === 'confirmado')
      .map(r => r.numero);
  }
}

export async function obterNumerosDoPedido(pedidoId: string): Promise<number[]> {
  if (!SUPABASE_AVAILABLE) {
    return NUMEROS_CACHE
      .filter(r => r.pedidoId === pedidoId)
      .map(r => r.numero);
  }

  try {
    const { data, error } = await supabase
      .from('numeros_sorteio')
      .select('numero')
      .eq('pedido_id', pedidoId)
      .order('numero', { ascending: true });

    if (error) throw error;
    return data.map(item => item.numero);
  } catch (error) {
    console.error('❌ Erro ao buscar números do pedido:', error);
    return NUMEROS_CACHE
      .filter(r => r.pedidoId === pedidoId)
      .map(r => r.numero);
  }
}

export async function verificarNumeroDisponivel(numero: number, sorteioId: string): Promise<boolean> {
  if (!SUPABASE_AVAILABLE) {
    return !NUMEROS_CACHE.some(
      r => r.numero === numero && r.sorteioId === sorteioId && r.status === 'confirmado'
    );
  }

  try {
    const { data, error } = await supabase
      .from('numeros_sorteio')
      .select('numero')
      .eq('numero', numero)
      .eq('sorteio_id', sorteioId)
      .eq('status', 'confirmado')
      .single();

    if (error && error.code === 'PGRST116') return true; // Não encontrado = disponível
    return !data;
  } catch (error) {
    console.error('❌ Erro ao verificar número:', error);
    return !NUMEROS_CACHE.some(
      r => r.numero === numero && r.sorteioId === sorteioId && r.status === 'confirmado'
    );
  }
}

// ==================== GERAÇÃO DE NÚMEROS ====================

export async function gerarNumerosAleatoriosUnicos(
  quantidade: number,
  sorteioId: string
): Promise<number[]> {
  // Buscar configuração do sorteio
  const sorteio = await obterSorteio(sorteioId);
  if (!sorteio) {
    throw new Error('Sorteio não encontrado');
  }

  const min = sorteio.numeroInicial;
  const max = sorteio.numeroFinal;
  
  // Buscar números já vendidos
  const numerosReservados = await obterNumerosReservadosPorSorteio(sorteioId);
  
  // Gerar lista de números disponíveis no intervalo
  const numerosDisponiveis = Array.from({ length: max - min + 1 }, (_, i) => min + i)
    .filter(n => !numerosReservados.includes(n));
  
  if (numerosDisponiveis.length < quantidade) {
    throw new Error('Não há números suficientes disponíveis neste sorteio');
  }
  
  // Embaralhar e pegar os primeiros N números
  const embaralhados = numerosDisponiveis.sort(() => Math.random() - 0.5);
  return embaralhados.slice(0, quantidade).sort((a, b) => a - b);
}

// ==================== UTILITÁRIOS ====================

export function gerarIdPedido(): string {
  return `PED${Date.now()}${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
}

export async function limparReservasExpiradas(): Promise<void> {
  const quinzeMinutosAtras = new Date(Date.now() - 15 * 60 * 1000);

  if (!SUPABASE_AVAILABLE) {
    NUMEROS_CACHE = NUMEROS_CACHE.filter(r => {
      if (r.status === 'confirmado') return true;
      return r.dataReserva > quinzeMinutosAtras;
    });
    return;
  }

  try {
    const { error } = await supabase
      .from('numeros_sorteio')
      .delete()
      .eq('status', 'reservado')
      .lt('data_reserva', quinzeMinutosAtras.toISOString());

    if (error) throw error;
    console.log('✅ Reservas expiradas limpas');
  } catch (error) {
    console.error('❌ Erro ao limpar reservas:', error);
  }
}

// Executar limpeza periódica apenas no servidor
if (typeof window === 'undefined') {
  setInterval(limparReservasExpiradas, 5 * 60 * 1000); // A cada 5 minutos
}
