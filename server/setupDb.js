import pool from "./db.js";

const STOCKS = [
    {
        id: 1,
        name: "QuantumLeap Tech",
        symbol: "QLT",
        current_price: 145.50,
        volatility: 0.015,
        sector: "Technology",
    },
    {
        id: 2,
        name: "BioGen Innovations",
        symbol: "BGI",
        current_price: 280.20,
        volatility: 0.02,
        sector: "Healthcare",
    },
    {
        id: 3,
        name: "EcoPower Renewables",
        symbol: "EPR",
        current_price: 45.30,
        volatility: 0.025,
        sector: "Energy",
    },
    {
        id: 4,
        name: "CyberNet Security",
        symbol: "CNS",
        current_price: 310.15,
        volatility: 0.018,
        sector: "Technology",
    },
    {
        id: 5,
        name: "Stellar Foods",
        symbol: "STF",
        current_price: 85.75,
        volatility: 0.008,
        sector: "Consumer Goods",
    },
];

async function setup() {
    try {
        console.log("Creating tables...");

        // Create users table
        await pool.query(`
            CREATE TABLE IF NOT EXISTS users (
                id SERIAL PRIMARY KEY,
                username VARCHAR(255) NOT NULL,
                email VARCHAR(255) UNIQUE NOT NULL,
                password VARCHAR(255) NOT NULL,
                balance DECIMAL DEFAULT 10000,
                xp INTEGER DEFAULT 0,
                level INTEGER DEFAULT 1,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);

        // Create stocks table
        await pool.query(`
            CREATE TABLE IF NOT EXISTS stocks (
                id SERIAL PRIMARY KEY,
                symbol VARCHAR(10) UNIQUE NOT NULL,
                name VARCHAR(255),
                current_price DECIMAL,
                volatility DECIMAL,
                sector VARCHAR(255)
            );
        `);

        // Create candles table
        await pool.query(`
            CREATE TABLE IF NOT EXISTS candles (
                id SERIAL PRIMARY KEY,
                stock_id INTEGER REFERENCES stocks(id),
                time BIGINT,
                open DECIMAL,
                high DECIMAL,
                low DECIMAL,
                close DECIMAL
            );
        `);

        // Create positions table
        await pool.query(`
            CREATE TABLE IF NOT EXISTS positions (
                id SERIAL PRIMARY KEY,
                user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
                stock_id INTEGER REFERENCES stocks(id),
                type VARCHAR(10) NOT NULL CHECK (type IN ('LONG', 'SHORT')),
                entry_price DECIMAL NOT NULL,
                current_price DECIMAL NOT NULL,
                amount DECIMAL NOT NULL,
                leverage INTEGER NOT NULL DEFAULT 1,
                stop_loss DECIMAL,
                take_profit DECIMAL,
                pnl DECIMAL DEFAULT 0,
                status VARCHAR(10) NOT NULL DEFAULT 'OPEN' CHECK (status IN ('OPEN', 'CLOSED')),
                opened_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                closed_at TIMESTAMP
            );
        `);

        // Create transactions table
        await pool.query(`
            CREATE TABLE IF NOT EXISTS transactions (
                id SERIAL PRIMARY KEY,
                user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
                position_id INTEGER REFERENCES positions(id),
                type VARCHAR(20) NOT NULL CHECK (type IN ('DEPOSIT', 'WITHDRAWAL', 'TRADE_OPEN', 'TRADE_CLOSE', 'PROFIT', 'LOSS')),
                amount DECIMAL NOT NULL,
                balance_after DECIMAL NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);

        console.log("Tables created.");

        console.log("Seeding stocks...");
        for (const stock of STOCKS) {
            await pool.query(`
                INSERT INTO stocks (id, symbol, name, current_price, volatility, sector)
                VALUES ($1, $2, $3, $4, $5, $6)
                ON CONFLICT (id) DO UPDATE SET
                    symbol = EXCLUDED.symbol,
                    name = EXCLUDED.name,
                    current_price = EXCLUDED.current_price,
                    volatility = EXCLUDED.volatility,
                    sector = EXCLUDED.sector;
            `, [stock.id, stock.symbol, stock.name, stock.current_price, stock.volatility, stock.sector]);

            // Also update sequence to avoid collision if we insert new stocks later
            await pool.query(`SELECT setval('stocks_id_seq', (SELECT MAX(id) FROM stocks))`);
        }
        console.log("Stocks seeded.");

        process.exit(0);
    } catch (err) {
        console.error("Error setting up DB:", err);
        process.exit(1);
    }
}

setup();
