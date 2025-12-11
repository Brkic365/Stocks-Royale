export const generateNews = (stocks) => {
    if (!stocks || stocks.length === 0) return null;

    const stock = stocks[Math.floor(Math.random() * stocks.length)];
    const sentiment = Math.random() > 0.5 ? 'POSITIVE' : 'NEGATIVE';

    const positiveTemplates = [
        "{symbol} reports record breaking earnings for Q4.",
        "Analysts upgrade {symbol} to 'Strong Buy'.",
        "New partnership announced by {symbol} drives investor confidence.",
        "{symbol} unveils revolutionary new product line.",
        "Market sentiment shifts in favor of {symbol} after CEO interview.",
        "Elon Musk tweets 'I kinda like {symbol}' causing price surge.",
        "Reddit traders on r/WallStreetBets start pumping {symbol} to the moon! 🚀",
        "{symbol} announces it will accept Dogecoin for payments."
    ];

    const negativeTemplates = [
        "{symbol} faces regulatory scrutiny over new practices.",
        "Supply chain issues likely to impact {symbol} revenue.",
        "Analysts downgrade {symbol} amid market uncertainty.",
        "{symbol} misses earnings expectations by wide margin.",
        "CEO of {symbol} steps down unexpectedly.",
        "Elon Musk tweets 'selling my {symbol} shares' causes panic.",
        "Insider trading paradox detected at {symbol} headquarters.",
        "{symbol} accidentally deletes their production database."
    ];

    const template = sentiment === 'POSITIVE'
        ? positiveTemplates[Math.floor(Math.random() * positiveTemplates.length)]
        : negativeTemplates[Math.floor(Math.random() * negativeTemplates.length)];

    const headline = template.replace("{symbol}", stock.symbol);

    return {
        id: Date.now(),
        headline,
        symbol: stock.symbol,
        sentiment,
        timestamp: new Date().toISOString()
    };
};
