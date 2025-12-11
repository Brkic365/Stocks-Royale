import dotenv from 'dotenv';
dotenv.config();
import pg from 'pg';

const { Pool } = pg;
const pool = new Pool({
    connectionString: process.env.DATABASE_URL
});

async function checkState() {
    const client = await pool.connect();
    try {
        console.log("--- CHECKING DB STATE ---");

        const stocks = await client.query('SELECT symbol, current_price, volatility FROM stocks');
        console.log("CURRENT STOCK PRICES & VOLATILITY:");
        stocks.rows.forEach(s => console.log(`${s.symbol}: $${s.current_price} | Vol: ${s.volatility}`));

        const candleCount = await client.query('SELECT count(*) FROM candles');
        console.log(`\nTOTAL CANDLES: ${candleCount.rows[0].count}`);

        const lastCandles = await client.query(`
            SELECT s.symbol, c.close, c.time 
            FROM candles c 
            JOIN stocks s ON c.stock_id = s.id 
            ORDER BY c.time DESC LIMIT 5
        `);
        console.log("\nLATEST 5 CANDLES:");
        lastCandles.rows.forEach(c => console.log(`${c.symbol}: $${c.close} @ ${new Date(c.time * 1000).toISOString()}`));

    } catch (err) {
        console.error("Error:", err);
    } finally {
        client.release();
        await pool.end();
    }
}

checkState();
