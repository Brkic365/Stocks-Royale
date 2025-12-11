"use client"

import { useState, useEffect } from "react";
import axios from "axios";
import { getToken } from "@/utils/auth"

function useTrades() {
    const [trades, setTrades] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
      const fetchTrades = async () => {
        try {
            const token = getToken();

            const res = await axios.get(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/trades`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            setTrades(res.data);
        } catch (err) {
            setError(err);
        } finally {
            setLoading(false);
        }
      };

      fetchTrades();
    }, [])
    

  return { trades, loading, error };
}

export default useTrades;