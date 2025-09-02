import React, { createContext, useState, useEffect, useContext, useCallback } from 'react';
import * as api from '@/services/api'; // <<<<< robusto contra export errado

const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const [prize, setPrize] = useState(null);
  const [loading, setLoading] = useState(true);

  /* ===== Helpers de ticket (tolerantes a formato) ===== */

  const digits = (t) => String(t ?? '').replace(/\D/g, '');

  const canonical = (t) => {
    const d = digits(t);
    if (!d) return '';
    const n = Number(d);
    return Number.isNaN(n) ? d : String(n);
  };

  const pad6 = (t) => digits(t).padStart(6, '0');
  const pad7 = (t) => digits(t).padStart(7, '0');

  const keyVariants = (t) => {
    const c = canonical(t);
    const p6 = pad6(t);
    const p7 = pad7(t);
    return Array.from(new Set([digits(t), c, p6, p7]));
  };

  const ticketEq = (a, b) => {
    const A = new Set(keyVariants(a));
    const B = new Set(keyVariants(b));
    for (const k of A) if (B.has(k)) return true;
    return false;
  };

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
    const awardedFlag = isAwarded(
      p.awarded ?? p.isAwarded ?? p.awardedAt ?? p.winnerId
    );

    const c = canonical(rawTicket);
    const p6 = pad6(rawTicket);
    const p7 = pad7(rawTicket);

    return {
      ...p,
      id: c,
      ticket: c,
      ticketNumber: c,
      prizeName: p.prizeName ?? 'Prêmio Instantâneo',
      awarded: awardedFlag,
      name: p.name ?? p.winnerName ?? null,
      _ticketFaces: { canonical: c, pad6: p6, pad7: p7, raw: String(rawTicket ?? '') },
    };
  };

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      // 1) Raffles
      const raffles = await api.getRaffles();
      const raffle = pickActiveRaffle(raffles);
      if (!raffle || !raffle.id) {
        console.warn('Nenhum sorteio ativo/encontrado em getRaffles()');
        setPrize(null);
        return;
      }

      // 2) Instant prizes do raffle
      const instantPrizes = await api.getInstantPrizes(raffle.id).catch((e) => {
        console.warn('getInstantPrizes falhou:', e?.message || e);
        return [];
      });
      const normalizedInstant = Array.isArray(instantPrizes)
        ? instantPrizes.map((x) => normalizeInstantPrize(x))
        : [];

      // 3) Winners por raffle (só se a função existir mesmo)
      let winnersDoc = { winners: [] };
      if (typeof api.getWinners === 'function') {
        winnersDoc = await api.getWinners(raffle.id).catch((e) => {
          console.warn('getWinners falhou:', e?.message || e);
          return { winners: [] };
        });
      } else {
        console.warn('getWinners não é uma função exportada de "@/services/api". Usando winners vazio.');
      }

      // 4) Mapa ticket -> nome (considera todas as variações)
      const nameByTicket = new Map();
      const winnersArray = Array.isArray(winnersDoc?.winners) ? winnersDoc.winners : [];
      for (const w of winnersArray) {
        const t = w?.ticket ?? w?.ticketNumber ?? w?.id;
        const nm = w?.winnerName || w?.name || w?.customerName || null;
        if (!t || !nm) continue;
        for (const k of keyVariants(t)) {
          if (!nameByTicket.has(k)) nameByTicket.set(k, nm);
        }
      }

      // 5) Injeta nome SOMENTE em premiados
      const winners = normalizedInstant.map((np) => {
        if (!np.awarded) return { ...np, winnerName: null, name: null };

        const faces = np._ticketFaces || {};
        const candidates = Array.from(new Set([
          np.ticket, np.id, np.ticketNumber,
          faces.canonical, faces.pad6, faces.pad7, faces.raw
        ])).filter(Boolean);

        let injectedName = np.name ?? null;
        for (const key of candidates) {
          const val = nameByTicket.get(String(key));
          if (val) { injectedName = val; break; }
        }

        return { ...np, winnerName: injectedName, name: injectedName };
      });

      // 6) Objeto da UI
      setPrize({
        id: raffle.id,
        name: raffle.name ?? raffle.title ?? 'Sorteio',
        description: raffle.description ?? '',
        imageURL: raffle.imageURL ?? raffle.image ?? '',
        imageAlt: raffle.imageAlt ?? raffle.name ?? 'Imagem do sorteio',
        pricePerTicket: Number(raffle.pricePerTicket ?? raffle.unitPrice ?? 0.0),
        titleOptions: raffle.titleOptions ?? [],
        winners,
      });

    } catch (error) {
      console.error('Failed to load app data', error);
      setPrize(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  const awardPrize = useCallback((ticketId, winnerName) => {
    setPrize((currentPrize) => {
      if (!currentPrize) return currentPrize;
      const updated = (currentPrize.winners || []).map((w) => {
        if (ticketEq(w.ticketNumber ?? w.ticket ?? w.id, ticketId)) {
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
      return { ...currentPrize, winners: updated };
    });
  }, []);

  const findWinnerByTicket = useCallback((ticketId) => {
    if (!prize) return null;
    return (
      (prize.winners || []).find(
        (w) => ticketEq(w.ticketNumber ?? w.ticket ?? w.id, ticketId)
      ) || null
    );
  }, [prize]);

  const value = {
    prize,
    loading,
    awardPrize,
    findWinnerByTicket,
    reload: loadData,
    _utils: { digits, canonical, pad6, pad7, keyVariants, ticketEq, isAwarded },
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useAppContext = () => useContext(AppContext);
