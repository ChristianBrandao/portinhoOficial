// src/pages/PrizeDetail.jsx
import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import { Facebook, Send, Twitter, Trophy, MessageSquare, ShoppingCart, Minus, Plus } from 'lucide-react';
import Header from '@/components/shared/Header';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import CheckoutDialog from '@/components/shared/CheckoutDialog';
import { useAppContext } from '@/context/AppContext';
import WinnerAnnouncementDialog from '@/components/shared/WinnerAnnouncementDialog';

const MIN_QTY = 4;
const MAX_QTY = 1000;
const clamp = (v, min = MIN_QTY, max = MAX_QTY) => Math.min(max, Math.max(min, v ?? min));

const PrizeDetail = () => {
  const { toast } = useToast();
  const { id } = useParams();
  const { prize, findWinnerByTicket, _utils } = useAppContext();

  const { isAwarded, normTicket, ticketEq } = _utils;

  const twoNames = (s) => {
    const parts = String(s || '').trim().split(/\s+/);
    return parts.slice(0, 2).join(' ');
  };

  // Chip de preço — SEM AZUL (neutro)
  const PricePill = ({ amount: amountProp, prizeName }) => {
    const parseAmount = (input) => {
      const raw = String(input ?? '').trim();
      if (!raw) return null;
      if (/^\d+$/.test(raw)) return Number(raw);
      const only = raw.replace(/[^\d.,]/g, '');
      if (only.includes('.') && only.includes(',')) return Number(only.replace(/\./g, '').replace(',', '.'));
      if (only.includes(',') && !only.includes('.')) return Number(only.replace(/\./g, '').replace(',', '.'));
      if (only.includes('.') && !only.includes(',')) {
        const lastDot = only.lastIndexOf('.');
        const decimals = only.length - lastDot - 1;
        return decimals === 3 ? Number(only.replace(/\./g, '')) : Number(only);
      }
      return Number(only);
    };

    const amount = typeof amountProp === 'number' ? amountProp : parseAmount(prizeName);

    return (
      <div className="flex justify-center">
        <div
          className="
            inline-flex items-center gap-2 h-10 px-3 rounded-full
            text-white bg-gray-700 ring-1 ring-white/10 shadow-none
          "
        >
          <span className="text-xs opacity-95">R$</span>
          <span className="text-xl font-black tracking-wide">
            {amount != null
              ? amount.toLocaleString('pt-BR', { minimumFractionDigits: 0, maximumFractionDigits: 2 })
              : String(prizeName ?? '—')}
          </span>
        </div>
      </div>
    );
  };

  const raffleId = prize?.id || id;

  const [quantity, setQuantity] = useState(MIN_QTY);
  const [selectedPrice, setSelectedPrice] = useState(0);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [instantWinner, setInstantWinner] = useState(null);
  const [awardedLocal, setAwardedLocal] = useState([]);

  React.useEffect(() => {
    if (prize) {
      const q = MIN_QTY;
      setQuantity(q);
      setSelectedPrice(q * prize.pricePerTicket);
    }
  }, [prize]);

  const ticketFromWinner = (w) => normTicket(w.ticketNumber ?? w.ticket ?? w.id ?? '');

  const handleFeatureClick = () => {
    toast({ title: '🚧 Em breve 🚀' });
  };

  const handleSelectTitles = (titles) => {
    const q = clamp(titles);
    setQuantity(q);
    setSelectedPrice(q * (prize?.pricePerTicket ?? 0));
    toast({
      title: 'Seleção atualizada!',
      description: `Você selecionou ${q} títulos por R$ ${(q * (prize?.pricePerTicket ?? 0)).toFixed(2).replace('.', ',')}.`,
    });
  };

  const startCheckout = () => setIsCheckoutOpen(true);

  const socialButtons = [
    { icon: <Facebook size={20} />, color: 'bg-blue-600' },
    { icon: <Send size={20} />, color: 'bg-blue-400' },
    { icon: <Twitter size={20} />, color: 'bg-sky-500' },
    { icon: <MessageSquare size={20} />, color: 'bg-green-500' },
  ];

  if (!prize) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center text-white">
        Carregando rempdasorte...
      </div>
    );
  }

  const titleOptions = prize.titleOptions || [];
  const winners = prize.winners || [];

  const totalPrizes = winners.length;
  const availablePrizes = winners.filter(
    (w) => !isAwarded(w.awarded ?? w.isAwarded ?? w.awardedAt ?? w.winnerId),
  ).length;

  return (
    <>
      <Helmet>
        <title>Detalhes do Prêmio - {prize.name}</title>
        <meta name="description" content={`Participe do sorteio ${prize.name} por apenas R$ ${prize.pricePerTicket.toFixed(2)}.`} />
        <meta property="og:title" content={`Detalhes do Prêmio - ${prize.name}`} />
        <meta property="og:description" content={`Participe do sorteio ${prize.name} por apenas R$ ${prize.pricePerTicket.toFixed(2)}.`} />
      </Helmet>

      <div className="min-h-screen bg-gray-900 flex flex-col items-center">
        <Header />
        <main className="w-full max-w-2xl px-4 py-8">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            {/* CARD DO PRÊMIO */}
            <div className="bg-gray-800 rounded-lg shadow-md overflow-hidden mb-8">
              <img alt={prize.imageAlt} className="w-full h-auto object-cover" src={prize.imageURL} />
              <div className="p-4 space-y-1">
                <h2 className="text-xl font-bold text-gray-100">{prize.name}</h2>
                <p className="text-gray-400 text-base">{prize.description}</p>
              </div>
            </div>

            {/* PREÇO */}
            <div className="flex justify-center items-center gap-2 mb-6">
              <p className="text-gray-400 font-medium">POR APENAS</p>
              <span className="bg-black text-white font-bold text-lg px-4 py-1 rounded">
                R$ {prize.pricePerTicket.toFixed(2).replace('.', ',')}
              </span>
            </div>

            {/* OPÇÕES DE TÍTULOS */}
            <div className="bg-gray-800 rounded-lg shadow-md overflow-hidden mb-6">
              <div className="p-4 border-b border-gray-700 flex items-center space-x-2">
                <ShoppingCart className="h-6 w-6 text-gray-400" />
                <h2 className="text-lg font-bold text-gray-100">Meus títulos</h2>
              </div>
              <div className="p-4 border-b border-gray-700 flex items-center space-x-2">
                <Trophy className="h-6 w-6 text-yellow-500" />
                <h2 className="text-lg font-bold text-gray-100">Prêmios</h2>
              </div>
              <div className="p-4 text-center text-gray-400">
                <p>Quanto mais títulos, mais chances de ganhar!</p>
              </div>

              <div className="grid grid-cols-3 gap-4 p-4">
                {titleOptions.map((option, index) => (
                  <motion.div
                    key={index}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className={`relative flex flex-col items-center justify-center p-4 rounded-lg cursor-pointer transition-all duration-200 ${
                      quantity === option.titles
                        ? 'bg-cyan-600 text-white shadow-lg ring-2 ring-cyan-400'
                        : 'bg-black text-white border border-gray-700'
                    }`}
                    onClick={() => handleSelectTitles(option.titles, option.price)}
                  >
                    {option.popular && (
                      <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 bg-cyan-400 text-black text-xs font-bold px-2 py-0.5 rounded-full">
                        Mais popular
                      </span>
                    )}
                    <span className="text-2xl font-extrabold">+{option.titles}</span>
                    <span className="text-sm">R$ {option.price.toFixed(2).replace('.', ',')}</span>
                    <span className="text-xs mt-2 uppercase">Selecionar</span>
                  </motion.div>
                ))}
              </div>

              <div className="p-4 flex items-center justify-between bg-gray-700">
                <div className="flex items-center space-x-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="bg-gray-600 text-white hover:bg-gray-500"
                    onClick={() => {
                      const newQty = clamp(quantity - 1);
                      setQuantity(newQty);
                      setSelectedPrice(newQty * prize.pricePerTicket);
                    }}
                  >
                    <Minus />
                  </Button>
                  <input
                    type="number"
                    value={quantity}
                    min={MIN_QTY}
                    max={MAX_QTY}
                    onChange={(e) => {
                      const parsed = parseInt(e.target.value, 10);
                      const newQty = clamp(Number.isFinite(parsed) ? parsed : MIN_QTY);
                      setQuantity(newQty);
                      setSelectedPrice(newQty * prize.pricePerTicket);
                    }}
                    className="w-20 text-center bg-gray-900 text-white rounded-md py-2"
                  />
                  <Button
                    variant="ghost"
                    size="icon"
                    className="bg-gray-600 text-white hover:bg-gray-500"
                    onClick={() => {
                      const newQty = clamp(quantity + 1);
                      setQuantity(newQty);
                      setSelectedPrice(newQty * prize.pricePerTicket);
                    }}
                  >
                    <Plus />
                  </Button>
                </div>
                <Button
                  className="bg-cyan-500 text-black font-bold 
                             flex items-center justify-center gap-2 
                             text-sm sm:text-base md:text-lg 
                             px-4 sm:px-6 py-2 sm:py-3 
                             rounded-lg hover:bg-cyan-400 w-full sm:w-auto"
                  onClick={startCheckout}
                >
                  <span>Participar</span>
                  <span className="font-extrabold">R$ {selectedPrice.toFixed(2).replace('.', ',')}</span>
                </Button>
              </div>
            </div>
          </motion.div>

          {/* TÍTULOS PREMIADOS */}
          <div className="bg-gray-800 rounded-lg shadow-sm p-4 mb-6">
            <div className="flex justify-between items-center">
              <h2 className="font-bold text-lg flex items-center gap-2 text-gray-100">
                <Trophy size={20} className="text-yellow-500" /> Títulos premiados
              </h2>
              <div className="flex items-center gap-4">
                <div className="flex gap-2">
                  {socialButtons.map((btn, index) => (
                    <Button
                      key={index}
                      size="icon"
                      className={`${btn.color} text-white rounded-md w-8 h-8 hover:opacity-90`}
                      onClick={handleFeatureClick}
                    >
                      {btn.icon}
                    </Button>
                  ))}
                </div>
                <span className="bg-blue-800 text-white text-sm font-bold px-2 py-1 rounded">
                  {availablePrizes}/{totalPrizes}
                </span>
              </div>
            </div>

            <div className="mt-4 space-y-2">
              {winners.map((winner) => {
                const ticketLbl = ticketFromWinner(winner);

                const awardedFlagRemote = isAwarded(
                  winner.awarded ?? winner.isAwarded ?? winner.awardedAt ?? winner.winnerId,
                );
                const awardedFlagLocal = awardedLocal.some((t) => ticketEq(t, ticketLbl));
                const awardedFlag = awardedFlagRemote || awardedFlagLocal;

                return (
                  <div
                    key={ticketLbl}
                    className={`rounded-xl transition shadow-sm ${
                      awardedFlag
                        ? 'bg-gradient-to-r from-blue-700 to-blue-600 text-white'
                        : 'bg-gray-700 text-gray-200 hover:bg-gray-600'
                    }`}
                  >
                    <div
                      className="
                        grid
                        grid-cols-[72px_1fr_minmax(120px,160px)]
                        sm:grid-cols-[96px_1fr_240px]
                        items-center
                        gap-2 sm:gap-3
                        px-2 sm:px-3
                        py-2
                      "
                    >
                      {/* Número do bilhete — manter glow/realce AZUL */}
                      <span
                        className="inline-flex h-9 w-20 sm:h-10 sm:w-24 items-center justify-center
                                   font-mono font-bold text-white rounded-md
                                   bg-gray-900/80 border border-cyan-400/40 ring-1 ring-cyan-400/30"
                      >
                        {ticketLbl}
                      </span>

                      {/* Preço — sem azul */}
                      <div className="flex justify-center">
                        <PricePill amount={winner.prizeAmount} prizeName={winner.prizeName || 'R$ 3000'} />
                      </div>

                      {/* Status / Ganhador */}
                      <div className="min-w-0 flex justify-end">
                        {awardedFlag ? (
                          <div className="flex items-center gap-2 text-white font-extrabold uppercase max-w-[220px] truncate">
                            <Trophy size={18} />
                            <span className="truncate">
                              {twoNames(winner.winnerName || winner.name || winner.customerName || '')}
                            </span>
                          </div>
                        ) : (
                          // VERDINHO de volta
                          <div
                            className="
                              inline-flex items-center gap-2
                              h-9 sm:h-10 px-2.5 rounded-full
                              bg-emerald-900/40 text-emerald-300 ring-1 ring-emerald-400/30
                              whitespace-nowrap
                            "
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 sm:h-5 sm:w-5" viewBox="0 0 20 20" fill="currentColor">
                              <path
                                fillRule="evenodd"
                                d="M16.707 5.293a1 1 0 00-1.414 0L9 11.586 6.707 9.293a1 1 0 10-1.414 1.414l3 3a1 1 0 001.414 0l7-7a1 1 0 000-1.414z"
                                clipRule="evenodd"
                              />
                            </svg>
                            <span className="text-base sm:text-sm font-semibold tracking-wide">Disponível</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* AVISOS */}
          <div className="bg-gray-800 rounded-lg shadow-sm p-4 text-gray-400 space-y-3 h-48 overflow-y-auto text-sm">
            <p className="font-bold">Proibido a venda para menores de 18 anos!</p>
            <p>
              Ação totalmente instantânea, achando qualquer bilhete premiado disponível você recebe uma ligação e recebe seus prêmios!
            </p>
            <p>Qualquer dúvida ou problema chamar no suporte via WhatsApp.</p>
            <p>Boa sorte!</p>
          </div>

          <div className="text-center mt-8">
            <p className="text-sm text-gray-400">
              Desenvolvido por{' '}
              <a href="#" onClick={handleFeatureClick} className="text-cyan-400 font-bold">
                toprifa.bet
              </a>
            </p>
          </div>
        </main>

        <CheckoutDialog
          isOpen={isCheckoutOpen}
          setIsOpen={setIsCheckoutOpen}
          raffleId={raffleId}
          unitPrice={prize.pricePerTicket}
          quantity={quantity}
          totalPrice={selectedPrice}
          productName={prize.name}
          onPaymentSuccess={(data) => {
            const tickets =
              Array.isArray(data.winningTickets) && data.winningTickets.length
                ? data.winningTickets.map(normTicket)
                : data.winningTicket
                ? [normTicket(data.winningTicket)]
                : [];

            const instantPrizes =
              Array.isArray(data.instantPrizes) && data.instantPrizes.length
                ? data.instantPrizes.map((ip) => ({ ...ip, ticket: normTicket(ip.ticket) }))
                : data.instantPrizeName && data.winningTicket
                ? [{ ticket: normTicket(data.winningTicket), prizeName: data.instantPrizeName }]
                : [];

            if (!tickets.length) {
              toast({ title: 'Pagamento confirmado', description: 'Nenhum prêmio nesta compra.' });
              return;
            }

            setAwardedLocal((prev) => {
              const set = new Set(prev);
              tickets.forEach((t) => set.add(t));
              return Array.from(set);
            });

            const winnersLocal = tickets
              .map((t) => {
                const local = (prize.winners || []).find((w) => ticketEq(ticketFromWinner(w), t));
                const byCtx = local || findWinnerByTicket?.(t) || null;
                if (byCtx) return byCtx;
                const prName =
                  instantPrizes.find((ip) => ticketEq(ip.ticket, t))?.prizeName ||
                  data.instantPrizeName ||
                  'Prêmio Instantâneo';
                return { ticket: t, prizeName: prName, ticketNumber: t, isAwarded: true, name: '' };
              })
              .filter(Boolean);

            setInstantWinner(winnersLocal.length > 1 ? winnersLocal : winnersLocal[0]);
          }}
        />

        <WinnerAnnouncementDialog isOpen={!!instantWinner} setIsOpen={() => setInstantWinner(null)} winner={instantWinner} />
      </div>
    </>
  );
};

export default PrizeDetail;
