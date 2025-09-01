import React, { createContext, useState, useEffect, useContext, useCallback } from 'react';
import { getRaffles, getInstantPrizes } from '@/services/api';

const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const [prize, setPrize] = useState(null);
  const [loading, setLoading] = useState(true);

  const pickActiveRaffle = (raffles) => {
    if (!raffles) return null;
    // Se a API já retorna objeto único:
    if (!Array.isArray(raffles)) return raffles;
    // Caso seja lista, escolha a primeira ou a que tiver alguma flag "active"
    const active = raffles.find(r => r.active) || raffles[0];
    return active || null;
  };

  const normalizeInstantPrize = (p) => {
    // Normaliza os campos para o que a UI espera
    const ticketId = p.ticketNumber || p.ticket || p.id; // compatibilidade
    return {
      ...p,
      id: ticketId,                              // garante id = número
      ticket: ticketId,                          // facilita findWinnerByTicket
      prizeName: p.prizeName ?? 'Prêmio Instantâneo',
      awarded: !!(p.awarded ?? p.isAwarded),     // UI usa "awarded"
      name: p.name ?? p.winnerName ?? null,      // se backend não enviar nome, fica null
      // mantém campos originais como isAwarded, winnerId, awardedAt se vierem
    };
  };

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      // 1) Raffles
      const raffles = await getRaffles();
      const raffle = pickActiveRaffle(raffles);
      if (!raffle || !raffle.id) {
        console.warn('Nenhum sorteio ativo/encontrado em getRaffles()');
        setPrize(null);
        return;
      }

      // 2) Instant prizes do raffle
      const instantPrizes = await getInstantPrizes(raffle.id);
      const winners = Array.isArray(instantPrizes)
        ? instantPrizes.map(normalizeInstantPrize)
        : [];

      // 3) Monta objeto prize esperado pelo restante do app
      setPrize({
        id: raffle.id,
        name: raffle.name ?? raffle.title ?? 'Sorteio',
        description: raffle.description ?? '',
        imageURL: raffle.imageURL ?? raffle.image ?? '',
        imageAlt: raffle.imageAlt ?? raffle.name ?? 'Imagem do sorteio',
        pricePerTicket: Number(raffle.pricePerTicket ?? raffle.unitPrice ?? 0.0),
        titleOptions: raffle.titleOptions ?? [],   // se você tiver bundles pré-configurados
        winners,                                   // lista normalizada
      });
    } catch (error) {
      console.error('Failed to load app data', error);
      setPrize(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Marca o ticket como premiado no estado (update otimista)
  const awardPrize = useCallback((ticketId, winnerName) => {
    setPrize((currentPrize) => {
      if (!currentPrize) return currentPrize;
      const updatedWinners = (currentPrize.winners || []).map((w) => {
        const idToCompare = w.ticketNumber || w.ticket || w.id;
        if (idToCompare === ticketId) {
          return {
            ...w,
            awarded: true,
            name: winnerName || w.name || 'Vencedor',
            date: new Date().toLocaleDateString('pt-BR'),
          };
        }
        return w;
      });
      return { ...currentPrize, winners: updatedWinners };
    });

    // Opcional: recarregar depois de alguns segundos para refletir backend
    // setTimeout(() => loadData(), 2000);
  }, []);

  const findWinnerByTicket = useCallback((ticketId) => {
    if (!prize) return null;
    return (prize.winners || []).find(
      (w) => (w.ticketNumber || w.ticket || w.id) === ticketId
    ) || null;
  }, [prize]);

  const value = {
    prize,
    loading,
    awardPrize,
    findWinnerByTicket,
    reload: loadData,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useAppContext = () => useContext(AppContext);
