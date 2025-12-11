import pool from "../db.js";

// Place a bet
export async function placeBet(req, res) {
    const { stockId, amount, prediction } = req.body;
    const userId = req.user.id;

    if (!amount || amount <= 0) {
        return res.status(400).json({ error: "Invalid amount" });
    }
    if (!['GREEN', 'RED'].includes(prediction)) {
        return res.status(400).json({ error: "Invalid prediction" });
    }

    try {
        // Check balance
        const userRes = await pool.query("SELECT balance FROM users WHERE id = $1", [userId]);
        const user = userRes.rows[0];

        if (parseFloat(user.balance) < parseFloat(amount)) {
            return res.status(400).json({ error: "Insufficient balance" });
        }

        // Deduct balance
        const newBalance = parseFloat(user.balance) - parseFloat(amount);
        await pool.query("UPDATE users SET balance = $1 WHERE id = $2", [newBalance, userId]);

        // Create bet
        const result = await pool.query(`
            INSERT INTO bets (user_id, stock_id, amount, prediction, status)
            VALUES ($1, $2, $3, $4, 'PENDING')
            RETURNING *
        `, [userId, stockId, amount, prediction]);

        res.json({ success: true, bet: result.rows[0], newBalance });

    } catch (error) {
        console.error("Place bet error:", error);
        res.status(500).json({ error: "Failed to place bet" });
    }
}

// Get active bets for user
export async function getActiveBets(req, res) {
    const userId = req.user.id;
    try {
        const result = await pool.query(`
            SELECT b.*, s.symbol 
            FROM bets b
            JOIN stocks s ON b.stock_id = s.id
            WHERE b.user_id = $1 AND b.status = 'PENDING'
            ORDER BY b.created_at DESC
        `, [userId]);
        res.json(result.rows);
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch bets" });
    }
}

export async function getPendingBetsByStockId(stockId) {
    try {
        const result = await pool.query(`
            SELECT * FROM bets 
            WHERE stock_id = $1 AND status = 'PENDING'
        `, [stockId]);
        return result.rows;
    } catch (e) {
        return [];
    }
}

// Internal helper to resolve bets in socket.js
export async function resolveBetInternal(betId, outcome, payout) {
    try {
        const status = outcome ? 'WIN' : 'LOSS';
        const finalPayout = outcome ? payout : 0;
        const now = new Date();

        const result = await pool.query(`
            UPDATE bets 
            SET status = $1, payout = $2, resolved_at = $3
            WHERE id = $4
            RETURNING *
        `, [status, finalPayout, now, betId]);

        return result.rows[0];
    } catch (e) {
        console.error("Resolve bet error:", e);
    }
}
