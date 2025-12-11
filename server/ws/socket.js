import { saveCandle } from "../models/candleModel.js";
import { updateStockPrice } from "../models/stockModel.js";
import { generateCandle } from "../market/engine.js";
import { addCandle, getCandles } from "../market/state.js";
import { generateNews } from "../services/newsService.js";
import { getOpenPositionsByStockId } from "../models/positionModel.js";
import { checkLiquidation } from "../services/positionService.js";
import { liquidatePositionInternal } from "../controllers/positionController.js";
import { resolveBetInternal, getPendingBetsByStockId } from "../controllers/betController.js";
import { getUserById, updateUserBalance } from "../models/userModel.js";

let interval = null;

// Store recent news
// Store recent news
const newsHistory = [];

export default function setupSockets(io, stocks) {
    io.on("connection", socket => {
        console.log("Client connected");

        // Send recent news immediately
        socket.emit("initial_news", newsHistory);

        socket.on("subscribe_stock", (symbol) => {
            socket.join(symbol);
            socket.emit("initial_candles", {
                symbol,
                candles: getCandles(symbol)
            });
        });
    });

    // MARKET ENGINE LOOP
    if (!interval) {
        // ... (keep engine loop)
        interval = setInterval(async () => {
            // ... existing engine code ...
            for (let stock of stocks) {
                const candles = getCandles(stock.symbol);
                const lastClose = candles[candles.length - 1].close;
                const newCandle = generateCandle(lastClose, stock.volatility);
                addCandle(stock.symbol, newCandle);
                await saveCandle(stock.id, newCandle);
                await updateStockPrice(stock.symbol, newCandle.close);

                // Check for liquidations
                const openPositions = await getOpenPositionsByStockId(stock.id);
                for (let pos of openPositions) {
                    if (checkLiquidation(pos, newCandle.close)) {
                        console.log(`LIQUIDATING Position ${pos.id} (Stock: ${stock.symbol})`);
                        await liquidatePositionInternal(pos.id, newCandle.close);
                    }
                }

                // CHECK BETS (Green/Red)
                const pendingBets = await getPendingBetsByStockId(stock.id);
                for (let bet of pendingBets) {
                    const isGreen = newCandle.close >= newCandle.open; // Green candle
                    const predictedGreen = bet.prediction === 'GREEN';
                    const win = (isGreen && predictedGreen) || (!isGreen && !predictedGreen);

                    if (win) {
                        const payout = parseFloat(bet.amount) * 1.9;
                        await resolveBetInternal(bet.id, true, payout);

                        // Update User Balance
                        const user = await getUserById(bet.user_id);
                        const newBal = parseFloat(user.balance) + payout;
                        await updateUserBalance(bet.user_id, newBal);

                        // Transaction logic if you want to track it
                        // await createTransaction(bet.user_id, null, 'PROFIT', payout, newBal); // Optional

                        console.log(`BET WIN: User ${bet.user_id} won $${payout} on ${stock.symbol}`);
                        io.emit("bet_result", { betId: bet.id, userId: bet.user_id, result: 'WIN', payout });
                    } else {
                        await resolveBetInternal(bet.id, false, 0);
                        console.log(`BET LOSS: User ${bet.user_id} lost on ${stock.symbol}`);
                        io.emit("bet_result", { betId: bet.id, userId: bet.user_id, result: 'LOSS', payout: 0 });
                    }
                }

                io.to(stock.symbol).emit("new_candle", {
                    symbol: stock.symbol,
                    candle: newCandle
                });
            }
        }, 5000);

        // NEWS GENERATION LOOP
        setInterval(() => {
            const newsItem = generateNews(stocks);
            if (newsItem) {
                // Add to history
                newsHistory.unshift(newsItem);
                if (newsHistory.length > 20) newsHistory.pop();

                io.emit("news_update", newsItem);
            }
        }, 8000); // New news every 8 seconds
    }
}
