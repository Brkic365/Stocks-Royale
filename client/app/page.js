"use client";
import Image from "next/image";
import Link from 'next/link';
import Navbar from "@/components/Navbar";
import styles from "@/styles/pages/Home.module.scss";
import { FiActivity, FiShield, FiTrendingUp } from 'react-icons/fi';

export default function Home() {
  return (
    <main className={styles.home}>
      <Navbar />

      {/* Hero Section */}
      <section className={styles.hero}>
        <div className={styles.heroContent}>
          <div className={styles.badge}>
            Welcome to the Arena
          </div>
          <h1>
            Master the Market in <br />
            <span className={styles.gradientText}>Stocks Royale</span>
          </h1>
          <p>
            Experience the thrill of stock trading without the risk. Compete with others, climb the leaderboards, and prove you have what it takes to be a top investor.
          </p>
          <div className={styles.ctaGroup}>
            <Link href="/register" className={`${styles.button} ${styles.primary}`}>
              Get Started Free
            </Link>
            <Link href="/about" className={`${styles.button} ${styles.secondary}`}>
              How it Works
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className={styles.features}>
        <div className={styles.sectionHeader}>
          <h2>Why Trade Here?</h2>
          <p>Built for beginners and pros alike.</p>
        </div>

        <div className={styles.grid}>
          <div className={styles.card}>
            <div className={styles.iconWrapper}>
              <FiTrendingUp />
            </div>
            <h3>Real-Time Data</h3>
            <p>
              Trade with live market data. Our platform simulates real world conditions so you can learn with accuracy.
            </p>
          </div>

          <div className={styles.card}>
            <div className={styles.iconWrapper}>
              <FiShield />
            </div>
            <h3>Risk-Free Environment</h3>
            <p>
              Start with virtual currency. Make mistakes, learn strategies, and grow your portfolio with zero financial risk.
            </p>
          </div>

          <div className={styles.card}>
            <div className={styles.iconWrapper}>
              <FiActivity />
            </div>
            <h3>Competitive Leaderboards</h3>
            <p>
              Rise through the ranks. Challenge friends and other traders to see who can generate the highest returns.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
