"use client";
import styles from '@/styles/components/ErrorModal.module.scss';
import { useEffect } from 'react';

export default function ErrorModal({ message, title, onClose }) {

    // Close on Escape key
    useEffect(() => {
        const handleEsc = (e) => {
            if (e.key === 'Escape') onClose();
        };
        window.addEventListener('keydown', handleEsc);
        return () => window.removeEventListener('keydown', handleEsc);
    }, [onClose]);

    return (
        <div className={styles.overlay} onClick={onClose}>
            <div className={styles.modal} onClick={e => e.stopPropagation()}>
                <div className={styles.icon}>⚠️</div>
                <div className={styles.title}>{title || "Error"}</div>
                <div className={styles.message}>{message}</div>
                <button className={styles.button} onClick={onClose}>
                    Dismiss
                </button>
            </div>
        </div>
    );
}
