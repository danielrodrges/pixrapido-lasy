'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { 
  Zap, 
  TrendingUp, 
  Clock, 
  Users, 
  CheckCircle, 
  Sparkles,
  ArrowRight,
  Trophy,
  Shield,
  Ticket,
  ShoppingCart
} from 'lucide-react';
import Header from '@/components/custom/Header';
import { Sorteio, Pacote } from '@/lib/types';
import { formatarMoeda, calcularTempoRestante } from '@/lib/mock-data';

export default function HomePage() {
  const [sorteiosAtivos, setSorteiosAtivos] = useState<Sorteio[]>([]);
  const [pacotesPadrao, setPacotesPadrao] = useState<Pacote[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [tempoRestante, setTempoRestante] = useState<any>({});
  const [pacotesSelecionados, setPacotesSelecionados] = useState<{[key: string]: Pacote}>({});
  const [processandoCheckout, setProcessandoCheckout] = useState<{[key: string]: boolean}>({});

  // Buscar sorteios e pacotes da API (produtos do Stripe)
  useEffect(() => {
    async function carregarSorteios() {
      try {
        const response = await fetch('/api/sorteios');
        const data = await response.json();
        
        if (data.sorteios) {
          setSorteiosAtivos(data.sorteios);
          console.log('✅ Sorteios carregados do Stripe:', data.sorteios.length);
        }
        
        if (data.pacotes) {
          setPacotesPadrao(data.pacotes);
          console.log('✅ Pacotes carregados:', data.pacotes.length);
        }
      } catch (error) {
        console.error('❌ Erro ao carregar sorteios:', error);
      } finally {
        setCarregando(false);
      }
    }
    
    carregarSorteios();
  }, []);

  // Atualizar contadores a cada segundo
  useEffect(() => {
    if (sorteiosAtivos.length === 0) return;
    
    const interval = setInterval(() => {
      const novosTempos: any = {};
      sorteiosAtivos.forEach(sorteio => {
        // Converter string para Date se necessário
        const dataSorteio = typeof sorteio.dataSorteio === 'string' 
          ? new Date(sorteio.dataSorteio) 
          : sorteio.dataSorteio;
        novosTempos[sorteio.id] = calcularTempoRestante(dataSorteio);
      });
      setTempoRestante(novosTempos);
    }, 1000);

    return () => clearInterval(interval);
  }, [sorteiosAtivos]);

  const calcularPorcentagemVendida = (sorteio: Sorteio) => {
    return Math.round((sorteio.numerosVendidos / sorteio.totalNumeros) * 100);
  };

  const handleComprarAgora = async (sorteio: Sorteio, pacote: Pacote) => {
    setProcessandoCheckout(prev => ({ ...prev, [sorteio.id]: true }));

    try {
      // Redirecionar para checkout com os dados
      const params = new URLSearchParams({
        sorteio: sorteio.id,
        pacote: pacote.id,
        quantidade: pacote.quantidade.toString(),
        valor: pacote.preco.toString(),
      });
      
      window.location.href = `/checkout?${params.toString()}`;
    } catch (error) {
      console.error('Erro ao processar compra:', error);
      alert('Erro ao processar compra. Tente novamente.');
    } finally {
      setProcessandoCheckout(prev => ({ ...prev, [sorteio.id]: false }));
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <Header />

      {/* Hero Section - Banner Principal */}
      <section className="relative bg-gradient-to-r from-emerald-600 via-emerald-500 to-yellow-500 overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4xIj48cGF0aCBkPSJNMzYgMzRjMC0yLjIxIDEuNzktNCA0LTRzNCAxLjc5IDQgNC0xLjc5IDQtNCA0LTQtMS43OS00LTR6bTAgMTBjMC0yLjIxIDEuNzktNCA0LTRzNCAxLjc5IDQgNC0xLjc5IDQtNCA0LTQtMS43OS00LTR6Ii8+PC9nPjwvZz48L3N2Zz4=')] opacity-20"></div>
        
        <div className="container mx-auto px-4 py-6 sm:py-10 md:py-16 relative">
          <div className="text-center max-w-4xl mx-auto">
            {/* Badge Ao Vivo */}
            <div className="inline-flex items-center gap-2 bg-red-500 text-white px-3 py-1.5 sm:px-4 sm:py-2 rounded-full font-bold text-xs sm:text-sm md:text-base mb-3 sm:mb-4 animate-pulse shadow-lg">
              <span className="w-2 h-2 bg-white rounded-full animate-ping"></span>
              AO VIVO AGORA
            </div>

            <h1 className="text-2xl sm:text-3xl md:text-5xl lg:text-6xl font-black text-white mb-3 sm:mb-4 leading-tight px-2">
              GANHE PRÊMIOS
              <span className="block text-yellow-400 mt-1 sm:mt-2">
                INCRÍVEIS AGORA!
              </span>
            </h1>

            <p className="text-base sm:text-lg md:text-xl text-white/90 mb-4 sm:mb-6 font-semibold px-4">
              Compre seus números em segundos e concorra a prêmios de até{' '}
              <span className="text-yellow-400 font-black">R$ 50.000!</span>
            </p>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-2 sm:gap-4 max-w-2xl mx-auto mb-4 sm:mb-8 px-4">
              <div className="bg-white/20 backdrop-blur-sm rounded-lg sm:rounded-xl p-2 sm:p-4">
                <div className="text-xl sm:text-2xl md:text-3xl font-black text-yellow-400">+15K</div>
                <div className="text-[10px] sm:text-xs md:text-sm text-white font-semibold">Ganhadores</div>
              </div>
              <div className="bg-white/20 backdrop-blur-sm rounded-lg sm:rounded-xl p-2 sm:p-4">
                <div className="text-xl sm:text-2xl md:text-3xl font-black text-yellow-400">100%</div>
                <div className="text-[10px] sm:text-xs md:text-sm text-white font-semibold">Seguro</div>
              </div>
              <div className="bg-white/20 backdrop-blur-sm rounded-lg sm:rounded-xl p-2 sm:p-4">
                <div className="text-xl sm:text-2xl md:text-3xl font-black text-yellow-400">24/7</div>
                <div className="text-[10px] sm:text-xs md:text-sm text-white font-semibold">Disponível</div>
              </div>
            </div>

            <a
              href="#sorteios"
              className="inline-flex items-center gap-2 bg-yellow-400 text-emerald-600 px-6 py-3 sm:px-8 sm:py-4 rounded-full font-black text-base sm:text-lg md:text-xl shadow-2xl hover:scale-105 transition-transform"
            >
              <Zap className="w-5 h-5 sm:w-6 sm:h-6" />
              COMPRAR AGORA
              <ArrowRight className="w-5 h-5 sm:w-6 sm:h-6" />
            </a>
          </div>
        </div>
      </section>

      {/* Sorteios Ativos */}
      <section id="sorteios" className="py-6 sm:py-10 md:py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-6 sm:mb-8 md:mb-12">
            <div className="inline-flex items-center gap-2 bg-emerald-100 text-emerald-600 px-3 py-1.5 sm:px-4 sm:py-2 rounded-full font-bold text-xs sm:text-sm mb-3 sm:mb-4">
              <Trophy className="w-4 h-4 sm:w-5 sm:h-5" />
              SORTEIOS ATIVOS
            </div>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-gray-900 mb-2 px-4">
              Escolha Seu Prêmio
            </h2>
            <p className="text-gray-600 text-sm sm:text-base md:text-lg px-4">
              Números limitados! Garanta o seu agora
            </p>
          </div>

          {carregando ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
              <p className="mt-4 text-gray-600">Carregando sorteios...</p>
            </div>
          ) : sorteiosAtivos.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-600 text-lg">Nenhum sorteio ativo no momento.</p>
              <p className="text-gray-500 text-sm mt-2">Em breve novos sorteios!</p>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-2 gap-4 sm:gap-6 max-w-6xl mx-auto">
              {sorteiosAtivos.map((sorteio) => {
              const porcentagem = calcularPorcentagemVendida(sorteio);
              const tempo = tempoRestante[sorteio.id] || { dias: 0, horas: 0, minutos: 0, segundos: 0 };
              const pacoteSelecionado = pacotesSelecionados[sorteio.id];

              return (
                <div
                  key={sorteio.id}
                  className="bg-white rounded-xl sm:rounded-2xl shadow-xl overflow-hidden hover:shadow-2xl transition-all"
                >
                  {/* Badge Destaque */}
                  {sorteio.destaque && (
                    <div className="absolute top-3 right-3 sm:top-4 sm:right-4 z-10 bg-red-500 text-white px-2 py-1 sm:px-3 sm:py-1 rounded-full font-bold text-xs sm:text-sm flex items-center gap-1 shadow-lg">
                      <Sparkles className="w-3 h-3 sm:w-4 sm:h-4" />
                      DESTAQUE
                    </div>
                  )}

                  {/* Imagem */}
                  <div className="relative h-48 sm:h-56 md:h-64 overflow-hidden">
                    <Image
                      src={sorteio.imagemUrl}
                      alt={sorteio.titulo}
                      fill
                      className="object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                    <div className="absolute bottom-3 left-3 right-3 sm:bottom-4 sm:left-4 sm:right-4">
                      <h3 className="text-white font-black text-xl sm:text-2xl md:text-3xl leading-tight">
                        {sorteio.titulo}
                      </h3>
                    </div>
                  </div>

                  {/* Conteúdo */}
                  <div className="p-4 sm:p-5 md:p-6">
                    {/* Valor do Prêmio */}
                    <div className="bg-gradient-to-r from-emerald-50 to-yellow-50 rounded-lg sm:rounded-xl p-3 sm:p-4 mb-3 sm:mb-4">
                      <div className="text-xs sm:text-sm text-gray-600 font-semibold mb-1">
                        Prêmio Total
                      </div>
                      <div className="text-2xl sm:text-3xl md:text-4xl font-black text-emerald-600">
                        {formatarMoeda(sorteio.valorPremio)}
                      </div>
                    </div>

                    {/* Barra de Progresso */}
                    <div className="mb-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs sm:text-sm font-bold text-gray-700 flex items-center gap-1">
                          <Users className="w-3 h-3 sm:w-4 sm:h-4" />
                          {sorteio.numerosVendidos.toLocaleString('pt-BR')} vendidos
                        </span>
                        <span className="text-xs sm:text-sm font-bold text-red-500">
                          {porcentagem}% vendido
                        </span>
                      </div>
                      <div className="h-2 sm:h-3 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-emerald-500 to-yellow-400 transition-all duration-500"
                          style={{ width: `${porcentagem}%` }}
                        ></div>
                      </div>
                      <div className="text-[10px] sm:text-xs text-gray-500 mt-1 font-semibold">
                        Restam apenas {(sorteio.totalNumeros - sorteio.numerosVendidos).toLocaleString('pt-BR')} números!
                      </div>
                    </div>

                    {/* Contador */}
                    <div className="bg-red-50 rounded-lg sm:rounded-xl p-2.5 sm:p-3 mb-4">
                      <div className="flex items-center justify-center gap-2 text-red-600 font-bold text-xs sm:text-sm mb-2">
                        <Clock className="w-3 h-3 sm:w-4 sm:h-4" />
                        TERMINA EM:
                      </div>
                      <div className="grid grid-cols-4 gap-1.5 sm:gap-2 text-center">
                        <div>
                          <div className="text-xl sm:text-2xl font-black text-red-600">{tempo.dias}</div>
                          <div className="text-[10px] sm:text-xs text-red-500 font-semibold">Dias</div>
                        </div>
                        <div>
                          <div className="text-xl sm:text-2xl font-black text-red-600">{tempo.horas}</div>
                          <div className="text-[10px] sm:text-xs text-red-500 font-semibold">Hrs</div>
                        </div>
                        <div>
                          <div className="text-xl sm:text-2xl font-black text-red-600">{tempo.minutos}</div>
                          <div className="text-[10px] sm:text-xs text-red-500 font-semibold">Min</div>
                        </div>
                        <div>
                          <div className="text-xl sm:text-2xl font-black text-red-600">{tempo.segundos}</div>
                          <div className="text-[10px] sm:text-xs text-red-500 font-semibold">Seg</div>
                        </div>
                      </div>
                    </div>

                    {/* Título Opções de Compra */}
                    <div className="mb-3">
                      <h4 className="text-sm sm:text-base font-black text-gray-900 mb-2 flex items-center gap-2">
                        <ShoppingCart className="w-4 h-4" />
                        ESCOLHA SUA QUANTIDADE:
                      </h4>
                    </div>

                    {/* 6 Minicards de Opções */}
                    <div className="grid grid-cols-3 gap-2 mb-4">
                      {pacotesPadrao.slice(0, 6).map((pacote) => {
                        const precoOriginal = pacote.quantidade * sorteio.precoPorNumero;
                        const economia = precoOriginal - pacote.preco;
                        const isSelected = pacoteSelecionado?.id === pacote.id;

                        return (
                          <button
                            key={pacote.id}
                            onClick={() => setPacotesSelecionados(prev => ({ 
                              ...prev, 
                              [sorteio.id]: pacote 
                            }))}
                            className={`relative p-2 sm:p-3 rounded-lg transition-all hover:scale-105 ${
                              isSelected
                                ? 'bg-gradient-to-br from-emerald-500 to-emerald-600 text-white shadow-lg scale-105'
                                : 'bg-gray-50 hover:bg-gray-100 text-gray-900 border-2 border-gray-200'
                            }`}
                          >
                            {/* Badge Popular */}
                            {pacote.popular && (
                              <div className="absolute -top-1.5 left-1/2 -translate-x-1/2 bg-yellow-400 text-emerald-600 px-1.5 py-0.5 rounded-full font-black text-[8px] sm:text-[10px] shadow-lg whitespace-nowrap">
                                POPULAR
                              </div>
                            )}

                            {/* Badge Desconto */}
                            {pacote.desconto && (
                              <div className="absolute -top-1 -right-1 bg-red-500 text-white w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center font-black text-[8px] sm:text-[10px] shadow-lg">
                                -{pacote.desconto}%
                              </div>
                            )}

                            <div className="text-center">
                              <div className="text-xl sm:text-2xl font-black mb-0.5">
                                {pacote.quantidade}
                              </div>
                              <div className={`text-[9px] sm:text-[10px] font-bold mb-1 ${
                                isSelected ? 'text-white/90' : 'text-gray-600'
                              }`}>
                                {pacote.quantidade === 1 ? 'núm' : 'núms'}
                              </div>

                              {/* Preço */}
                              <div className="mb-0.5">
                                {pacote.desconto ? (
                                  <>
                                    <div className={`text-[8px] sm:text-[9px] line-through mb-0.5 ${
                                      isSelected ? 'text-white/70' : 'text-gray-400'
                                    }`}>
                                      {formatarMoeda(precoOriginal)}
                                    </div>
                                    <div className="text-xs sm:text-sm font-black">
                                      {formatarMoeda(pacote.preco)}
                                    </div>
                                  </>
                                ) : (
                                  <div className="text-xs sm:text-sm font-black">
                                    {formatarMoeda(pacote.preco)}
                                  </div>
                                )}
                              </div>

                              {/* Check */}
                              {isSelected && (
                                <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4 mx-auto mt-0.5" />
                              )}
                            </div>
                          </button>
                        );
                      })}
                    </div>

                    {/* Botão Comprar Agora */}
                    <button
                      onClick={() => {
                        if (pacoteSelecionado) {
                          handleComprarAgora(sorteio, pacoteSelecionado);
                        } else {
                          alert('Selecione uma quantidade primeiro!');
                        }
                      }}
                      disabled={!pacoteSelecionado || processandoCheckout[sorteio.id]}
                      className={`w-full py-3 sm:py-4 rounded-lg sm:rounded-xl font-black text-base sm:text-lg transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2 ${
                        pacoteSelecionado && !processandoCheckout[sorteio.id]
                          ? 'bg-gradient-to-r from-emerald-500 to-emerald-600 text-white hover:from-emerald-600 hover:to-emerald-700'
                          : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      }`}
                    >
                      {processandoCheckout[sorteio.id] ? (
                        <>
                          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          PROCESSANDO...
                        </>
                      ) : (
                        <>
                          <Zap className="w-4 h-4 sm:w-5 sm:h-5" />
                          {pacoteSelecionado 
                            ? `COMPRAR ${pacoteSelecionado.quantidade} POR ${formatarMoeda(pacoteSelecionado.preco)}`
                            : 'SELECIONE UMA OPÇÃO'
                          }
                        </>
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
            </div>
          )}
        </div>
      </section>

      {/* Como Funciona */}
      <section className="py-6 sm:py-10 md:py-16 bg-gradient-to-br from-gray-900 to-gray-800 text-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-8 sm:mb-12">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-black mb-3 sm:mb-4 px-4">
              Como Funciona?
            </h2>
            <p className="text-gray-300 text-sm sm:text-base md:text-lg px-4">
              Simples, rápido e seguro!
            </p>
          </div>

          <div className="grid sm:grid-cols-3 gap-6 sm:gap-8 max-w-5xl mx-auto">
            <div className="text-center">
              <div className="bg-yellow-400 w-12 h-12 sm:w-16 sm:h-16 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4 shadow-xl">
                <span className="text-2xl sm:text-3xl font-black text-gray-900">1</span>
              </div>
              <h3 className="text-lg sm:text-xl font-black mb-2">Escolha o Sorteio</h3>
              <p className="text-sm sm:text-base text-gray-300">
                Selecione o prêmio que você quer ganhar
              </p>
            </div>

            <div className="text-center">
              <div className="bg-yellow-400 w-12 h-12 sm:w-16 sm:h-16 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4 shadow-xl">
                <span className="text-2xl sm:text-3xl font-black text-gray-900">2</span>
              </div>
              <h3 className="text-lg sm:text-xl font-black mb-2">Compre Seus Números</h3>
              <p className="text-sm sm:text-base text-gray-300">
                Escolha quantos números quer e finalize o pagamento
              </p>
            </div>

            <div className="text-center">
              <div className="bg-yellow-400 w-12 h-12 sm:w-16 sm:h-16 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4 shadow-xl">
                <span className="text-2xl sm:text-3xl font-black text-gray-900">3</span>
              </div>
              <h3 className="text-lg sm:text-xl font-black mb-2">Aguarde o Sorteio</h3>
              <p className="text-sm sm:text-base text-gray-300">
                Acompanhe seus números e torça para ganhar!
              </p>
            </div>
          </div>

          {/* Garantias */}
          <div className="mt-8 sm:mt-12 grid sm:grid-cols-3 gap-4 sm:gap-6 max-w-4xl mx-auto">
            <div className="bg-white/10 backdrop-blur-sm rounded-lg sm:rounded-xl p-4 sm:p-6 text-center">
              <Shield className="w-10 h-10 sm:w-12 sm:h-12 mx-auto mb-2 sm:mb-3 text-yellow-400" />
              <h4 className="font-black text-sm sm:text-base mb-1 sm:mb-2">100% Seguro</h4>
              <p className="text-xs sm:text-sm text-gray-300">Pagamento protegido</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg sm:rounded-xl p-4 sm:p-6 text-center">
              <Zap className="w-10 h-10 sm:w-12 sm:h-12 mx-auto mb-2 sm:mb-3 text-yellow-400" />
              <h4 className="font-black text-sm sm:text-base mb-1 sm:mb-2">Super Rápido</h4>
              <p className="text-xs sm:text-sm text-gray-300">Compra em segundos</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg sm:rounded-xl p-4 sm:p-6 text-center">
              <TrendingUp className="w-10 h-10 sm:w-12 sm:h-12 mx-auto mb-2 sm:mb-3 text-yellow-400" />
              <h4 className="font-black text-sm sm:text-base mb-1 sm:mb-2">Mais Chances</h4>
              <p className="text-xs sm:text-sm text-gray-300">Quanto mais, melhor</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-6 sm:py-8">
        <div className="container mx-auto px-4 text-center">
          <div className="flex items-center justify-center gap-2 mb-3 sm:mb-4">
            <Ticket className="w-6 h-6 sm:w-8 sm:h-8 text-yellow-400" />
            <span className="text-xl sm:text-2xl font-black">
              PIX<span className="text-yellow-400">RÁPIDO</span>
            </span>
          </div>
          <p className="text-gray-400 text-xs sm:text-sm">
            © 2024 PixRápido. Todos os direitos reservados.
          </p>
          <p className="text-gray-500 text-[10px] sm:text-xs mt-2">
            Jogue com responsabilidade. +18 anos.
          </p>
        </div>
      </footer>
    </div>
  );
}
