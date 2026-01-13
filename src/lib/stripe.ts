// Configuração do Stripe
import Stripe from 'stripe';

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('STRIPE_SECRET_KEY não configurada');
}

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2024-12-18.acacia',
});

// IDs dos produtos Stripe para cada sorteio
export const STRIPE_PRODUCTS = {
  '1': process.env.NEXT_PUBLIC_STRIPE_PRODUCT_MOTO || 'prod_moto_cg160',
  '2': process.env.NEXT_PUBLIC_STRIPE_PRODUCT_IPHONE || 'prod_iphone15',
  '3': process.env.NEXT_PUBLIC_STRIPE_PRODUCT_DINHEIRO || 'prod_50k_cash',
  '4': process.env.NEXT_PUBLIC_STRIPE_PRODUCT_PS5 || 'prod_ps5_bundle',
};

// Função para criar sessão de checkout
export async function criarSessaoCheckout(
  sorteioId: string,
  sorteioTitulo: string,
  quantidade: number,
  valorTotal: number,
  cpf: string,
  nome: string,
  numeros: number[]
) {
  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    line_items: [
      {
        price_data: {
          currency: 'brl',
          product_data: {
            name: `${quantidade} número(s) - ${sorteioTitulo}`,
            description: `Números: ${numeros.join(', ')}`,
          },
          unit_amount: Math.round(valorTotal * 100), // Stripe usa centavos
        },
        quantity: 1,
      },
    ],
    mode: 'payment',
    success_url: `${process.env.NEXT_PUBLIC_URL || 'http://localhost:3000'}/sucesso?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${process.env.NEXT_PUBLIC_URL || 'http://localhost:3000'}/?sorteio=${sorteioId}`,
    metadata: {
      sorteioId,
      sorteioTitulo,
      quantidade: quantidade.toString(),
      valorTotal: valorTotal.toString(),
      cpf,
      nome,
      numeros: JSON.stringify(numeros),
    },
  });

  return session;
}

// Função para verificar status de pagamento
export async function verificarStatusPagamento(sessionId: string) {
  const session = await stripe.checkout.sessions.retrieve(sessionId);
  return {
    status: session.payment_status,
    metadata: session.metadata,
  };
}

// Função para criar produto no Stripe (para setup inicial)
export async function criarProdutoStripe(
  nome: string,
  descricao: string,
  imagem?: string
) {
  const product = await stripe.products.create({
    name: nome,
    description: descricao,
    images: imagem ? [imagem] : undefined,
  });

  return product;
}

// Função para criar preço no Stripe
export async function criarPrecoStripe(
  productId: string,
  valor: number
) {
  const price = await stripe.prices.create({
    product: productId,
    unit_amount: Math.round(valor * 100), // Converter para centavos
    currency: 'brl',
  });

  return price;
}
