
import React from 'react';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import Header from '@/components/shared/Header';
import { Trophy, Gift, Calendar } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { useAppContext } from '@/context/AppContext';

const Winners = () => {
    const { toast } = useToast();
    const { allWinners } = useAppContext();

    const handleFeatureClick = (e) => {
        e.preventDefault();
        toast({
            title: "🚧 Este recurso ainda não foi implementado—mas não se preocupe! Você pode solicitá-lo no seu próximo prompt! 🚀"
        });
    };
    
    const cardVariants = {
        hidden: { opacity: 0, y: 50 },
        visible: i => ({
            opacity: 1,
            y: 0,
            transition: {
                delay: i * 0.1,
                duration: 0.5,
                ease: "easeOut"
            }
        })
    };

    return (
        <>
            <Helmet>
                <title>Ganhadores - Portinho</title>
                <meta name="description" content="Confira a lista de todos os ganhadores dos nossos sorteios." />
                <meta property="og:title" content="Ganhadores - Portinho" />
                <meta property="og:description" content="Confira a lista de todos os ganhadores dos nossos sorteios." />
            </Helmet>

            <div className="min-h-screen bg-gray-900 flex flex-col items-center">
                <Header />
                <main className="w-full max-w-4xl px-4 py-8">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                        className="text-center mb-8"
                    >
                        <Trophy className="mx-auto h-12 w-12 text-yellow-500" />
                        <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-100 mt-4">Nossos Ganhadores</h1>
                        <p className="text-gray-400 mt-2">Veja quem já teve a sorte grande!</p>
                    </motion.div>

                    {allWinners.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {allWinners.map((winner, index) => (
                                <motion.div
                                    key={`${winner.ticket}-${index}`}
                                    custom={index}
                                    variants={cardVariants}
                                    initial="hidden"
                                    animate="visible"
                                    className="bg-gray-800 rounded-xl shadow-lg overflow-hidden flex flex-col transform hover:-translate-y-2 transition-transform duration-300"
                                >
                                    <div className="h-48 overflow-hidden">
                                        <img  alt={`Prêmio ganho por ${winner.name}`} className="w-full h-full object-cover" src="https://images.unsplash.com/photo-1658504140972-7af3e80d35f1" />
                                    </div>
                                    <div className="p-4 flex flex-col flex-grow">
                                        <h2 className="text-xl font-bold text-gray-100">{winner.name}</h2>
                                        <div className="mt-2 space-y-2 text-sm text-gray-400">
                                            <div className="flex items-center gap-2">
                                                <Gift size={16} className="text-cyan-500" />
                                                <span>{winner.prize}</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Calendar size={16} className="text-cyan-500" />
                                                <span>Sorteado em: {winner.date}</span>
                                            </div>
                                        </div>
                                        <div className="mt-4 pt-4 border-t border-gray-700 flex-grow flex items-end">
                                            <p className="text-xs text-gray-500">Bilhete Premiado:</p>
                                            <p className="ml-2 px-3 py-1 bg-green-700 text-green-100 text-sm font-bold rounded-full">{winner.id}</p>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    ) : (
                         <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="text-center text-gray-500 py-10"
                         >
                            <p>Ainda não tivemos ganhadores. Seja o primeiro!</p>
                         </motion.div>
                    )}


                    <div className="text-center mt-12">
                        <p className="text-sm text-gray-400">Desenvolvido por <a href="#" onClick={handleFeatureClick} className="text-cyan-400 font-bold">Sorteio.bet</a></p>
                    </div>
                </main>
            </div>
        </>
    );
};

export default Winners;
