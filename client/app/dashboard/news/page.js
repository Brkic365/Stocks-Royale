"use client";
import React, { useState, useEffect } from 'react';
import useSocket from '../../../hooks/useSocket';
import styles from '@/styles/pages/News.module.scss';
import { TrendingUp, TrendingDown, Newspaper } from 'lucide-react';

export default function NewsPage() {
    const [news, setNews] = useState([]);
    const socket = useSocket();

    useEffect(() => {
        let isMounted = true;

        // Fetch initial news from API
        const fetchNews = async () => {
            try {
                const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/news`);
                if (response.ok) {
                    const data = await response.json();
                    if (isMounted) {
                        setNews(prev => {
                            // Merge with existing (socket updates might have come in)
                            const merged = [...prev];
                            data.forEach(item => {
                                if (!merged.some(p => p.id === item.id)) {
                                    merged.push(item);
                                }
                            });
                            // Sort by timestamp desc
                            merged.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
                            return merged.slice(0, 20);
                        });
                    }
                }
            } catch (err) {
                console.error("Failed to fetch news:", err);
            }
        };

        fetchNews();

        if (!socket) return;

        // Listen for initial_news from socket as well (redundancy/realtime catchup)
        const handleInitialNews = (history) => {
            setNews(prev => {
                const merged = [...prev];
                history.forEach(item => {
                    if (!merged.some(p => p.id === item.id)) {
                        merged.push(item);
                    }
                });
                merged.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
                return merged.slice(0, 20);
            });
        };

        const handleNewsUpdate = (newsItem) => {
            setNews(prev => {
                if (prev.some(item => item.id === newsItem.id)) return prev;
                return [newsItem, ...prev].slice(0, 20);
            });
        };

        socket.on('initial_news', handleInitialNews);
        socket.on('news_update', handleNewsUpdate);

        return () => {
            isMounted = false;
            socket.off('initial_news', handleInitialNews);
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
