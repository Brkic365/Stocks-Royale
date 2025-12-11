import pg from 'pg';
import dotenv from 'dotenv';
dotenv.config();

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });

async function update() {
    try {
        console.log("Updating transactions constraint...");
        await pool.query(`
            ALTER TABLE transactions 
            DROP CONSTRAINT transactions_type_check;
        `);
        await pool.query(`
            ALTER TABLE transactions 
            ADD CONSTRAINT transactions_type_check 
            CHECK (type IN ('DEPOSIT', 'WITHDRAWAL', 'TRADE_OPEN', 'TRADE_CLOSE', 'PROFIT', 'LOSS', 'LIQUIDATION'));
        `);
        console.log("Constraint updated successfully.");
    } catch (e) {
        console.error(e);
    } finally {
        pool.end();
    }
}

update();
