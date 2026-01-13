// Dados mockados para demonstração do PixRápido
import { Sorteio, Pacote, Pedido } from './types';

export const sorteiosAtivos: Sorteio[] = [
  {
    id: '1',
    titulo: '🏍️ MOTO HONDA CG 160 0KM',
    descricao: 'Moto zero quilômetro + R$ 5.000 em dinheiro!',
    imagemUrl: 'https://images.unsplash.com/photo-1558981403-c5f9899a28bc?w=800&h=600&fit=crop',
    valorPremio: 15000,
    precoPorNumero: 5,
    totalNumeros: 10000,
    numerosVendidos: 7834,
    datasorteio: new Date('2024-02-15T20:00:00'),
    status: 'ativo',
    destaque: true,
    stripeProductId: process.env.NEXT_PUBLIC_STRIPE_PRODUCT_MOTO,
  },
  {
    id: '2',
    titulo: '📱 IPHONE 15 PRO MAX',
    descricao: 'iPhone 15 Pro Max 256GB + AirPods Pro',
    imagemUrl: 'https://images.unsplash.com/photo-1696446702183-cbd0674e39f8?w=800&h=600&fit=crop',
    valorPremio: 12000,
    precoPorNumero: 3,
    totalNumeros: 5000,
    numerosVendidos: 3421,
    datasorteio: new Date('2024-02-10T21:00:00'),
    status: 'ativo',
    stripeProductId: process.env.NEXT_PUBLIC_STRIPE_PRODUCT_IPHONE,
  },
  {
    id: '3',
    titulo: '💰 R$ 50.000 EM DINHEIRO',
    descricao: 'Cinquenta mil reais direto na sua conta!',
    imagemUrl: 'https://images.unsplash.com/photo-1607863680198-23d4b2565df0?w=800&h=600&fit=crop',
    valorPremio: 50000,
    precoPorNumero: 10,
    totalNumeros: 15000,
    numerosVendidos: 9234,
    datasorteio: new Date('2024-02-20T20:00:00'),
    status: 'ativo',
    destaque: true,
    stripeProductId: process.env.NEXT_PUBLIC_STRIPE_PRODUCT_DINHEIRO,
  },
  {
    id: '4',
    titulo: '🎮 PLAYSTATION 5 + JOGOS',
    descricao: 'PS5 + 5 jogos + 2 controles',
    imagemUrl: 'https://images.unsplash.com/photo-1606813907291-d86efa9b94db?w=800&h=600&fit=crop',
    valorPremio: 5000,
    precoPorNumero: 2,
    totalNumeros: 3000,
    numerosVendidos: 1876,
    datasorteio: new Date('2024-02-08T19:00:00'),
    status: 'ativo',
    stripeProductId: process.env.NEXT_PUBLIC_STRIPE_PRODUCT_PS5,
  },
];

// 6 pacotes padrão para opções de compra
export const pacotesPadrao: Pacote[] = [
  {
    id: 'p1',
    quantidade: 1,
    preco: 5,
  },
  {
    id: 'p2',
    quantidade: 5,
    preco: 20,
    desconto: 20,
  },
  {
    id: 'p3',
    quantidade: 10,
    preco: 35,
    desconto: 30,
    popular: true,
  },
  {
    id: 'p4',
    quantidade: 20,
    preco: 60,
    desconto: 40,
  },
  {
    id: 'p5',
    quantidade: 50,
    preco: 125,
    desconto: 50,
  },
  {
    id: 'p6',
    quantidade: 100,
    preco: 200,
    desconto: 60,
  },
];

export const pedidosMock: Pedido[] = [
  {
    id: 'PED1736723400ABC123',
    sorteioId: '1',
    sorteioTitulo: '🏍️ MOTO HONDA CG 160 0KM',
    numeros: [1234, 5678, 9012, 3456, 7890],
    valorTotal: 20,
    dataPedido: new Date('2024-01-10T14:30:00'),
    status: 'pago',
    metodoPagamento: 'pix',
    cpf: '12345678900',
    nome: 'João Silva',
  },
  {
    id: 'PED1736723500XYZ789',
    sorteioId: '2',
    sorteioTitulo: '📱 IPHONE 15 PRO MAX',
    numeros: [4321, 8765],
    valorTotal: 6,
    dataPedido: new Date('2024-01-12T10:15:00'),
    status: 'pago',
    metodoPagamento: 'pix',
    cpf: '12345678900',
    nome: 'João Silva',
  },
];

// Função para gerar números aleatórios únicos
export function gerarNumerosAleatorios(quantidade: number, max: number): number[] {
  const numeros = new Set<number>();
  while (numeros.size < quantidade) {
    numeros.add(Math.floor(Math.random() * max) + 1);
  }
  return Array.from(numeros).sort((a, b) => a - b);
}

// Função para calcular tempo restante
export function calcularTempoRestante(dataFinal: Date): {
  dias: number;
  horas: number;
  minutos: number;
  segundos: number;
} {
  const agora = new Date().getTime();
  const fim = dataFinal.getTime();
  const diferenca = fim - agora;

  if (diferenca <= 0) {
    return { dias: 0, horas: 0, minutos: 0, segundos: 0 };
  }

  return {
    dias: Math.floor(diferenca / (1000 * 60 * 60 * 24)),
    horas: Math.floor((diferenca % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
    minutos: Math.floor((diferenca % (1000 * 60 * 60)) / (1000 * 60)),
    segundos: Math.floor((diferenca % (1000 * 60)) / 1000),
  };
}

// Função para formatar CPF
export function formatarCPF(cpf: string): string {
  const numeros = cpf.replace(/\D/g, '');
  return numeros.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
}

// Função para formatar moeda
export function formatarMoeda(valor: number): string {
  return valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

// Função para calcular preço com desconto
export function calcularPrecoComDesconto(
  precoPorNumero: number,
  quantidade: number,
  desconto?: number
): number {
  const precoBase = precoPorNumero * quantidade;
  if (!desconto) return precoBase;
  
  return precoBase * (1 - desconto / 100);
}

// Função para obter pacotes de um sorteio específico
export function obterPacotesSorteio(sorteio: Sorteio): Pacote[] {
  return pacotesPadrao.map(pacote => ({
    ...pacote,
    preco: calcularPrecoComDesconto(
      sorteio.precoPorNumero,
      pacote.quantidade,
      pacote.desconto
    ),
  }));
}

// Função para validar se há números suficientes disponíveis
export function validarDisponibilidade(
  sorteio: Sorteio,
  quantidadeSolicitada: number
): boolean {
  const numerosDisponiveis = sorteio.totalNumeros - sorteio.numerosVendidos;
  return numerosDisponiveis >= quantidadeSolicitada;
}
