import pool from "../db.js";

export async function getAllStocks() {
    const result = await pool.query("SELECT * FROM stocks ORDER BY id ASC");
    return result.rows;
}

export async function getStockBySymbol(symbol) {
    const q = `SELECT * FROM stocks WHERE symbol = $1`;
    const result = await pool.query(q, [symbol]);
    return result.rows[0];
}

export async function updateStockPrice(symbol, newPrice) {
    const q = `
        UPDATE stocks SET current_price = $2
        WHERE symbol = $1 RETURNING *;
    `;
    const result = await pool.query(q, [symbol, newPrice]);
    return result.rows[0];
}
