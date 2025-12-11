import pg from 'pg';
import axios from 'axios';
import dotenv from 'dotenv';
dotenv.config();

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
const API_URL = 'http://localhost:4000'; // Direct to backend

async function verify() {
    try {
        console.log("--- 1. REGISTER USER ---");
        const email = `levtest_${Date.now()}@test.com`;
        const res = await axios.post(`${API_URL}/auth/register`, {
            username: 'levtest',
            email: email,
            password: 'password123'
        });
        const token = res.data.token;
        console.log(`Registered ${email}. Token obtained.`);

        console.log("\n--- 2. PLACE ORDER (Lev 10x) ---");
        // Get a stock first
        const stocksRes = await pool.query('SELECT symbol, current_price FROM stocks LIMIT 1');
        const stock = stocksRes.rows[0];
        console.log(`Target: ${stock.symbol} @ $${stock.current_price}`);

        const amount = 100;
        const leverage = 10;

        await axios.post(`${API_URL}/positions`, {
            stockSymbol: stock.symbol,
            type: 'LONG',
            amount: amount,
            leverage: leverage
        }, {
            headers: { Authorization: `Bearer ${token}` }
        });
        console.log(`Placed BUY order: $${amount} with ${leverage}x leverage.`);

        console.log("\n--- 3. VERIFY DB ---");
        const posRes = await pool.query(`
            SELECT p.amount as shares, p.entry_price, p.leverage 
            FROM positions p 
            JOIN users u ON p.user_id = u.id 
            WHERE u.email = $1 
            ORDER BY p.created_at DESC LIMIT 1
        `, [email]);

        const pos = posRes.rows[0];
        const expectedShares = (amount * leverage) / parseFloat(pos.entry_price);
        const actualShares = parseFloat(pos.shares);

        console.log(`Entry: $${pos.entry_price}`);
        console.log(`Expected Shares: ${expectedShares.toFixed(4)}`);
        console.log(`Actual Shares:   ${actualShares.toFixed(4)}`);

        if (Math.abs(actualShares - expectedShares) < 0.001) {
            console.log("✅ SUCCESS: Leverage Math is CORRECT.");
        } else {
            console.log("❌ FAILURE: Math mismatch.");
        }

    } catch (err) {
        console.error("Error:", err.response?.data || err.message);
    } finally {
        pool.end();
    }
}

verify();
