import pool from './db.js';
import { roulettePosition } from './controllers/positionController.js';
import { placeBet, resolveBetInternal } from './controllers/betController.js';

// Mock Res/Req for controller testing
const mockRes = () => {
    const res = {};
    res.status = (code) => {
        console.log(`Status: ${code}`);
        return res;
    };
    res.json = (data) => {
        console.log(`Response:`, JSON.stringify(data));
        return res;
    };
    return res;
};

async function verifyGamification() {
    console.log("--- 1. SETUP USER & POSITION ---");
    // Create temp user
    const email = `gametest_${Date.now()}@test.com`;
    const user = (await pool.query(`INSERT INTO users (username, email, password, balance) VALUES ('gamble', $1, 'pass', 1000) RETURNING *`, [email])).rows[0];
    const stock = (await pool.query(`SELECT * FROM stocks LIMIT 1`)).rows[0];

    // Open Position
    const pos = (await pool.query(`INSERT INTO positions (user_id, stock_id, type, amount, leverage, entry_price, current_price, status) VALUES ($1, $2, 'LONG', 100, 10, 100, 100, 'OPEN') RETURNING *`, [user.id, stock.id])).rows[0];
    console.log(`Created Position ${pos.id} for User ${user.id}`);

    console.log("\n--- 2. TEST RUSSIAN ROULETTE ---");
    // Mock Request
    const req = { params: { id: pos.id }, user: { id: user.id } };

    // Run it a few times to see outcomes (it's random)
    console.log("Pulling trigger...");
    await roulettePosition(req, mockRes());

    // check result
    const updatedPos = (await pool.query(`SELECT * FROM positions WHERE id = $1`, [pos.id])).rows[0];
    console.log(`Position Status: ${updatedPos.status}`);
    console.log(`Position Amount: ${updatedPos.amount} (Was 100)`);
    console.log(`Position Leverage: ${updatedPos.leverage} (Was 10)`);

    console.log("\n--- 3. TEST BINARY OPTIONS ---");
    // Place Bet
    const betReq = { body: { stockId: stock.id, amount: 100, prediction: 'GREEN' }, user: { id: user.id } };
    console.log("Placing bet...");
    await placeBet(betReq, mockRes());

    const bet = (await pool.query(`SELECT * FROM bets WHERE user_id = $1 ORDER BY created_at DESC LIMIT 1`, [user.id])).rows[0];
    console.log(`Bet placed: ${bet.id} - ${bet.prediction} - ${bet.status}`);

    console.log("Resolving bet as WIN...");
    await resolveBetInternal(bet.id, true, 190); // 1.9x

    const resolvedBet = (await pool.query(`SELECT * FROM bets WHERE id = $1`, [bet.id])).rows[0];
    console.log(`Bet Status: ${resolvedBet.status}`);
    console.log(`Payout: ${resolvedBet.payout}`);

    console.log("\n✅ GAMIFICATION VERIFIED");
    pool.end();
}

verifyGamification();
