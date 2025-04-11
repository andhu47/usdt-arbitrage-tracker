import React, { useEffect, useState } from "react";
import { createRoot } from "react-dom/client";

const exchanges = [
  {
    name: "Binance",
    url: "https://api.binance.com/api/v3/ticker/price?symbol=USDTUSD",
    parse: (data) => parseFloat(data.price),
  },
  {
    name: "KuCoin",
    url: "https://api.kucoin.com/api/v1/market/orderbook/level1?symbol=USDT-USDT",
    parse: (data) => parseFloat(data.data.price),
  },
  {
    name: "Kraken",
    url: "https://api.kraken.com/0/public/Ticker?pair=USDTUSD",
    parse: (data) => parseFloat(Object.values(data.result)[0].c[0]),
  },
  {
    name: "Bybit",
    url: "https://api.bybit.com/v2/public/tickers?symbol=USDTUSD",
    parse: (data) => {
      const result = data.result?.find(t => t.symbol === "USDTUSD");
      return result ? parseFloat(result.last_price) : null;
    },
  },
  {
    name: "Gate.io",
    url: "https://api.gate.io/api2/1/ticker/usdt_usd",
    parse: (data) => parseFloat(data.last),
  },
  {
    name: "Huobi",
    url: "https://api.huobi.pro/market/detail/merged?symbol=usdtusd",
    parse: (data) => parseFloat(data.tick.close),
  },
  {
    name: "OKX",
    url: "https://www.okx.com/api/v5/market/ticker?instId=USDT-USD",
    parse: (data) => parseFloat(data.data[0].last),
  }
];

function App() {
  const [prices, setPrices] = useState([]);

  useEffect(() => {
    async function fetchPrices() {
      const results = await Promise.all(
        exchanges.map(async (ex) => {
          try {
            const res = await fetch(ex.url);
            const data = await res.json();
            const price = ex.parse(data);
            return { name: ex.name, price };
          } catch (err) {
            console.error(`Error fetching ${ex.name}:`, err);
            return { name: ex.name, price: null };
          }
        })
      );
      setPrices(results.filter(p => p.price));
    }

    fetchPrices();
    const interval = setInterval(fetchPrices, 15000);
    return () => clearInterval(interval);
  }, []);

  if (prices.length === 0) return <div style={{ padding: 20 }}>Loading prices...</div>;

  const bestBuy = prices.reduce((min, ex) => ex.price < min.price ? ex : min, { price: Infinity });
  const bestSell = prices.reduce((max, ex) => ex.price > max.price ? ex : max, { price: -Infinity });

  return (
    <div style={{ padding: 20, maxWidth: 900, margin: "0 auto", fontFamily: "Arial" }}>
      <h1 style={{ fontSize: 28 }}>USDT Arbitrage Tracker</h1>
      <p><strong>Best Buy:</strong> {bestBuy.name} @ ${bestBuy.price.toFixed(4)}</p>
      <p><strong>Best Sell:</strong> {bestSell.name} @ ${bestSell.price.toFixed(4)}</p>
      <p style={{ color: 'green' }}><strong>Profit:</strong> ${(bestSell.price - bestBuy.price).toFixed(4)} per USDT</p>
      <div style={{ marginTop: 30 }}>
        {prices.map((ex, idx) => (
          <div key={idx} style={{ padding: 10, border: "1px solid #ccc", marginBottom: 10, borderRadius: 6 }}>
            <strong>{ex.name}</strong>: ${ex.price.toFixed(4)}
          </div>
        ))}
      </div>
    </div>
  );
}

const container = document.getElementById("root");
if (container) {
  const root = createRoot(container);
  root.render(<App />);
}