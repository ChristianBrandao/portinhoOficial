
import React, { useState } from 'react';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import Header from '@/components/shared/Header';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { Calendar } from 'lucide-react';

const Raffles = () => {
    const { toast } = useToast();
    const [activeTab, setActiveTab] = useState('Ativos');

    const handleFeatureClick = () => {
        toast({
            title: "🚧 Este recurso ainda não foi implementado—mas não se preocupe! Você pode solicitá-lo no seu próximo prompt! 🚀"
        });
    };
    
    const tabs = ['Ativos', 'Concluídos', 'Em breve'];

    return (
        <>
            <Helmet>
                <title>Sorteios - Portinho</title>
                <meta name="description" content="Veja todos os sorteios ativos, concluídos e em breve." />
                <meta property="og:title" content="Sorteios - Portinho" />
                <meta property="og:description" content="Veja todos os sorteios ativos, concluídos e em breve." />
            </Helmet>

            <div className="min-h-screen bg-gray-900 flex flex-col items-center">
                <Header />
                <main className="w-full max-w-2xl px-4 py-8">
                    <motion.div
                        initial={{ opacity: 0, y: 50 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2, duration: 0.8 }}
                        className="bg-gray-800 rounded-lg shadow-md overflow-hidden">
                        
                        <div className="p-4 border-b border-gray-700 flex justify-between items-center">
                            <div className="flex items-baseline space-x-2">
                                <span className="text-orange-500">⚡</span>
                                <h1 className="text-lg font-bold text-gray-100">Prêmios</h1>
                            </div>
                            <Button onClick={handleFeatureClick} className="bg-black text-white hover:bg-gray-700">
                                Buscar
                                <Calendar className="ml-2 h-4 w-4" />
                            </Button>
                        </div>

                        <div className="p-4 border-b border-gray-700 flex items-center space-x-4">
                            <span className="text-sm font-semibold text-gray-400">LISTAR</span>
                            <div className="flex items-center space-x-2">
                                {tabs.map((tab) => (
                                    <button
                                        key={tab}
                                        onClick={() => setActiveTab(tab)}
                                        className={`px-4 py-1.5 rounded-md text-sm font-semibold transition-colors ${
                                            activeTab === tab
                                                ? 'bg-cyan-600 text-white'
                                                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                                        }`}
                                    >
                                        {tab}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {activeTab === 'Ativos' && (
                            <Link to="/prize/1">
                                <div className="p-4 cursor-pointer hover:bg-gray-700 transition-colors">
                                    <motion.div
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        transition={{ duration: 0.5 }}
                                        className="flex items-center space-x-4 group"
                                    >
                                        <div className="w-24 h-24 rounded-lg overflow-hidden flex-shrink-0">
                                            <img  alt="Motocicleta Honda ADV em destaque" className="w-full h-full object-cover" src="https://images.unsplash.com/photo-1698377073183-7e6d0a3f0c38" />
                                        </div>
                                        <div className="flex-1">
                                            <h2 className="text-lg font-bold text-gray-100 group-hover:text-cyan-400 transition-colors">Adv 2025 Okm</h2>
                                            <p className="text-gray-400 text-sm">Adv 2025 OKM + IPhone 16 + Capacete</p>
                                            <div className="mt-2 bg-green-500 text-white px-3 py-1 rounded-md text-xs font-semibold inline-block shadow-sm">
                                                Corre que está acabando!
                                            </div>
                                        </div>
                                    </motion.div>
                                </div>
                            </Link>
                        )}
                         {activeTab !== 'Ativos' && (
                            <div className="p-8 text-center text-gray-400">
                                <p>Não há sorteios {activeTab.toLowerCase()} no momento.</p>
                            </div>
                        )}
                    </motion.div>
                    
                    <div className="text-center mt-8">
                        <p className="text-sm text-gray-400">Desenvolvido por <a href="#" onClick={handleFeatureClick} className="text-cyan-400 font-bold">Sorteio.bet</a></p>
                    </div>
                </main>
            </div>
        </>
    );
};

export default Raffles;
