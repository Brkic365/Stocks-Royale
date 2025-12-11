"use client";
import { LineChart, Line, ResponsiveContainer } from 'recharts';
import styles from '../../styles/components/TickerStrip.module.scss';

const TickerCard = ({ stock, onSelect, isSelected }) => {
  const isPositive = stock.volatility > 0;
  const sparklineData = Array.from({ length: 20 }, () => ({
    price: stock.current_price * (1 + (Math.random() - 0.5) * 0.05)
  }));

  return (
    <div 
      className={`${styles.tickerCard} ${isSelected ? styles.selected : ''}`}
      onClick={() => onSelect(stock)}
    >
      <div className={styles.header}>
        <div>
          <p className={styles.symbol}>{stock.symbol}/USD</p>
          <p className={styles.price}>${stock.current_price.toFixed(2)}</p>
        </div>
        <p className={`${styles.change} ${isPositive ? styles.positive : styles.negative}`}>
          {isPositive ? '▲' : '▼'} {(stock.volatility * 10).toFixed(2)}%
        </p>
      </div>
      <div className={styles.sparkline}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={sparklineData}>
            <Line type="monotone" dataKey="price" stroke={isPositive ? '#26a69a' : '#ef5350'} strokeWidth={2} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export default function TickerStrip({ stocks, onSelectStock, selectedSymbol }) {
  return (
    <div className={styles.stripContainer}>
      {stocks.slice(0, 4).map(stock => (
        <TickerCard 
          key={stock.id} 
          stock={stock} 
          onSelect={onSelectStock}
          isSelected={stock.symbol === selectedSymbol}
        />
      ))}
    </div>
  );
}