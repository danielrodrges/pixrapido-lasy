'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { 
  ArrowLeft, 
  CheckCircle,
  Shield,
  Zap,
  Copy
} from 'lucide-react';
import Header from '@/components/custom/Header';
import { gerarNumerosAleatorios } from '@/lib/mock-data';
import { formatarMoeda } from '@/lib/mock-data';
import { Sorteio, Pacote } from '@/lib/types';

function CheckoutContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [sorteio, setSorteio] = useState<Sorteio | null>(null);
  const [pacote, setPacote] = useState<Pacote | null>(null);
  const [numeros, setNumeros] = useState<number[]>([]);
  const [cpf, setCpf] = useState('');
  const [loading, setLoading] = useState(false);
  const [carregandoSorteio, setCarregandoSorteio] = useState(true);
  const [pixData, setPixData] = useState<{
    pixCode: string;
    pixQrCodeUrl: string;
    pedidoId: string;
  } | null>(null);
  const [pixCopiado, setPixCopiado] = useState(false);

  useEffect(() => {
    // Verificar se usuário está logado
    const userCpf = localStorage.getItem('userCpf');
    if (userCpf) {
      setCpf(userCpf);
    }

    // Carregar dados do sorteio da API
    const sorteioId = searchParams.get('sorteio');
    const pacoteId = searchParams.get('pacote');

    if (sorteioId && pacoteId) {
      async function carregarDados() {
        try {
          // Buscar sorteios e pacotes da API
          const response = await fetch('/api/sorteios');
          const data = await response.json();
          
          const sorteioEncontrado = data.sorteios?.find((s: Sorteio) => s.id === sorteioId);
          const pacoteEncontrado = data.pacotes?.find((p: Pacote) => p.id === pacoteId);

          if (sorteioEncontrado && pacoteEncontrado) {
            setSorteio(sorteioEncontrado);
            setPacote(pacoteEncontrado);
            
            // Gerar números aleatórios
            const numerosGerados = gerarNumerosAleatorios(
              pacoteEncontrado.quantidade,
              sorteioEncontrado.totalNumeros
            );
            setNumeros(numerosGerados);
          } else {
            console.error('Sorteio ou pacote não encontrado');
            router.push('/');
          }
        } catch (error) {
          console.error('Erro ao carregar sorteio:', error);
          router.push('/');
        } finally {
          setCarregandoSorteio(false);
        }
      }
      
      carregarDados();
    } else {
      router.push('/');
    }
  }, [searchParams, router]);

  const handleFinalizarCompra = async () => {
    if (!cpf || !sorteio || !pacote) {
      alert('Dados incompletos. Por favor, tente novamente.');
      return;
    }

    const userName = localStorage.getItem('userName') || 'Comprador';
    const userPhone = localStorage.getItem('userPhone') || '';

    setLoading(true);

    try {
      // Chamar API para gerar PIX
      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sorteioId: sorteio.id,
          sorteioTitulo: sorteio.titulo,
          quantidade: pacote.quantidade,
          valorTotal: pacote.preco,
          cpf,
          nome: userName,
          numeros,
          email: `${cpf}@pixrapido.com.br`,
          telefone: userPhone,
        }),
      });

      const data = await response.json();

      if (data.success && data.pixCode) {
        // Mostrar QR Code PIX
        setPixData({
          pixCode: data.pixCode,
          pixQrCodeUrl: data.pixQrCodeUrl,
          pedidoId: data.pedidoId,
        });
      } else {
        throw new Error(data.error || 'Erro ao gerar PIX');
      }
    } catch (error: any) {
      console.error('Erro ao processar pagamento:', error);
      alert('Erro ao processar pagamento. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const copiarCodigoPix = () => {
    if (pixData?.pixCode) {
      navigator.clipboard.writeText(pixData.pixCode);
      setPixCopiado(true);
      setTimeout(() => setPixCopiado(false), 3000);
    }
  };

  const handleContinuar = () => {
    if (!cpf) {
      router.push(`/login?redirect=/checkout?sorteio=${sorteio?.id}&pacote=${pacote?.id}`);
      return;
    }

    // Gerar PIX
    handleFinalizarCompra();
  };

  // Se já tiver PIX gerado, mostrar tela de pagamento
  if (pixData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
        <Header />

        <div className="container mx-auto px-4 py-4 sm:py-6 md:py-8">
          <div className="max-w-2xl mx-auto">
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

            {/* Card PIX */}
            <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg p-6 sm:p-8">
              <div className="text-center mb-6">
                <h2 className="text-2xl sm:text-3xl font-black text-gray-900 mb-2">
                  🎉 Pedido Criado!
                </h2>
                <p className="text-gray-600">
                  Escaneie o QR Code ou copie o código PIX para pagar
                </p>
              </div>

              {/* QR Code */}
              <div className="flex justify-center mb-6">
                <div className="bg-white p-4 rounded-xl border-4 border-emerald-500">
                  <img 
                    src={pixData.pixQrCodeUrl} 
                    alt="QR Code PIX" 
                    className="w-64 h-64"
                  />
                </div>
              </div>

              {/* Código PIX */}
              <div className="mb-6">
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Código PIX Copia e Cola:
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={pixData.pixCode}
                    readOnly
                    className="flex-1 px-4 py-3 border-2 border-gray-300 rounded-lg font-mono text-sm bg-gray-50"
                  />
                  <button
                    onClick={copiarCodigoPix}
                    className={`px-6 py-3 rounded-lg font-bold transition-all ${
                      pixCopiado
                        ? 'bg-emerald-500 text-white'
                        : 'bg-emerald-600 text-white hover:bg-emerald-700'
                    }`}
                  >
                    {pixCopiado ? '✓ Copiado!' : 'Copiar'}
                  </button>
                </div>
              </div>

              {/* Valor */}
              <div className="bg-emerald-50 rounded-lg p-4 mb-6 text-center">
                <p className="text-sm text-emerald-700 font-semibold mb-1">Valor a pagar:</p>
                <p className="text-3xl font-black text-emerald-600">
                  {formatarMoeda(pacote?.preco || 0)}
                </p>
              </div>

              {/* Instruções */}
              <div className="bg-blue-50 rounded-lg p-4 mb-6">
                <h3 className="font-bold text-blue-900 mb-2">📱 Como pagar:</h3>
                <ol className="text-sm text-blue-800 space-y-1">
                  <li>1. Abra o app do seu banco</li>
                  <li>2. Escolha pagar com PIX</li>
                  <li>3. Escaneie o QR Code ou cole o código</li>
                  <li>4. Confirme o pagamento</li>
                  <li>5. Seus números serão liberados automaticamente!</li>
                </ol>
              </div>

              {/* Números */}
              <div className="bg-yellow-50 rounded-lg p-4">
                <p className="text-sm font-bold text-yellow-700 mb-2">
                  🎲 Seus números reservados:
                </p>
                <div className="flex flex-wrap gap-2">
                  {numeros.map((numero) => (
                    <div
                      key={numero}
                      className="bg-white border-2 border-yellow-400 text-yellow-600 px-3 py-1.5 rounded-lg font-black text-sm"
                    >
                      {numero.toString().padStart(4, '0')}
                    </div>
                  ))}
                </div>
              </div>

              {/* Aviso */}
              <p className="text-xs text-gray-500 text-center mt-6">
                Pedido: {pixData.pedidoId}
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (carregandoSorteio || !sorteio || !pacote) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mb-4"></div>
          <p className="text-gray-600 font-semibold mb-4">Carregando sorteio...</p>
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

          {/* Progress - Simplificado */}
          <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg p-4 sm:p-6 mb-4 sm:mb-6">
            <div className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-emerald-600" />
              <h2 className="text-lg sm:text-xl font-black text-gray-900">
                Finalizar Compra - Pagamento Seguro via Stripe
              </h2>
            </div>
            <p className="text-sm text-gray-600 mt-2">
              Você será redirecionado para o checkout seguro do Stripe. Pague com PIX ou Cartão.
            </p>
          </div>

          <div className="grid lg:grid-cols-3 gap-4 sm:gap-6">
            {/* Conteúdo Principal */}
            <div className="lg:col-span-2">
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

                  <div className="bg-yellow-50 rounded-lg sm:rounded-xl p-3 sm:p-4">\n                    <div className="text-xs sm:text-sm font-bold text-yellow-600 mb-2">
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
                          Redirecionando para pagamento...
                        </>
                      ) : (
                        <>
                          <Zap className="w-5 h-5 sm:w-6 sm:h-6" />
                          FINALIZAR COMPRA
                        </>
                      )}
                    </button>

                    <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                      <p className="text-sm text-blue-800 text-center">
                        <Shield className="w-4 h-4 inline mr-2" />
                        Pagamento 100% seguro via Stripe. Aceita PIX e Cartão.
                      </p>
                    </div>
                  </div>
                </div>
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
