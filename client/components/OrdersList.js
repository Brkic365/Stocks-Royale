"use client";
import styles from '@/styles/components/OrdersList.module.scss';
import { useHoldings } from '@/contexts/HoldingsContext';
import { useAuth } from '@/contexts/AuthContext';
import useStocks from '@/hooks/useStocks'; // Need live prices
import api from '@/utils/api';
import { useState } from 'react';
import CoinflipModal from './CoinflipModal';

export default function OrdersList() {
    const { holdings, loading, refetch } = useHoldings();
    const { refreshUser } = useAuth();
    const { stocks } = useStocks(); // Get live prices
    const [coinflipPositionId, setCoinflipPositionId] = useState(null);
    const [closingId, setClosingId] = useState(null);

    const handleClose = async (id) => {
        if (closingId) return;
        setClosingId(id);
        try {
            await api.post(`/positions/${id}/close`);
            await refetch();
            await refreshUser();
        } catch (error) {
            console.error("Failed to close position:", error);
            alert("Failed to close position");
        } finally {
            setClosingId(null);
        }
    };

    // Removed old handleCoinflip logic in favor of Modal

    // Helper to render the main content logic
    const renderContent = () => {
        if (loading) return <div className={styles.loading}>Loading orders...</div>;

        if (!holdings || holdings.length === 0) {
            return (
                <div className={styles.container}>
                    <h3>Current Orders</h3>
                    <div className={styles.empty}>No active orders</div>
                </div>
            );
        }

        return (
            <div className={styles.container}>
                <h3>Current Orders</h3>
                <div className={styles.list}>
                    {holdings.map((pos) => {
                        const stock = stocks.find(s => s.symbol === pos.stock?.symbol);
                        const currentPrice = stock?.current_price || pos.stock?.current_price || 0;

                        let pnl = 0;
                        let pnlPercent = 0;

                        const entry = parseFloat(pos.avg_price);
                        const shares = parseFloat(pos.amount);
                        const leverage = parseInt(pos.leverage) || 1;
                        const invested = (shares * entry) / leverage;

                        if (currentPrice > 0) {
                            if (pos.type === 'LONG') {
                                pnl = (currentPrice - entry) * shares;
                            } else {
                                pnl = (entry - currentPrice) * shares;
                            }
                            pnlPercent = (pnl / invested) * 100;
                        }

                        const isProfitable = pnl >= 0;

                        return (
                            <div key={pos.id} className={`${styles.item} ${pos.type === 'LONG' ? styles.long : styles.short}`}>
                                <div className={styles.header}>
                                    <div className={styles.mainInfo}>
                                        <span className={styles.symbol}>{pos.stock?.symbol || 'UNKNOWN'}</span>
                                        <span className={styles.type}>{pos.type}</span>
                                        <span className={styles.leverage}>{leverage}x</span>
                                    </div>
                                    <div className={styles.actions}>
                                        <button
                                            className={styles.closeBtn}
                                            onClick={() => handleClose(pos.id)}
                                            disabled={closingId === pos.id}
                                        >
                                            {closingId === pos.id ? '...' : 'Close'}
                                        </button>
                                        <button
                                            className={styles.rouletteBtn}
                                            onClick={() => setCoinflipPositionId(pos.id)}
                                            title="Coinflip: 50% Double / 50% Die"
                                        >
                                            🪙
                                        </button>
                                    </div>
                                </div>

                                <div className={styles.detailsGrid}>
                                    <div className={styles.col}>
                                        <span className={styles.label}>Shares</span>
                                        <span className={styles.value}>{shares.toFixed(4)}</span>
                                    </div>
                                    <div className={styles.col}>
                                        <span className={styles.label}>Entry</span>
                                        <span className={styles.value}>${entry.toFixed(2)}</span>
                                    </div>
                                    <div className={styles.col}>
                                        <span className={styles.label}>Current</span>
                                        <span className={styles.value}>${currentPrice.toFixed(2)}</span>
                                    </div>
                                    <div className={styles.col}>
                                        <span className={styles.label}>Profit/Loss</span>
                                        <span className={`${styles.value} ${isProfitable ? styles.profit : styles.loss}`}>
                                            {pnl >= 0 ? '+' : ''}{pnl.toFixed(2)} ({pnlPercent.toFixed(1)}%)
                                        </span>
                                    </div>
                                    <div className={styles.col}>
                                        <span className={styles.label}>Stop Loss</span>
                                        <span className={styles.value}>{pos.stop_loss ? `$${parseFloat(pos.stop_loss).toFixed(2)}` : '-'}</span>
                                    </div>
                                    <div className={styles.col}>
                                        <span className={styles.label}>Take Profit</span>
                                        <span className={styles.value}>{pos.take_profit ? `$${parseFloat(pos.take_profit).toFixed(2)}` : '-'}</span>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        );
    };

    return (
        <>
            {/* Modal is strictly outside the container/content logic to persist across re-renders */}
            {coinflipPositionId && (
                <CoinflipModal
                    positionId={coinflipPositionId}
                    onClose={() => setCoinflipPositionId(null)}
                />
            )}
            {renderContent()}
        </>
    );
}
