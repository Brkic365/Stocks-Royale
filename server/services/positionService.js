// Position service - handles business logic for trading

export function calculatePnL(position, currentPrice) {
    const entryPrice = parseFloat(position.entry_price);
    const shares = parseFloat(position.amount); // amount is now SHARES
    const leverage = parseInt(position.leverage);
    const current = parseFloat(currentPrice);

    let pnl;

    if (position.type === 'LONG') {
        // Profit = (Current - Entry) * Shares
        // (Leverage is already baked into "Shares" count)
        pnl = (current - entryPrice) * shares;
    } else {
        // Profit = (Entry - Current) * Shares
        pnl = (entryPrice - current) * shares;
    }

    return parseFloat(pnl.toFixed(2));
}

export function checkStopLoss(position, currentPrice) {
    if (!position.stop_loss) return false;

    const stopLoss = parseFloat(position.stop_loss);
    const current = parseFloat(currentPrice);

    if (position.type === 'LONG') {
        // Long position: stop loss triggers when price drops below stop loss
        return current <= stopLoss;
    } else {
        // Short position: stop loss triggers when price rises above stop loss
        return current >= stopLoss;
    }
}

export function checkTakeProfit(position, currentPrice) {
    if (!position.take_profit) return false;

    const takeProfit = parseFloat(position.take_profit);
    const current = parseFloat(currentPrice);

    if (position.type === 'LONG') {
        // Long position: take profit triggers when price rises above take profit
        return current >= takeProfit;
    } else {
        // Short position: take profit triggers when price drops below take profit
        return current <= takeProfit;
    }
}

export function validatePosition(amount, leverage, userBalance) {
    // Check if user has enough balance
    if (amount > userBalance) {
        return { valid: false, error: 'Insufficient balance' };
    }

    // Check minimum amount
    if (amount < 1) {
        return { valid: false, error: 'Minimum position size is $1' };
    }

    // Check leverage limits
    if (leverage < 1 || leverage > 100) {
        return { valid: false, error: 'Leverage must be between 1x and 100x' };
    }

    return { valid: true };
}

export function checkLiquidation(position, currentPrice) {
    const entryPrice = parseFloat(position.entry_price);
    const shares = parseFloat(position.amount);
    const leverage = parseInt(position.leverage) || 1;
    const current = parseFloat(currentPrice);

    // Initial Investment = (Shares * Entry) / Leverage
    const initialInvestment = (shares * entryPrice) / leverage;

    let pnl;
    if (position.type === 'LONG') {
        pnl = (current - entryPrice) * shares;
    } else {
        pnl = (entryPrice - current) * shares;
    }

    // Equity = Initial Investment + PnL
    const equity = initialInvestment + pnl;

    // Liquidate if Equity drops to 0 or below
    return equity <= 0;
}
