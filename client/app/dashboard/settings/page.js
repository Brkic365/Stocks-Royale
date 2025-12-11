"use client";
import React, { useState } from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import styles from '@/styles/pages/Settings.module.scss';
import { User, Bell, Shield, LogOut } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function SettingsPage() {
    const { user, logout } = useAuth();
    const router = useRouter();

    const handleLogout = () => {
        logout();
        router.push('/login');
    };

    return (
        <div className={styles.settingsContainer}>
            <header className={styles.header}>
                <h1>Settings</h1>
            </header>

            {/* Profile Section */}
            <section className={styles.section}>
                <h2><User size={20} /> Profile</h2>
                <div className={styles.formGroup}>
                    <label>Username</label>
                    <input type="text" value={user?.username || ''} disabled />
                </div>
                <div className={styles.formGroup}>
                    <label>Email (Mocked)</label>
                    <input type="email" value={`${user?.username}@example.com`} disabled />
                </div>
            </section>

            {/* Notifications */}
            <section className={styles.section}>
                <h2><Bell size={20} /> Notifications</h2>
                <ToggleRow title="Push Notifications" description="Get alerts for price changes and trade executions" defaultActive={true} />
                <ToggleRow title="Email Reports" description="Weekly portfolio summary and market insights" defaultActive={false} />
            </section>

            {/* Security */}
            <section className={styles.section}>
                <h2><Shield size={20} /> Account Security</h2>
                <div className={styles.formGroup}>
                    <label>Password</label>
                    <button className={`${styles.button} ${styles.secondary}`} style={{ width: '100%', background: 'transparent', border: '1px solid rgba(255,255,255,0.1)' }}>Change Password</button>
                </div>

                <div style={{ marginTop: '2rem', paddingTop: '2rem', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                    <button onClick={handleLogout} className={`${styles.button} ${styles.danger}`}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', justifyContent: 'center' }}>
                            <LogOut size={18} /> Sign Out
                        </div>
                    </button>
                </div>
            </section>
        </div>
    );
}

function ToggleRow({ title, description, defaultActive }) {
    const [active, setActive] = useState(defaultActive);

    return (
        <div className={styles.toggleGroup}>
            <div className={styles.toggleText}>
                <h4>{title}</h4>
                <p>{description}</p>
            </div>
            <div
                className={`${styles.toggle} ${active ? styles.active : ''}`}
                onClick={() => setActive(!active)}
            >
                <div className={styles.knob} />
            </div>
        </div>
    );
}
