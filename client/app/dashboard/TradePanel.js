"use client";
import { useState, useEffect } from 'react';
import api from '@/utils/api';
import styles from '../../styles/components/TradePanel.module.scss';
import { getToken } from '@/utils/auth';
import { useAuth } from '@/contexts/AuthContext';
import { useHoldings } from '../../contexts/HoldingsContext';

// Helper component for buttons
const ButtonGroup = ({ options, selected, onSelect }) => (
  <div className={styles.buttonGroup}>
    {options.map(opt => (
      <button
        key={opt}
        className={selected === opt ? styles.active : ''}
        onClick={() => onSelect(opt)}
      >
        {opt}
      </button>
    ))}
  </div>
);

export default function TradePanel({ stock }) {
  const [tradeType, setTradeType] = useState('BUY');
  const [amount, setAmount] = useState('500.00');
  const [leverage, setLeverage] = useState(1);

  const [stopLossPercent, setStopLossPercent] = useState(null);
  const [stopLossPrice, setStopLossPrice] = useState('');

  const [takeProfitPercent, setTakeProfitPercent] = useState(null);
  const [takeProfitPrice, setTakeProfitPrice] = useState('');

  const { refetch: refetchHoldings } = useHoldings();
  const { refreshUser, user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  // Helper functions
  const parsePercent = (percentString) => {
    if (!percentString) return NaN;
    return parseFloat(percentString.replace('%', '')) / 100;
  }

  // Auto-calculate SL price
  useEffect(() => {
    if (!stock || !stopLossPercent) {
      if (!stopLossPrice) setStopLossPrice('');
      return;
    };

    const entryPrice = stock.current_price;
    const slPercentValue = parsePercent(stopLossPercent);
    let newPrice;

    if (tradeType === 'BUY') {
      newPrice = entryPrice * (1 - (Math.abs(slPercentValue) / leverage));
    } else { // SELL
      newPrice = entryPrice * (1 + (Math.abs(slPercentValue) / leverage));
    }

    if (!isNaN(newPrice)) setStopLossPrice(newPrice.toFixed(2));
  }, [stock, leverage, stopLossPercent, tradeType]);

  // Auto-calculate TP price
  useEffect(() => {
    if (!stock || !takeProfitPercent) {
      if (!takeProfitPrice) setTakeProfitPrice('');
      return;
    };

    const entryPrice = stock.current_price;
    const tpPercentValue = parsePercent(takeProfitPercent);
    let newPrice;

    if (tradeType === 'BUY') {
      newPrice = entryPrice * (1 + (tpPercentValue / leverage));
    } else { // SELL
      newPrice = entryPrice * (1 - (tpPercentValue / leverage));
    }

    if (!isNaN(newPrice)) setTakeProfitPrice(newPrice.toFixed(2));
  }, [stock, leverage, takeProfitPercent, tradeType]);

  // Handler for manual price input
  const handlePriceInputChange = (value, type) => {
    const regex = /^\d*(\.?\d{0,2})$/;
    if (!regex.test(value)) return;

    if (type === 'stopLoss') {
      setStopLossPrice(value);
      setStopLossPercent(null);
    } else if (type === 'takeProfit') {
      setTakeProfitPrice(value);
      setTakeProfitPercent(null);
    }
  };

  const handlePriceInputBlur = (type) => {
    const priceStr = type === 'stopLoss' ? stopLossPrice : takeProfitPrice;
    const price = parseFloat(priceStr);

    if (isNaN(price) || !stock || price === 0) {
      if (type === 'stopLoss') {
        setStopLossPrice('');
        setStopLossPercent(null);
      } else {
        setTakeProfitPrice('');
        setTakeProfitPercent(null);
      }
      return;
    }

    const entryPrice = stock.current_price;
    let percentChange;

    if (tradeType === 'BUY') {
      percentChange = ((price - entryPrice) / entryPrice) * 100 * leverage;
    } else { // SELL
      percentChange = ((entryPrice - price) / entryPrice) * 100 * leverage;
    }

    const formattedPercent = `${percentChange > 0 ? '+' : ''}${percentChange.toFixed(0)}%`;

    if (type === 'stopLoss') {
      setStopLossPrice(price.toFixed(2));
      setStopLossPercent(formattedPercent);
    } else {
      setTakeProfitPrice(price.toFixed(2));
      setTakeProfitPercent(formattedPercent);
    }
  };

  const handleHandleAmountChange = (e) => {
    const value = e.target.value;
    const regex = /^\d*(\.?\d{0,2})$/;
    if (regex.test(value)) setAmount(value);
  };
  const handleAmountBlur = () => {
    const numValue = parseFloat(amount);
    setAmount(!isNaN(numValue) ? numValue.toFixed(2) : '0.00');
  };

  const handleTrade = async () => {
    setError(null);
    setSuccess(null);
    setIsSubmitting(true);

    try {
      const token = getToken();
      if (!token) throw new Error("Not authenticated");

      const payload = {
        stockSymbol: stock.symbol,
        type: tradeType === 'BUY' ? 'LONG' : 'SHORT',
        amount: parseFloat(amount),
        leverage: parseInt(leverage),
        stopLoss: stopLossPrice ? parseFloat(stopLossPrice) : null,
        takeProfit: takeProfitPrice ? parseFloat(takeProfitPrice) : null
      };

      await api.post('/positions', payload);

      setSuccess("Order placed successfully!");
      // Refresh data if available
      if (refetchHoldings) refetchHoldings();
      if (refreshUser) refreshUser();

    } catch (err) {
      console.error(err);
      setError(err.response?.data?.error || "Failed to place order");
    } finally {
      setIsSubmitting(false);
      // Hide success message after 3 seconds
      setTimeout(() => setSuccess(null), 3000);
    }
  };

  if (!stock) {
    return <div className={styles.panelContainer}></div>;
  }

  const numericAmount = parseFloat(amount) || 0;

  // STANDARD MODE RENDER
  return (
    <div className={styles.panelContainer}>

      <div className={styles.tradeTypeToggle}>
        <div className={`${styles.slider} ${tradeType === 'SELL' ? styles.sliderSell : ''}`} />
        <button onClick={() => setTradeType('BUY')} className={tradeType === 'BUY' ? styles.active : ''}>BUY</button>
        <button onClick={() => setTradeType('SELL')} className={tradeType === 'SELL' ? styles.active : ''}>SELL</button>
      </div>

      <div className={styles.inputGroup}>
        <label htmlFor="amount">Amount</label>
        <div className={styles.inputWrapper}>
          <input type="text" inputMode="decimal" id="amount" value={amount} onChange={handleHandleAmountChange} onBlur={handleAmountBlur} placeholder="0.00" />
          <span>USD</span>
        </div>
      </div>

      <div className={styles.inputGroup}>
        <div className={styles.leverageHeader}>
          <label htmlFor="leverage">Leverage</label>
          <span className={`${styles.riskTag} ${leverage <= 25 ? styles.lowRisk :
            leverage <= 75 ? styles.mediumRisk :
              styles.highRisk
            }`}>
            {leverage <= 25 ? 'Low Risk' : leverage <= 75 ? 'Medium Risk' : 'High Risk'}
          </span>
        </div>
        <h3 className={styles.leverageDisplay}>{leverage}x</h3>
        <div className={styles.leverageControl}>
          <input
            type="range" id="leverage" min="1" max="100" step="1"
            value={leverage} onChange={(e) => setLeverage(Number(e.target.value))}
            style={{ '--leverage-percent': `${(leverage - 1) / 99 * 100}%` }}
          />
        </div>
        <div className={styles.sliderTicks}>
          <span>0</span><span>25</span><span>50</span><span>75</span><span>100</span>
        </div>
      </div>

      <div className={styles.inputGroup}>
        <label>Stop Loss</label>
        <div className={styles.priceInputSection}>
          <input
            type="text" inputMode="decimal" placeholder="Price"
            value={stopLossPrice}
            onChange={(e) => handlePriceInputChange(e.target.value, 'stopLoss')}
            onBlur={() => handlePriceInputBlur('stopLoss')}
          />
          {stopLossPercent && <span className={styles.percentageDisplay}>{stopLossPercent}</span>}
        </div>
        <ButtonGroup
          options={['-10%', '-25%', '-50%']}
          selected={stopLossPercent}
          onSelect={setStopLossPercent}
        />
      </div>

      <div className={styles.inputGroup}>
        <label>Take Profit</label>
        <div className={styles.priceInputSection}>
          <input
            type="text" inputMode="decimal" placeholder="Price"
            value={takeProfitPrice}
            onChange={(e) => handlePriceInputChange(e.target.value, 'takeProfit')}
            onBlur={() => handlePriceInputBlur('takeProfit')}
          />
          {takeProfitPercent && <span className={styles.percentageDisplay}>{takeProfitPercent}</span>}
        </div>
        <ButtonGroup
          options={['+25%', '+50%', '+100%']}
          selected={takeProfitPercent}
          onSelect={setTakeProfitPercent}
        />
      </div>

      <div className={styles.messageBox}>
        {error && <div className={styles.error}>{error}</div>}
        {success && <div className={styles.success}>{success}</div>}
      </div>

      <button className={styles.placeOrderButton} onClick={handleTrade} disabled={isSubmitting}>
        {isSubmitting ? 'Processing...' : `Place ${tradeType}`}
      </button>

      <div className={styles.orderInfo}>
        <div className={styles.infoRow}><span>Execution price</span><span>~{stock.current_price?.toFixed(2)}</span></div>
        <div className={styles.infoRow}><span>Notional value</span><span>{(numericAmount * leverage).toFixed(2)} USD</span></div>
        <div className={styles.infoRow}><span>Wallet Balance</span><span>{user?.balance ? user.balance.toFixed(2) : '0.00'} USD</span></div>
      </div>
    </div>
  );
}