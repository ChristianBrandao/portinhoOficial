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

const PrizeDetail = () => {
  const { toast } = useToast();
  const { id } = useParams();
  const { prize, findWinnerByTicket } = useAppContext();

  const raffleId = prize?.id || id;

  const [quantity, setQuantity] = useState(10);
  const [selectedPrice, setSelectedPrice] = useState(0.20);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [instantWinner, setInstantWinner] = useState(null);

  React.useEffect(() => {
    if (prize) {
      setQuantity(10);
      setSelectedPrice(10 * prize.pricePerTicket);
    }
  }, [prize]);

  const handleFeatureClick = () => {
    toast({
      title: '🚧 Este recurso ainda não foi implementado—mas não se preocupe! Você pode solicitá-lo no seu próximo prompt! 🚀',
    });
  };

  const handleSelectTitles = (titles, price) => {
    setQuantity(titles);
    setSelectedPrice(price);
    toast({
      title: 'Seleção atualizada!',
      description: `Você selecionou ${titles} títulos por R$ ${price.toFixed(2).replace('.', ',')}.`,
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
        Carregando...
      </div>
    );
  }

  const titleOptions = prize.titleOptions || [];
  const winners = prize.winners || [];
  const availablePrizes = winners.filter((w) => w.awarded !== true).length; // só conta quando não for exatamente true
  const totalPrizes = winners.length;

  // helper para o rótulo do ticket e consistência de tipos
  const ticketLabel = (w) => String(w.ticketNumber ?? w.ticket ?? w.id ?? '');

  return (
    <>
      <Helmet>
        <title>Detalhes do Prêmio - {prize.name}</title>
        <meta
          name="description"
          content={`Participe do sorteio ${prize.name} por apenas R$ ${prize.pricePerTicket.toFixed(2)}.`}
        />
        <meta property="og:title" content={`Detalhes do Prêmio - ${prize.name}`} />
        <meta
          property="og:description"
          content={`Participe do sorteio ${prize.name} por apenas R$ ${prize.pricePerTicket.toFixed(2)}.`}
        />
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
                      const newQty = Math.max(1, quantity - 1);
                      setQuantity(newQty);
                      setSelectedPrice(newQty * prize.pricePerTicket);
                    }}
                  >
                    <Minus />
                  </Button>
                  <input
                    type="number"
                    value={quantity}
                    onChange={(e) => {
                      const newQty = Math.max(1, parseInt(e.target.value) || 0);
                      setQuantity(newQty);
                      setSelectedPrice(newQty * prize.pricePerTicket);
                    }}
                    className="w-16 text-center bg-gray-900 text-white rounded-md py-2"
                  />
                  <Button
                    variant="ghost"
                    size="icon"
                    className="bg-gray-600 text-white hover:bg-gray-500"
                    onClick={() => {
                      const newQty = quantity + 1;
                      setQuantity(newQty);
                      setSelectedPrice(newQty * prize.pricePerTicket);
                    }}
                  >
                    <Plus />
                  </Button>
                </div>
                <Button
                  className="bg-cyan-500 text-black font-bold text-lg px-6 py-3 rounded-lg hover:bg-cyan-400"
                  onClick={startCheckout}
                >
                  Participar <span className="ml-2">R$ {selectedPrice.toFixed(2).replace('.', ',')}</span>
                </Button>
              </div>
            </div>

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
                  const isAwarded = winner.awarded === true; // só considera exatamente true
                  const name = winner.name || '';
                  return (
                    <div
                      key={winner.id}
                      className={`flex items-center justify-between p-2 rounded-lg text-sm transition ${
                        isAwarded ? 'bg-black text-white' : 'bg-gray-700 text-gray-200 hover:bg-gray-600'
                      }`}
                    >
                      <span
                        className={`font-bold px-3 py-1 rounded-full ${
                          isAwarded ? 'bg-black border border-white' : 'bg-gray-600'
                        }`}
                      >
                        {ticketLabel(winner)}
                      </span>

                      <span
                        className={`flex-1 text-center ${
                          isAwarded ? 'text-yellow-300' : 'text-cyan-300'
                        } font-extrabold tracking-wide text-base md:text-lg`}
                      >
                        {winner.prizeName || '—'}
                      </span>

                      <div className="flex items-center gap-2">
                        {/* nome sempre, menor; se não houver, mostra vazio */}
                        <span
                          className={`px-2 py-0.5 rounded-md text-xs font-medium ${
                            isAwarded
                              ? 'border border-emerald-500/30 bg-emerald-600/20 text-emerald-300'
                              : 'text-gray-400 bg-transparent border border-transparent'
                          }`}
                        >
                          {name}
                        </span>
                        {isAwarded && <Trophy size={16} className="text-yellow-400" />}
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
                Ação totalmente instantânea, achando qualquer bilhete premiado disponível você recebe uma ligação e
                recebe seus prêmios!
              </p>
              <p>Qualquer dúvida ou problema chamar no suporte via WhatsApp.</p>
              <p>Boa sorte!</p>
            </div>

            <div className="text-center mt-8">
              <p className="text-sm text-gray-400">
                Desenvolvido por{' '}
                <a href="#" onClick={handleFeatureClick} className="text-cyan-400 font-bold">
                  Sorteio.bet
                </a>
              </p>
            </div>
          </motion.div>
        </main>

        <Button
          onClick={handleFeatureClick}
          className="fixed bottom-6 right-6 bg-green-500 hover:bg-green-600 text-white rounded-full shadow-lg h-14 px-6 flex items-center gap-2 text-lg"
        >
          <MessageSquare />
          WhatsApp
        </Button>

        <CheckoutDialog
          isOpen={isCheckoutOpen}
          setIsOpen={setIsCheckoutOpen}
          raffleId={raffleId}
          unitPrice={prize.pricePerTicket}
          quantity={quantity}
          totalPrice={selectedPrice}
          productName={prize.name}
          onPaymentSuccess={(data) => {
            const winner = findWinnerByTicket(data.winningTicket);
            if (winner) setInstantWinner(winner);
          }}
        />

        <WinnerAnnouncementDialog
          isOpen={!!instantWinner}
          setIsOpen={() => setInstantWinner(null)}
          winner={instantWinner}
        />
      </div>
    </>
  );
};

export default PrizeDetail;
