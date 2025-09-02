// src/pages/Winners.jsx
import React, { useState, useEffect } from 'react';
import Header from "@/components/shared/Header";

// Mocks leves (mantive para seu ambiente atual)
const Helmet = ({ children }) => <div style={{ display: 'none' }}>{children}</div>;
const motion = { div: ({ children, className, ...props }) => <div className={className} {...props}>{children}</div> };
const Button = ({ children, className, onClick }) => <button className={`p-2 rounded-md ${className}`} onClick={onClick}>{children}</button>;

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

// Ícones
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

// Helpers de formatação
const formatBRL = (val) => {
  if (val == null) return '-';
  // Tenta converter string "200", "200.00", "R$ 200", etc. em número
  const num = typeof val === 'number'
    ? val
    : Number(String(val).replace(/[^\d,-]/g, '').replace(',', '.'));
  if (!isFinite(num)) return String(val);
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(num);
};
const formatDateBR = (d) => {
  const dt = d ? new Date(d) : null;
  if (!dt || isNaN(dt.getTime())) return '-';
  return dt.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' });
};

const Winners = () => {
  const { toast } = useToast();
  const [winners, setWinners] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const API_URL = 'https://3wshbwd4ta.execute-api.sa-east-1.amazonaws.com/Prod';

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(`${API_URL}/winners`);
        if (!res.ok) throw new Error('Erro ao buscar a lista de ganhadores.');
        const data = await res.json();
        setWinners(Array.isArray(data) ? data : []);
      } catch (err) {
        setError(err.message || 'Falha ao carregar.');
      } finally {
        setIsLoading(false);
      }
    })();
  }, []);

  const handleFeatureClick = (e) => {
    e.preventDefault();
    toast({
      title: "🚧 Em breve",
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
        <Header />

        <main className="w-full max-w-6xl px-4 py-8">
          <motion.div className="text-center mb-8">
            <Trophy className="mx-auto h-12 w-12 text-yellow-500" />
            <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-100 mt-3">Nossos Ganhadores</h1>
            <p className="text-gray-400 mt-1 text-sm">Veja quem já teve a sorte grande!</p>
          </motion.div>

          {isLoading ? (
            <div className="p-8 text-center text-gray-400">Carregando ganhadores...</div>
          ) : error ? (
            <div className="p-8 text-center text-red-400">Erro ao carregar: {error}</div>
          ) : winners.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {winners.map((w, idx) => {
                const name = w.name || 'Ganhador';
                const prize = formatBRL(w.prize);          // garante “R$ 200,00” numa linha
                const date  = formatDateBR(w.date);
                const ticket = w.ticket || '—';

                return (
                  <motion.div
                    key={`${w.id || ticket}-${idx}`}
                    className="bg-gray-800 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all"
                  >
                    {/* Imagem com proporção fixa para cartões menores */}
                    <div className="relative w-full aspect-[16/9] bg-gray-700">
                      <img
                        alt={`Prêmio ganho por ${name}`}
                        className="absolute inset-0 w-full h-full object-cover"
                        src={w.prizeImage || "https://placehold.co/640x360/1E293B/F8FAFC?text=Pr%C3%AAmio"}
                        loading="lazy"
                      />
                    </div>

                    <div className="p-4">
                      {/* Linha 1: Nome + Ticket */}
                      <div className="flex items-center justify-between gap-3">
                        <h2 className="text-white font-bold uppercase tracking-wide text-base sm:text-lg truncate">
                          {name}
                        </h2>
                        <span className="px-2 py-0.5 bg-green-600 text-white text-xs font-bold rounded-full font-mono whitespace-nowrap">
                          {ticket}
                        </span>
                      </div>

                      {/* Linha 2: Prêmio + Data (compacto) */}
                      <div className="mt-3 grid grid-cols-2 gap-2 text-[13px] sm:text-sm">
                        <div className="flex items-center gap-2 text-gray-300 min-w-0">
                          <Gift className="h-4 w-4 text-cyan-400 flex-shrink-0" />
                          <span className="truncate whitespace-nowrap">{prize}</span>
                        </div>
                        <div className="flex items-center gap-2 text-gray-300 justify-end sm:justify-start min-w-0">
                          <Calendar className="h-4 w-4 text-cyan-400 flex-shrink-0" />
                          <span className="truncate">{date}</span>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          ) : (
            <div className="text-center text-gray-500 py-10">Ainda não tivemos ganhadores. Seja o primeiro!</div>
          )}

          <div className="text-center mt-8">
            <p className="text-xs text-gray-500">
              Desenvolvido por{" "}
              <a href="#" onClick={handleFeatureClick} className="text-cyan-400 font-bold">
                toprifa.bet
              </a>
            </p>
          </div>
        </main>
      </div>
    </>
  );
};

export default Winners;
