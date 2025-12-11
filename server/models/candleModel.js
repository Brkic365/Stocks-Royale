import pool from "../db.js";

export async function saveCandle(stockId, candle) {
    const { time, open, high, low, close } = candle;

    const q = `
        INSERT INTO candles (stock_id, time, open, high, low, close)
        VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING *;
    `;

    await pool.query(q, [stockId, time, open, high, low, close]);
}

export async function getCandlesBySymbol(symbol) {
    const q = `
        SELECT c.*
        FROM candles c
        JOIN stocks s ON c.stock_id = s.id
        WHERE s.symbol = $1
        ORDER BY time ASC;
    `;
    const result = await pool.query(q, [symbol]);
    return result.rows;
}
