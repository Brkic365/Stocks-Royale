import { createPosition, getPositionsByUser, closePosition as closePositionModel, getPositionById, updatePositionSize } from "../models/positionModel.js";
import { getUserById, updateUserBalance } from "../models/userModel.js";
import { getStockBySymbol } from "../models/stockModel.js";
import { createTransaction } from "../models/transactionModel.js";
import { calculatePnL, validatePosition } from "../services/positionService.js";

export async function openPosition(req, res) {
    try {
        const { stockSymbol, type, amount, leverage, stopLoss, takeProfit } = req.body;
        const userId = req.user.id;

        // Validate inputs
        if (!stockSymbol || !type || !amount || !leverage) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        if (!['LONG', 'SHORT'].includes(type)) {
            return res.status(400).json({ error: 'Invalid position type' });
        }

        // Get user and check balance
        const user = await getUserById(userId);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        const userBalance = parseFloat(user.balance);
        const positionAmount = parseFloat(amount);
        const positionLeverage = parseInt(leverage);

        // Validate position
        const validation = validatePosition(positionAmount, positionLeverage, userBalance);
        if (!validation.valid) {
            return res.status(400).json({ error: validation.error });
        }

        // Get stock
        const stock = await getStockBySymbol(stockSymbol);
        if (!stock) {
            return res.status(404).json({ error: 'Stock not found' });
        }

        const entryPrice = parseFloat(stock.current_price);

        // Calculate amount of shares from the USD investment amount
        const sharesAmount = (positionAmount * positionLeverage) / entryPrice; // Leveraged Shares

        // Deduct USD amount from user balance
        const newBalance = userBalance - positionAmount;
        await updateUserBalance(userId, newBalance);

        // Create position (Store 'amount' as SHARES in DB for consistency with PnL calculation)
        const position = await createPosition(
            userId,
            stock.id,
            type,
            entryPrice,
            sharesAmount, // Storing LEVERAGED SHARES now
            positionLeverage,
            stopLoss || null,
            takeProfit || null
        );

        // Create transaction record
        await createTransaction(userId, position.id, 'TRADE_OPEN', -positionAmount, newBalance);

        res.status(201).json({
            success: true,
            position,
            newBalance
        });
    } catch (error) {
        console.error('Error opening position:', error);
        res.status(500).json({ error: 'Failed to open position' });
    }
}

export async function getMyPositions(req, res) {
    try {
        const userId = req.user.id;
        const { status } = req.query;

        const positions = await getPositionsByUser(userId, status);

        // Convert string values to numbers for each position
        const formattedPositions = positions.map(pos => ({
            ...pos,
            entry_price: parseFloat(pos.entry_price),
            current_price: parseFloat(pos.current_price),
            amount: parseFloat(pos.amount),
            leverage: parseInt(pos.leverage),
            stop_loss: pos.stop_loss ? parseFloat(pos.stop_loss) : null,
            take_profit: pos.take_profit ? parseFloat(pos.take_profit) : null,
            pnl: parseFloat(pos.pnl)
        }));

        res.json(formattedPositions);
    } catch (error) {
        console.error('Error fetching positions:', error);
        res.status(500).json({ error: 'Failed to fetch positions' });
    }
}

export async function closePosition(req, res) {
    try {
        const { id } = req.params;
        const userId = req.user.id;

        // Get position
        const position = await getPositionById(id);
        if (!position) {
            return res.status(404).json({ error: 'Position not found' });
        }

        // Check ownership
        if (position.user_id !== userId) {
            return res.status(403).json({ error: 'Not authorized' });
        }

        // Check if already closed
        if (position.status === 'CLOSED') {
            return res.status(400).json({ error: 'Position already closed' });
        }

        // Get current stock price
        const stock = await getStockBySymbol(position.symbol);
        const closePrice = parseFloat(stock.current_price);

        // Calculate final P&L
        const pnl = calculatePnL(position, closePrice);

        // Close position
        await closePositionModel(id, closePrice, pnl);

        // Update user balance
        const user = await getUserById(userId);
        const sharesAmount = parseFloat(position.amount); // stored as shares
        const entryPrice = parseFloat(position.entry_price);
        const leverage = parseInt(position.leverage); // get leverage

        // Initial Investment = (Shares * Entry Price) / Leverage (reverse the open logic)
        const initialInvestment = (sharesAmount * entryPrice) / leverage;

        const newBalance = parseFloat(user.balance) + initialInvestment + pnl;
        await updateUserBalance(userId, newBalance);

        // Create transaction
        const transactionType = pnl >= 0 ? 'PROFIT' : 'LOSS';
        // Total amount passed to transaction log for display? Usually just the PnL or total? 
        // Let's log the Total Return (Inv + PnL)
        await createTransaction(userId, id, 'TRADE_CLOSE', initialInvestment + pnl, newBalance);

        res.json({
            success: true,
            pnl,
            newBalance
        });
    } catch (error) {
        console.error('Error closing position:', error);
        res.status(500).json({ error: 'Failed to close position' });
    }
}

