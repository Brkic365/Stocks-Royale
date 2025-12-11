import { getCandlesBySymbol } from "../models/candleModel.js";

let candleMemory = {};

export async function initMarket(stocks) {
    for (const stock of stocks) {
        // Try to load historical candles from database
        const dbCandles = await getCandlesBySymbol(stock.symbol);

        if (dbCandles && dbCandles.length > 0) {
            // Use database candles
            candleMemory[stock.symbol] = dbCandles.map(c => ({
                time: parseInt(c.time),
                open: parseFloat(c.open),
                high: parseFloat(c.high),
                low: parseFloat(c.low),
                close: parseFloat(c.close)
            }));
            console.log(`Loaded ${dbCandles.length} candles for ${stock.symbol} from database`);
        } else {
            // Initialize with current price if no historical data
            console.log(`[INIT] No DB candles for ${stock.symbol}. Using current_price: ${stock.current_price}`);
            candleMemory[stock.symbol] = [{
                time: Math.floor(Date.now() / 1000), // Ensure fresh timestamp
                open: parseFloat(stock.current_price),
                high: parseFloat(stock.current_price),
                low: parseFloat(stock.current_price),
                close: parseFloat(stock.current_price)
            }];
            console.log(`[INIT] Initialized ${stock.symbol} memory with $${stock.current_price}`);
        }
    }
}

export function addCandle(symbol, candle) {
    if (!candleMemory[symbol]) {
        candleMemory[symbol] = [];
    }

    candleMemory[symbol].push(candle);

    // Limit memory to last 500 candles
    if (candleMemory[symbol].length > 500) {
        candleMemory[symbol].shift();
    }
}

export function getCandles(symbol) {
    return candleMemory[symbol] || [];
}