export function generateCandle(previousClose, vol) {
    const volatility = Math.abs(vol);

    // Ensure open equals previous close for continuity
    const open = previousClose;

    // MEAN REVERSION LOGIC
    // Target price range: $10 - $600
    let drift = 0;

    if (previousClose > 600) {
        // Force price down if too high
        drift = -0.02 * volatility;
    } else if (previousClose < 10) {
        // Force price up if too low
        drift = 0.02 * volatility;
    } else {
        // Random walk with tiny bias towards mean (300)
        const mean = 300;
        const dist = (mean - previousClose) / mean;
        drift = (Math.random() - 0.5 + (dist * 0.05)) * volatility * 0.5;
    }

    const close = open * (1 + drift);

    // High and low should be within the range of open and close
    const maxPrice = Math.max(open, close);
    const minPrice = Math.min(open, close);

    // Add some wick to high and low
    const wickRange = Math.abs(close - open) * 0.5;
    const high = maxPrice + (Math.random() * wickRange);
    const low = Math.max(0.01, minPrice - (Math.random() * wickRange)); // Prevent negative

    return {
        time: Math.floor(Date.now() / 1000),
        open: parseFloat(open.toFixed(2)),
        high: parseFloat(high.toFixed(2)),
        low: parseFloat(low.toFixed(2)),
        close: parseFloat(close.toFixed(2)),
    };
}
