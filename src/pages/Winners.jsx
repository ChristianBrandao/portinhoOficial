import React, { useState, useEffect } from 'react';
import Header from "@/components/shared/Header"; // usa o Header unificado

// Componente mock de `Helmet`
const Helmet = ({ children }) => (
  <div style={{ display: 'none' }}>{children}</div>
);

// Mock leve para framer-motion (desativa animações no mock)
const motion = {
  div: ({ children, className, ...props }) => (
    <div className={className} {...props}>{children}</div>
  ),
};

// Componente mock de `Button`
const Button = ({ children, className, onClick }) => (
  <button className={`p-2 rounded-md ${className}`} onClick={onClick}>
    {children}
  </button>
);

// Hook mock de useToast
const useToast = () => ({
  toast: ({ title, description }) => {
    console.log(`Toast: ${title} - ${description}`);
    const el = document.createElement('div');
    el.className = 'fixed bottom-4 right-4 bg-black text-white px-4 py-2 rounded-lg shadow-xl animate-fade-in-up z-50';
    el.innerHTML = `<strong>${title}</strong><br/>${description}`;
    document.body.appendChild(el);
    setTimeout(() => el.remove(), 3000);
  }
});

// Ícones simplificados
const Trophy = (props) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
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
  <svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
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
  <svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect width="18" height="18" x="3" y="4" rx="2" ry="2" />
    <line x1="16" x2="16" y1="2" y2="6" />
    <line x1="8" x2="8" y1="2" y2="6" />
    <line x1="3" x2="21" y1="10" y2="10" />
  </svg>
);

const Winners = () => {
  const { toast } = useToast();
  const [winners, setWinners] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const API_URL = 'https://3wshbwd4ta.execute-api.sa-east-1.amazonaws.com/Prod';

  useEffect(() => {
    const fetchWinners = async () => {
      try {
        const response = await fetch(`${API_URL}/winners`);
        if (!response.ok) throw new Error('Erro ao buscar a lista de ganhadores.');
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
      title: "🚧 Este recurso ainda não foi implementado 🚀",
      description: "Funcionalidade em desenvolvimento."
    });
  };

  return (
    <>
      <Helmet>
        <title>Ganhadores - Portinho</title>
        <meta name="description" content="Confira a lista de todos os ganhadores dos nossos sorteios." />
      </Helmet>

      <div className="min-h-screen bg-gray-900 flex flex-col items-center">
        <Header /> {/* ✅ usa o Header real */}
        <main className="w-full max-w-5xl px-4 py-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center mb-10"
          >
            <Trophy className="mx-auto h-14 w-14 text-yellow-500" />
            <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-100 mt-4">Nossos Ganhadores</h1>
            <p className="text-gray-400 mt-2">Veja quem já teve a sorte grande!</p>
          </motion.div>

          {isLoading ? (
            <div className="p-8 text-center text-gray-400">Carregando ganhadores...</div>
          ) : error ? (
            <div className="p-8 text-center text-red-400">Erro ao carregar os ganhadores: {error}</div>
          ) : winners.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {winners.map((winner, index) => (
                <motion.div
                  key={`${winner.id}-${index}`}
                  className="bg-gray-800 rounded-xl shadow-lg overflow-hidden flex flex-col hover:-translate-y-1 transition-transform"
                >
                  <div className="h-48 bg-gray-700 overflow-hidden">
                    <img
                      alt={`Prêmio ganho por ${winner.name}`}
                      className="w-full h-full object-cover"
                      src={winner.prizeImage || "https://placehold.co/400x300/1E293B/F8FAFC?text=Prêmio"}
                    />
                  </div>
                  <div className="p-5 flex flex-col flex-grow">
                    <h2 className="text-lg font-bold text-white">{winner.name}</h2>
                    <div className="mt-2 space-y-2 text-sm text-gray-300">
                      <div className="flex items-center gap-2">
                        <Gift size={16} className="text-cyan-400" />
                        <span className="font-medium">{winner.prize}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar size={16} className="text-cyan-400" />
                        <span>Sorteado em {new Date(winner.date).toLocaleDateString('pt-BR')}</span>
                      </div>
                    </div>
                    <div className="mt-4 pt-4 border-t border-gray-700 flex items-center justify-between">
                      <span className="text-xs text-gray-400">Bilhete:</span>
                      <span className="ml-2 px-3 py-1 bg-green-600 text-white text-sm font-bold rounded-full shadow">
                        {winner.ticket}
                      </span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="text-center text-gray-500 py-10">Ainda não tivemos ganhadores. Seja o primeiro!</div>
          )}

          <div className="text-center mt-12">
            <p className="text-sm text-gray-400">
              Desenvolvido por{" "}
              <a href="#" onClick={handleFeatureClick} className="text-cyan-400 font-bold">
                Sorteio.bet
              </a>
            </p>
          </div>
        </main>
      </div>
    </>
  );
};

export default Winners;
