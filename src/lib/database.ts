// Sistema de "banco de dados" usando localStorage para demo
// Em produção, substituir por Supabase, PostgreSQL, MongoDB, etc.

import { Pedido, NumeroReservado, Usuario } from './types';

// Chaves do localStorage
const KEYS = {
  PEDIDOS: 'pixrapido_pedidos',
  NUMEROS_RESERVADOS: 'pixrapido_numeros_reservados',
  USUARIOS: 'pixrapido_usuarios',
};

// ==================== PEDIDOS ====================

export function salvarPedido(pedido: Pedido): void {
  if (typeof window === 'undefined') return;
  
  const pedidos = obterPedidos();
  pedidos.push(pedido);
  localStorage.setItem(KEYS.PEDIDOS, JSON.stringify(pedidos));
}

export function obterPedidos(): Pedido[] {
  if (typeof window === 'undefined') return [];
  
  const data = localStorage.getItem(KEYS.PEDIDOS);
  if (!data) return [];
  
  return JSON.parse(data).map((p: any) => ({
    ...p,
    dataPedido: new Date(p.dataPedido),
  }));
}

export function obterPedidosPorCpf(cpf: string): Pedido[] {
  return obterPedidos().filter(p => p.cpf === cpf);
}

export function obterPedidoPorId(id: string): Pedido | null {
  const pedidos = obterPedidos();
  return pedidos.find(p => p.id === id) || null;
}

export function atualizarStatusPedido(pedidoId: string, status: Pedido['status']): void {
  if (typeof window === 'undefined') return;
  
  const pedidos = obterPedidos();
  const index = pedidos.findIndex(p => p.id === pedidoId);
  
  if (index !== -1) {
    pedidos[index].status = status;
    localStorage.setItem(KEYS.PEDIDOS, JSON.stringify(pedidos));
  }
}

// ==================== NÚMEROS RESERVADOS ====================

export function reservarNumeros(
  numeros: number[],
  sorteioId: string,
  pedidoId: string,
  cpf: string
): void {
  if (typeof window === 'undefined') return;
  
  const reservas = obterNumerosReservados();
  
  numeros.forEach(numero => {
    reservas.push({
      numero,
      sorteioId,
      pedidoId,
      cpf,
      dataReserva: new Date(),
      status: 'reservado',
    });
  });
  
  localStorage.setItem(KEYS.NUMEROS_RESERVADOS, JSON.stringify(reservas));
}

export function confirmarNumerosReservados(pedidoId: string): void {
  if (typeof window === 'undefined') return;
  
  const reservas = obterNumerosReservados();
  
  reservas.forEach(reserva => {
    if (reserva.pedidoId === pedidoId) {
      reserva.status = 'confirmado';
    }
  });
  
  localStorage.setItem(KEYS.NUMEROS_RESERVADOS, JSON.stringify(reservas));
}

export function obterNumerosReservados(): NumeroReservado[] {
  if (typeof window === 'undefined') return [];
  
  const data = localStorage.getItem(KEYS.NUMEROS_RESERVADOS);
  if (!data) return [];
  
  return JSON.parse(data).map((n: any) => ({
    ...n,
    dataReserva: new Date(n.dataReserva),
  }));
}

export function obterNumerosReservadosPorSorteio(sorteioId: string): number[] {
  const reservas = obterNumerosReservados();
  return reservas
    .filter(r => r.sorteioId === sorteioId && r.status === 'confirmado')
    .map(r => r.numero);
}

export function verificarNumeroDisponivel(numero: number, sorteioId: string): boolean {
  const reservas = obterNumerosReservados();
  return !reservas.some(
    r => r.numero === numero && r.sorteioId === sorteioId && r.status === 'confirmado'
  );
}

// ==================== GERAÇÃO DE NÚMEROS ====================

export function gerarNumerosAleatoriosUnicos(
  quantidade: number,
  max: number,
  sorteioId: string
): number[] {
  const numerosReservados = obterNumerosReservadosPorSorteio(sorteioId);
  const numerosDisponiveis = Array.from({ length: max }, (_, i) => i + 1)
    .filter(n => !numerosReservados.includes(n));
  
  if (numerosDisponiveis.length < quantidade) {
    throw new Error('Não há números suficientes disponíveis');
  }
  
  // Embaralhar e pegar os primeiros N números
  const embaralhados = numerosDisponiveis.sort(() => Math.random() - 0.5);
  return embaralhados.slice(0, quantidade).sort((a, b) => a - b);
}

// ==================== USUÁRIOS ====================

export function salvarUsuario(usuario: Usuario): void {
  if (typeof window === 'undefined') return;
  
  const usuarios = obterUsuarios();
  const index = usuarios.findIndex(u => u.cpf === usuario.cpf);
  
  if (index !== -1) {
    usuarios[index] = usuario;
  } else {
    usuarios.push(usuario);
  }
  
  localStorage.setItem(KEYS.USUARIOS, JSON.stringify(usuarios));
}

export function obterUsuarios(): Usuario[] {
  if (typeof window === 'undefined') return [];
  
  const data = localStorage.getItem(KEYS.USUARIOS);
  if (!data) return [];
  
  return JSON.parse(data);
}

export function obterUsuarioPorCpf(cpf: string): Usuario | null {
  const usuarios = obterUsuarios();
  return usuarios.find(u => u.cpf === cpf) || null;
}

// ==================== UTILITÁRIOS ====================

export function gerarIdPedido(): string {
  return `PED${Date.now()}${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
}

export function limparDadosExpirados(): void {
  if (typeof window === 'undefined') return;
  
  // Limpar reservas pendentes com mais de 15 minutos
  const reservas = obterNumerosReservados();
  const agora = new Date().getTime();
  const quinzeMinutos = 15 * 60 * 1000;
  
  const reservasValidas = reservas.filter(r => {
    if (r.status === 'confirmado') return true;
    const tempoReserva = new Date(r.dataReserva).getTime();
    return (agora - tempoReserva) < quinzeMinutos;
  });
  
  localStorage.setItem(KEYS.NUMEROS_RESERVADOS, JSON.stringify(reservasValidas));
}

// Executar limpeza ao carregar
if (typeof window !== 'undefined') {
  limparDadosExpirados();
  // Executar limpeza a cada 5 minutos
  setInterval(limparDadosExpirados, 5 * 60 * 1000);
}
