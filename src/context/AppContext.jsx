import React, { createContext, useState, useEffect, useContext, useCallback } from 'react';
import { getRaffles, getInstantPrizes, getWinners, getPurchase } from '@/services/api';

const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const [prize, setPrize] = useState(null);
  const [loading, setLoading] = useState(true);

  /* ===== Helpers ===== */
  const normTicket = (t) => {
    // Não padronize com zeros — mantenha só dígitos para casar 6/7+ dígitos
    return String(t ?? '').replace(/\D/g, '');
  };

  const ticketEq = (a, b) => normTicket(a) === normTicket(b);

  const isAwarded = (v) => {
    if (v === true) return true;
    if (typeof v === 'number') return v === 1;
    if (v instanceof Date) return true;
    if (typeof v === 'string') {
      const s = v.trim().toLowerCase();
      if (['true', '1', 'y', 'yes'].includes(s)) return true;
      if (/^\d{4}-\d{2}-\d{2}t\d{2}:\d{2}:/i.test(s)) return true; // ISO em awardedAt
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

  const normalizeInstantPrize = (p = {}) => {
    const rawTicket = p.ticketNumber ?? p.ticket ?? p.id;
    const ticketId = normTicket(rawTicket);
    const awardedFlag = isAwarded(
      p.awarded ?? p.isAwarded ?? p.awardedAt ?? p.winnerId
    );

    return {
      ...p,
      id: ticketId,
      ticket: ticketId,
      ticketNumber: ticketId,
      prizeName: p.prizeName ?? 'Prêmio Instantâneo',
      awarded: awardedFlag,
      winnerId: p.winnerId ?? p.purchaseId ?? null, // garantir presença
      name: p.name ?? p.winnerName ?? null,
    };
  };

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      // 1) Raffle
      const raffles = await getRaffles();
      const raffle = pickActiveRaffle(raffles);
      if (!raffle?.id) {
        setPrize(null);
        return;
      }

      // 2) Instant prizes
      const instantPrizes = await getInstantPrizes(raffle.id);
      const normalizedInstant = Array.isArray(instantPrizes)
        ? instantPrizes.map(normalizeInstantPrize)
        : [];

      // 3) Winners doc (se existir com nomes, ótimo; senão seguimos)
      let winnersDoc = null;
      try { winnersDoc = await getWinners(raffle.id); } catch {}
      const rawWinners = Array.isArray(winnersDoc?.winners) ? winnersDoc.winners : [];

      // 4) Mapa ticket->nome vindo do winners (se houver)
      const nameByTicket = new Map(
        rawWinners.map((w) => {
          const tk = normTicket(w.ticket ?? w.ticketNumber ?? w.id);
          const nm = w.winnerName || w.name || w.customerName || null;
          return [tk, nm];
        })
      );

      // 5) Primeiro enriquecimento: usar nome do winners (quando houver) nos premiados
      let winners = normalizedInstant.map((np) => {
        const injectedName = np.awarded ? (nameByTicket.get(np.ticket) ?? np.name ?? null) : null;
        return { ...np, winnerName: injectedName, name: injectedName };
      });

      // 6) Segundo enriquecimento: buscar nome por purchaseId (winnerId) para premiados sem nome
      const needsPurchase = winners.filter(w => w.awarded && !w.winnerName && w.winnerId);
      if (needsPurchase.length) {
        // ids únicos
        const uniqueIds = Array.from(new Set(needsPurchase.map(w => String(w.winnerId))));
        // busca em paralelo
        const purchases = await Promise.all(
          uniqueIds.map(async (pid) => {
            try { return { pid, data: await getPurchase(pid) }; }
            catch { return { pid, data: null }; }
          })
        );
        // mapa id -> customer.name
        const nameByPurchaseId = new Map(
          purchases.map(({ pid, data }) => {
            const nm = data?.customer?.name ?? null;
            return [pid, nm];
          })
        );
        // aplica nomes
        winners = winners.map(w => {
          if (w.awarded && !w.winnerName && w.winnerId) {
            const nm = nameByPurchaseId.get(String(w.winnerId)) || null;
            return { ...w, winnerName: nm, name: nm };
          }
          return w;
        });
      }

      setPrize({
        id: raffle.id,
        name: raffle.name ?? raffle.title ?? 'Sorteio',
        description: raffle.description ?? '',
        imageURL: raffle.imageURL ?? raffle.image ?? '',
        imageAlt: raffle.imageAlt ?? raffle.name ?? 'Imagem do sorteio',
        pricePerTicket: Number(raffle.pricePerTicket ?? raffle.unitPrice ?? 0),
        titleOptions: raffle.titleOptions ?? [],
        winners,
      });
    } catch (err) {
      console.error('Failed to load app data', err);
      setPrize(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  const awardPrize = useCallback((ticketId, winnerName) => {
    const normalized = normTicket(ticketId);
    setPrize((current) => {
      if (!current) return current;
      const updated = (current.winners || []).map((w) => {
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
      return { ...current, winners: updated };
    });
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
    _utils: { normTicket, ticketEq, isAwarded },
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useAppContext = () => useContext(AppContext);
