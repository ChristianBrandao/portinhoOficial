
import React, { useState } from 'react';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import InputMask from 'react-input-mask';
import Header from '@/components/shared/Header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/use-toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { ShoppingCart, Search, AlertTriangle } from 'lucide-react';

const MyNumbers = () => {
    const { toast } = useToast();
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [phone, setPhone] = useState('');
    const [searched, setSearched] = useState(false);
    const [purchases, setPurchases] = useState([]);

    const handleFeatureClick = (e) => {
        e.preventDefault();
        toast({
            title: "🚧 Este recurso ainda não foi implementado—mas não se preocupe! Você pode solicitá-lo no seu próximo prompt! 🚀"
        });
    };

    const handleSearch = (e) => {
        e.preventDefault();
        // For demonstration, we'll use mock data.
        // In a real app, you would fetch this from your backend (e.g., Supabase).
        const MOCK_DATA = {
            '(99) 99999-9999': [
                { id: 1, title: 'Adv 2025 Okm', date: '25/08/2025', numbers: ['12345', '67890'], status: 'pago' },
                { id: 2, title: 'iPhone 16 Pro', date: '24/08/2025', numbers: ['54321'], status: 'pendente' }
            ]
        };

        const userPurchases = MOCK_DATA[phone] || [];
        setPurchases(userPurchases);
        setSearched(true);
        setIsDialogOpen(false);
        if (userPurchases.length === 0) {
            toast({
                title: 'Nenhuma compra encontrada',
                description: 'Não encontramos compras para este número de telefone.',
                variant: 'destructive'
            });
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
                <main className="w-full max-w-2xl px-4 py-8">
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
                        {!searched && (
                            <div className="bg-yellow-900 border-l-4 border-yellow-600 text-yellow-200 p-4 rounded-md flex items-center">
                                <AlertTriangle className="h-5 w-5 mr-3" />
                                <p>Clique em buscar para localizar suas compras</p>
                            </div>
                        )}

                        {searched && purchases.length > 0 && (
                            <div className="space-y-4">
                                {purchases.map(purchase => (
                                    <div key={purchase.id} className="bg-gray-800 rounded-lg shadow p-4">
                                        <h2 className="font-bold text-lg text-gray-100">{purchase.title}</h2>
                                        <p className="text-sm text-gray-400">Comprado em: {purchase.date}</p>
                                        <div className="mt-2">
                                            <span className={`px-2 py-1 text-xs font-semibold rounded-full ${purchase.status === 'pago' ? 'bg-green-700 text-green-100' : 'bg-yellow-700 text-yellow-100'}`}>
                                                {purchase.status.charAt(0).toUpperCase() + purchase.status.slice(1)}
                                            </span>
                                        </div>
                                        <p className="mt-3 font-semibold text-gray-100">Seus números:</p>
                                        <div className="flex flex-wrap gap-2 mt-2">
                                            {purchase.numbers.map(num => (
                                                <span key={num} className="bg-blue-700 text-blue-100 px-3 py-1 rounded-md font-mono text-sm">{num}</span>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                        
                        {searched && purchases.length === 0 && (
                            <div className="bg-red-900 border-l-4 border-red-600 text-red-200 p-4 rounded-md flex items-center">
                                <AlertTriangle className="h-5 w-5 mr-3" />
                                <p>Nenhum resultado encontrado. Tente outro número.</p>
                            </div>
                        )}

                    </motion.div>

                    <div className="text-center mt-8">
                        <p className="text-sm text-gray-400">Desenvolvido por <a href="#" onClick={handleFeatureClick} className="text-cyan-400 font-bold">Sorteio.bet</a></p>
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

export default MyNumbers;
