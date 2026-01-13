import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { headers } from 'next/headers';

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const signature = headers().get('stripe-signature');

    if (!signature) {
      return NextResponse.json(
        { error: 'Assinatura ausente' },
        { status: 400 }
      );
    }

    // Verificar evento do Stripe
    const event = stripe.webhooks.constructEvent(
      body,
      signature,
      webhookSecret
    );

    // Processar evento
    switch (event.type) {
      case 'checkout.session.completed':
        const session = event.data.object;
        
        // Extrair dados do metadata
        const metadata = session.metadata;
        
        if (metadata) {
          const pedidoData = {
            id: `PED${Date.now()}${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
            sorteioId: metadata.sorteioId,
            sorteioTitulo: metadata.sorteioTitulo,
            numeros: JSON.parse(metadata.numeros),
            valorTotal: parseFloat(metadata.valorTotal),
            dataPedido: new Date(),
            status: 'pago' as const,
            metodoPagamento: 'pix' as const,
            cpf: metadata.cpf,
            nome: metadata.nome,
            stripeSessionId: session.id,
          };

          // Aqui você salvaria no banco de dados real
          // Por enquanto, o frontend usa localStorage
          console.log('✅ Pagamento confirmado:', pedidoData);
          
          // Em produção, você faria:
          // - Salvar pedido no banco de dados
          // - Confirmar números reservados
          // - Enviar email/SMS de confirmação
          // - Atualizar contadores de números vendidos
        }
        break;

      case 'checkout.session.expired':
        console.log('⏰ Sessão de checkout expirada');
        // Liberar números reservados
        break;

      case 'payment_intent.payment_failed':
        console.log('❌ Pagamento falhou');
        break;
    }

    return NextResponse.json({ received: true });
  } catch (error: any) {
    console.error('Erro no webhook:', error);
    return NextResponse.json(
      { error: error.message },
      { status: 400 }
    );
  }
}
