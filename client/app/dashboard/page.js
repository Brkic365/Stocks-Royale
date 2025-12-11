"use client";
import { useState, useEffect } from 'react';

import useStocks from "@/hooks/useStocks";
// import useHoldings from "@/hooks/useHoldings"; // Removed

import TradePanel from "./TradePanel";
import TickerStrip from "./TickerStrip";
import MarketChart from './MarketChart';

import styles from '@/styles/pages/Dashboard.module.scss';
import LoadingSpinner from '@/components/LoadingSpinner';
import OrdersList from '@/components/OrdersList';
import NewsToast from '@/components/NewsToast';
import { HoldingsProvider, useHoldings } from '@/contexts/HoldingsContext';

function DashboardContent() {
  const { stocks, loading: stocksLoading } = useStocks();
  const { holdings, loading: holdingsLoading } = useHoldings();
  const [selectedStock, setSelectedStock] = useState(null);

  useEffect(() => {
    if (stocks && stocks.length > 0 && !selectedStock) {
      setSelectedStock(stocks[0]);
    }
  }, [stocks, selectedStock]);

  if (stocksLoading || holdingsLoading) return <LoadingSpinner />;

  return (
    <div className={styles.dashboardGrid}>
      <NewsToast />
      <div className={styles.dashboardLeft}>
        <MarketChart stock={selectedStock} />
        <TickerStrip
          stocks={stocks}
          onSelectStock={setSelectedStock}
          selectedSymbol={selectedStock?.symbol}
        />
        <div className={styles.bottomSection}>
          <OrdersList />
        </div>
      </div>
      <div className={styles.dashboardRight}>
        <TradePanel stock={selectedStock} />
      </div>
    </div>
  );
}

export default function DashboardPage() {
  return (
    <HoldingsProvider>
      <DashboardContent />
    </HoldingsProvider>
  );
}