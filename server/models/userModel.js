import pool from "../db.js";

export async function createUser(username, email, password) {
    const query = `
        INSERT INTO users (username, email, password, balance, xp, level)
        VALUES ($1, $2, $3, 10000, 0, 1)
        RETURNING id, username, email;
    `
    const result = await pool.query(query, [username, email, password]);
    return result.rows[0];
}

export async function getUserByEmail(email) {
    const query = `
        SELECT * FROM users WHERE email = $1
    `

    const result = await pool.query(query, [email]);

    return result.rows[0];
}

export async function getUserById(userId) {
    const query = `SELECT * FROM users WHERE id = $1`;
    const result = await pool.query(query, [userId]);
    return result.rows[0];
}

export async function updateUserBalance(userId, newBalance) {
    const query = `
        UPDATE users SET balance = $2
        WHERE id = $1
        RETURNING *;
    `;
    const result = await pool.query(query, [userId, newBalance]);
    return result.rows[0];
}