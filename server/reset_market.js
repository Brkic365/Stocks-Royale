import dotenv from 'dotenv';
dotenv.config();
import pg from 'pg';

const { Pool } = pg;
const pool = new Pool({
    connectionString: process.env.DATABASE_URL
});

const INITIAL_PRICES = {
    'QLT': 145.50,
    'BGI': 280.20,
    'EPR': 45.30,
    'CNS': 310.15,
    'STF': 85.75
};

async function resetMarket() {
    const client = await pool.connect();
    try {
        console.log("HARD RESETTING MARKET PRICES...");

        // 1. Clear all candles
        await client.query('TRUNCATE TABLE candles CASCADE');
        console.log("✓ Cleared all historical candles");

        // 2. Reset stock prices
        for (const [symbol, price] of Object.entries(INITIAL_PRICES)) {
            await client.query('UPDATE stocks SET current_price = $1 WHERE symbol = $2', [price, symbol]);
            console.log(`✓ Reset ${symbol} to $${price}`);
        }

        console.log("\nDONE. Please RESTART the server to clear in-memory cache.");
    } catch (err) {
        console.error("Error resetting market:", err);
    } finally {
        client.release();
        await pool.end();
    }
}

resetMarket();
