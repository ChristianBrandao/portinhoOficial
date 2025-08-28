import React, { createContext, useState, useEffect, useContext, useCallback } from 'react';
import { getPrizeData, getWinners } from '@/services/api';

const AppContext = createContext();

export const AppProvider = ({ children }) => {
    const [prize, setPrize] = useState(null);
    const [allWinners, setAllWinners] = useState([]);
    const [loading, setLoading] = useState(true);

    const loadData = useCallback(async () => {
        setLoading(true);
        try {
            const [prizeResponse, winnersResponse] = await Promise.all([
                getPrizeData(),
                getWinners()
            ]);
            setPrize(prizeResponse);
            setAllWinners(winnersResponse);
        } catch (error) {
            console.error("Failed to load app data", error);
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
        loadData(); 
    }, [loadData]);

    const findWinnerByTicket = useCallback((ticketId) => {
        if(!prize) return null;
        return prize.winners.find(w => w.id === ticketId);
    }, [prize]);

    const value = {
        prize,
        allWinners,
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