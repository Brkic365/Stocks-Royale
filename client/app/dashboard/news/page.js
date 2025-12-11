"use client";
import React, { useState, useEffect } from 'react';
import useSocket from '../../../hooks/useSocket';
import styles from '@/styles/pages/News.module.scss';
import { TrendingUp, TrendingDown, Newspaper } from 'lucide-react';

export default function NewsPage() {
    const [news, setNews] = useState([]);
    const socket = useSocket();

    useEffect(() => {
        if (!socket) return;

        const handleNewsUpdate = (newsItem) => {
            setNews(prev => [newsItem, ...prev].slice(0, 20)); // Keep last 20 items
        };

        socket.on('news_update', handleNewsUpdate);

        // Initial mock news to populate empty state if needed, or wait for socket
        // setNews(mockInitialNews);

        return () => {
            socket.off('news_update', handleNewsUpdate);
        };
    }, [socket]);

    return (
        <div className={styles.newsContainer}>
            <header className={styles.header}>
                <h1>Market News</h1>
                <div className={styles.liveIndicator}>LIVE FEED</div>
            </header>

            <div className={styles.newsFeed}>
                {news.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '3rem', color: '#787b86' }}>
                        <Newspaper size={48} style={{ marginBottom: '1rem', opacity: 0.5 }} />
                        <p>Waiting for market updates...</p>
                    </div>
                ) : (
                    news.map(item => (
                        <div key={item.id} className={styles.newsCard}>
                            <div className={`${styles.iconWrapper} ${item.sentiment === 'POSITIVE' ? styles.positive : styles.negative}`}>
                                {item.sentiment === 'POSITIVE' ? <TrendingUp size={24} /> : <TrendingDown size={24} />}
                            </div>
                            <div className={styles.content}>
                                <div className={styles.meta}>
                                    <span className={styles.symbol}>{item.symbol}</span>
                                    <span className={styles.time}>{new Date(item.timestamp).toLocaleTimeString()}</span>
                                </div>
                                <h3>{item.headline}</h3>
                                <p>Impact: {item.sentiment === 'POSITIVE' ? 'Bullish' : 'Bearish'}</p>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
