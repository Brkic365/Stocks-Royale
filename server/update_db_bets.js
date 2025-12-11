import pg from 'pg';
import dotenv from 'dotenv';
dotenv.config();

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });

async function setupBets() {
    try {
        console.log("Creating bets table...");
        await pool.query(`
            CREATE TABLE IF NOT EXISTS bets (
                id SERIAL PRIMARY KEY,
                user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
                stock_id INTEGER REFERENCES stocks(id),
                amount DECIMAL NOT NULL,
                prediction VARCHAR(10) NOT NULL CHECK (prediction IN ('GREEN', 'RED')),
                status VARCHAR(10) NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'WIN', 'LOSS')),
                payout DECIMAL DEFAULT 0,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                resolved_at TIMESTAMP
            );
        `);
        console.log("Bets table created.");
    } catch (e) {
        console.error(e);
    } finally {
        pool.end();
    }
}

setupBets();
