
import React from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import Header from '@/components/shared/Header';
import { useToast } from '@/components/ui/use-toast';
import { useAppContext } from '@/context/AppContext';

function Home() {
  const { toast } = useToast();
  const { prize } = useAppContext();

  const handleFeatureClick = () => {
    toast({
      title: "🚧 Este recurso ainda não foi implementado—mas não se preocupe! Você pode solicitá-lo no seu próximo prompt! 🚀"
    });
  };

  if (!prize) {
    return (
       <div className="min-h-screen bg-gray-900 flex items-center justify-center">
         <p className="text-white">Carregando prêmio...</p>
       </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>Portinho - Sorteios e Prêmios</title>
        <meta name="description" content="Participe dos nossos sorteios e ganhe prêmios incríveis como motocicletas 0km, iPhones e mais!" />
        <meta property="og:title" content="Portinho - Sorteios e Prêmios" />
        <meta property="og:description" content="Participe dos nossos sorteios e ganhe prêmios incríveis como motocicletas 0km, iPhones e mais!" />
      </Helmet>
      
      <div className="min-h-screen bg-gray-900 flex flex-col items-center">
        <Header />
        
        <main className="w-full max-w-2xl px-4 py-8">
          <motion.div 
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8, duration: 0.8 }}
            className="bg-gray-800 rounded-lg shadow-md overflow-hidden">
            
            <div className="p-4 border-b border-gray-700">
              <div className="flex items-baseline space-x-2">
                <span className="text-orange-500">⚡</span>
                <h1 className="text-lg font-bold text-gray-100">Prêmios</h1>
                <p className="text-sm text-gray-400">Escolha sua sorte</p>
              </div>
            </div>
            
            <Link to={`/prize/${prize.id}`}>
              <div className="p-0 cursor-pointer">
                <motion.div 
                  initial={{ scale: 0.95, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 1.0, duration: 0.6 }}
                  className="relative group">
                  <div className="relative">
                    <img  alt={prize.imageAlt} className="w-full h-auto object-cover" src="https://images.unsplash.com/photo-1585054393722-7876ed285ce4" />
                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-300"></div>
                    <motion.div 
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ delay: 1.3, duration: 0.4 }}
                      className="absolute bottom-4 left-4 bg-green-500 text-white px-3 py-1 rounded-md text-sm font-semibold shadow-lg">
                      Corre que está acabando!
                    </motion.div>
                  </div>

                  <div className="p-4 space-y-1">
                    <h2 className="text-xl font-bold text-gray-100 group-hover:text-cyan-400 transition-colors">{prize.name}</h2>
                    <p className="text-gray-400 text-base">{prize.description}</p>
                  </div>
                </motion.div>
              </div>
            </Link>
          </motion.div>
           <div className="text-center mt-8">
              <p className="text-sm text-gray-400">Desenvolvido por <a href="#" onClick={handleFeatureClick} className="text-cyan-400 font-bold">Sorteio.bet</a></p>
           </div>
        </main>
      </div>
    </>
  );
}

export default Home;
