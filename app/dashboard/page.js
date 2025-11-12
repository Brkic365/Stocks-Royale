"use client"
import { useStocks } from "../../hooks/useStocks";
import { useHoldings } from "../../hooks/useHoldings";
import Portfolio from "./Portfolio";
import Market from "./Market";
import TradePanel from "./TradePanel";
import TradeHistory from "./TradeHistory";
import styles from "@/styles/pages/Dashboard.module.scss"

export default function DashboardPage() {
  const { stocks, loading: stocksLoading } = useStocks();
  const { holdings, loading: holdingsLoading } = useHoldings();

  if (stocksLoading || holdingsLoading) return <div>Loading...</div>;

  return (
    <section className={styles.dashboardContainer}>
      <h1>Gamified Stock Dashboard</h1>

      <section className={styles.dashboardGrid}>
        <section className={styles.dashboardLeft}>
          <Market stocks={stocks} />
          <TradePanel stocks={stocks} />
        </section>

        <section className={styles.dashboardRight}>
          <Portfolio holdings={holdings} />
          <TradeHistory />
        </section>
      </section>
    </section>
  );
}
