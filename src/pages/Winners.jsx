import React, { useState, useEffect } from 'react';
import Header from "@/components/shared/Header";

// Componente mock de `Helmet` para gerenciar metadados
const Helmet = ({ children }) => {
  return <div style={{ display: 'none' }}>{children}</div>;
};

// Componente mock de `motion` (de framer-motion) para animações.
// As animações são desativadas neste ambiente.
const motion = {
  div: ({ children, className, ...props }) => {
    return (
      <div className={className} {...props}>
        {children}
      </div>
    );
  },
};

// Componente mock de `Header`
const Header = () => (
<div className="min-h-screen bg-gray-900 flex flex-col">
  <Header />   {/* Header unificado */}
  <main className="flex-1">
    {/* conteúdo da página */}
  </main>
</div>
);

// Componente mock de `Button` (de shadcn/ui)
const Button = ({ children, className, onClick }) => {
  return (
    <button className={`p-2 rounded-md ${className}`} onClick={onClick}>
      {children}
    </button>
  );
};

// Hook mock de `useToast` (de shadcn/ui) para exibir mensagens
const useToast = () => {
  return {
    toast: ({ title, description }) => {
      console.log(`Toast: ${title} - ${description}`);
      const toastElement = document.createElement('div');
      toastElement.className = 'fixed bottom-4 right-4 bg-black text-white px-4 py-2 rounded-lg shadow-xl animate-fade-in-up z-50';
      toastElement.innerHTML = `<strong>${title}</strong><br/>${description}`;
      document.body.appendChild(toastElement);
      setTimeout(() => toastElement.remove(), 3000);
    }
  };
};

// Componente mock de `Trophy`, `Gift` e `Calendar` (de lucide-react)
const Trophy = (props) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" />
    <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" />
    <path d="M4 22h16" />
    <path d="M10 14.66V17c0 .55-.47 1-1 1H7s-2 1.5-2 2v2H20v-2c0-1-2-2-2-2h-3c-.53 0-1-.45-1-1v-2.34" />
    <path d="M8 9s1.5 2 2.5 2S13 9 13 9" />
    <path d="M15 9s1.5 2 2.5 2S20 9 20 9" />
    <path d="M12 11c1.67 0 3-1.33 3-3V5H9v3c0 1.67 1.33 3 3 3z" />
  </svg>
);

const Gift = (props) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="8" width="18" height="4" rx="1" />
    <path d="M12 8V22" />
    <path d="M17 12c0 1.5-1.5 3-3 3s-3-1.5-3-3" />
    <path d="M7 12c0 1.5 1.5 3 3 3s3-1.5 3-3" />
    <path d="M19 12V22" />
    <path d="M5 12V22" />
    <path d="M22 8.5V4.5A2.5 2.5 0 0 0 19.5 2H4.5A2.5 2.5 0 0 0 2 4.5V8.5" />
    <path d="M12 2v6" />
  </svg>
);

const Calendar = (props) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect width="18" height="18" x="3" y="4" rx="2" ry="2" />
    <line x1="16" x2="16" y1="2" y2="6" />
    <line x1="8" x2="8" y1="2" y2="6" />
    <line x1="3" x2="21" y1="10" y2="10" />
  </svg>
);

// Componente Principal
const Winners = () => {
  const { toast } = useToast();
  const [winners, setWinners] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // URL da sua API
  const API_URL = 'https://3wshbwd4ta.execute-api.sa-east-1.amazonaws.com/Prod';

  // Hook para buscar os dados da API
  useEffect(() => {
    const fetchWinners = async () => {
      try {
        const response = await fetch(`${API_URL}/winners`);
        if (!response.ok) {
          throw new Error('Erro ao buscar a lista de ganhadores.');
        }
        const data = await response.json();
        setWinners(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };
    fetchWinners();
  }, []);

  const handleFeatureClick = (e) => {
    e.preventDefault();
    toast({
      title: "🚧 Este recurso ainda não foi implementado—mas não se preocupe! Você pode solicitá-lo no seu próximo prompt! 🚀",
      description: "Funcionalidade em desenvolvimento."
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

          {isLoading ? (
            <div className="p-8 text-center text-gray-400">
              <p>Carregando ganhadores...</p>
            </div>
          ) : error ? (
            <div className="p-8 text-center text-red-400">
              <p>Erro ao carregar os ganhadores: {error}</p>
            </div>
          ) : winners.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {winners.map((winner, index) => (
                <motion.div
                  key={`${winner.id}-${index}`}
                  custom={index}
                  variants={cardVariants}
                  initial="hidden"
                  animate="visible"
                  className="bg-gray-800 rounded-xl shadow-lg overflow-hidden flex flex-col transform hover:-translate-y-2 transition-transform duration-300"
                >
                  <div className="h-48 overflow-hidden">
                    <img 
                      alt={`Prêmio ganho por ${winner.name}`} 
                      className="w-full h-full object-cover" 
                      src={winner.prizeImage || "https://placehold.co/400x300/4B5563/F3F4F6?text=Sem+Imagem"} 
                    />
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
                        <span>Sorteado em: {new Date(winner.date).toLocaleDateString('pt-BR')}</span>
                      </div>
                    </div>
                    <div className="mt-4 pt-4 border-t border-gray-700 flex-grow flex items-end">
                      <p className="text-xs text-gray-500">Bilhete Premiado:</p>
                      <p className="ml-2 px-3 py-1 bg-green-700 text-green-100 text-sm font-bold rounded-full">{winner.ticket}</p>
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
