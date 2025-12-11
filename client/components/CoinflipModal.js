"use client";
import { useState, useEffect } from 'react';
import styles from '@/styles/components/CoinflipModal.module.scss';
import api from '@/utils/api';
import { useAuth } from '@/contexts/AuthContext';
import { useHoldings } from '@/contexts/HoldingsContext';

import { useError } from '@/contexts/ErrorContext';

export default function CoinflipModal({ positionId, onClose }) {
    const [status, setStatus] = useState('CONFIRM'); // CONFIRM | SPINNING | RESULT
    const [result, setResult] = useState(null); // { type: 'WIN'|'LOSS', message: string }
    const { refreshUser } = useAuth();
    const { refetch } = useHoldings();
    const { showError } = useError();

    const handleFlip = async () => {
        setStatus('SPINNING');

        try {
            // Add slight delay to simulate tension before API call finishes
            const [res] = await Promise.all([
                api.post(`/positions/${positionId}/coinflip`),
                new Promise(resolve => setTimeout(resolve, 2000)) // Min 2s spin
            ]);

            const data = res.data;
            setResult({
                type: data.result,
                message: data.message
            });
            setStatus('RESULT');

            await refetch();
            await refreshUser();

        } catch (error) {
            console.error("Coinflip error:", error);
            showError(error.response?.data?.error || "Failed to flip", "Coin Stuck");
            onClose();
        }
    };

    return (
        <div className={styles.overlay} onClick={(e) => { if (status !== 'SPINNING') onClose(); }}>
            <div className={styles.modal} onClick={e => e.stopPropagation()}>

                {/* HEADER */}
                <div className={styles.title}>
                    {status === 'CONFIRM' && "High Stakes Coinflip"}
                    {status === 'SPINNING' && "Flipping..."}
                    {status === 'RESULT' && (result?.type === 'WIN' ? "YOU WON!" : "YOU LOST")}
                </div>

                <div className={styles.content}>
                    {/* COIN VISUAL */}
                    <div className={styles.coinWrapper}>
                        <div className={`${styles.coin} ${status === 'SPINNING' ? styles.spinning : ''}`}>
                            <div className={`${styles.side} ${styles.heads}`}>🪙</div>
                            <div className={`${styles.side} ${styles.tails}`}>💀</div>
                        </div>
                    </div>

                    {/* TEXT CONTENT */}
                    {status === 'CONFIRM' && (
                        <div className={styles.text}>
                            <p>50% Chance: <strong>Double Position</strong> (Free Leverage)</p>
                            <p style={{ color: '#f87171' }}>50% Chance: <strong>Total Loss</strong> (Position & Equity Burned)</p>
                            <p style={{ fontSize: '0.8rem', marginTop: '1rem', opacity: 0.6 }}>Are you feeling lucky?</p>
                        </div>
                    )}

                    {status === 'RESULT' && (
                        <div className={styles.text}>
                            <div className={`${styles.resultText} ${result?.type === 'WIN' ? styles.win : styles.loss}`}>
                                {result?.type === 'WIN' ? "+ 2x SIZE" : "LIQUIDATED"}
                            </div>
                            <p>{result?.message}</p>
                        </div>
                    )}

                    {/* ACTIONS */}
                    <div className={styles.actions}>
                        {status === 'CONFIRM' && (
                            <>
                                <button className={`${styles.btn} ${styles.cancel}`} onClick={onClose}>Run Away</button>
                                <button className={`${styles.btn} ${styles.confirm}`} onClick={handleFlip}>FLIP IT</button>
                            </>
                        )}

                        {status === 'RESULT' && (
                            <button className={`${styles.btn} ${styles.confirm}`} onClick={onClose}>
                                {result?.type === 'WIN' ? "Collect" : "Accept Fate"}
                            </button>
                        )}
                    </div>

                </div>
            </div>
        </div>
    );
}
