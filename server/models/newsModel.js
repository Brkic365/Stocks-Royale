import pool from "../db.js";

export const createNews = async (symbol, headline, sentiment) => {
    const result = await pool.query(
        `INSERT INTO news (symbol, headline, sentiment) 
         VALUES ($1, $2, $3) 
         RETURNING *`,
        [symbol, headline, sentiment]
    );
    return result.rows[0];
};

export const getRecentNews = async (limit = 20) => {
    const result = await pool.query(
        `SELECT * FROM news ORDER BY timestamp DESC LIMIT $1`,
        [limit]
    );
    return result.rows;
};