// Internal function for system liquidation (no req/res)
export async function liquidatePositionInternal(positionId, closePrice) {
    try {
        const position = await getPositionById(positionId);
        if (!position || position.status !== 'OPEN') return;

        // Calculate PnL (Should be approx -InitialInvestment)
        const pnl = calculatePnL(position, closePrice);

        // Close position
        await closePositionModel(positionId, closePrice, pnl);

        // Update user balance (Equity should be 0, but if negative, user loses everything invested, balance doesn't go below 0 usually?? 
        // Logic: Balance = Balance + Inv + PnL.
        // If PnL = -Inv, then Balance + 0. Correct.
        // If PnL < -Inv (Gap down), User loses more? 
        // For simplicity, let's floor the balance return at 0? 
        // "if user looses all of his money in the wallet" -> wait.
        // If equity in POSITION is 0, position closes. Result is 0 returned to wallet.
        // Wallet balance itself (cash) is unaffected unless we deduct gap loss.
        // Let's stick to standard Close logic.

        const user = await getUserById(position.user_id);
        const sharesAmount = parseFloat(position.amount);
        const entryPrice = parseFloat(position.entry_price);
        const leverage = parseInt(position.leverage);

        const initialInvestment = (sharesAmount * entryPrice) / leverage;
        const equity = initialInvestment + pnl;

        // Ensure we don't return negative money if gap down (unless we want debt)
        // For game logic, max loss is investment.
        const returnAmount = Math.max(0, equity);

        const newBalance = parseFloat(user.balance) + returnAmount;
        await updateUserBalance(position.user_id, newBalance);

        // Create transaction
        await createTransaction(position.user_id, positionId, 'LIQUIDATION', returnAmount, newBalance);

        console.log(`LIQUIDATED Position ${positionId} for User ${position.user_id}. PnL: ${pnl}`);
        return true;
    } catch (error) {
        console.error(`Failed to liquidate position ${positionId}:`, error);
        return false;
    }
}

export async function coinflipPosition(req, res) {
    const { id } = req.params;
    const userId = req.user.id;

    try {
        const position = await getPositionById(id);
        if (!position || position.user_id !== userId || position.status !== 'OPEN') {
            console.log(`[Coinflip] Invalid position or user mismatch. ID: ${id}, User: ${userId}`);
            return res.status(400).json({ error: 'Invalid position' });
        }

        console.log(`[Coinflip] Flipping for Position ${id}. Current Amount: ${position.amount}, Lev: ${position.leverage}`);

        const surviving = Math.random() >= 0.5;

        if (!surviving) {
            // TAILS - TOTAL LOSS
            console.log(`[Coinflip] Result: TAILS (Loss)`);
            const shares = parseFloat(position.amount);
            const entry = parseFloat(position.entry_price);
            const leverage = parseInt(position.leverage) || 1;
            const initialInvestment = (shares * entry) / leverage;

            const lossPnL = -initialInvestment;

            await closePositionModel(id, position.current_price, lossPnL);
            await createTransaction(userId, id, 'LIQUIDATION', 0, parseFloat(req.user.balance));

            return res.json({ result: 'LOSS', message: 'Tails... The coin has claimed your offering. (Total Loss)' });
        } else {
            // HEADS - YOU WIN (True Double Down)
            // User Feedback: "Doubling leverage" felt useless.
            // New Logic: Double the POSITION SIZE (Shares) but KEEP LEVERAGE THE SAME.
            // This effectively doubles the user's "Equity" in the trade for free.

            console.log(`[Coinflip] Result: HEADS (Win)`);

            const newAmount = parseFloat(position.amount) * 2;
            const currentLeverage = parseInt(position.leverage) || 1;
            // We do NOT double leverage. We give them free shares.

            await updatePositionSize(id, newAmount, currentLeverage);

            return res.json({ result: 'WIN', message: 'Heads! Position size doubled (Free Equity Injection)!' });
        }
    } catch (error) {
        console.error('[Coinflip] Error:', error);
        res.status(500).json({ error: 'Coin stuck in the air' });
    }
}
