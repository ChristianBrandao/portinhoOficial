import React, { createContext, useState, useEffect, useContext, useCallback } from 'react';
import { getRaffles, getInstantPrizes } from '@/services/api';

const AppContext = createContext();

export const AppProvider = ({ children }) => {
    const [prize, setPrize] = useState(null);
    const [allWinners, setAllWinners] = useState([]);
    const [loading, setLoading] = useState(true);

    const loadData = useCallback(async () => {
        setLoading(true);
        try {
            // Passo 1: Busca os detalhes do sorteio principal.
            const raffleResponse = await getRaffles();

            let instantPrizes = [];
            // Passo 2: Se o sorteio foi encontrado e tem um ID, busca os prêmios instantâneos.
            if (raffleResponse && raffleResponse.id) {
                instantPrizes = await getInstantPrizes(raffleResponse.id);
            }

            // Passo 3: Adiciona a lista de prêmios ao objeto do sorteio.
            setPrize({
                ...raffleResponse,
                winners: instantPrizes
            });

        } catch (error) {
            console.error("Falha ao carregar dados do aplicativo", error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadData();
    }, [loadData]);

    const awardPrize = useCallback((ticketId, winnerName) => {
        setPrize(currentPrize => {
            const updatedWinners = currentPrize.winners.map(w => {
                if (w.id === ticketId) {
                    return { ...w, awarded: true, name: winnerName, date: new Date().toLocaleDateString('pt-BR') };
                }
                return w;
            });
            return { ...currentPrize, winners: updatedWinners };
        });
        // Recarrega os dados para pegar a última versão do backend
        loadData(); 
    }, [loadData]);

    const findWinnerByTicket = useCallback((ticketId) => {
        if(!prize) return null;
        return prize.winners.find(w => w.id === ticketId);
    }, [prize]);

    const value = {
        prize,
        // allWinners foi removido, a lista de vencedores está no objeto 'prize'
        loading,
        awardPrize,
        findWinnerByTicket,
        reload: loadData,
    };

    return (
        <AppContext.Provider value={value}>
            {children}
        </AppContext.Provider>
    );
};

export const useAppContext = () => {
    return useContext(AppContext);
};
