import pg from 'pg';
import dotenv from 'dotenv';
import { liquidatePositionInternal } from './controllers/positionController.js';
import { getPositionById } from './models/positionModel.js';
import { getUserById } from './models/userModel.js';

dotenv.config();

// MOCK res object for controller if needed? 
// limit: liquidatePositionInternal doesn't use res.

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });

async function verifyLiquidation() {
    try {
        console.log("--- 1. SETUP TEST USER & POSITION ---");
        // Create temp user
        const email = `liqtest_${Date.now()}@test.com`;
        const userRes = await pool.query(`
            INSERT INTO users (username, email, password, balance) 
            VALUES ('liqtest', $1, 'hash', 1000) RETURNING id`, [email]);
        const userId = userRes.rows[0].id;

        // Get Stock
        const stockRes = await pool.query(`SELECT id, current_price FROM stocks LIMIT 1`);
        const stock = stockRes.rows[0];
        const entryPrice = parseFloat(stock.current_price);

        // Open Position: $1000, 10x Lev. (Margin $100).
        // 10x leverage. Amount = 100 shares approx?
        // Logic: shares = (Amt * Lev) / Entry.
        const margin = 100;
        const leverage = 10;
        const shares = (margin * leverage) / entryPrice; // $1000 notional

        const posRes = await pool.query(`
            INSERT INTO positions (user_id, stock_id, type, entry_price, current_price, amount, leverage, status)
            VALUES ($1, $2, 'LONG', $3, $3, $4, $5, 'OPEN') RETURNING id`,
            [userId, stock.id, entryPrice, shares, leverage]);

        const positionId = posRes.rows[0].id;
        console.log(`Created Position ${positionId}. Entry: $${entryPrice}. Shares: ${shares.toFixed(2)}. Margin: $${margin}.`);

        console.log("\n--- 2. EXECUTE LIQUIDATION ---");
        // Drop price by 15%. (10% drop wipes 10x leverage).
        const crashPrice = entryPrice * 0.85;
        console.log(`Simulating Price Crash to $${crashPrice.toFixed(2)} (-15%)`);

        const result = await liquidatePositionInternal(positionId, crashPrice);
        console.log(`Liquidation Result: ${result}`);

        console.log("\n--- 3. VERIFY RESULT ---");
        const finalPos = await getPositionById(positionId);
        console.log(`Status: ${finalPos.status} (Expected: CLOSED or LIQUIDATED? Code sets CLOSED via closePositionModel)`);

        const finalUser = await getUserById(userId);
        console.log(`User Balance: $${finalUser.balance} (Expected ~1000? No, wait.)`);
        // Initial balance 1000.
        // We manually inserted position, didn't deduct balance.
        // So Balance is 1000.
        // Liquidation returns remaining equity (0).
        // So Balance should remain 1000.

        // Wait, if I use `openPosition`, it deducts 100.
        // Here I bypassed it.
        // So if `liquidatePositionInternal` adds 0, correct.

        // Let's verify pnl
        console.log(`Final PnL: ${finalPos.pnl}`);
        const expectedPnL = (crashPrice - entryPrice) * shares;
        console.log(`Expected PnL: ${expectedPnL.toFixed(2)}`);

        if (finalPos.status === 'CLOSED' && Math.abs(parseFloat(finalPos.pnl) - expectedPnL) < 1) {
            console.log("✅ LIQUIDATION LOGIC VERIFIED");
        } else {
            console.log("❌ LIQUIDATION FAILED");
        }

    } catch (e) {
        console.error(e);
    } finally {
        pool.end();
        // Force exit because pool hangs?
        process.exit(0);
    }
}

verifyLiquidation();
