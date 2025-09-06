import React, { useState, useMemo } from 'react';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import InputMask from 'react-input-mask';
import Header from '@/components/shared/Header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/use-toast';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
  DialogDescription, DialogFooter, DialogClose
} from '@/components/ui/dialog';
import {
  ShoppingCart, Search, AlertTriangle, Loader, Frown,
  Trophy, CalendarClock, Hash, Receipt, Filter, RotateCcw
} from 'lucide-react';

import { findUserByPhone, getMyNumbers } from '@/services/api';

function toDateOnlyStr(d) {
  // yyyy-mm-dd para <input type="date">
  const dt = new Date(d);
  const y = dt.getFullYear();
  const m = String(dt.getMonth() + 1).padStart(2, '0');
  const day = String(dt.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}
function addDays(base, delta) {
  const d = new Date(base);
  d.setDate(d.getDate() + delta);
  return d;
}

// util para comparar tickets normalizando (com/sem zero à esquerda)
const pad6 = (x) => String(x).padStart(6, '0');
const ticketEq = (a, b) => pad6(a) === pad6(b);

const MeusNumeros = () => {
  const { toast } = useToast();

  // busca
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [error, setError] = useState('');

  // dados brutos da API
  const [data, setData] = useState(null);

  // filtros de data (yyyy-mm-dd)
  const today = useMemo(() => toDateOnlyStr(new Date()), []);
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  const handleSearch = async (e) => {
    e?.preventDefault?.();
    setLoading(true);
    setSearched(true);
    setError('');
    setIsDialogOpen(false);

    const unmasked = phone.replace(/\D/g, '');

    try {
      const user = await findUserByPhone(unmasked);
      if (!user?.id) throw new Error('Usuário não encontrado.');

      const result = await getMyNumbers(user.id);
      setData(result);

      if (!result?.purchases?.length) {
        toast({
          title: 'Nenhuma compra encontrada',
          description: 'Não encontramos compras para este telefone.',
        });
      }

      // auto-definir range com base nos dados (últimos 30 dias)
      const dates = (result?.purchases || [])
        .map(p => new Date(p.paidAt || p.createdAt || Date.now()))
        .sort((a,b) => a - b);

      if (dates.length) {
        const max = dates[dates.length - 1];
        const min = addDays(max, -30);
        setDateFrom(toDateOnlyStr(min));
        setDateTo(toDateOnlyStr(max));
      } else {
        setDateFrom('');
        setDateTo('');
      }

    } catch (err) {
      console.error('Erro na busca:', err);
      setData(null);
      setError(err?.message || 'Falha na busca. Tente novamente.');
      toast({
        title: 'Erro na busca',
        description: err?.message || 'Não foi possível encontrar suas compras.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const purchases = data?.purchases || [];

  // aplica filtro de data (client-side)
  const filtered = useMemo(() => {
    if (!purchases.length) return [];
    if (!dateFrom && !dateTo) return purchases;

    const from = dateFrom ? new Date(dateFrom + 'T00:00:00') : null;
    const to   = dateTo ? new Date(dateTo   + 'T23:59:59.999') : null;

    return purchases.filter(p => {
      const when = new Date(p.paidAt || p.createdAt || 0);
      if (from && when < from) return false;
      if (to && when > to) return false;
      return true;
    });
  }, [purchases, dateFrom, dateTo]);

  const totals = useMemo(() => {
    const list = filtered;
    const countWins = (p) => {
      if (Array.isArray(p.winningTickets) && p.winningTickets.length) return p.winningTickets.length;
      return p.winningTicket ? 1 : 0;
    };
    return {
      purchases: list.length,
      numbers: list.reduce((acc, p) => acc + (p.numbers?.length || 0), 0),
      winners: list.reduce((acc, p) => acc + countWins(p), 0),
    };
  }, [filtered]);

  const setPreset = (days) => {
    if (!purchases.length) return;
    const dates = purchases
      .map(p => new Date(p.paidAt || p.createdAt || Date.now()))
      .sort((a,b) => a - b);
    const max = dates[dates.length - 1];
    const from = addDays(max, -days + 1);
    setDateFrom(toDateOnlyStr(from));
    setDateTo(toDateOnlyStr(max));
  };

  const clearFilters = () => {
    setDateFrom('');
    setDateTo('');
  };

  return (
    <>
      <Helmet>
        <title>Meus Números - rempdasorte</title>
        <meta name="description" content="Consulte e filtre por data os números que você comprou." />
      </Helmet>

      <div className="min-h-screen bg-gray-900 flex flex-col items-center">
        <Header />
        <main className="w-full max-w-3xl px-4 py-8 flex-grow">

          {/* HEADER */}
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.5 }}
            className="bg-gray-800 rounded-lg shadow-md p-6"
          >
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              <div className="flex items-center space-x-3">
                <ShoppingCart className="h-6 w-6 text-gray-400" />
                <h1 className="text-xl font-bold text-gray-100">Meus números</h1>
              </div>
              <div className="flex gap-2">
                <Button onClick={() => setIsDialogOpen(true)} className="bg-black text-white hover:bg-gray-700">
                  <Search className="mr-2 h-4 w-4" /> Buscar
                </Button>
              </div>
            </div>
          </motion.div>

          {/* ALERTA INICIAL */}
          {!searched && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="mt-6 bg-yellow-900/40 border border-yellow-700 text-yellow-200 p-4 rounded-md flex items-center"
            >
              <AlertTriangle className="h-5 w-5 mr-3" />
              <p>Clique em <b>Buscar</b> para localizar suas compras.</p>
            </motion.div>
          )}

          {/* LOADING */}
          {loading && (
            <div className="flex justify-center items-center py-10 text-gray-400">
              <Loader className="animate-spin mr-2 h-6 w-6" /> Buscando...
            </div>
          )}

          {/* ERRO */}
          {!loading && error && (
            <div className="mt-6 bg-red-900/40 border border-red-700 text-red-200 p-4 rounded-md flex items-center">
              <AlertTriangle className="h-5 w-5 mr-3" />
              <p>{error}</p>
            </div>
          )}

          {/* FILTROS DE DATA (mostra só após buscar) */}
          {!loading && searched && !error && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
              className="mt-6 bg-gray-800 rounded-lg p-4"
            >
              <div className="flex items-center gap-3 mb-3">
                <Filter className="h-4 w-4 text-gray-300" />
                <h2 className="text-gray-200 font-semibold">Filtrar por data</h2>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <div className="text-xs text-gray-400 mb-1">De</div>
                  <Input
                    type="date"
                    value={dateFrom}
                    max={dateTo || today}
                    onChange={(e) => setDateFrom(e.target.value)}
                    className="bg-gray-900 text-gray-100 border-gray-700"
                  />
                </div>
                <div>
                  <div className="text-xs text-gray-400 mb-1">Até</div>
                  <Input
                    type="date"
                    value={dateTo}
                    min={dateFrom || ''}
                    max={today}
                    onChange={(e) => setDateTo(e.target.value)}
                    className="bg-gray-900 text-gray-100 border-gray-700"
                  />
                </div>
              </div>

              <div className="flex flex-wrap gap-2 mt-3">
                <Button type="button" variant="secondary" className="bg-gray-700 hover:bg-gray-600"
                        onClick={() => setPreset(1)}>
                  Hoje
                </Button>
                <Button type="button" variant="secondary" className="bg-gray-700 hover:bg-gray-600"
                        onClick={() => setPreset(7)}>
                  Últimos 7 dias
                </Button>
                <Button type="button" variant="secondary" className="bg-gray-700 hover:bg-gray-600"
                        onClick={() => setPreset(30)}>
                  Últimos 30 dias
                </Button>
                <Button type="button" className="bg-black text-white hover:bg-gray-700 ml-auto"
                        onClick={clearFilters}>
                  <RotateCcw className="h-4 w-4 mr-2" /> Limpar filtros
                </Button>
              </div>
            </motion.div>
          )}

          {/* RESULTADOS (após filtro) */}
          {!loading && searched && !error && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="mt-6 space-y-6"
            >
              {/* RESUMO */}
              <div className="bg-gray-800 rounded-lg p-4">
                <h3 className="text-gray-200 font-semibold mb-3">Resumo</h3>
                <div className="grid grid-cols-3 gap-3 text-center">
                  <div className="bg-gray-900 rounded p-3">
                    <div className="text-gray-400 text-xs">Compras</div>
                    <div className="text-xl font-bold text-white">{totals.purchases}</div>
                  </div>
                  <div className="bg-gray-900 rounded p-3">
                    <div className="text-gray-400 text-xs">Números</div>
                    <div className="text-xl font-bold text-white">{totals.numbers}</div>
                  </div>
                  <div className="bg-gray-900 rounded p-3">
                    <div className="text-gray-400 text-xs">Prêmios</div>
                    <div className="text-xl font-bold text-white">{totals.winners}</div>
                  </div>
                </div>
              </div>

              {/* LISTA */}
              {filtered.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-10 text-gray-400 text-center">
                  <Frown className="h-16 w-16 mb-4" />
                  <p className="text-xl font-semibold">Nenhuma compra no período selecionado.</p>
                  <p className="mt-2 text-sm">Ajuste o filtro de datas ou limpe os filtros.</p>
                </div>
              ) : (
                filtered.map((p) => {
                  // normalização (compat + múltiplos)
                  const winningTickets = Array.isArray(p.winningTickets) && p.winningTickets.length
                    ? p.winningTickets.map(String)
                    : (p.winningTicket ? [String(p.winningTicket)] : []);

                  const instantPrizes = Array.isArray(p.instantPrizes) && p.instantPrizes.length
                    ? p.instantPrizes
                    : (p.instantPrizeName && p.winningTicket
                        ? [{ ticket: String(p.winningTicket), prizeName: p.instantPrizeName }]
                        : []);

                  return (
                    <div key={p.purchaseId} className="bg-gray-800 rounded-lg p-5">
                      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-3">
                        <div>
                          <div className="text-sm text-gray-400">Produto</div>
                          <div className="text-lg font-semibold text-gray-100">
                            {p.productName || p.raffleId}
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3 md:text-right">
                          <div className="flex items-center gap-2 justify-start md:justify-end text-gray-300">
                            <Receipt className="h-4 w-4 text-gray-400" />
                            <span className="font-mono text-xs">{p.purchaseId}</span>
                          </div>
                          <div className="flex items-center gap-2 justify-start md:justify-end text-gray-300">
                            <CalendarClock className="h-4 w-4 text-gray-400" />
                            <span className="text-xs">
                              {new Date(p.paidAt || p.createdAt || Date.now()).toLocaleString('pt-BR')}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="mt-4">
                        <div className="text-sm text-gray-400 mb-2">Números</div>
                        <div className="flex flex-wrap gap-2">
                          {(p.numbers ?? []).length === 0 && (
                            <span className="text-gray-500 text-sm">— nenhum número nesta compra —</span>
                          )}
                          {(p.numbers ?? []).map((n) => (
                            <span
                              key={n}
                              className="inline-flex items-center gap-1 bg-cyan-700 text-white px-3 py-1 rounded-lg font-mono text-sm shadow"
                            >
                              <Hash className="h-3 w-3 opacity-80" /> {n}
                            </span>
                          ))}
                        </div>
                      </div>

                      {(winningTickets.length > 0) && (
                        <div className="mt-4 bg-emerald-900/30 border border-emerald-700 rounded-lg p-3 text-emerald-300">
                          <div className="flex items-center gap-2 font-semibold">
                            <Trophy className="h-5 w-5 text-yellow-300" />
                            {winningTickets.length > 1
                              ? 'Você foi contemplado em vários bilhetes!'
                              : 'Você foi contemplado!'}
                          </div>

                          {/* Lista 1 ou N tickets + nomes dos prêmios quando houver */}
                          <div className="mt-2 text-sm space-y-1">
                            {winningTickets.map((t) => {
                              const prizeName =
                                instantPrizes.find((ip) => ticketEq(ip.ticket, t))?.prizeName
                                || p.instantPrizeName
                                || 'Prêmio Instantâneo';
                              return (
                                <div key={t}>
                                  Ticket:&nbsp;
                                  <span className="font-mono text-emerald-200">{t}</span>
                                  {prizeName ? (
                                    <>
                                      &nbsp;— <span className="font-semibold">{prizeName}</span>
                                    </>
                                  ) : null}
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </motion.div>
          )}
        </main>
      </div>

      {/* MODAL DE BUSCA */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[425px] bg-gray-800 text-gray-100 border-gray-700">
          <DialogHeader>
            <DialogTitle className="text-gray-100">Buscar compras</DialogTitle>
            <DialogDescription className="text-gray-400">
              Digite seu número de telefone (com DDD) para encontrar suas compras.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSearch}>
            <div className="grid gap-4 py-4">
              <InputMask
                mask="(99) 99999-9999"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              >
                {(inputProps) => (
                  <Input
                    {...inputProps}
                    id="phone"
                    placeholder="(99) 99999-9999"
                    required
                    className="bg-gray-700 text-gray-100 border-gray-600 placeholder:text-gray-500"
                  />
                )}
              </InputMask>
            </div>

            <DialogFooter>
              <DialogClose asChild>
                <Button type="button" variant="secondary" className="bg-gray-700 text-gray-100 hover:bg-gray-600">
                  Cancelar
                </Button>
              </DialogClose>
              <Button type="submit" className="bg-black text-white hover:bg-gray-700">
                <Search className="mr-2 h-4 w-4" />
                Buscar
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default MeusNumeros;
