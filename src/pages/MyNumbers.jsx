import React, { useState } from 'react';
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
  Trophy, CalendarClock, Hash, Receipt
} from 'lucide-react';

// chama seu services/api
import { findUserByPhone, getMyNumbers } from '@/services/api';

const MeusNumeros = () => {
  const { toast } = useToast();

  // ui state
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [error, setError] = useState('');

  // dados vindos da API
  // shape: { user, totals, purchases: [{ purchaseId, productName, numbers[], winningTicket, instantPrizeName, paidAt, raffleId, totalPrice }] }
  const [data, setData] = useState(null);

  const handleSearch = async (e) => {
    e.preventDefault();
    setLoading(true);
    setSearched(true);
    setError('');
    setIsDialogOpen(false);

    const unmasked = phone.replace(/\D/g, '');

    try {
      // 1) resolve user
      const user = await findUserByPhone(unmasked);
      if (!user?.id) throw new Error('Usuário não encontrado.');

      // 2) busca números do usuário
      const result = await getMyNumbers(user.id);
      setData(result);

      if (!result?.purchases?.length) {
        toast({
          title: 'Nenhuma compra encontrada',
          description: 'Não encontramos compras para este telefone.',
        });
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
  const totals = data?.totals || { purchases: 0, numbers: 0, winners: 0 };

  return (
    <>
      <Helmet>
        <title>Meus Números - Portinho</title>
        <meta name="description" content="Consulte os números que você comprou em nossos sorteios." />
      </Helmet>

      <div className="min-h-screen bg-gray-900 flex flex-col items-center">
        <Header />
        <main className="w-full max-w-3xl px-4 py-8 flex-grow">
          {/* HEADER CARD */}
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.5 }}
            className="bg-gray-800 rounded-lg shadow-md p-6"
          >
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex items-center space-x-3">
                <ShoppingCart className="h-6 w-6 text-gray-400" />
                <h1 className="text-xl font-bold text-gray-100">Meus números</h1>
              </div>
              <Button onClick={() => setIsDialogOpen(true)} className="bg-black text-white hover:bg-gray-700">
                <Search className="mr-2 h-4 w-4" /> Buscar
              </Button>
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

          {/* RESULTADOS */}
          {!loading && searched && !error && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.15 }}
              className="mt-6 space-y-6"
            >
              {/* RESUMO */}
              <div className="bg-gray-800 rounded-lg p-4">
                <h2 className="text-gray-200 font-semibold mb-3">Resumo</h2>
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

              {/* LISTA DE COMPRAS */}
              {purchases.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-10 text-gray-400 text-center">
                  <Frown className="h-16 w-16 mb-4" />
                  <p className="text-xl font-semibold">Nenhuma compra encontrada.</p>
                  <p className="mt-2 text-sm">Verifique o número e tente novamente.</p>
                </div>
              ) : (
                purchases.map((p) => (
                  <div key={p.purchaseId} className="bg-gray-800 rounded-lg p-5">
                    {/* header do card */}
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
                        {p.paidAt && (
                          <div className="flex items-center gap-2 justify-start md:justify-end text-gray-300">
                            <CalendarClock className="h-4 w-4 text-gray-400" />
                            <span className="text-xs">{new Date(p.paidAt).toLocaleString('pt-BR')}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* números */}
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

                    {/* contemplado */}
                    {p.winningTicket && (
                      <div className="mt-4 bg-emerald-900/30 border border-emerald-700 rounded-lg p-3 text-emerald-300">
                        <div className="flex items-center gap-2 font-semibold">
                          <Trophy className="h-5 w-5 text-yellow-300" />
                          Você foi contemplado!
                        </div>
                        <div className="mt-1 text-sm">
                          Ticket:&nbsp;
                          <span className="font-mono text-emerald-200">{p.winningTicket}</span>
                          {p.instantPrizeName ? (
                            <>
                              &nbsp;— <span className="font-semibold">{p.instantPrizeName}</span>
                            </>
                          ) : null}
                        </div>
                      </div>
                    )}
                  </div>
                ))
              )}
            </motion.div>
          )}
        </main>
      </div>

      {/* BUSCA */}
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
