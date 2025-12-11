"use client";
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '@/components/Sidebar';
import { useAuth } from '@/contexts/AuthContext';
import styles from '@/styles/layouts/DashboardLayout.module.scss';

export default function DashboardLayout({ children }) {
    const { user, loading } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!loading && !user) {
            router.push('/login');
        }
    }, [user, loading, router]);

    if (loading) {
        return (
            <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                height: '100vh',
                color: '#fff'
            }}>
                Loading...
            </div>
        );
    }

    if (!user) {
        return null;
    }

    return (
        <div className={styles.layout}>
            <div className={styles.background}>
                <span></span>
                <span></span>
                <span></span>
                <span></span>
                <span></span>
                <span></span>
                <span></span>
            </div>

            <Sidebar />

            <main className={styles.mainContent}>
                {children}
            </main>
        </div>
    );
}
