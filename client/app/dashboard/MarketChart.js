"use client";

import React, { useEffect, useRef, useState } from "react";
import styles from "../../styles/components/MarketChart.module.scss";
import useSocket from "../../hooks/useSocket";

let chartModule = null;

export default function MarketChart({ stock }) {
  const [mounted, setMounted] = useState(false);
  const [chartLoaded, setChartLoaded] = useState(false);
  const socket = useSocket();

  const chartContainerRef = useRef(null);
  const chartRef = useRef(null);
  const seriesRef = useRef(null);
  const currentSymbolRef = useRef(null);

  // Load library client side, after mounting
  useEffect(() => {
    setMounted(true);

    const loadChart = async () => {
      try {
        chartModule = await import("lightweight-charts");
        setChartLoaded(true);
      } catch (error) {
        console.error("Failed to load chart library:", error);
      }
    };

    loadChart();
  }, []);

  // Initialize chart
  useEffect(() => {
    if (!mounted || !chartLoaded || !chartContainerRef.current || !chartModule) {
      return;
    }

    const container = chartContainerRef.current;

    if (container.clientWidth <= 0 || container.clientHeight <= 0) {
      return;
    }

    try {
      const { createChart, CrosshairMode } = chartModule;

      const chart = createChart(container, {
        layout: {
          background: { color: "transparent" },
          textColor: "#d1d4dc",
          fontSize: 12,
        },
        grid: {
          vertLines: { color: "transparent" },
          horzLines: { color: "transparent" },
        },
        crosshair: {
          mode: CrosshairMode.Normal
        },
        rightPriceScale: {
          borderColor: "#485c7b",
        },
        timeScale: {
          borderColor: "#485c7b",
          timeVisible: true,
          secondsVisible: false,
        },
        width: container.clientWidth,
        height: container.clientHeight,
      });

      chartRef.current = chart;

      const candlestickSeries = chart.addSeries(chartModule.CandlestickSeries, {
        upColor: '#4caf50',
        downColor: '#f44336',
        borderUpColor: '#4caf50',
        borderDownColor: '#f44336',
        wickUpColor: '#4caf50',
        wickDownColor: '#f44336',
      });

      seriesRef.current = candlestickSeries;

    } catch (error) {
      console.error("Error initializing chart:", error);
    }

    return () => {
      if (chartRef.current) {
        try {
          chartRef.current.remove();
        } catch (e) {
          console.error("Error removing chart:", e);
        }
        chartRef.current = null;
        seriesRef.current = null;
      }
    };
  }, [mounted, chartLoaded]);

  // Subscribe to stock via Socket.IO
  useEffect(() => {
    if (!socket || !stock || !seriesRef.current) return;

    // Unsubscribe from previous stock
    if (currentSymbolRef.current && currentSymbolRef.current !== stock.symbol) {
      console.log(`Unsubscribing from ${currentSymbolRef.current}`);
    }

    currentSymbolRef.current = stock.symbol;
    console.log(`Subscribing to ${stock.symbol}`);
    socket.emit('subscribe_stock', stock.symbol);

    const handleInitialCandles = ({ symbol, candles }) => {
      if (symbol !== stock.symbol || !seriesRef.current) return;

      console.log(`Received ${candles.length} initial candles for ${symbol}`);
      seriesRef.current.setData(candles);
      if (chartRef.current) {
        chartRef.current.timeScale().fitContent();
      }
    };

    const handleNewCandle = ({ symbol, candle }) => {
      if (symbol !== stock.symbol || !seriesRef.current) return;

      seriesRef.current.update(candle);
    };

    socket.on('initial_candles', handleInitialCandles);
    socket.on('new_candle', handleNewCandle);

    return () => {
      socket.off('initial_candles', handleInitialCandles);
      socket.off('new_candle', handleNewCandle);
    };
  }, [socket, stock, chartLoaded]);

  // Handle resize
  useEffect(() => {
    if (!mounted || !chartLoaded) return;

    const handleResize = () => {
      if (chartRef.current && chartContainerRef.current) {
        const container = chartContainerRef.current;
        if (container.clientWidth > 0 && container.clientHeight > 0) {
          try {
            chartRef.current.resize(
              container.clientWidth,
              container.clientHeight
            );
          } catch (error) {
            console.error("Error resizing chart:", error);
          }
        }
      }
    };

    window.addEventListener("resize", handleResize);
    const timeoutId = setTimeout(handleResize, 100);

    return () => {
      window.removeEventListener("resize", handleResize);
      clearTimeout(timeoutId);
    };
  }, [mounted, chartLoaded]);

  if (!mounted || !chartLoaded) {
    return (
      <div className={styles.chartContainer}>
        <div className={styles.header}>
          <h2 className={styles.symbol}>
            {stock ? `${stock.symbol}/USD` : "Select a stock"}
          </h2>
        </div>
        <div
          className={styles.chartWrapper}
          style={{ width: "100%", height: "400px", minHeight: "400px" }}
        >
          <div style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            height: "100%",
            color: "#d1d4dc",
            flexDirection: "column",
            gap: "10px"
          }}>
            <div>Loading chart...</div>
            <div style={{ fontSize: "12px", color: "#888" }}>
              {!mounted ? "Initializing..." : "Loading charts..."}
            </div>
          </div>
        </div>
      </div>
    );
  }

  const priceChange = stock ? stock.volatility * 10 : 0;
  const isPositive = priceChange >= 0;

  return (
    <div className={styles.chartContainer}>
      <div className={styles.header}>
        {stock ? (
          <div>
            <h2 className={styles.symbol}>{stock.symbol}/USD</h2>
            <div className={styles.priceInfo}>
              <p className={styles.price}>${stock.current_price.toFixed(2)}</p>
              <p
                className={`${styles.change} ${isPositive ? styles.textSuccess : styles.textDanger
                  }`}
              >
                {isPositive ? "▲" : "▼"} {Math.abs(priceChange).toFixed(2)}%
              </p>
            </div>
          </div>
        ) : (
          <h2 className={styles.symbol}>Select a stock</h2>
        )}
      </div>
      <div
        ref={chartContainerRef}
        className={styles.chartWrapper}
        style={{
          width: "100%",
          height: "400px",
          minHeight: "400px",
          minWidth: "0"
        }}
      />
    </div>
  );
}