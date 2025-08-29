import React, { useState } from 'react';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import InputMask from 'react-input-mask';
import Header from '@/components/shared/Header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/use-toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { ShoppingCart, Search, AlertTriangle, Loader, Frown } from 'lucide-react';

// Importa as funções do seu arquivo api.js
import { findUserByPhone, getMyNumbers } from '@/services/api';

const MeusNumeros = () => {
    const { toast } = useToast();
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [phone, setPhone] = useState('');
    const [numbers, setNumbers] = useState([]);
    const [searched, setSearched] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [isError, setIsError] = useState(false);

    const handleSearch = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setSearched(true);
        setIsError(false);
        setIsDialogOpen(false); // Fecha o modal

        // Remove a máscara do telefone
        const unmaskedPhone = phone.replace(/\D/g, '');

        try {
            // Passo 1: Buscar o usuário usando a função do api.js
            const userData = await findUserByPhone(unmaskedPhone);

            if (!userData) {
                // Caso a função retorne null, o usuário não foi encontrado
                throw new Error('Usuário não encontrado.');
            }
            
            // Passo 2: Usar o ID do usuário para buscar seus números com a função do api.js
            const userNumbers = await getMyNumbers(userData.id);
            setNumbers(userNumbers);

            if (userNumbers.length === 0) {
                 toast({
                     title: 'Nenhuma compra encontrada',
                     description: 'Não encontramos compras para este número de telefone.',
                 });
            }

        } catch (error) {
            console.error("Erro na busca:", error);
            setIsError(true);
            setNumbers([]); // Limpa os números
            toast({
                title: 'Erro na busca',
                description: error.message || 'Não foi possível encontrar suas compras. Verifique o número e tente novamente.',
                variant: 'destructive',
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <>
            <Helmet>
                <title>Meus Números - Portinho</title>
                <meta name="description" content="Consulte os números que você comprou em nossos sorteios." />
                <meta property="og:title" content="Meus Números - Portinho" />
                <meta property="og:description" content="Consulte os números que você comprou em nossos sorteios." />
            </Helmet>

            <div className="min-h-screen bg-gray-900 flex flex-col items-center">
                <Header />
                <main className="w-full max-w-2xl px-4 py-8 flex-grow">
                    <motion.div
                        initial={{ opacity: 0, y: 50 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2, duration: 0.8 }}
                        className="bg-gray-800 rounded-lg shadow-md p-6"
                    >
                        <div className="flex justify-between items-center">
                            <div className="flex items-center space-x-3">
                                <ShoppingCart className="h-6 w-6 text-gray-400" />
                                <h1 className="text-xl font-bold text-gray-100">Meus números</h1>
                            </div>
                            <Button onClick={() => setIsDialogOpen(true)} className="bg-black text-white hover:bg-gray-700">
                                <Search className="mr-2 h-4 w-4" /> Buscar
                            </Button>
                        </div>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.4 }}
                        className="mt-6"
                    >
                        {/* Estado inicial: mostrar alerta para buscar */}
                        {!searched && (
                            <div className="bg-yellow-900 border-l-4 border-yellow-600 text-yellow-200 p-4 rounded-md flex items-center">
                                <AlertTriangle className="h-5 w-5 mr-3" />
                                <p>Clique em "Buscar" para localizar suas compras.</p>
                            </div>
                        )}
                        
                        {/* Estado de carregamento */}
                        {isLoading && (
                            <div className="flex justify-center items-center py-10 text-gray-400">
                                <Loader className="animate-spin mr-2 h-6 w-6" /> Buscando...
                            </div>
                        )}

                        {/* Resultados da busca */}
                        {!isLoading && searched && numbers.length > 0 && (
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                                {numbers.map((numberObj, index) => (
                                    <div 
                                        key={index}
                                        className="bg-gray-700 text-cyan-400 font-bold text-center py-4 rounded-lg text-lg"
                                    >
                                        {numberObj.lotteryNumber}
                                    </div>
                                ))}
                            </div>
                        )}
                        
                        {/* Nenhum resultado encontrado */}
                        {!isLoading && searched && numbers.length === 0 && !isError && (
                            <div className="flex flex-col items-center justify-center py-10 text-gray-400 text-center">
                                <Frown className="h-16 w-16 mb-4" />
                                <p className="text-xl font-semibold">Nenhuma compra encontrada.</p>
                                <p className="mt-2 text-sm">Verifique o número e tente novamente.</p>
                            </div>
                        )}

                        {/* Erro na busca */}
                        {!isLoading && isError && (
                            <div className="bg-red-900 border-l-4 border-red-600 text-red-200 p-4 rounded-md flex items-center">
                                <AlertTriangle className="h-5 w-5 mr-3" />
                                <p>Houve um problema na busca. Verifique sua conexão e o número informado.</p>
                            </div>
                        )}
                    </motion.div>

                    <div className="text-center mt-8">
                        <p className="text-sm text-gray-400">Desenvolvido por <a href="#" className="text-cyan-400 font-bold">Sorteio.bet</a></p>
                    </div>
                </main>
            </div>

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
                                {(inputProps) => <Input {...inputProps} id="phone" placeholder="(99) 99999-9999" required className="bg-gray-700 text-gray-100 border-gray-600 placeholder:text-gray-500" />}
                            </InputMask>
                        </div>
                        <DialogFooter>
                            <DialogClose asChild>
                                <Button type="button" variant="secondary" className="bg-gray-700 text-gray-100 hover:bg-gray-600">
                                    Cancelar
                                </Button>
                            </DialogClose>
                            <Button type="submit" className="bg-black text-white hover:bg-gray-700">Buscar</Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </>
    );
};

export default MeusNumeros;
