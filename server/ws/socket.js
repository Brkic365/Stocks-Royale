import { saveCandle } from "../models/candleModel.js";
import { updateStockPrice } from "../models/stockModel.js";
import { generateCandle } from "../market/engine.js";
import { addCandle, getCandles } from "../market/state.js";
import { generateNews } from "../services/newsService.js";
import { getOpenPositionsByStockId } from "../models/positionModel.js";
import { checkLiquidation } from "../services/positionService.js";
import { liquidatePositionInternal } from "../controllers/positionController.js";
import { getUserById, updateUserBalance } from "../models/userModel.js";
import { createNews, getRecentNews } from "../models/newsModel.js";

let interval = null;

export default function setupSockets(io, stocks) {
    io.on("connection", async socket => {
        console.log("Client connected");

        // Send recent news from DB
        try {
            const newsHistory = await getRecentNews(20);
            socket.emit("initial_news", newsHistory);
        } catch (err) {
            console.error("Error sending initial news:", err);
        }

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
        interval = setInterval(async () => {
            for (let stock of stocks) {
                const candles = getCandles(stock.symbol);
                if (!candles || candles.length === 0) continue;

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

                io.to(stock.symbol).emit("new_candle", {
                    symbol: stock.symbol,
                    candle: newCandle
                });
            }
        }, 5000);

        // NEWS GENERATION LOOP
        setInterval(async () => {
            const newsItem = generateNews(stocks);
            if (newsItem) {
                try {
                    // Save to DB
                    const savedNews = await createNews(newsItem.symbol, newsItem.headline, newsItem.sentiment);
                    io.emit("news_update", savedNews);
                } catch (err) {
                    console.error("Error saving news:", err);
                }
            }
        }, 8000);
    }
}
