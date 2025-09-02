import React, { createContext, useState, useEffect, useContext, useCallback } from 'react';
import { getRaffles, getInstantPrizes, getWinners } from '@/services/api';

const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const [prize, setPrize] = useState(null);
  const [loading, setLoading] = useState(true);

  /* ===== Helpers ===== */
  const normTicket = (t) => {
    // Normaliza para string numérica; ajuste o padStart se o seu padrão tiver outro tamanho
    const s = String(t ?? '').replace(/\D/g, '');
    return s.padStart(6, '0');
  };

  // compara bilhetes ignorando zeros à esquerda / número vs string
  const ticketEq = (a, b) => normTicket(a) === normTicket(b);

  // interpreta "premiado" a partir de vários formatos possíveis no payload
  const isAwarded = (v) => {
    if (v === true) return true;
    if (typeof v === 'number') return v === 1;
    if (v instanceof Date) return true;
    if (typeof v === 'string') {
      const s = v.trim().toLowerCase();
      if (['true', '1', 'y', 'yes'].includes(s)) return true;
      if (/^\d{4}-\d{2}-\d{2}t\d{2}:\d{2}:/i.test(s)) return true; // ISO date em awardedAt
      if (s.startsWith('purchase-')) return true; // winnerId pattern
      return false;
    }
    if (v && typeof v === 'object') {
      return !!(v.awarded || v.awardedAt || v.winnerId || v.isAwarded);
    }
    return false;
  };

  const pickActiveRaffle = (raffles) => {
    if (!raffles) return null;
    if (!Array.isArray(raffles)) return raffles;
    const active = raffles.find((r) => r.active) || raffles[0];
    return active || null;
  };

  const normalizeInstantPrize = (p) => {
    // resolve ticket e normaliza
    const rawTicket = p.ticketNumber ?? p.ticket ?? p.id;
    const ticketId = normTicket(rawTicket);

    // resolve flag de prêmio de forma confiável
    const awardedFlag = isAwarded(
      p.awarded ?? p.isAwarded ?? p.awardedAt ?? p.winnerId // qualquer indicador de premiação
    );

    return {
      ...p,
      id: ticketId,                 // garante id consistente
      ticket: ticketId,             // facilita buscas
      ticketNumber: ticketId,       // mantém também em ticketNumber
      prizeName: p.prizeName ?? 'Prêmio Instantâneo',
      awarded: awardedFlag,
      name: p.name ?? p.winnerName ?? null,
      // mantém campos originais como awardedAt, winnerId, etc.
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
      const normalizedInstant = Array.isArray(instantPrizes)
        ? instantPrizes.map(normalizeInstantPrize)
        : [];

      // 3) Winners por raffle (para enriquecer apenas os premiados)
      let winnersDoc = null;
      try {
        // Espera { raffleId, winners: [...] }
        winnersDoc = await getWinners(raffle.id);
      } catch (e) {
        console.warn('Falha ao carregar winners:', e?.message || e);
      }

      // 4) Mapa ticket -> nome (winnerName/name/customerName)
      const nameByTicket = new Map(
        (winnersDoc?.winners || []).map((w) => {
          const tk = normTicket(w.ticket ?? w.ticketNumber ?? w.id);
          const nm = w.winnerName || w.name || w.customerName || null;
          return [tk, nm];
        })
      );

      // 5) Injeta nome SOMENTE se o item está premiado
      const winners = normalizedInstant.map((np) => {
        const injectedName = np.awarded
          ? (nameByTicket.get(np.ticket) ?? np.name ?? null)
          : null;

        return {
          ...np,
          winnerName: injectedName,  // usado no PrizeDetail
          name: injectedName,        // compat com renderização atual
        };
      });

      // 6) Objeto usado pela UI
      setPrize({
        id: raffle.id,
        name: raffle.name ?? raffle.title ?? 'Sorteio',
        description: raffle.description ?? '',
        imageURL: raffle.imageURL ?? raffle.image ?? '',
        imageAlt: raffle.imageAlt ?? raffle.name ?? 'Imagem do sorteio',
        pricePerTicket: Number(raffle.pricePerTicket ?? raffle.unitPrice ?? 0.0),
        titleOptions: raffle.titleOptions ?? [],
        winners, // <- já enriquecidos com winnerName quando premiados
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
    const normalized = normTicket(ticketId);
    setPrize((currentPrize) => {
      if (!currentPrize) return currentPrize;
      const updatedWinners = (currentPrize.winners || []).map((w) => {
        const wTicket = normTicket(w.ticketNumber ?? w.ticket ?? w.id);
        if (wTicket === normalized) {
          return {
            ...w,
            awarded: true,
            name: winnerName || w.name || 'Vencedor',
            winnerName: winnerName || w.winnerName || 'Vencedor',
            awardedAt: w.awardedAt ?? new Date().toISOString(),
            date: new Date().toLocaleDateString('pt-BR'),
          };
        }
        return w;
      });
      return { ...currentPrize, winners: updatedWinners };
    });
    // Opcional: sincronizar com backend e depois chamar loadData()
  }, []);

  const findWinnerByTicket = useCallback((ticketId) => {
    if (!prize) return null;
    const target = normTicket(ticketId);
    return (
      (prize.winners || []).find(
        (w) => normTicket(w.ticketNumber ?? w.ticket ?? w.id) === target
      ) || null
    );
  }, [prize]);

  const value = {
    prize,
    loading,
    awardPrize,
    findWinnerByTicket,
    reload: loadData,
    // exporta helpers se quiser usar no front
    _utils: { normTicket, ticketEq, isAwarded },
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useAppContext = () => useContext(AppContext);
