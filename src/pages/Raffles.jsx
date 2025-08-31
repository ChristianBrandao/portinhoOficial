import React, { useState, useEffect } from 'react';

/* ============ mocks (Helmet, motion, Link, Button, Toast, Icon) ============ */
const Helmet = ({ children }) => <div style={{ display: 'none' }}>{children}</div>;

const motion = {
  div: ({ children, className, ...props }) => (
    <div className={className} {...props}>{children}</div>
  ),
};

const Link = ({ to, children, className, ...props }) => {
  const handleLinkClick = (e) => {
    e.preventDefault();
    console.log(`Navegação para: ${to}`);
  };
  return (
    <a href={to} onClick={handleLinkClick} className={className} {...props}>
      {children}
    </a>
  );
};

const Button = ({ children, className, onClick }) => (
  <button className={`p-2 rounded-md ${className}`} onClick={onClick}>
    {children}
  </button>
);

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

const Calendar = (props) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24"
       viewBox="0 0 24 24" fill="none" stroke="currentColor"
       strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect width="18" height="18" x="3" y="4" rx="2" ry="2" />
    <line x1="16" x2="16" y1="2" y2="6" />
    <line x1="8" x2="8" y1="2" y2="6" />
    <line x1="3" x2="21" y1="10" y2="10" />
  </svg>
);

const Header = () => (
  <header className="w-full bg-gray-950 p-4 border-b border-gray-800 text-white">
    <div className="flex justify-between items-center max-w-2xl mx-auto">
      <h1 className="text-xl font-bold">Portinho</h1>
      <nav>
        <Button className="bg-gray-800 hover:bg-gray-700">Login</Button>
      </nav>
    </div>
  </header>
);
/* ============================ helpers ============================ */
const norm = (s = '') =>
  s.toString().toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim();

const normalizeStatus = (s = '') => {
  const x = norm(s);
  if (['active', 'ativo', 'ativa'].includes(x)) return 'active';
  if (['completed', 'concluido', 'concluida', 'concluidos', 'concluidas'].includes(x)) return 'completed';
  if (['upcoming', 'em breve', 'embreve', 'breve', 'pendente'].includes(x)) return 'upcoming';
  return 'unknown';
};

/* ============================ componente ============================ */
const Raffles = () => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('Ativos');
  const [raffles, setRaffles] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const API_URL = 'https://3wshbwd4ta.execute-api.sa-east-1.amazonaws.com/Prod';

  useEffect(() => {
    const fetchRaffles = async () => {
      try {
        const response = await fetch(`${API_URL}/raffles`);
        if (!response.ok) throw new Error('Erro ao buscar dados dos sorteios.');

        const data = await response.json();
        console.log('API /raffles ->', data);

        // Objeto único -> array; arrays conhecidos; senão []
        let list =
          Array.isArray(data) ? data :
          Array.isArray(data?.items) ? data.items :
          Array.isArray(data?.data) ? data.data :
          Array.isArray(data?.raffles) ? data.raffles :
          (data && typeof data === 'object') ? [data] : [];

        // Mapeia campos e normaliza status/image/title/id
        list = list.map((r, idx) => ({
          ...r,
          id: r.id || r.slug || r._id || `raffle-${idx}`,
          title: r.title || r.name || 'Sorteio',
          description: r.description || '',
          imageUrl: r.imageUrl || r.imageURL || r.image || '',
          status: normalizeStatus(r.status),
        }));

        console.table(list.map(x => ({ id: x.id, title: x.title, status: x.status })));
        setRaffles(list);
      } catch (err) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };
    fetchRaffles();
  }, []);

  const handleFeatureClick = (e) => {
    e.preventDefault();
    toast({
      title: '🚧 Este recurso ainda não foi implementado',
      description: 'Funcionalidade em desenvolvimento.',
    });
  };

  const tabs = ['Ativos', 'Concluídos', 'Em breve'];

  // Agora o status já vem normalizado (active/completed/upcoming)
  const list = Array.isArray(raffles) ? raffles : [];
  const filteredRaffles = list.filter((raffle) => {
    if (activeTab === 'Ativos') return raffle.status === 'active';
    if (activeTab === 'Concluídos') return raffle.status === 'completed';
    if (activeTab === 'Em breve') return raffle.status === 'upcoming';
    return false;
  });

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
            className="bg-gray-800 rounded-lg shadow-md overflow-hidden"
          >
            <div className="p-4 border-b border-gray-700 flex items-center">
              <div className="flex items-baseline space-x-2">
                <span className="text-orange-500">⚡</span>
                <h1 className="text-lg font-bold text-gray-100">Prêmios</h1>
              </div>
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

            {isLoading ? (
              <div className="p-8 text-center text-gray-400">Carregando sorteios...</div>
            ) : error ? (
              <div className="p-8 text-center text-red-400">Erro ao carregar os sorteios: {error}</div>
            ) : filteredRaffles.length > 0 ? (
              filteredRaffles.map((raffle) => (
                <Link key={raffle.id} to={`/prize/${raffle.id}`}>
                  <div className="p-4 cursor-pointer hover:bg-gray-700 transition-colors">
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.5 }}
                      className="flex items-center space-x-4 group"
                    >
                      <div className="w-24 h-24 rounded-lg overflow-hidden flex-shrink-0">
                        <img
                          alt={raffle.title}
                          className="w-full h-full object-cover"
                          src={raffle.imageUrl || 'https://placehold.co/96x96/4B5563/F3F4F6?text=Sem+Imagem'}
                        />
                      </div>
                      <div className="flex-1">
                        <h2 className="text-lg font-bold text-gray-100 group-hover:text-cyan-400 transition-colors">
                          {raffle.title}
                        </h2>
                        <p className="text-gray-400 text-sm">{raffle.description}</p>
                        {raffle.status === 'active' && (
                          <div className="mt-2 bg-green-500 text-white px-3 py-1 rounded-md text-xs font-semibold inline-block shadow-sm">
                            Corre que está acabando!
                          </div>
                        )}
                      </div>
                    </motion.div>
                  </div>
                </Link>
              ))
            ) : (
              <div className="p-8 text-center text-gray-400">
                <p>Não há sorteios {activeTab.toLowerCase()} no momento.</p>
              </div>
            )}
          </motion.div>

          <div className="text-center mt-8">
            <p className="text-sm text-gray-400">
              Desenvolvido por{' '}
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

export default Raffles;
