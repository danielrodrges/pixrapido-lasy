'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { CheckCircle, Home, User } from 'lucide-react';
import Header from '@/components/custom/Header';

function SucessoContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [sessionId, setSessionId] = useState<string | null>(null);

  useEffect(() => {
    const session = searchParams.get('session_id');
    
    if (!session) {
      router.push('/');
      return;
    }

    setSessionId(session);
    setLoading(false);

    // Aqui você poderia fazer uma chamada para verificar o status do pagamento
    // e atualizar o pedido no banco de dados
  }, [searchParams, router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 font-semibold">Verificando pagamento...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <Header />

      <div className="container mx-auto px-4 py-8 md:py-16">
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-2xl shadow-2xl p-8 md:p-12 text-center">
            {/* Ícone de Sucesso */}
            <div className="w-20 h-20 md:w-24 md:h-24 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6 animate-bounce">
              <CheckCircle className="w-12 h-12 md:w-14 md:h-14 text-emerald-600" />
            </div>

            {/* Título */}
            <h1 className="text-3xl md:text-4xl font-black text-gray-900 mb-4">
              Pagamento Confirmado!
            </h1>

            <p className="text-lg md:text-xl text-gray-600 mb-8">
              Seus números foram reservados com sucesso! 🎉
            </p>

            {/* Informações */}
            <div className="bg-gradient-to-r from-emerald-50 to-yellow-50 rounded-xl p-6 mb-8">
              <p className="text-sm md:text-base text-gray-700 font-semibold mb-2">
                Você receberá um e-mail com a confirmação e os detalhes do seu pedido.
              </p>
              <p className="text-sm md:text-base text-gray-600">
                Seus números já estão participando do sorteio!
              </p>
            </div>

            {/* ID da Sessão (para debug) */}
            {sessionId && (
              <div className="bg-gray-50 rounded-lg p-4 mb-8">
                <p className="text-xs text-gray-500 font-mono">
                  ID da Sessão: {sessionId}
                </p>
              </div>
            )}

            {/* Botões de Ação */}
            <div className="space-y-3">
              <Link
                href="/minha-conta"
                className="block w-full bg-gradient-to-r from-emerald-500 to-emerald-600 text-white py-4 rounded-xl font-black text-lg hover:from-emerald-600 hover:to-emerald-700 transition-all shadow-lg flex items-center justify-center gap-2"
              >
                <User className="w-6 h-6" />
                VER MEUS PEDIDOS
              </Link>

              <Link
                href="/"
                className="block w-full bg-gray-100 text-gray-700 py-4 rounded-xl font-bold hover:bg-gray-200 transition-colors flex items-center justify-center gap-2"
              >
                <Home className="w-6 h-6" />
                Voltar para Início
              </Link>
            </div>

            {/* Mensagem de Incentivo */}
            <div className="mt-8 pt-8 border-t border-gray-200">
              <p className="text-sm text-gray-600 font-semibold">
                Boa sorte! 🍀 Que seus números sejam sorteados!
              </p>
            </div>
          </div>

          {/* Card de Próximos Passos */}
          <div className="mt-6 bg-blue-50 border-2 border-blue-200 rounded-xl p-6">
            <h3 className="text-lg font-black text-blue-900 mb-3">
              📱 Próximos Passos
            </h3>
            <ul className="space-y-2 text-sm text-blue-800">
              <li className="flex items-start gap-2">
                <span className="font-bold">1.</span>
                <span>Verifique seu e-mail para confirmação do pedido</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="font-bold">2.</span>
                <span>Acesse "Minha Conta" para ver seus números</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="font-bold">3.</span>
                <span>Aguarde a data do sorteio e boa sorte!</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function SucessoPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 font-semibold">Carregando...</p>
        </div>
      </div>
    }>
      <SucessoContent />
    </Suspense>
  );
}
