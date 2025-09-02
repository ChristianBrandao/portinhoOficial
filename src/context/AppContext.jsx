import React, { createContext, useState, useEffect, useContext, useCallback } from 'react';
import { getRaffles, getInstantPrizes, getWinners } from '@/services/api';

const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const [prize, setPrize] = useState(null);
  const [loading, setLoading] = useState(true);

  /* ===== Helpers de ticket (super tolerantes a formato) ===== */

  // Só dígitos
  const digits = (t) => String(t ?? '').replace(/\D/g, '');

  // "canônico" = sem zeros à esquerda (Number->String), preserva "0" se vazio
  const canonical = (t) => {
    const d = digits(t);
    if (!d) return '';
    const n = Number(d);
    // se for NaN mantém string original, mas em geral vira "3", "7384921", etc.
    return Number.isNaN(n) ? d : String(n);
  };

  const pad6 = (t) => digits(t).padStart(6, '0'); // "3" -> "000003"
  const pad7 = (t) => digits(t).padStart(7, '0'); // "3" -> "0000003"

  // Todas as chaves equivalentes a um ticket (sem/6/7)
  const keyVariants = (t) => {
    const c = canonical(t);      // "3"  | "7384921"
    const p6 = pad6(t);          // "000003" | "7384921" (se já >= 7 dígitos, fica igual)
    const p7 = pad7(t);          // "0000003" | "7384921"
    // Usa Set pra evitar duplicadas
    return Array.from(new Set([digits(t), c, p6, p7]));
  };

  // comparação ampla
  const ticketEq = (a, b) => {
    const A = new Set(keyVariants(a));
    const B = new Set(keyVariants(b));
    for (const k of A) if (B.has(k)) return true;
    return false;
  };

  // interpreta "premiado" a partir de vários formatos possíveis
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

  // Normaliza um item vindo do /instantprizes
  const normalizeInstantPrize = (p) => {
    const rawTicket = p.ticketNumber ?? p.ticket ?? p.id;
    const awardedFlag = isAwarded(
      p.awarded ?? p.isAwarded ?? p.awardedAt ?? p.winnerId
    );

    // Mantém várias faces do ticket no objeto (útil pra debug/merge)
    const c = canonical(rawTicket);
    const p6 = pad6(rawTicket);
    const p7 = pad7(rawTicket);

    return {
      ...p,
      // chaves "oficiais" usadas pela UI
      id: c,                 // canônico
      ticket: c,
      ticketNumber: c,
      prizeName: p.prizeName ?? 'Prêmio Instantâneo',
      awarded: awardedFlag,
      name: p.name ?? p.winnerName ?? null,

      // faces auxiliares (não usadas na UI, mas ajudam no merge)
      _ticketFaces: { canonical: c, pad6: p6, pad7: p7, raw: String(rawTicket ?? '') },
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
        winnersDoc = await getWinners(raffle.id); // { raffleId, winners: [...] }
      } catch (e) {
        console.warn('Falha ao carregar winners:', e?.message || e);
      }

      // 4) Mapa ticket -> nome (todas as variações mapeadas!)
      const nameByTicket = new Map();
      for (const w of (winnersDoc?.winners || [])) {
        const t = w.ticket ?? w.ticketNumber ?? w.id;
        const nm = w.winnerName || w.name || w.customerName || null;
        if (!t || !nm) continue;

        for (const k of keyVariants(t)) {
          if (!nameByTicket.has(k)) {
            nameByTicket.set(k, nm);
          }
        }
      }

      // 5) Injeta nome SOMENTE se o item está premiado (tentando todas as variações)
      const winners = normalizedInstant.map((np) => {
        if (!np.awarded) {
          return { ...np, winnerName: null, name: null };
        }

        // tenta todas as variações do próprio ticket
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

        return {
          ...np,
          winnerName: injectedName,
          name: injectedName,
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
    setPrize((currentPrize) => {
      if (!currentPrize) return currentPrize;

      const updatedWinners = (currentPrize.winners || []).map((w) => {
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
      return { ...currentPrize, winners: updatedWinners };
    });
    // Opcional: sincronizar com backend e depois chamar loadData()
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
