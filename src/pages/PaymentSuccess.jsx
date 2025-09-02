import React from 'react';
import { Helmet } from 'react-helmet';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CheckCircle, Award, Info, ArrowRight } from 'lucide-react';
import Header from '@/components/shared/Header';
import { Button } from '@/components/ui/button';
import { useAppContext } from '@/context/AppContext';

const PaymentSuccess = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const order = location.state?.order;
  const { _utils } = useAppContext();
  const { normTicket, ticketEq } = _utils;

  React.useEffect(() => {
    if (!order) navigate('/');
  }, [order, navigate]);

  if (!order) return null;

  const numbers = Array.isArray(order.purchasedNumbers) ? order.purchasedNumbers.map(normTicket) : [];
  const reservationId = order.reservationId || order.purchaseId || order.id;

  // Normalização (compat + múltiplos)
  const winningTickets = Array.isArray(order.winningTickets) && order.winningTickets.length
    ? order.winningTickets.map(normTicket)
    : (order.winningTicket ? [normTicket(order.winningTicket)] : []);

  const instantPrizes = Array.isArray(order.instantPrizes) && order.instantPrizes.length
    ? order.instantPrizes.map(ip => ({ ...ip, ticket: normTicket(ip.ticket) }))
    : (order.instantPrizeName && order.winningTicket
        ? [{ ticket: normTicket(order.winningTicket), prizeName: order.instantPrizeName }]
        : []);

  const won = winningTickets.some((t) => numbers.some((n) => ticketEq(n, t)));
  const firstPrizeName = instantPrizes[0]?.prizeName || order.instantPrizeName || 'Prêmio Instantâneo';

  // helper p/ saber se um número foi vencedor
  const isWinningNumber = (num) => winningTickets.some((t) => ticketEq(t, num));

  return (
    <>
      <Helmet>
        <title>Pagamento Confirmado - Portinho</title>
        <meta name="description" content="Seu pagamento foi confirmado com sucesso!" />
      </Helmet>

      <div className="min-h-screen bg-gray-900 flex flex-col items-center">
        <Header />
        <main className="w-full max-w-2xl px-4 py-16 flex-grow flex items-center justify-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, type: 'spring' }}
            className="bg-gray-800 rounded-lg shadow-2xl p-8 text-center w-full"
          >
            <div className="flex justify-center mb-6">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, duration: 0.4, type: 'spring', stiffness: 150 }}
              >
                <CheckCircle className="h-24 w-24 text-green-500" />
              </motion.div>
            </div>

            <h1 className="text-3xl font-bold text-gray-100 mb-2">Pagamento Confirmado!</h1>
            <p className="text-gray-400 mb-6">Sua compra foi realizada com sucesso.</p>

            {/* Resultado do(s) prêmio(s) instantâneo(s) */}
            {won ? (
              <div className="bg-green-700/70 border border-green-600 rounded-md p-4 mb-6 text-left flex items-start gap-3">
                <Award className="h-6 w-6 text-green-300 mt-0.5" />
                <div>
                  {winningTickets.length <= 1 ? (
                    <>
                      <p className="text-green-100 font-semibold">
                        🎉 Parabéns! Você foi contemplado no {firstPrizeName}.
                      </p>
                      <p className="text-green-100/90 mt-1">
                        Número vencedor:{' '}
                        <span className="font-mono font-bold">{winningTickets[0]}</span>
                      </p>
                    </>
                  ) : (
                    <>
                      <p className="text-green-100 font-semibold">
                        🎉 Parabéns! Você foi contemplado em {winningTickets.length} bilhetes:
                      </p>
                      <ul className="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {winningTickets.map((t) => {
                          const prize = instantPrizes.find((ip) => ticketEq(ip.ticket, t))?.prizeName || firstPrizeName;
                          return (
                            <li key={t} className="text-green-100/90">
                              <span className="font-mono font-bold">{t}</span>
                              {prize ? <span className="opacity-90"> — {prize}</span> : null}
                            </li>
                          );
                        })}
                      </ul>
                    </>
                  )}
                </div>
              </div>
            ) : (
              <div className="bg-blue-700/50 border border-blue-600 rounded-md p-4 mb-6 text-left flex items-start gap-3">
                <Info className="h-6 w-6 text-blue-200 mt-0.5" />
                <div className="text-blue-100">Nenhum prêmio nesta compra</div>
              </div>
            )}

            <div className="bg-gray-700 rounded-lg p-6 text-left space-y-4 mb-8">
              <h2 className="text-lg font-semibold text-gray-200 border-b border-gray-600 pb-2">
                Resumo da Compra
              </h2>
              <div className="flex justify-between">
                <span className="text-gray-400">Produto:</span>
                <span className="font-bold text-gray-100">{order.productName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">ID da Reserva:</span>
                <span className="font-mono text-sm text-gray-300">{reservationId}</span>
              </div>
              <div>
                <span className="text-gray-400">Números Adquiridos:</span>
                <div className="flex flex-wrap gap-2 mt-2">
                  {numbers.map((num) => (
                    <span
                      key={num}
                      className={
                        'px-3 py-1 rounded-md font-mono text-sm shadow-md ' +
                        (won && isWinningNumber(num) ? 'bg-green-600 text-white' : 'bg-cyan-700 text-cyan-100')
                      }
                    >
                      {num}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild className="bg-cyan-600 hover:bg-cyan-500 text-white font-bold w-full sm:w-auto">
                <Link to="/meus-numeros">
                  Ver Meus Números
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button asChild variant="outline" className="border-gray-600 text-gray-300 hover:bg-gray-700 hover:text-white w-full sm:w-auto">
                <Link to="/">Voltar para o Início</Link>
              </Button>
            </div>
          </motion.div>
        </main>
      </div>
    </>
  );
};

export default PaymentSuccess;
