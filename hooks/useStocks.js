"use client"

import { useState, useEffect } from "react";
import axios from "axios";
import { getToken } from "@/utils/auth"

function useStocks() {

    const [stocks, setStocks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
      const fetchStocks = async () => {
        try {
            const token = getToken();

            const res = await axios.get(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/stocks`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            setStocks(res.data);
        } catch (err) {
            setError(err);
        } finally {
            setLoading(false);
        }
      };

      fetchStocks();
    }, [])
    

  return { stocks, loading, error };
}

export default useStocks