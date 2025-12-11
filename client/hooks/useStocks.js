"use client"
import { useState, useEffect } from "react";
import api, { API_URL } from "@/utils/api";
import useSocket from "./useSocket";

export default function useStocks() {
  const [stocks, setStocks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const socket = useSocket();

  useEffect(() => {
    const fetchStocks = async () => {
      try {
        const res = await api.get('/stocks');
        // Convert string values from database to numbers
        const stocksWithNumbers = res.data.map(stock => ({
          ...stock,
          current_price: parseFloat(stock.current_price),
          volatility: parseFloat(stock.volatility)
        }));
        setStocks(stocksWithNumbers);
      } catch (err) {
        console.error("Error fetching stocks:", err);
        setError(err);
      } finally {
        setLoading(false);
      }
    };

    fetchStocks();
  }, []);

  // Listen for real-time price updates via socket
  useEffect(() => {
    if (!socket) return;

    const handleNewCandle = ({ symbol, candle }) => {
      setStocks(prevStocks =>
        prevStocks.map(stock =>
          stock.symbol === symbol
            ? { ...stock, current_price: parseFloat(candle.close) }
            : stock
        )
      );
    };

    socket.on('new_candle', handleNewCandle);

    return () => {
      socket.off('new_candle', handleNewCandle);
    };
  }, [socket]);

  return { stocks, loading, error };
}