"use client"

import { useState, useEffect } from "react";
import axios from "axios";
import { getToken } from "@/utils/auth"

function useHoldings() {
    const [holdings, setHoldings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
      const fetchHoldings = async () => {
        try {
            const token = getToken();

            const res = await axios.get(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/holdings`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            setHoldings(res.data);
        } catch (err) {
            setError(err);
        } finally {
            setLoading(false);
        }
      };

      fetchHoldings();
    }, [])
    

  return { holdings, loading, error };
}

export default useHoldings;