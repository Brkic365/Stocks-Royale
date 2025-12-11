"use client";
import React, { useState } from 'react';
import useStocks from '@/hooks/useStocks';
import styles from '@/styles/pages/Market.module.scss';
import { Search, TrendingUp, TrendingDown, ArrowUpRight, ArrowDownRight } from 'lucide-react';

import LoadingSpinner from '@/components/LoadingSpinner';

export default function MarketPage() {
    const { stocks, loading } = useStocks();
    const [searchTerm, setSearchTerm] = useState('');

    if (loading) return <LoadingSpinner />;

    const filteredStocks = stocks.filter(stock =>
        stock.symbol.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (stock.name && stock.name.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    // Mock categorization for demo purposes
    const trendingStocks = filteredStocks.slice(0, 4);
    const topGainers = filteredStocks.slice(0, 3).map(s => ({ ...s, changePercent: Math.random() * 5 + 1 }));
    const topLosers = filteredStocks.slice(3, 6).map(s => ({ ...s, changePercent: -(Math.random() * 5 + 1) }));

    return (
        <div className={styles.marketContainer}>
            <header className={styles.header}>
                <h1>Market Overview</h1>
                <div className={styles.searchBar}>
                    <Search size={20} />
                    <input
                        type="text"
                        placeholder="Search symbols or companies..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </header>

            {/* Trending Section */}
            <section className={styles.section}>
                <h2>Trending Now</h2>
                <div className={styles.marketGrid}>
                    {trendingStocks.map(stock => (
                        <MarketCard key={stock.symbol} stock={stock} />
                    ))}
                </div>
            </section>

            {/* Lists Selection */}
            <div className={styles.marketGrid}>
                <section className={styles.section}>
                    <h2>Top Gainers</h2>
                    {topGainers.map((stock, i) => (
                        <CompactStockRow key={i} stock={stock} positive={true} />
                    ))}
                </section>

                <section className={styles.section}>
                    <h2>Top Losers</h2>
                    {topLosers.map((stock, i) => (
                        <CompactStockRow key={i} stock={stock} positive={false} />
                    ))}
                </section>
            </div>
        </div>
    );
}

function MarketCard({ stock }) {
    // Randomizing change for demo visuals if not present
    const change = stock.change || (Math.random() * 10 - 2);
    const isPositive = change >= 0;

    return (
        <div className={styles.marketCard}>
            <div className={styles.cardHeader}>
                <div>
                    <div className={styles.symbol}>{stock.symbol}</div>
                    <div className={styles.name}>{stock.name || 'Stock Name'}</div>
                </div>
                <div className={styles.price}>${stock.current_price?.toFixed(2)}</div>
            </div>
            <div className={styles.cardFooter}>
                <div className={`${styles.change} ${isPositive ? styles.positive : styles.negative}`}>
                    {isPositive ? <ArrowUpRight size={16} /> : <ArrowDownRight size={16} />}
                    {Math.abs(change).toFixed(2)}%
                </div>
                <div className={styles.volume}>Vol: {(Math.random() * 10).toFixed(1)}M</div>
            </div>
        </div>
    );
}

function CompactStockRow({ stock, positive }) {
    const change = stock.changePercent || (positive ? 2.5 : -2.5);

    return (
        <div className={styles.marketCard} style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div style={{
                    width: '3rem',
                    height: '3rem',
                    borderRadius: '50%',
                    background: positive ? 'rgba(38, 166, 154, 0.1)' : 'rgba(239, 83, 80, 0.1)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: positive ? '#26a69a' : '#ef5350'
                }}>
                    {positive ? <TrendingUp size={20} /> : <TrendingDown size={20} />}
                </div>
                <div>
                    <div className={styles.symbol} style={{ fontSize: '1rem' }}>{stock.symbol}</div>
                    <div className={styles.name} style={{ fontSize: '0.75rem' }}>${stock.current_price?.toFixed(2)}</div>
                </div>
            </div>

            <div className={`${styles.change} ${positive ? styles.positive : styles.negative}`}>
                {change > 0 ? '+' : ''}{change.toFixed(2)}%
            </div>
        </div>
    )
}
