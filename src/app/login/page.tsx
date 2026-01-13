'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Ticket, ArrowLeft, CheckCircle, Shield } from 'lucide-react';
import { formatarCPF } from '@/lib/mock-data';

export default function LoginPage() {
  const router = useRouter();
  const [cpf, setCpf] = useState('');
  const [nome, setNome] = useState('');
  const [telefone, setTelefone] = useState('');
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);

  const handleCpfChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const valor = e.target.value.replace(/\D/g, '');
    if (valor.length <= 11) {
      setCpf(valor);
    }
  };

  const handleTelefoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const valor = e.target.value.replace(/\D/g, '');
    if (valor.length <= 11) {
      setTelefone(valor);
    }
  };

  const formatarTelefone = (tel: string) => {
    if (tel.length <= 10) {
      return tel.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
    }
    return tel.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // Simular autenticação
    setTimeout(() => {
      // Salvar CPF no localStorage (simulação)
      localStorage.setItem('userCpf', cpf);
      if (!isLogin) {
        localStorage.setItem('userName', nome);
        localStorage.setItem('userPhone', telefone);
      }
      
      setLoading(false);
      
      // Redirecionar para checkout ou conta
      const urlParams = new URLSearchParams(window.location.search);
      const redirect = urlParams.get('redirect');
      
      if (redirect) {
        router.push(redirect);
      } else {
        router.push('/minha-conta');
      }
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-600 via-emerald-500 to-yellow-500 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <Link href="/" className="flex items-center justify-center gap-2 mb-6 sm:mb-8 group">
          <div className="bg-yellow-400 p-2.5 sm:p-3 rounded-lg sm:rounded-xl shadow-2xl group-hover:scale-110 transition-transform">
            <Ticket className="w-8 h-8 sm:w-10 sm:h-10 text-emerald-600" />
          </div>
          <div className="flex flex-col">
            <span className="text-white font-black text-2xl sm:text-3xl leading-none">
              PIX<span className="text-yellow-400">RÁPIDO</span>
            </span>
            <span className="text-emerald-100 text-xs sm:text-sm font-medium">
              Sorteios Instantâneos
            </span>
          </div>
        </Link>

        {/* Card de Login/Cadastro */}
        <div className="bg-white rounded-xl sm:rounded-2xl shadow-2xl p-5 sm:p-6 md:p-8">
          {/* Voltar */}
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-gray-600 hover:text-emerald-600 font-semibold mb-4 sm:mb-6 transition-colors text-sm sm:text-base"
          >
            <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" />
            Voltar
          </Link>

          {/* Título */}
          <div className="text-center mb-6 sm:mb-8">
            <h1 className="text-2xl sm:text-3xl font-black text-gray-900 mb-2">
              {isLogin ? 'Entrar' : 'Criar Conta'}
            </h1>
            <p className="text-sm sm:text-base text-gray-600">
              {isLogin
                ? 'Acesse sua conta com seu CPF'
                : 'Cadastre-se em segundos!'}
            </p>
          </div>

          {/* Formulário */}
          <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
            {/* CPF */}
            <div>
              <label className="block text-xs sm:text-sm font-bold text-gray-700 mb-2">
                CPF
              </label>
              <input
                type="text"
                value={cpf ? formatarCPF(cpf) : ''}
                onChange={handleCpfChange}
                placeholder="000.000.000-00"
                required
                className="w-full px-3 py-2.5 sm:px-4 sm:py-3 rounded-lg sm:rounded-xl border-2 border-gray-200 focus:border-emerald-500 focus:outline-none text-base sm:text-lg font-semibold"
              />
            </div>

            {/* Campos adicionais para cadastro */}
            {!isLogin && (
              <>
                <div>
                  <label className="block text-xs sm:text-sm font-bold text-gray-700 mb-2">
                    Nome Completo
                  </label>
                  <input
                    type="text"
                    value={nome}
                    onChange={(e) => setNome(e.target.value)}
                    placeholder="Seu nome completo"
                    required
                    className="w-full px-3 py-2.5 sm:px-4 sm:py-3 rounded-lg sm:rounded-xl border-2 border-gray-200 focus:border-emerald-500 focus:outline-none text-base sm:text-lg"
                  />
                </div>

                <div>
                  <label className="block text-xs sm:text-sm font-bold text-gray-700 mb-2">
                    Telefone/WhatsApp
                  </label>
                  <input
                    type="text"
                    value={telefone ? formatarTelefone(telefone) : ''}
                    onChange={handleTelefoneChange}
                    placeholder="(00) 00000-0000"
                    required
                    className="w-full px-3 py-2.5 sm:px-4 sm:py-3 rounded-lg sm:rounded-xl border-2 border-gray-200 focus:border-emerald-500 focus:outline-none text-base sm:text-lg font-semibold"
                  />
                </div>
              </>
            )}

            {/* Botão Submit */}
            <button
              type="submit"
              disabled={loading || cpf.length !== 11 || (!isLogin && (!nome || telefone.length < 10))}
              className="w-full bg-gradient-to-r from-emerald-500 to-emerald-600 text-white py-3 sm:py-4 rounded-lg sm:rounded-xl font-black text-base sm:text-lg hover:from-emerald-600 hover:to-emerald-700 transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Processando...
                </>
              ) : (
                <>
                  <CheckCircle className="w-5 h-5 sm:w-6 sm:h-6" />
                  {isLogin ? 'ENTRAR' : 'CRIAR CONTA'}
                </>
              )}
            </button>
          </form>

          {/* Toggle Login/Cadastro */}
          <div className="mt-5 sm:mt-6 text-center">
            <button
              onClick={() => setIsLogin(!isLogin)}
              className="text-emerald-600 font-bold hover:text-emerald-700 transition-colors text-sm sm:text-base"
            >
              {isLogin
                ? 'Não tem conta? Cadastre-se aqui'
                : 'Já tem conta? Faça login'}
            </button>
          </div>

          {/* Garantias */}
          <div className="mt-6 sm:mt-8 pt-5 sm:pt-6 border-t border-gray-200">
            <div className="flex items-center justify-center gap-2 text-xs sm:text-sm text-gray-600">
              <Shield className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-600" />
              <span className="font-semibold">
                Seus dados estão 100% seguros
              </span>
            </div>
          </div>
        </div>

        {/* Info adicional */}
        <div className="mt-4 sm:mt-6 text-center">
          <p className="text-white text-xs sm:text-sm font-semibold">
            Cadastro rápido e sem burocracia!
          </p>
        </div>
      </div>
    </div>
  );
}
