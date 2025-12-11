"use client";
import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import styles from '@/styles/pages/Home.module.scss';
import { FiTrendingUp } from 'react-icons/fi';

export default function Navbar() {
    const pathname = usePathname();

    // We could add mobile menu state here if needed
    // const [isMenuOpen, setIsMenuOpen] = useState(false);

    return (
        <nav className={styles.navbar}>
            <Link href="/" className={styles.logo}>
                <FiTrendingUp className={styles.logoIcon} />
                <span>Stocks Royale</span>
            </Link>

            <div className={styles.navLinks}>
                <Link href="/">Home</Link>
                <Link href="#features">Features</Link>
            </div>

            <div className={styles.authButtons}>
                <Link href="/login" className={`${styles.button} ${styles.secondary}`} style={{ padding: '0.5rem 1.5rem' }}>
                    Log In
                </Link>
                <Link href="/register" className={`${styles.button} ${styles.primary}`} style={{ padding: '0.5rem 1.5rem' }}>
                    Sign Up
                </Link>
            </div>
        </nav>
    );
}
