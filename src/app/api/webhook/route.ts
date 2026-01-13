import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { headers } from 'next/headers';
import { atualizarStatusPedido, confirmarNumerosReservados, atualizarNumerosVendidos, salvarUsuario, reservarNumeros } from '@/lib/database';

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
        
        if (metadata && metadata.pedidoId) {
          const pedidoId = metadata.pedidoId;
          const sorteioId = metadata.sorteioId;
          const cpf = metadata.cpf;
          const nome = metadata.nome;
          const numeros = JSON.parse(metadata.numeros || '[]');
          
          // 1. Salvar usuário no Supabase
          await salvarUsuario({
            cpf,
            nome,
            dataCadastro: new Date(),
          });
          
          // 2. Reservar números no Supabase
          await reservarNumeros(numeros, sorteioId, pedidoId, cpf);
          
          // 3. Atualizar status do pedido para "pago"
          await atualizarStatusPedido(pedidoId, 'pago');
          
          // 4. Confirmar números reservados
          await confirmarNumerosReservados(pedidoId);
          
          // 5. Atualizar contador de números vendidos
          await atualizarNumerosVendidos(sorteioId, numeros.length);
          
          console.log('✅ Pagamento confirmado e processado:', {
            pedidoId,
            sessionId: session.id,
            valor: metadata.valorTotal,
            quantidade: numeros.length,
            numeros: numeros
          });
          
          // TODO: Em produção, adicionar:
          // - Enviar email/SMS de confirmação
          // - Notificar sistema de sorteio
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
