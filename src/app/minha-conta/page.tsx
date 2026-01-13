'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  User, 
  Ticket, 
  Clock, 
  CheckCircle, 
  XCircle,
  LogOut,
  ArrowLeft,
  Calendar,
  Hash
} from 'lucide-react';
import Header from '@/components/custom/Header';
import { pedidosMock } from '@/lib/mock-data';
import { formatarCPF, formatarMoeda } from '@/lib/mock-data';
import { Pedido } from '@/lib/types';

export default function MinhaContaPage() {
  const router = useRouter();
  const [cpf, setCpf] = useState('');
  const [nome, setNome] = useState('');
  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Verificar se usuário está logado
    const userCpf = localStorage.getItem('userCpf');
    const userName = localStorage.getItem('userName');

    if (!userCpf) {
      router.push('/login?redirect=/minha-conta');
      return;
    }

    setCpf(userCpf);
    setNome(userName || 'Usuário');
    
    // Carregar pedidos (mockados)
    setTimeout(() => {
      setPedidos(pedidosMock);
      setLoading(false);
    }, 500);
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem('userCpf');
    localStorage.removeItem('userName');
    localStorage.removeItem('userPhone');
    router.push('/');
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pago':
        return (
          <span className="inline-flex items-center gap-1 bg-emerald-100 text-emerald-600 px-2.5 py-1 sm:px-3 sm:py-1 rounded-full font-bold text-xs sm:text-sm">
            <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4" />
            Pago
          </span>
        );
      case 'pendente':
        return (
          <span className="inline-flex items-center gap-1 bg-yellow-100 text-yellow-600 px-2.5 py-1 sm:px-3 sm:py-1 rounded-full font-bold text-xs sm:text-sm">
            <Clock className="w-3 h-3 sm:w-4 sm:h-4" />
            Pendente
          </span>
        );
      case 'cancelado':
        return (
          <span className="inline-flex items-center gap-1 bg-red-100 text-red-600 px-2.5 py-1 sm:px-3 sm:py-1 rounded-full font-bold text-xs sm:text-sm">
            <XCircle className="w-3 h-3 sm:w-4 sm:h-4" />
            Cancelado
          </span>
        );
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="w-12 h-12 sm:w-16 sm:h-16 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 font-semibold text-sm sm:text-base">Carregando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <Header />

      <div className="container mx-auto px-4 py-4 sm:py-6 md:py-8">
        {/* Cabeçalho da Conta */}
        <div className="bg-gradient-to-r from-emerald-600 to-emerald-500 rounded-xl sm:rounded-2xl shadow-xl p-4 sm:p-6 md:p-8 mb-6 sm:mb-8 text-white">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4 mb-4 sm:mb-0">
            <div className="flex items-center gap-3 sm:gap-4">
              <div className="bg-white/20 backdrop-blur-sm p-3 sm:p-4 rounded-lg sm:rounded-xl">
                <User className="w-10 h-10 sm:w-12 sm:h-12" />
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl md:text-3xl font-black mb-1">
                  Olá, {nome}!
                </h1>
                <p className="text-emerald-100 font-semibold text-xs sm:text-sm md:text-base">
                  CPF: {formatarCPF(cpf)}
                </p>
              </div>
            </div>

            <div className="flex gap-2 sm:gap-3 w-full sm:w-auto">
              <Link
                href="/"
                className="flex-1 sm:flex-initial flex items-center justify-center gap-2 bg-white/20 hover:bg-white/30 backdrop-blur-sm px-3 py-2 sm:px-4 sm:py-2 rounded-lg sm:rounded-xl font-bold transition-colors text-xs sm:text-sm md:text-base"
              >
                <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" />
                Voltar
              </Link>
              <button
                onClick={handleLogout}
                className="flex-1 sm:flex-initial flex items-center justify-center gap-2 bg-red-500 hover:bg-red-600 px-3 py-2 sm:px-4 sm:py-2 rounded-lg sm:rounded-xl font-bold transition-colors text-xs sm:text-sm md:text-base"
              >
                <LogOut className="w-4 h-4 sm:w-5 sm:h-5" />
                Sair
              </button>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mt-4 sm:mt-6">
            <div className="bg-white/10 backdrop-blur-sm rounded-lg sm:rounded-xl p-3 sm:p-4">
              <div className="text-2xl sm:text-3xl font-black mb-1">
                {pedidos.length}
              </div>
              <div className="text-xs sm:text-sm text-emerald-100 font-semibold">
                Total de Pedidos
              </div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg sm:rounded-xl p-3 sm:p-4">
              <div className="text-2xl sm:text-3xl font-black mb-1">
                {pedidos.filter(p => p.status === 'pago').length}
              </div>
              <div className="text-xs sm:text-sm text-emerald-100 font-semibold">
                Pedidos Pagos
              </div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg sm:rounded-xl p-3 sm:p-4">
              <div className="text-2xl sm:text-3xl font-black mb-1">
                {pedidos.reduce((acc, p) => acc + p.numeros.length, 0)}
              </div>
              <div className="text-xs sm:text-sm text-emerald-100 font-semibold">
                Números Comprados
              </div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg sm:rounded-xl p-3 sm:p-4 col-span-2 sm:col-span-1">
              <div className="text-xl sm:text-2xl md:text-3xl font-black mb-1 truncate">
                {formatarMoeda(pedidos.reduce((acc, p) => acc + p.valorTotal, 0))}
              </div>
              <div className="text-xs sm:text-sm text-emerald-100 font-semibold">
                Total Investido
              </div>
            </div>
          </div>
        </div>

        {/* Título Pedidos */}
        <div className="mb-4 sm:mb-6">
          <h2 className="text-xl sm:text-2xl md:text-3xl font-black text-gray-900 mb-2">
            Meus Pedidos
          </h2>
          <p className="text-sm sm:text-base text-gray-600">
            Acompanhe todos os seus números e sorteios
          </p>
        </div>

        {/* Lista de Pedidos */}
        {pedidos.length === 0 ? (
          <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg p-6 sm:p-8 md:p-12 text-center">
            <Ticket className="w-12 h-12 sm:w-16 sm:h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg sm:text-xl font-black text-gray-900 mb-2">
              Nenhum pedido ainda
            </h3>
            <p className="text-sm sm:text-base text-gray-600 mb-4 sm:mb-6">
              Comece agora e garanta seus números da sorte!
            </p>
            <Link
              href="/"
              className="inline-flex items-center gap-2 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white px-5 py-2.5 sm:px-6 sm:py-3 rounded-lg sm:rounded-xl font-bold hover:from-emerald-600 hover:to-emerald-700 transition-all shadow-lg text-sm sm:text-base"
            >
              Ver Sorteios Ativos
            </Link>
          </div>
        ) : (
          <div className="space-y-3 sm:space-y-4">
            {pedidos.map((pedido) => (
              <div
                key={pedido.id}
                className="bg-white rounded-xl sm:rounded-2xl shadow-lg p-4 sm:p-6 hover:shadow-xl transition-shadow"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 mb-3 sm:mb-4">
                  <div>
                    <h3 className="text-lg sm:text-xl font-black text-gray-900 mb-1">
                      {pedido.sorteioTitulo}
                    </h3>
                    <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-xs sm:text-sm text-gray-600">
                      <span className="flex items-center gap-1 font-semibold">
                        <Calendar className="w-3 h-3 sm:w-4 sm:h-4" />
                        {new Date(pedido.dataPedido).toLocaleDateString('pt-BR')}
                      </span>
                      <span className="flex items-center gap-1 font-semibold">
                        <Hash className="w-3 h-3 sm:w-4 sm:h-4" />
                        #{pedido.id.toUpperCase()}
                      </span>
                    </div>
                  </div>
                  <div className="flex flex-row sm:flex-col items-center sm:items-end gap-2 sm:gap-3">
                    {getStatusBadge(pedido.status)}
                    <div className="text-right">
                      <div className="text-xl sm:text-2xl font-black text-emerald-600">
                        {formatarMoeda(pedido.valorTotal)}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Números */}
                <div className="bg-gradient-to-r from-emerald-50 to-yellow-50 rounded-lg sm:rounded-xl p-3 sm:p-4">
                  <div className="text-xs sm:text-sm font-bold text-gray-700 mb-2 sm:mb-3">
                    Seus Números da Sorte:
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {pedido.numeros.map((numero) => (
                      <div
                        key={numero}
                        className="bg-white border-2 border-emerald-500 text-emerald-600 px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg font-black text-base sm:text-lg shadow-sm"
                      >
                        {numero.toString().padStart(4, '0')}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Informações Adicionais */}
                <div className="mt-3 sm:mt-4 pt-3 sm:pt-4 border-t border-gray-200 flex flex-wrap items-center justify-between gap-2 text-xs sm:text-sm">
                  <span className="text-gray-600 font-semibold">
                    Pagamento: <span className="text-emerald-600 font-black">PIX</span>
                  </span>
                  <span className="text-gray-600 font-semibold">
                    {pedido.numeros.length} {pedido.numeros.length === 1 ? 'número' : 'números'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* CTA para novos sorteios */}
        {pedidos.length > 0 && (
          <div className="mt-6 sm:mt-8 bg-gradient-to-r from-emerald-600 to-emerald-500 rounded-xl sm:rounded-2xl shadow-xl p-5 sm:p-6 md:p-8 text-center text-white">
            <h3 className="text-xl sm:text-2xl md:text-3xl font-black mb-2">
              Quer Mais Chances de Ganhar?
            </h3>
            <p className="text-emerald-100 mb-4 sm:mb-6 text-sm sm:text-base md:text-lg">
              Confira os sorteios ativos e garanta mais números!
            </p>
            <Link
              href="/"
              className="inline-flex items-center gap-2 bg-yellow-400 text-emerald-600 px-6 py-3 sm:px-8 sm:py-4 rounded-lg sm:rounded-xl font-black text-base sm:text-lg hover:bg-yellow-300 transition-all shadow-lg"
            >
              <Ticket className="w-5 h-5 sm:w-6 sm:h-6" />
              Ver Sorteios Ativos
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
