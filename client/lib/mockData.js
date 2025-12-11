// lib/mockData.js

// --- MOCK STOCKS DATA ---
// Simuliramo dionice s različitim parametrima.
export const mockStocks = [
  {
    id: 1,
    name: "QuantumLeap Tech",
    symbol: "QLT",
    current_price: 450.78,
    volatility: 0.05, // 5% base volatility
    sector: "Technology",
  },
  {
    id: 2,
    name: "BioGen Innovations",
    symbol: "BGI",
    current_price: 120.34,
    volatility: 0.08, // Higher volatility
    sector: "Healthcare",
  },
  {
    id: 3,
    name: "EcoPower Renewables",
    symbol: "EPR",
    current_price: 85.50,
    volatility: -0.02, // Currently in a slight downtrend
    sector: "Energy",
  },
  {
    id: 4,
    name: "CyberNet Security",
    symbol: "CNS",
    current_price: 215.12,
    volatility: 0.12, // High volatility
    sector: "Technology",
  },
  {
    id: 5,
    name: "Stellar Foods",
    symbol: "STF",
    current_price: 65.22,
    volatility: 0.01, // Stable stock
    sector: "Consumer Goods",
  },
];


// --- MOCK HOLDINGS (PORTFOLIO) DATA ---
// Simuliramo što korisnik trenutno posjeduje.
export const mockHoldings = [
  {
    id: 101,
    stock_id: 1, // QLT
    amount: 10, // 10 shares
    avg_price: 430.25,
    leverage: 2,
  },
  {
    id: 102,
    stock_id: 3, // EPR
    amount: 50,
    avg_price: 90.10, // Currently at a loss
    leverage: 1,
  },
  {
    id: 103,
    stock_id: 4, // CNS
    amount: 5,
    avg_price: 205.80,
    leverage: 5, // High leverage position
  },
];


// --- MOCK TRADES (HISTORY) DATA ---
// Simuliramo povijest trgovanja.
export const mockTrades = [
  {
    id: 1001,
    stock_id: 4, // CNS
    type: 'BUY',
    amount: 5,
    price: 205.80,
    leverage: 5,
    result: null, // This is an open position
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
  },
  {
    id: 1002,
    stock_id: 2, // BGI
    type: 'BUY',
    amount: 10,
    price: 115.50,
    leverage: 1,
    result: null, // This trade was closed by the one below
    timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
  },
  {
    id: 1003,
    stock_id: 2, // BGI
    type: 'SELL',
    amount: 10,
    price: 125.00,
    leverage: 1,
    result: 95.00, // Profit of (125 - 115.50) * 10 = $95.00
    timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(), // 5 hours ago
  },
];

export const generateCandlestickData = (basePrice) => {
  const data = [];
  let currentPrice = basePrice;
  
  // Start from 100 periods ago (in seconds)
  const baseTime = Math.floor(Date.now() / 1000) - (100 * 5 * 60);
  
  for (let i = 0; i < 100; i++) {
    const time = baseTime + (i * 5 * 60); // 5-minute intervals
    
    const open = currentPrice;
    const volatility = 0.02;
    const change = (Math.random() - 0.5) * 2 * volatility * basePrice;
    let close = open + change;
    
    // Ensure realistic high/low values
    const high = Math.max(open, close) + Math.random() * volatility * basePrice * 0.3;
    const low = Math.min(open, close) - Math.random() * volatility * basePrice * 0.3;
    
    // Ensure prices are positive
    close = Math.max(close, 0.01);
    
    data.push({ 
      time: time, 
      open: parseFloat(open.toFixed(2)), 
      high: parseFloat(high.toFixed(2)), 
      low: parseFloat(Math.max(low, 0.01).toFixed(2)), 
      close: parseFloat(close.toFixed(2))
    });
    
    currentPrice = close;
  }
  
  return data;
};

// Alternative function if the above doesn't work - using business days
export const generateBusinessDayCandlestickData = (basePrice) => {
  const data = [];
  let currentPrice = basePrice;
  
  const today = new Date();
  const baseDate = new Date(today);
  baseDate.setDate(baseDate.getDate() - 100); // Start 100 days ago
  
  for (let i = 0; i < 100; i++) {
    const date = new Date(baseDate);
    date.setDate(date.getDate() + i);
    
    // Skip weekends for business days
    if (date.getDay() === 0 || date.getDay() === 6) continue;
    
    const time = date.toISOString().split('T')[0]; // Format as YYYY-MM-DD
    
    const open = currentPrice;
    const volatility = 0.02;
    const change = (Math.random() - 0.5) * 2 * volatility * basePrice;
    let close = open + change;
    const high = Math.max(open, close) + Math.random() * volatility * basePrice * 0.5;
    const low = Math.min(open, close) - Math.random() * volatility * basePrice * 0.5;
    
    close = Math.max(close, 0.01);
    
    data.push({ 
      time: time, 
      open: Number(open.toFixed(2)), 
      high: Number(high.toFixed(2)), 
      low: Number(Math.max(low, 0.01).toFixed(2)), 
      close: Number(close.toFixed(2))
    });
    
    currentPrice = close;
  }
  
  return data;
};