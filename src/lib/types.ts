// Tipos e interfaces do PixRápido

export interface Sorteio {
  id: string;
  titulo: string;
  descricao: string;
  imagemUrl: string;
  valorPremio: number;
  precoPorNumero: number;
  totalNumeros: number;
  numerosVendidos: number;
  datasorteio: Date;
  status: 'ativo' | 'encerrado' | 'sorteado';
  destaque?: boolean;
  stripeProductId?: string;
}

export interface Pacote {
  id: string;
  quantidade: number;
  preco: number;
  desconto?: number;
  popular?: boolean;
}

export interface Pedido {
  id: string;
  sorteioId: string;
  sorteioTitulo: string;
  numeros: number[];
  valorTotal: number;
  dataPedido: Date;
  status: 'pendente' | 'pago' | 'cancelado';
  metodoPagamento: 'pix' | 'cartao';
  cpf: string;
  nome: string;
  stripeSessionId?: string;
}

export interface Usuario {
  cpf: string;
  nome: string;
  telefone?: string;
  email?: string;
}

export interface NumeroReservado {
  numero: number;
  sorteioId: string;
  pedidoId: string;
  cpf: string;
  dataReserva: Date;
  status: 'reservado' | 'confirmado';
}
