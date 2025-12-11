"use client";
import { useState, useEffect } from 'react';
import api, { API_URL } from '@/utils/api';
import io from 'socket.io-client';
import { useAuth } from '@/contexts/AuthContext';
import styles from '@/styles/components/BinaryBetting.module.scss';

let socket;

export default function BinaryBetting({ activeStock }) {
    const { refreshUser, user } = useAuth();
    const [amount, setAmount] = useState(100);
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState(null); // { type: 'WIN' | 'LOSS', amount: number }

    useEffect(() => {
        socket = io(API_URL); // Ensure this matches server URL

        socket.on('bet_result', (data) => {
            if (data.userId === user?.id) {
                setLoading(false);
                setResult({
                    type: data.result,
                    amount: data.result === 'WIN' ? data.payout : parseFloat(amount) // Show payout or lost amount
                });

                if (data.result === 'WIN') refreshUser();

                // Clear result after 3 seconds
                setTimeout(() => setResult(null), 3000);
            }
        });

        return () => {
            socket.disconnect();
        };
    }, [user, amount, refreshUser]);

    const placeBet = async (prediction) => {
        if (!activeStock || loading) return;
        setLoading(true);
        try {
            const res = await api.post('/bets', {
                stockId: activeStock.id,
                amount: parseFloat(amount),
                prediction
            });

            if (res.data.success) {
                // UI feedback handled by socket or verify here? 
                // Wait for socket result.
                refreshUser();
            }
        } catch (error) {
            console.error("Bet failed:", error);
            alert("Failed to place bet: " + (error.response?.data?.error || "Unknown"));
            setLoading(false);
        }
    };

    if (!activeStock) return null;

    return (
        <div className={styles.container}>
            <h3>Result in 5s (Next Candle)</h3>

            <div className={styles.inputGroup}>
                <label>Bet Amount</label>
                <div className={styles.inputWrapper}>
                    <span>$</span>
                    <input
                        type="number"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        min="10"
                    />
                </div>
            </div>

            <div className={styles.buttons}>
                <button
                    className={`${styles.btn} ${styles.green}`}
                    onClick={() => placeBet('GREEN')}
                    disabled={loading}
                >
                    {loading ? '...' : 'Green'}
                </button>
                <button
                    className={`${styles.btn} ${styles.red}`}
                    onClick={() => placeBet('RED')}
                    disabled={loading}
                >
                    {loading ? '...' : 'Red'}
                </button>
            </div>

            <div className={styles.info}>
                <span>Payout: 1.9x</span>
                <span>Wait: ~5s</span>
            </div>

            {result && (
                <div className={styles.resultOverlay}>
                    <div className={`${styles.content} ${result.type === 'WIN' ? styles.win : styles.loss}`}>
                        <div>{result.type === 'WIN' ? '🏆' : '💀'}</div>
                        <h2>{result.type === 'WIN' ? 'YOU WON' : 'YOU LOST'}</h2>
                        <p>{result.type === 'WIN' ? `+$${result.amount.toFixed(2)}` : `-$${result.amount}`}</p>
                    </div>
                </div>
            )}
        </div>
    );
}
