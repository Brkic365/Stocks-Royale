"use client";
import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '@/utils/api';
import { getToken } from '@/utils/auth';
import useStocks from '@/hooks/useStocks';

const HoldingsContext = createContext();

export function HoldingsProvider({ children }) {
    const [holdings, setHoldings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const { stocks } = useStocks();

    const fetchHoldings = useCallback(async () => {
        try {
            const token = getToken();
            if (!token) {
                setLoading(false);
                setHoldings([]);
                return;
            }

            const res = await api.get('/positions');
            const rawPositions = res.data;

            // Aggregate positions by stock symbol
            const aggregated = {};

            rawPositions.forEach(pos => {
                const stock = stocks.find(s => s.id === pos.stock_id);
                // Only aggregate if position is OPEN
                if (pos.status !== 'OPEN') return;

                if (!aggregated[pos.stock_id]) {
                    aggregated[pos.stock_id] = {
                        id: pos.id,
                        stock_id: pos.stock_id,
                        stock: stock,
                        amount: 0, // Total shares
                        totalCost: 0,
                        investedCapital: 0, // Real Margin
                        type: pos.type,
                        leverage: pos.leverage // preserve leverage (of first pos)
                    };
                }

                aggregated[pos.stock_id].amount += parseFloat(pos.amount);
                aggregated[pos.stock_id].totalCost += (parseFloat(pos.amount) * parseFloat(pos.entry_price));
                aggregated[pos.stock_id].investedCapital += (parseFloat(pos.amount) * parseFloat(pos.entry_price)) / (parseFloat(pos.leverage) || 1);
            });

            const holdingsList = Object.values(aggregated).map(h => ({
                ...h,
                avg_price: h.amount > 0 ? h.totalCost / h.amount : 0,
            }));

            setHoldings(holdingsList);
        } catch (err) {
            console.error("Error fetching holdings:", err);
            setError(err);
        } finally {
            setLoading(false);
        }
    }, [stocks]);

    useEffect(() => {
        // Fetch only when stocks are available to link data
        if (stocks.length > 0) {
            fetchHoldings();
        } else {
            // If no stocks yet, we might still want to fetch raw positions but we need stocks for display...
            // Let's rely on useStocks loading first.
        }
    }, [stocks, fetchHoldings]);

    return (
        <HoldingsContext.Provider value={{ holdings, loading, error, refetch: fetchHoldings }}>
            {children}
        </HoldingsContext.Provider>
    );
}

export function useHoldings() {
    const context = useContext(HoldingsContext);
    if (!context) {
        throw new Error('useHoldings must be used within HoldingsProvider');
    }
    return context;
}
