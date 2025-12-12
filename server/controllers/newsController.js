import { getRecentNews } from "../models/newsModel.js";

export const getNewsHistory = async (req, res) => {
    try {
        const news = await getRecentNews();
        res.json(news);
    } catch (error) {
        console.error("Error fetching news:", error);
        res.status(500).json({ error: "Failed to fetch news history" });
    }
};
