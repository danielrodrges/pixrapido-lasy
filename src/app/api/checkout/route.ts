import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { sorteioId, sorteioTitulo, quantidade, valorTotal, cpf, nome, numeros } = body;

    // Validações
    if (!sorteioId || !quantidade || !valorTotal || !cpf || !nome || !numeros) {
      return NextResponse.json(
        { error: 'Dados incompletos' },
        { status: 400 }
      );
    }

    // Criar sessão de checkout no Stripe
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

    return NextResponse.json({ 
      sessionId: session.id, 
      url: session.url,
      pedidoId: `PED${Date.now()}` 
    });
  } catch (error: any) {
    console.error('Erro ao criar checkout:', error);
    return NextResponse.json(
      { error: error.message || 'Erro ao processar pagamento' },
      { status: 500 }
    );
  }
}
