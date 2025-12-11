import pool from "../db.js";

export async function createPosition(userId, stockId, type, entryPrice, amount, leverage, stopLoss, takeProfit) {
    const query = `
        INSERT INTO positions (user_id, stock_id, type, entry_price, current_price, amount, leverage, stop_loss, take_profit)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
        RETURNING *;
    `;
    const result = await pool.query(query, [userId, stockId, type, entryPrice, entryPrice, amount, leverage, stopLoss, takeProfit]);
    return result.rows[0];
}

export async function getPositionsByUser(userId, status = null) {
    let query = `
        SELECT p.*, s.symbol, s.name as stock_name
        FROM positions p
        JOIN stocks s ON p.stock_id = s.id
        WHERE p.user_id = $1
    `;
    const params = [userId];

    if (status) {
        query += ` AND p.status = $2`;
        params.push(status);
    }

    query += ` ORDER BY p.opened_at DESC`;

    const result = await pool.query(query, params);
    return result.rows;
}

export async function getOpenPositions() {
    const query = `
        SELECT p.*, s.symbol
        FROM positions p
        JOIN stocks s ON p.stock_id = s.id
        WHERE p.status = 'OPEN'
    `;
    const result = await pool.query(query);
    return result.rows;
}

export async function getOpenPositionsByStockId(stockId) {
    const query = `
        SELECT p.*, s.symbol 
        FROM positions p
        JOIN stocks s ON p.stock_id = s.id
        WHERE p.stock_id = $1 AND p.status = 'OPEN'
    `;
    const result = await pool.query(query, [stockId]);
    return result.rows;
}

export async function updatePositionPnL(positionId, currentPrice, pnl) {
    const query = `
        UPDATE positions
        SET current_price = $2, pnl = $3
        WHERE id = $1
        RETURNING *;
    `;
    const result = await pool.query(query, [positionId, currentPrice, pnl]);
    return result.rows[0];
}

export async function closePosition(positionId, closePrice, pnl) {
    const query = `
        UPDATE positions
        SET status = 'CLOSED', current_price = $2, pnl = $3, closed_at = CURRENT_TIMESTAMP
        WHERE id = $1
        RETURNING *;
    `;
    const result = await pool.query(query, [positionId, closePrice, pnl]);
    return result.rows[0];
}

export async function getPositionById(positionId) {
    const query = `
        SELECT p.*, s.symbol, s.name as stock_name
        FROM positions p
        JOIN stocks s ON p.stock_id = s.id
        WHERE p.id = $1
    `;
    const result = await pool.query(query, [positionId]);
    return result.rows[0];
}

export async function updatePositionSize(positionId, newAmount, newLeverage) {
    const query = `
        UPDATE positions 
        SET amount = $2, leverage = $3
        WHERE id = $1
        RETURNING *;
    `;
    const result = await pool.query(query, [positionId, newAmount, newLeverage]);
    return result.rows[0];
}
