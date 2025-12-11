import pool from "../db.js";

export async function createTransaction(userId, positionId, type, amount, balanceAfter) {
    const query = `
        INSERT INTO transactions (user_id, position_id, type, amount, balance_after)
        VALUES ($1, $2, $3, $4, $5)
        RETURNING *;
    `;
    const result = await pool.query(query, [userId, positionId, type, amount, balanceAfter]);
    return result.rows[0];
}

export async function getTransactionsByUser(userId, limit = 50) {
    const query = `
        SELECT t.*, p.type as position_type, s.symbol
        FROM transactions t
        LEFT JOIN positions p ON t.position_id = p.id
        LEFT JOIN stocks s ON p.stock_id = s.id
        WHERE t.user_id = $1
        ORDER BY t.created_at DESC
        LIMIT $2
    `;
    const result = await pool.query(query, [userId, limit]);
    return result.rows;
}
