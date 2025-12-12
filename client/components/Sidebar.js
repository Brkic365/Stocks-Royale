"use client";
import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import {
    LayoutDashboard,
    LineChart,
    Wallet,
    Settings,
    LogOut,
    TrendingUp,
    Newspaper,
    Crown,
    Menu,
    X
} from 'lucide-react';
import styles from '@/styles/components/Sidebar.module.scss';

export default function Sidebar() {
    const pathname = usePathname();
    const [isOpen, setIsOpen] = useState(false);
    const { user, logout } = useAuth();

    const navItems = [
        { icon: LayoutDashboard, label: 'Dashboard', href: '/dashboard' },
        { icon: Wallet, label: 'Portfolio', href: '/dashboard/portfolio' },
        { icon: Newspaper, label: 'News', href: '/dashboard/news' },
        { icon: Settings, label: 'Settings', href: '/dashboard/settings' },
    ];

    return (
        <>
            <button
                className={styles.mobileToggle}
                onClick={() => setIsOpen(!isOpen)}
            >
                {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>

            <div className={`${styles.overlay} ${isOpen ? styles.active : ''}`} onClick={() => setIsOpen(false)} />

            <aside className={`${styles.sidebar} ${isOpen ? styles.open : ''}`}>
                <div className={styles.logo}>
                    <Crown size={32} />
                    <span>Stocks Royale</span>
                </div>

                <nav className={styles.nav}>
                    {navItems.map((item) => {
                        const isActive = pathname === item.href;
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={`${styles.navItem} ${isActive ? styles.active : ''}`}
                                onClick={() => setIsOpen(false)}
                            >
                                <item.icon size={20} />
                                <span>{item.label}</span>
                            </Link>
                        );
                    })}
                </nav>

                <div className={styles.footer}>
                    <div className={styles.userProfile}>
                        <div className={styles.avatar}>
                            {user?.username?.charAt(0).toUpperCase() || 'U'}
                        </div>
                        <div className={styles.info}>
                            <span className={styles.name}>{user?.username || 'User'}</span>
                            <span className={styles.role}>
                                {user?.balance !== undefined ? `$${user.balance.toFixed(2)}` : 'Loading...'}
                            </span>
                        </div>
                        <button
                            onClick={logout}
                            className={styles.navItem}
                            style={{ marginLeft: 'auto', padding: '0.5rem' }}
                            title="Logout"
                        >
                            <LogOut size={18} />
                        </button>
                    </div>
                </div>
            </aside>
        </>
    );
}
