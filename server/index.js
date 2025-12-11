import express from "express"; // Server entry point - FORCE RESTART 6
import http from "http";
import { Server as SocketIO } from "socket.io";
import cors from "cors";

import { initMarket } from "./market/state.js";
import setupSockets from "./ws/socket.js";
import stockRoutes from "./routes/stockRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import positionRoutes from "./routes/positionRoutes.js";
import betRoutes from "./routes/betRoutes.js";
import { getAllStocks } from "./models/stockModel.js";

const app = express();
const server = http.createServer(app);

// CORS configuration
app.use(cors({
  origin: "http://localhost:3000",
  credentials: true
}));

// Middleware
app.use(express.json());

// API Routes
app.use("/api", stockRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/positions", positionRoutes);
app.use("/api/bets", betRoutes);
console.log("Server reloading... " + Date.now());

const io = new SocketIO(server, {
  cors: {
    origin: "http://localhost:3000",
    credentials: true
  },
});

// Initialize market with stocks from database
async function startServer() {
  try {
    const stocks = await getAllStocks();

    if (stocks.length === 0) {
      console.warn("No stocks found in database. Please run setupDb.js first.");
      process.exit(1);
    }

    console.log(`Loaded ${stocks.length} stocks from database`);

    // Initialize stock market state
    await initMarket(stocks);

    // Attach sockets
    setupSockets(io, stocks);

    const port = process.env.PORT || 4000;
    server.listen(port, () => {
      console.log(`Market engine running on port ${port}`);
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
}

startServer();
