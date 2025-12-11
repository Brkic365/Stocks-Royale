"use client";
import { useState, useEffect } from 'react';
import useSocket from '@/hooks/useSocket';
import styles from '@/styles/components/NewsFeed.module.scss';

export default function NewsFeed() {
    const [news, setNews] = useState([]);
    const socket = useSocket();

    useEffect(() => {
        if (!socket) return;

        const handleNews = (newsItem) => {
            setNews(prev => [newsItem, ...prev].slice(0, 10)); // Keep last 10
        };

        const handleInitialNews = (history) => {
            setNews(history.slice(0, 10));
        };

        socket.on('news_update', handleNews);
        socket.on('initial_news', handleInitialNews);

        return () => {
            socket.off('news_update', handleNews);
            socket.off('initial_news', handleInitialNews);
        };
    }, [socket]);

    return (
        <div className={styles.container}>
            <h3>Market News</h3>
            <div className={styles.list}>
                {news.length === 0 && <div className={styles.empty}>Waiting for news...</div>}
                {news.map((item, i) => (
                    <div key={i} className={styles.item}>
                        <div className={styles.time}>{new Date(item.time * 1000).toLocaleTimeString()}</div>
                        <div className={styles.content}>
                            <span className={styles.headline}>{item.headline}</span>
                            <p>{item.summary}</p>
                        </div>
                        {item.sentiment && <span className={`${styles.sentiment} ${item.sentiment === 'POSITIVE' ? styles.pos : styles.neg}`}>{item.sentiment}</span>}
                    </div>
                ))}
            </div>
        </div>
    );
}
