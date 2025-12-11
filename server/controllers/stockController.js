import { getAllStocks } from "../models/stockModel.js";

export async function getStocks(req, res) {
    try {
        const stocks = await getAllStocks();
        res.json(stocks);
    } catch (error) {
        console.error("Error fetching stocks:", error);
        res.status(500).json({ error: "Failed to fetch stocks" });
    }
}
