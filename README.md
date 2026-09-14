# MarketMind

> **Don't just see what moved. Ask MarketMind why.**

MarketMind is an AI-powered cryptocurrency market intelligence platform that transforms raw CoinMarketCap market data into understandable market insights.

Instead of simply showing prices and percentage changes, MarketMind analyzes market-wide data to identify momentum, volume expansion, selloffs, anomalies, confirmation, divergence, and absorption signals, then uses Gemini AI to explain what the data is showing.

## Why MarketMind?

Crypto markets generate a huge amount of data, but raw numbers do not always explain what is happening.

MarketMind combines:

**CoinMarketCap data → Market analytics → AI reasoning → Human-readable insight**

The goal is simple:

> **CoinMarketCap gives you the data. MarketMind explains what the data means.**

---

## Key Features

### 📊 Market Intelligence

MarketMind analyzes a broad set of cryptocurrency market metrics, including:

- Price changes
- Market capitalization
- Trading volume
- Volume changes
- 1h, 24h, 7d and 30d performance
- Market-cap dominance
- Market breadth
- Market momentum

### 🧠 Market Score

MarketMind calculates an overall market score using:

- Positive vs. negative market breadth
- Market-cap-weighted price performance
- Exclusion of major stablecoins from directional intelligence

The score is converted into a simple market regime such as bullish, bearish, or neutral.

### 🔎 Intelligence Feed

The analytics engine identifies market signals including:

- Momentum
- Volume expansion
- Selloffs
- Anomalies
- Confirmation
- Divergence
- Absorption

Signals are ranked by strength and intelligently prioritized so that a single asset does not dominate the entire feed.

### 🪙 Token Intelligence

Each supported token has its own intelligence page showing relevant market information and AI analysis.

### 🤖 Ask MarketMind

Users can ask natural-language questions about the current market.

Examples:

- Why is the market moving this way?
- Which assets show unusual activity?
- Is volume confirming the current trend?
- What does the current market breadth tell us?

The AI receives the current analytical market context and explains the observed data.

MarketMind is designed to distinguish between:

**Observed data**  
What the market data actually shows.

**Interpretation**  
What those measurements may indicate.

**Unknown causes**  
When the available data cannot establish why something happened, MarketMind does not invent a news event or catalyst.

---

# CoinMarketCap API Integration

CoinMarketCap is the primary market-data source for MarketMind.

The CoinMarketCap API integration powers:

- Cryptocurrency listings
- Token prices
- Market capitalization
- Trading volume
- Volume changes
- Percentage performance
- Market-cap dominance
- Token rankings
- Market-wide analytics
- Data supplied to the AI analysis engine

MarketMind fetches the market data through a server-side API layer and normalizes the response into a consistent internal market-data model before sending it through the analytics engine.

The CoinMarketCap integration is a core part of the MarketMind architecture and is explicitly used to generate the market intelligence displayed by the application.

---

# Architecture

```text
                  CoinMarketCap API
                         │
                         ▼
                  Market Data Layer
                         │
                         ▼
                 Analytics Engine
                         │
          ┌──────────────┴──────────────┐
          │                             │
          ▼                             ▼
    Market Signals                Market Score
          │                             │
          └──────────────┬──────────────┘
                         ▼
                    Gemini AI
                         │
                         ▼
                  MarketMind UI