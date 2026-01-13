// Funções auxiliares para integração com APIs do backend

const API_BASE_URL = process.env.NEXT_PUBLIC_URL || 'http://localhost:3000';

// ==================== AUTENTICAÇÃO ====================

export async function autenticarUsuario(cpf: string, nome: string, telefone?: string) {
  const response = await fetch(`${API_BASE_URL}/api/auth`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ cpf, nome, telefone }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Erro na autenticação');
  }

  return response.json();
}

export async function verificarUsuario(cpf: string) {
  const response = await fetch(`${API_BASE_URL}/api/auth?cpf=${cpf}`);

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Erro ao verificar usuário');
  }

  return response.json();
}

// ==================== NÚMEROS ====================

export async function gerarNumerosAleatorios(
  sorteioId: string,
  quantidade: number,
  totalNumeros: number
) {
  const response = await fetch(`${API_BASE_URL}/api/gerar-numeros`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ sorteioId, quantidade, totalNumeros }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Erro ao gerar números');
  }

  return response.json();
}

export async function verificarDisponibilidadeNumeros(
  sorteioId: string,
  numeros: number[]
) {
  const response = await fetch(`${API_BASE_URL}/api/verificar-numeros`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ sorteioId, numeros }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Erro ao verificar disponibilidade');
  }

  return response.json();
}

// ==================== PEDIDOS ====================

export async function criarPedido(dados: {
  sorteioId: string;
  sorteioTitulo: string;
  numeros: number[];
  valorTotal: number;
  cpf: string;
  nome: string;
  metodoPagamento?: string;
}) {
  const response = await fetch(`${API_BASE_URL}/api/pedidos`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(dados),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Erro ao criar pedido');
  }

  return response.json();
}

export async function buscarPedidosPorCpf(cpf: string) {
  const response = await fetch(`${API_BASE_URL}/api/pedidos?cpf=${cpf}`);

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Erro ao buscar pedidos');
  }

  return response.json();
}

// ==================== CHECKOUT STRIPE ====================

export async function criarSessaoCheckout(dados: {
  sorteioId: string;
  sorteioTitulo: string;
  quantidade: number;
  valorTotal: number;
  cpf: string;
  nome: string;
  numeros: number[];
}) {
  const response = await fetch(`${API_BASE_URL}/api/checkout`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(dados),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Erro ao criar sessão de checkout');
  }

  return response.json();
}

// ==================== UTILITÁRIOS ====================

export function formatarCPF(cpf: string): string {
  const numeros = cpf.replace(/\D/g, '');
  return numeros.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
}

export function validarCPF(cpf: string): boolean {
  const numeros = cpf.replace(/\D/g, '');
  
  if (numeros.length !== 11) return false;
  if (/^(\d)\1+$/.test(numeros)) return false;
  
  // Validação dos dígitos verificadores
  let soma = 0;
  let resto;
  
  for (let i = 1; i <= 9; i++) {
    soma += parseInt(numeros.substring(i - 1, i)) * (11 - i);
  }
  
  resto = (soma * 10) % 11;
  if (resto === 10 || resto === 11) resto = 0;
  if (resto !== parseInt(numeros.substring(9, 10))) return false;
  
  soma = 0;
  for (let i = 1; i <= 10; i++) {
    soma += parseInt(numeros.substring(i - 1, i)) * (12 - i);
  }
  
  resto = (soma * 10) % 11;
  if (resto === 10 || resto === 11) resto = 0;
  if (resto !== parseInt(numeros.substring(10, 11))) return false;
  
  return true;
}

export function formatarTelefone(telefone: string): string {
  const numeros = telefone.replace(/\D/g, '');
  
  if (numeros.length === 11) {
    return numeros.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
  } else if (numeros.length === 10) {
    return numeros.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
  }
  
  return telefone;
}
