const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");
const AuctionStore = require("./auctionStore");
const { predictPrice } = require("./regression");

const app = express();
app.use(cors());

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

const auction = new AuctionStore();
const userCounter = { count: 0 };

io.on("connection", (socket) => {
  userCounter.count++;
  const userName = `竞拍者${userCounter.count}`;
  socket.data = { userName };

  console.log(`${userName} 已连接`);

  socket.emit("init", {
    ...auction.getState(),
    userName,
  });

  io.emit("user_count", io.sockets.sockets.size);

  socket.on("request_state", () => {
    socket.emit("init", {
      ...auction.getState(),
      userName: socket.data.userName,
    });
  });

  socket.on("bid", (price) => {
    if (typeof price !== "number" || price <= auction.currentPrice) {
      socket.emit("bid_error", {
        message: `出价必须高于当前价格 ¥${auction.currentPrice}`,
      });
      return;
    }

    const bid = auction.addBid(socket.data.userName, socket.data.userName, price);

    io.emit("new_bid", bid);
    io.emit("price_update", {
      currentPrice: auction.currentPrice,
      predictedPrice: auction.predictedPrice,
    });
  });

  socket.on("disconnect", () => {
    console.log(`${socket.data.userName} 已断开`);
    io.emit("user_count", io.sockets.sockets.size);
  });
});

setInterval(() => {
  const recentBids = auction.getRecentBids();
  if (recentBids.length >= 2) {
    const predicted = predictPrice(recentBids, Date.now());
    if (predicted !== null) {
      auction.predictedPrice = predicted;
      io.emit("price_update", {
        currentPrice: auction.currentPrice,
        predictedPrice: auction.predictedPrice,
      });
    }
  }
}, 10000);

app.get("/api/state", (_req, res) => {
  res.json(auction.getState());
});

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`竞拍服务器运行在 http://localhost:${PORT}`);
});
