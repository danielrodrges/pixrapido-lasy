// Tipos e interfaces do PixRápido

export interface Sorteio {
  id: string;
  titulo: string;
  descricao: string;
  imagemUrl: string;
  valorPremio: number;
  precoPorNumero: number;
  totalNumeros: number;
  numeroInicial: number;
  numeroFinal: number;
  numerosVendidos: number;
  dataSorteio: Date;
  status: 'ativo' | 'encerrado' | 'sorteado';
  destaque?: boolean;
  stripeProductId?: string;
  numeroGanhador?: number;
  cpfGanhador?: string;
  dataRealizacao?: Date;
  createdAt?: Date;
  updatedAt?: Date;
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
  quantidadeNumeros: number;
  valorTotal: number;
  dataPedido: Date;
  dataPagamento?: Date;
  status: 'pendente' | 'pago' | 'cancelado';
  metodoPagamento: 'pix' | 'cartao';
  cpf: string;
  nome: string;
  stripeSessionId?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface Usuario {
  cpf: string;
  nome: string;
  telefone?: string;
  email?: string;
  dataCadastro?: Date;
}

export interface NumeroReservado {
  id?: number;
  numero: number;
  sorteioId: string;
  pedidoId: string;
  cpf: string;
  dataReserva: Date;
  dataConfirmacao?: Date;
  status: 'reservado' | 'confirmado';
  createdAt?: Date;
}
