import React, { createContext, useState, useEffect, useContext, useCallback } from 'react';
import { getRaffles, getInstantPrizes, getWinners, getPurchase } from '@/services/api';

const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const [prize, setPrize] = useState(null);
  const [loading, setLoading] = useState(true);

  /* ===== Helpers ===== */
  const normTicket = (t) => String(t ?? '').replace(/\D/g, '');
  const ticketEq = (a, b) => normTicket(a) === normTicket(b);

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

  const normalizeInstantPrize = (p = {}) => {
    const rawTicket = p.ticketNumber ?? p.ticket ?? p.id;
    const ticketId = normTicket(rawTicket);
    const awardedFlag = isAwarded(p.awarded ?? p.isAwarded ?? p.awardedAt ?? p.winnerId);

    return {
      ...p,
      id: ticketId,
      ticket: ticketId,
      ticketNumber: ticketId,
      prizeName: p.prizeName ?? 'Prêmio Instantâneo',
      awarded: awardedFlag,
      winnerId: p.winnerId ?? p.purchaseId ?? null, // se o endpoint não mandar, ficamos null
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

      // 3) Winners (contém ticket e purchaseId; normalmente não traz nome)
      let winnersDoc = null;
      try { winnersDoc = await getWinners(raffle.id); } catch {}
      const winnersArray = Array.isArray(winnersDoc?.winners) ? winnersDoc.winners : [];

      // 4) Mapas auxiliares vindos do /winners
      // ticket -> purchaseId (para descobrir o ID da compra de cada ticket premiado)
      const purchaseIdByTicket = new Map();
      // ticket -> nome (se por acaso vier, usamos direto)
      const nameByTicket = new Map();

      for (const w of winnersArray) {
        const tk = normTicket(w.ticket ?? w.ticketNumber ?? w.id);
        if (!tk) continue;
        const pid = w.purchaseId || w.winnerId || null;
        if (pid && !purchaseIdByTicket.has(tk)) purchaseIdByTicket.set(tk, pid);
        const nm = w.winnerName || w.name || w.customerName || null;
        if (nm && !nameByTicket.has(tk)) nameByTicket.set(tk, nm);
      }

      // 5) Primeiro enriquecimento: usa nome do /winners se existir
      let winners = normalizedInstant.map((np) => {
        const injectedName = np.awarded ? (nameByTicket.get(np.ticket) ?? np.name ?? null) : null;
        return { ...np, winnerName: injectedName, name: injectedName };
      });

      // 6) Segundo enriquecimento:
      // Para cada premiado sem nome, obter o purchaseId de duas fontes:
      // (a) winnerId vindo do instantprizes (se vier)
      // (b) purchaseIdByTicket (do /winners), quando winnerId não vier
      const needs = winners.filter(w => w.awarded && !w.winnerName);
      if (needs.length) {
        const ids = new Set();
        needs.forEach((w) => {
          const pid = w.winnerId || purchaseIdByTicket.get(w.ticket) || null;
          if (pid) ids.add(String(pid));
        });

        if (ids.size) {
          const results = await Promise.all(
            Array.from(ids).map(async (pid) => {
              try { return { pid, data: await getPurchase(pid) }; }
              catch { return { pid, data: null }; }
            })
          );
          const nameByPid = new Map(
            results.map(({ pid, data }) => [pid, data?.customer?.name ?? null])
          );

          winners = winners.map((w) => {
            if (w.awarded && !w.winnerName) {
              const pid = w.winnerId || purchaseIdByTicket.get(w.ticket) || null;
              const nm = pid ? nameByPid.get(String(pid)) || null : null;
              return { ...w, winnerName: nm, name: nm };
            }
            return w;
          });
        }
      }

      // 7) Estado final para a UI
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
