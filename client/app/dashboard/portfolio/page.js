"use client";
import React from 'react';
import { useHoldings, HoldingsProvider } from '@/contexts/HoldingsContext';
import { useAuth } from '@/contexts/AuthContext';
import styles from '@/styles/pages/Portfolio.module.scss';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

import LoadingSpinner from '@/components/LoadingSpinner';

import OrdersList from '@/components/OrdersList';

export default function PortfolioPage() {
    return (
        <HoldingsProvider>
            <PortfolioContent />
        </HoldingsProvider>
    );
}

function PortfolioContent() {
    const { holdings, loading } = useHoldings();
    const { user } = useAuth();

    if (loading) return <LoadingSpinner />;

    // Calculate stats based on EQUITY (not Notional Value)
    const stats = holdings.reduce((acc, curr) => {
        const currentPrice = curr.stock?.current_price || 0;
        const entryPrice = curr.avg_price; // averaged entry
        const shares = curr.amount;

        // Invested = Margin = (Shares * Entry) / Leverage
        // We added `investedCapital` to HoldingsContext logic
        const invested = curr.investedCapital || 0;

        // PnL calculation
        let pnl = 0;
        if (curr.type === 'LONG') {
            pnl = (currentPrice - entryPrice) * shares;
        } else {
            pnl = (entryPrice - currentPrice) * shares;
        }

        // Equity = Invested (Margin) + PnL
        const equity = invested + pnl;

        return {
            totalInvested: acc.totalInvested + invested,
            totalEquity: acc.totalEquity + equity,
            totalNotional: acc.totalNotional + (shares * currentPrice) // For pie chart maybe?
        };
    }, { totalInvested: 0, totalEquity: 0, totalNotional: 0 });

    const totalInvested = stats.totalInvested;
    const totalEquity = stats.totalEquity; // This is the real "current value" of the portfolio
    const totalProfit = totalEquity - totalInvested;
    const profitPercent = totalInvested > 0 ? (totalProfit / totalInvested) * 100 : 0;

    // Net Worth = Cash + Portfolio Equity
    const netWorth = (user?.balance || 0) + totalEquity;

    // Data for Pie Chart - Allocation by EQUITY (not Notional, to show risk/margin distribution)
    // Actually, Allocation usually shows Market Exposure (Notional). 
    // User complaint was about Net Worth. 
    // Let's show Allocation by Equity for now to be consistent with "Net Worth"
    const data = holdings.map(h => {
        const currentPrice = h.stock?.current_price || 0;
        const shares = h.amount;
        // Re-calc equity for chart
        let pnl = 0;
        if (h.type === 'LONG') {
            pnl = (currentPrice - h.avg_price) * shares;
        } else {
            pnl = (h.avg_price - currentPrice) * shares;
        }
        const invested = h.investedCapital || 0;
        const equity = invested + pnl;

        return {
            name: h.stock?.symbol,
            value: Math.max(0, equity) // Chart can't handle negative numbers, floor at 0
        };
    });

    const COLORS = ['#2962ff', '#e91e63', '#ffeb3b', '#00e676', '#7c4dff', '#ff9100'];

    return (
        <div className={styles.portfolioContainer}>
            {/* Hero Card */}
            <div className={styles.heroCard}>
                <div className={styles.label}>Net Worth</div>
                <div className={styles.balance}>
                    ${netWorth.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    <span>USD</span>
                </div>

                <div className={styles.stats}>
                    <div className={styles.stat}>
                        <span className={styles.statLabel}>Cash Balance</span>
                        <span className={styles.statValue}>${user?.balance?.toLocaleString()}</span>
                    </div>
                    <div className={styles.stat}>
                        <span className={styles.statLabel}>Invested (Margin)</span>
                        <span className={styles.statValue}>${totalInvested.toLocaleString(undefined, { maximumFractionDigits: 2 })}</span>
                    </div>
                    <div className={styles.stat}>
                        <span className={styles.statLabel}>Total Profit</span>
                        <span className={`${styles.statValue} ${styles.profit}`}>
                            {totalProfit >= 0 ? '+' : ''}{totalProfit.toLocaleString(undefined, { maximumFractionDigits: 2 })} ({profitPercent.toFixed(2)}%)
                        </span>
                    </div>
                </div>
            </div>

            <div className={styles.grid}>
                {/* Holdings Section - Now using OrdersList */}
                <div className={styles.holdingsSection}>
                    <OrdersList />
                </div>

                {/* Allocation Chart */}
                <div className={styles.allocationSection}>
                    <h2>Allocation (By Equity)</h2>
                    <div style={{ width: '100%', height: '300px' }}>
                        {holdings.length > 0 ? (
                            <ResponsiveContainer>
                                <PieChart>
                                    <Pie
                                        data={data}
                                        innerRadius={60}
                                        outerRadius={80}
                                        paddingAngle={5}
                                        dataKey="value"
                                    >
                                        {data.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip
                                        contentStyle={{ backgroundColor: '#1e222d', border: 'none', borderRadius: '8px' }}
                                        itemStyle={{ color: '#d1d4dc' }}
                                    />
                                </PieChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className={styles.chartPlaceholder}>No Data</div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
