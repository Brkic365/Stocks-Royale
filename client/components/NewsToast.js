"use client";
import { useState, useEffect } from 'react';
import useSocket from '@/hooks/useSocket';
import { Bell } from 'lucide-react';

export default function NewsToast() {
    const socket = useSocket();
    const [toasts, setToasts] = useState([]);

    useEffect(() => {
        if (!socket) return;

        const handleNews = (newsItem) => {
            const id = Date.now();
            setToasts(prev => [...prev, { ...newsItem, id }]);

            // Remove after 6 seconds
            setTimeout(() => {
                setToasts(prev => prev.filter(t => t.id !== id));
            }, 6000);
        };

        socket.on('news_update', handleNews);

        return () => {
            socket.off('news_update', handleNews);
        };
    }, [socket]);

    if (toasts.length === 0) return null;

    return (
        <div style={{
            position: 'fixed',
            bottom: '20px',
            right: '20px',
            zIndex: 1000,
            display: 'flex',
            flexDirection: 'column',
            gap: '10px',
            maxWidth: '350px'
        }}>
            {toasts.map(toast => (
                <div key={toast.id} style={{
                    background: 'rgba(30, 34, 45, 0.95)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    borderRadius: '8px',
                    padding: '16px',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
                    animation: 'slideIn 0.3s ease-out',
                    backdropFilter: 'blur(10px)',
                    display: 'flex',
                    gap: '12px'
                }}>
                    <div style={{
                        background: 'rgba(56, 189, 248, 0.1)',
                        padding: '8px',
                        borderRadius: '6px',
                        height: 'fit-content'
                    }}>
                        <Bell size={20} color="#38bdf8" />
                    </div>
                    <div>
                        <h4 style={{ margin: '0 0 4px 0', fontSize: '14px', color: '#fff' }}>{toast.headline}</h4>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <p style={{ margin: 0, fontSize: '12px', color: '#94a3b8' }}>
                                Impact: <span style={{ color: toast.sentiment === 'POSITIVE' ? '#00e676' : '#ff1744' }}>{toast.sentiment}</span>
                            </p>
                            <span style={{ fontSize: '11px', color: '#64748b' }}>{new Date(toast.timestamp).toLocaleTimeString()}</span>
                        </div>
                    </div>
                </div>
            ))}
            <style jsx>{`
        @keyframes slideIn {
          from { transform: translateY(100%); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
      `}</style>
        </div>
    );
}
