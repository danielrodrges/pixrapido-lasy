'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { 
  ArrowLeft, 
  CheckCircle, 
  Copy, 
  QrCode,
  Clock,
  Shield,
  Zap
} from 'lucide-react';
import Header from '@/components/custom/Header';
import { sorteiosAtivos, pacotesPadrao, gerarNumerosAleatorios } from '@/lib/mock-data';
import { formatarMoeda } from '@/lib/mock-data';
import { Sorteio, Pacote } from '@/lib/types';

function CheckoutContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [sorteio, setSorteio] = useState<Sorteio | null>(null);
  const [pacote, setPacote] = useState<Pacote | null>(null);
  const [numeros, setNumeros] = useState<number[]>([]);
  const [etapa, setEtapa] = useState<'dados' | 'pagamento' | 'confirmacao'>('dados');
  const [cpf, setCpf] = useState('');
  const [loading, setLoading] = useState(false);
  const [pixCopiado, setPixCopiado] = useState(false);
  const [tempoRestante, setTempoRestante] = useState(600); // 10 minutos

  // Código PIX mockado
  const pixCode = '00020126580014br.gov.bcb.pix0136a1b2c3d4-e5f6-7890-abcd-ef1234567890520400005303986540510.005802BR5925PIXRAPIDO SORTEIOS LTDA6009SAO PAULO62070503***63041D3D';

  useEffect(() => {
    // Verificar se usuário está logado
    const userCpf = localStorage.getItem('userCpf');
    if (userCpf) {
      setCpf(userCpf);
    }

    // Carregar dados do sorteio e pacote
    const sorteioId = searchParams.get('sorteio');
    const pacoteId = searchParams.get('pacote');

    if (sorteioId && pacoteId) {
      const sorteioEncontrado = sorteiosAtivos.find(s => s.id === sorteioId);
      const pacoteEncontrado = pacotesPadrao.find(p => p.id === pacoteId);

      if (sorteioEncontrado && pacoteEncontrado) {
        setSorteio(sorteioEncontrado);
        setPacote(pacoteEncontrado);
        
        // Gerar números aleatórios
        const numerosGerados = gerarNumerosAleatorios(
          pacoteEncontrado.quantidade,
          sorteioEncontrado.totalNumeros
        );
        setNumeros(numerosGerados);
      }
    }
  }, [searchParams]);

  // Contador regressivo
  useEffect(() => {
    if (etapa === 'pagamento') {
      const interval = setInterval(() => {
        setTempoRestante(prev => {
          if (prev <= 1) {
            clearInterval(interval);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [etapa]);

  const formatarTempo = (segundos: number) => {
    const minutos = Math.floor(segundos / 60);
    const segs = segundos % 60;
    return `${minutos.toString().padStart(2, '0')}:${segs.toString().padStart(2, '0')}`;
  };

  const handleContinuar = () => {
    if (!cpf) {
      router.push(`/login?redirect=/checkout?sorteio=${sorteio?.id}&pacote=${pacote?.id}`);
      return;
    }

    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setEtapa('pagamento');
    }, 1000);
  };

  const handleCopiarPix = () => {
    navigator.clipboard.writeText(pixCode);
    setPixCopiado(true);
    setTimeout(() => setPixCopiado(false), 3000);
  };

  const handleConfirmarPagamento = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setEtapa('confirmacao');
    }, 2000);
  };

  if (!sorteio || !pacote) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-4">
        <div className="text-center">
          <p className="text-gray-600 font-semibold mb-4">Carregando...</p>
          <Link href="/" className="text-emerald-600 font-bold hover:text-emerald-700">
            Voltar para início
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <Header />

      <div className="container mx-auto px-4 py-4 sm:py-6 md:py-8">
        <div className="max-w-4xl mx-auto">
          {/* Breadcrumb */}
          <div className="mb-4 sm:mb-6">
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-gray-600 hover:text-emerald-600 font-semibold transition-colors text-sm sm:text-base"
            >
              <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" />
              Voltar para sorteios
            </Link>
          </div>

          {/* Progress Steps */}
          <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg p-4 sm:p-6 mb-4 sm:mb-6">
            <div className="flex items-center justify-between">
              <div className={`flex items-center gap-1.5 sm:gap-2 ${etapa === 'dados' ? 'text-emerald-600' : 'text-gray-400'}`}>
                <div className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center font-bold text-sm sm:text-base ${
                  etapa === 'dados' ? 'bg-emerald-600 text-white' : 'bg-gray-200'
                }`}>
                  1
                </div>
                <span className="font-bold text-xs sm:text-sm md:text-base hidden sm:inline">Dados</span>
              </div>
              <div className="flex-1 h-1 bg-gray-200 mx-2 sm:mx-4">
                <div className={`h-full transition-all ${
                  etapa !== 'dados' ? 'bg-emerald-600 w-full' : 'w-0'
                }`}></div>
              </div>
              <div className={`flex items-center gap-1.5 sm:gap-2 ${etapa === 'pagamento' ? 'text-emerald-600' : 'text-gray-400'}`}>
                <div className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center font-bold text-sm sm:text-base ${
                  etapa === 'pagamento' ? 'bg-emerald-600 text-white' : 'bg-gray-200'
                }`}>
                  2
                </div>
                <span className="font-bold text-xs sm:text-sm md:text-base hidden sm:inline">Pagamento</span>
              </div>
              <div className="flex-1 h-1 bg-gray-200 mx-2 sm:mx-4">
                <div className={`h-full transition-all ${
                  etapa === 'confirmacao' ? 'bg-emerald-600 w-full' : 'w-0'
                }`}></div>
              </div>
              <div className={`flex items-center gap-1.5 sm:gap-2 ${etapa === 'confirmacao' ? 'text-emerald-600' : 'text-gray-400'}`}>
                <div className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center font-bold text-sm sm:text-base ${
                  etapa === 'confirmacao' ? 'bg-emerald-600 text-white' : 'bg-gray-200'
                }`}>
                  3
                </div>
                <span className="font-bold text-xs sm:text-sm md:text-base hidden sm:inline">Confirmação</span>
              </div>
            </div>
          </div>

          <div className="grid lg:grid-cols-3 gap-4 sm:gap-6">
            {/* Conteúdo Principal */}
            <div className="lg:col-span-2">
              {/* Etapa 1: Dados */}
              {etapa === 'dados' && (
                <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg p-4 sm:p-6 md:p-8">
                  <h2 className="text-xl sm:text-2xl font-black text-gray-900 mb-4 sm:mb-6">
                    Confirme seus Dados
                  </h2>

                  <div className="space-y-3 sm:space-y-4">
                    <div className="bg-emerald-50 rounded-lg sm:rounded-xl p-3 sm:p-4">
                      <div className="text-xs sm:text-sm font-bold text-emerald-600 mb-1 sm:mb-2">
                        ✓ Você está logado
                      </div>
                      <div className="text-sm sm:text-base text-gray-700 font-semibold">
                        CPF: {cpf ? cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4') : ''}
                      </div>
                    </div>

                    <div className="bg-yellow-50 rounded-lg sm:rounded-xl p-3 sm:p-4">
                      <div className="text-xs sm:text-sm font-bold text-yellow-600 mb-2">
                        📱 Seus Números da Sorte
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {numeros.map((numero) => (
                          <div
                            key={numero}
                            className="bg-white border-2 border-yellow-400 text-yellow-600 px-2.5 py-1.5 sm:px-3 sm:py-2 rounded-lg font-black text-sm sm:text-base"
                          >
                            {numero.toString().padStart(4, '0')}
                          </div>
                        ))}
                      </div>
                    </div>

                    <button
                      onClick={handleContinuar}
                      disabled={loading}
                      className="w-full bg-gradient-to-r from-emerald-500 to-emerald-600 text-white py-3 sm:py-4 rounded-lg sm:rounded-xl font-black text-base sm:text-lg hover:from-emerald-600 hover:to-emerald-700 transition-all shadow-lg hover:shadow-xl disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                      {loading ? (
                        <>
                          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          Processando...
                        </>
                      ) : (
                        <>
                          <Zap className="w-5 h-5 sm:w-6 sm:h-6" />
                          CONTINUAR PARA PAGAMENTO
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )}

              {/* Etapa 2: Pagamento */}
              {etapa === 'pagamento' && (
                <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg p-4 sm:p-6 md:p-8">
                  <div className="text-center mb-4 sm:mb-6">
                    <div className="inline-flex items-center gap-2 bg-red-100 text-red-600 px-3 py-1.5 sm:px-4 sm:py-2 rounded-full font-bold text-xs sm:text-sm mb-3 sm:mb-4">
                      <Clock className="w-4 h-4 sm:w-5 sm:h-5" />
                      Expira em: {formatarTempo(tempoRestante)}
                    </div>
                    <h2 className="text-xl sm:text-2xl font-black text-gray-900 mb-2">
                      Pague com PIX
                    </h2>
                    <p className="text-sm sm:text-base text-gray-600">
                      Escaneie o QR Code ou copie o código
                    </p>
                  </div>

                  {/* QR Code Mockado */}
                  <div className="bg-gradient-to-br from-emerald-50 to-yellow-50 rounded-xl sm:rounded-2xl p-4 sm:p-6 md:p-8 mb-4 sm:mb-6">
                    <div className="bg-white p-4 sm:p-6 rounded-lg sm:rounded-xl shadow-lg max-w-xs mx-auto">
                      <div className="aspect-square bg-gray-100 rounded-lg flex items-center justify-center mb-3 sm:mb-4">
                        <QrCode className="w-24 h-24 sm:w-32 sm:h-32 text-gray-400" />
                      </div>
                      <p className="text-center text-xs sm:text-sm text-gray-600 font-semibold">
                        Escaneie com o app do seu banco
                      </p>
                    </div>
                  </div>

                  {/* Código PIX */}
                  <div className="mb-4 sm:mb-6">
                    <label className="block text-xs sm:text-sm font-bold text-gray-700 mb-2">
                      Ou copie o código PIX:
                    </label>
                    <div className="flex flex-col sm:flex-row gap-2">
                      <input
                        type="text"
                        value={pixCode}
                        readOnly
                        className="flex-1 px-3 py-2 sm:px-4 sm:py-3 rounded-lg sm:rounded-xl border-2 border-gray-200 bg-gray-50 text-xs sm:text-sm font-mono"
                      />
                      <button
                        onClick={handleCopiarPix}
                        className="bg-emerald-600 text-white px-4 py-2 sm:px-6 sm:py-3 rounded-lg sm:rounded-xl font-bold hover:bg-emerald-700 transition-colors flex items-center justify-center gap-2 text-sm sm:text-base"
                      >
                        {pixCopiado ? (
                          <>
                            <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5" />
                            Copiado!
                          </>
                        ) : (
                          <>
                            <Copy className="w-4 h-4 sm:w-5 sm:h-5" />
                            Copiar
                          </>
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Botão Confirmar */}
                  <button
                    onClick={handleConfirmarPagamento}
                    disabled={loading}
                    className="w-full bg-gradient-to-r from-emerald-500 to-emerald-600 text-white py-3 sm:py-4 rounded-lg sm:rounded-xl font-black text-base sm:text-lg hover:from-emerald-600 hover:to-emerald-700 transition-all shadow-lg hover:shadow-xl disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {loading ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        Verificando pagamento...
                      </>
                    ) : (
                      <>
                        <CheckCircle className="w-5 h-5 sm:w-6 sm:h-6" />
                        JÁ PAGUEI
                      </>
                    )}
                  </button>

                  <p className="text-center text-xs sm:text-sm text-gray-500 mt-3 sm:mt-4">
                    Após o pagamento, clique em "Já Paguei"
                  </p>
                </div>
              )}

              {/* Etapa 3: Confirmação */}
              {etapa === 'confirmacao' && (
                <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg p-4 sm:p-6 md:p-8 text-center">
                  <div className="w-16 h-16 sm:w-20 sm:h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6">
                    <CheckCircle className="w-10 h-10 sm:w-12 sm:h-12 text-emerald-600" />
                  </div>

                  <h2 className="text-2xl sm:text-3xl font-black text-gray-900 mb-3 sm:mb-4">
                    Pagamento Confirmado!
                  </h2>

                  <p className="text-base sm:text-lg text-gray-600 mb-4 sm:mb-6">
                    Seus números foram reservados com sucesso!
                  </p>

                  <div className="bg-gradient-to-r from-emerald-50 to-yellow-50 rounded-lg sm:rounded-xl p-4 sm:p-6 mb-4 sm:mb-6">
                    <div className="text-xs sm:text-sm font-bold text-gray-700 mb-2 sm:mb-3">
                      Seus Números da Sorte:
                    </div>
                    <div className="flex flex-wrap justify-center gap-2">
                      {numeros.map((numero) => (
                        <div
                          key={numero}
                          className="bg-white border-2 border-emerald-500 text-emerald-600 px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg font-black text-base sm:text-lg shadow-sm"
                        >
                          {numero.toString().padStart(4, '0')}
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2 sm:space-y-3">
                    <Link
                      href="/minha-conta"
                      className="block w-full bg-gradient-to-r from-emerald-500 to-emerald-600 text-white py-3 sm:py-4 rounded-lg sm:rounded-xl font-black text-base sm:text-lg hover:from-emerald-600 hover:to-emerald-700 transition-all shadow-lg"
                    >
                      VER MEUS PEDIDOS
                    </Link>
                    <Link
                      href="/"
                      className="block w-full bg-gray-100 text-gray-700 py-3 sm:py-4 rounded-lg sm:rounded-xl font-bold hover:bg-gray-200 transition-colors text-sm sm:text-base"
                    >
                      Voltar para Início
                    </Link>
                  </div>
                </div>
              )}
            </div>

            {/* Resumo do Pedido */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg p-4 sm:p-6 lg:sticky lg:top-24">
                <h3 className="text-lg sm:text-xl font-black text-gray-900 mb-3 sm:mb-4">
                  Resumo do Pedido
                </h3>

                {/* Imagem do Sorteio */}
                <div className="relative h-28 sm:h-32 rounded-lg sm:rounded-xl overflow-hidden mb-3 sm:mb-4">
                  <Image
                    src={sorteio.imagemUrl}
                    alt={sorteio.titulo}
                    fill
                    className="object-cover"
                  />
                </div>

                <h4 className="font-bold text-sm sm:text-base text-gray-900 mb-3 sm:mb-4">
                  {sorteio.titulo}
                </h4>

                <div className="space-y-2 sm:space-y-3 mb-3 sm:mb-4 pb-3 sm:pb-4 border-b border-gray-200">
                  <div className="flex justify-between text-xs sm:text-sm">
                    <span className="text-gray-600 font-semibold">Quantidade:</span>
                    <span className="font-bold text-gray-900">
                      {pacote.quantidade} {pacote.quantidade === 1 ? 'número' : 'números'}
                    </span>
                  </div>
                  <div className="flex justify-between text-xs sm:text-sm">
                    <span className="text-gray-600 font-semibold">Preço unitário:</span>
                    <span className="font-bold text-gray-900">
                      {formatarMoeda(sorteio.precoPorNumero)}
                    </span>
                  </div>
                  {pacote.desconto && (
                    <div className="flex justify-between text-xs sm:text-sm">
                      <span className="text-gray-600 font-semibold">Desconto:</span>
                      <span className="font-bold text-emerald-600">
                        -{pacote.desconto}%
                      </span>
                    </div>
                  )}
                </div>

                <div className="flex justify-between items-center mb-4 sm:mb-6">
                  <span className="text-base sm:text-lg font-bold text-gray-900">Total:</span>
                  <span className="text-2xl sm:text-3xl font-black text-emerald-600">
                    {formatarMoeda(pacote.preco)}
                  </span>
                </div>

                {/* Garantias */}
                <div className="space-y-2 text-xs sm:text-sm">
                  <div className="flex items-center gap-2 text-gray-600">
                    <Shield className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                    <span className="font-semibold">Pagamento 100% seguro</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-600">
                    <CheckCircle className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                    <span className="font-semibold">Números garantidos</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-600">
                    <Zap className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                    <span className="font-semibold">Confirmação instantânea</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="w-12 h-12 sm:w-16 sm:h-16 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 font-semibold text-sm sm:text-base">Carregando checkout...</p>
        </div>
      </div>
    }>
      <CheckoutContent />
    </Suspense>
  );
}
