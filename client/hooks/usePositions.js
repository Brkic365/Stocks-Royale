"use client";
import { useState, useEffect } from 'react';
import axios from 'axios';
import { getAuthHeader } from '@/utils/auth';
import { useAuth } from '@/contexts/AuthContext';
import useSocket from './useSocket';

const API_URL = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000') + '/api';

export default function usePositions() {
    const [positions, setPositions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const { updateUser } = useAuth();
    const socket = useSocket();

    const fetchPositions = async () => {
        try {
            const res = await axios.get(`${API_URL}/positions`, {
                headers: getAuthHeader()
            });
            setPositions(res.data);
            setLoading(false);
        } catch (err) {
            console.error('Error fetching positions:', err);
            setError(err);
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPositions();
    }, []);

    const openPosition = async (stockSymbol, type, amount, leverage, stopLoss, takeProfit) => {
        try {
            const res = await axios.post(`${API_URL}/positions`, {
                stockSymbol,
                type,
                amount,
                leverage,
                stopLoss,
                takeProfit
            }, {
                headers: getAuthHeader()
            });

            // Update user balance
            updateUser({ balance: res.data.newBalance });

            // Refresh positions
            await fetchPositions();

            return { success: true, position: res.data.position };
        } catch (err) {
            return {
                success: false,
                error: err.response?.data?.error || 'Failed to open position'
            };
        }
    };

    const closePosition = async (positionId) => {
        try {
            const res = await axios.post(`${API_URL}/positions/${positionId}/close`, {}, {
                headers: getAuthHeader()
            });

            // Update user balance
            updateUser({ balance: res.data.newBalance });

            // Refresh positions
            await fetchPositions();

            return { success: true, pnl: res.data.pnl };
        } catch (err) {
            return {
                success: false,
                error: err.response?.data?.error || 'Failed to close position'
            };
        }
    };

    // Listen for position updates via socket
    useEffect(() => {
        if (!socket) return;

        const handlePositionUpdate = ({ positionId, currentPrice, pnl }) => {
            setPositions(prev =>
                prev.map(pos =>
                    pos.id === positionId
                        ? { ...pos, current_price: currentPrice, pnl }
                        : pos
                )
            );
        };

        const handlePositionClosed = ({ positionId, pnl, newBalance }) => {
            setPositions(prev => prev.filter(pos => pos.id !== positionId));
            updateUser({ balance: newBalance });
        };

        socket.on('position_update', handlePositionUpdate);
        socket.on('position_closed', handlePositionClosed);

        return () => {
            socket.off('position_update', handlePositionUpdate);
            socket.off('position_closed', handlePositionClosed);
        };
    }, [socket, updateUser]);

    return {
        positions,
        loading,
        error,
        openPosition,
        closePosition,
        refreshPositions: fetchPositions
    };
}
