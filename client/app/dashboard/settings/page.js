"use client";
import React, { useState } from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import styles from '@/styles/pages/Settings.module.scss';
import { User, Bell, Shield, LogOut } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function SettingsPage() {
    const { user, logout } = useAuth();
    const router = useRouter();
    const [passwordData, setPasswordData] = useState({ current: '', new: '' });
    const [msg, setMsg] = useState({ type: '', text: '' });
    const [preferences, setPreferences] = useState({
        notifications: { push: true, email: false }
    });

    // Load preferences
    useState(() => {
        if (user && user.preferences) {
            setPreferences(user.preferences);
        }
    }, [user]);

    const handleLogout = () => {
        logout();
        router.push('/login');
    };

    const handlePasswordChange = async () => {
        setMsg({ type: '', text: '' });
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/user/password`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    currentPassword: passwordData.current,
                    newPassword: passwordData.new
                })
            });

            const data = await res.json();
            if (res.ok) {
                setMsg({ type: 'success', text: 'Password updated successfully' });
                setPasswordData({ current: '', new: '' });
            } else {
                setMsg({ type: 'error', text: data.error || 'Failed to update password' });
            }
        } catch (err) {
            setMsg({ type: 'error', text: 'Network error' });
        }
    };

    const handleToggle = async (key) => {
        const newPrefs = {
            ...preferences,
            notifications: {
                ...preferences.notifications,
                [key]: !preferences.notifications?.[key]
            }
        };
        setPreferences(newPrefs);

        // Sync with backend
        try {
            const token = localStorage.getItem('token');
            await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/user/preferences`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({ preferences: newPrefs })
            });
        } catch (err) {
            console.error(err);
        }
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
                    <label>Email</label>
                    <input type="email" value={user?.email || `${user?.username}@example.com`} disabled />
                </div>
            </section>

            {/* Notifications */}
            <section className={styles.section}>
                <h2><Bell size={20} /> Notifications</h2>
                <ToggleRow
                    title="Push Notifications"
                    description="Get alerts for price changes and trade executions"
                    active={preferences.notifications?.push}
                    onToggle={() => handleToggle('push')}
                />
                <ToggleRow
                    title="Email Reports"
                    description="Weekly portfolio summary and market insights"
                    active={preferences.notifications?.email}
                    onToggle={() => handleToggle('email')}
                />
            </section>

            {/* Security */}
            <section className={styles.section}>
                <h2><Shield size={20} /> Account Security</h2>
                <div className={styles.formGroup}>
                    <label>Current Password</label>
                    <input
                        type="password"
                        value={passwordData.current}
                        onChange={(e) => setPasswordData({ ...passwordData, current: e.target.value })}
                    />
                </div>
                <div className={styles.formGroup}>
                    <label>New Password</label>
                    <input
                        type="password"
                        value={passwordData.new}
                        onChange={(e) => setPasswordData({ ...passwordData, new: e.target.value })}
                    />
                </div>

                {msg.text && (
                    <div style={{ color: msg.type === 'success' ? '#4caf50' : '#f44336', marginTop: '0.5rem' }}>
                        {msg.text}
                    </div>
                )}

                <button
                    className={`${styles.button} ${styles.secondary}`}
                    style={{ marginTop: '1rem', width: '100%', background: 'transparent', border: '1px solid rgba(255,255,255,0.1)' }}
                    onClick={handlePasswordChange}
                >
                    Change Password
                </button>

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

function ToggleRow({ title, description, active, onToggle }) {
    return (
        <div className={styles.toggleGroup}>
            <div className={styles.toggleText}>
                <h4>{title}</h4>
                <p>{description}</p>
            </div>
            <div
                className={`${styles.toggle} ${active ? styles.active : ''}`}
                onClick={onToggle}
            >
                <div className={styles.knob} />
            </div>
        </div>
    );
}
