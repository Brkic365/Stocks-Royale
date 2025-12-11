# Stocks Royale

Stocks Royale is a real-time stock trading and betting platform that combines traditional market mechanics with gamified elements.

## Features

- **Real-time Market Data**: Interactive candlestick charts powered by lightweight-charts.
- **Binary Betting**: Place "Green or Red" bets on short-term price movements.
- **Portfolio Management**: Track holdings, positions, and account value in real-time.
- **Gamified Trading**:  Unique mechanics to make trading more engaging.

## Tech Stack

### Client
- **Framework**: Next.js 16 (React 19)
- **Styling**: SCSS / Sass
- **Charts**: Lightweight Charts, Recharts

### Server
- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: PostgreSQL
- **Real-time**: Socket.io

## Getting Started

### Prerequisites
- Node.js (v18+ recommended)
- PostgreSQL database
- npm or bun

### Installation

1.  **Clone the repository**:
    ```bash
    git clone https://github.com/Brkic365/Stocks-Royale.git
    cd Stocks-Royale
    ```

2.  **Server Setup**:
    ```bash
    cd server
    npm install
    # Set up your .env file with DB credentials
    npm run dev
    ```

3.  **Client Setup**:
    ```bash
    cd client
    npm install
    npm run dev
    ```

4.  **Access the App**:
    Open [http://localhost:3000](http://localhost:3000) in your browser.
