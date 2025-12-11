import pool from "./db.js";

async function clearCandles() {
    try {
        console.log("Clearing old candle data...");
        await pool.query("DELETE FROM candles");
        console.log("Candles cleared successfully!");
        process.exit(0);
    } catch (error) {
        console.error("Error clearing candles:", error);
        process.exit(1);
    }
}

clearCandles();
