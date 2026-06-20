const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");
const AuctionStore = require("./auctionStore");
const { BotManager } = require("./botManager");
const { predictPriceAsync } = require("./regression");

const app = express();
app.use(cors());
app.use(express.json());

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

const auction = new AuctionStore();
const botManager = new BotManager(auction);
const userCounter = { count: 0 };
const pendingBids = new Map();

botManager.setOnBidHandler((bid) => {
  io.emit("new_bid", bid);
  io.emit("price_update", {
    currentPrice: auction.currentPrice,
    predictedPrice: auction.predictedPrice,
    sentimentIndex: auction.sentimentIndex,
  });
});

function broadcastBotStatus() {
  io.emit("bot_status", botManager.getStatusList());
}

io.on("connection", (socket) => {
  userCounter.count++;
  const userName = `竞拍者${userCounter.count}`;
  socket.data = { userName, userId: socket.id };

  console.log(`${userName} 已连接`);

  socket.emit("init", {
    ...auction.getState(),
    userName,
    bots: botManager.getStatusList(),
  });

  io.emit("user_count", io.sockets.sockets.size);

  socket.on("request_state", () => {
    socket.emit("init", {
      ...auction.getState(),
      userName: socket.data.userName,
      bots: botManager.getStatusList(),
    });
  });

  socket.on("bid", ({ price, requestId }) => {
    if (typeof price !== "number" || price <= auction.currentPrice) {
      socket.emit("bid_error", {
        message: `出价必须高于当前价格 ¥${auction.currentPrice}`,
        requestId,
      });
      return;
    }

    if (requestId && pendingBids.has(requestId)) {
      socket.emit("bid_error", {
        message: "请求正在处理中，请勿重复提交",
        requestId,
      });
      return;
    }

    if (!auction.canUserBid(socket.data.userId)) {
      socket.emit("bid_error", {
        message: "出价过于频繁，请稍后再试",
        requestId,
      });
      return;
    }

    if (requestId) {
      pendingBids.set(requestId, Date.now());
      setTimeout(() => pendingBids.delete(requestId), 5000);
    }

    const bid = auction.addBid(socket.data.userId, socket.data.userName, price);

    socket.emit("bid_ack", { success: true, requestId, bid });

    io.emit("new_bid", bid);
    io.emit("price_update", {
      currentPrice: auction.currentPrice,
      predictedPrice: auction.predictedPrice,
      sentimentIndex: auction.sentimentIndex,
    });
  });

  socket.on("admin_set_bots", ({ count }) => {
    if (typeof count === "number" && count >= 0 && count <= 3) {
      botManager.setActiveCount(count);
      broadcastBotStatus();
    }
  });

  socket.on("admin_toggle_bot", ({ botId, active }) => {
    botManager.setBotActive(botId, active);
    broadcastBotStatus();
  });

  socket.on("disconnect", () => {
    console.log(`${socket.data.userName} 已断开`);
    io.emit("user_count", io.sockets.sockets.size);
  });
});

setInterval(async () => {
  const stats = auction.getRegressionStats();
  auction.refreshSentiment();
  if (stats) {
    const predicted = await predictPriceAsync(stats, Date.now());
    if (predicted !== null) {
      auction.predictedPrice = predicted;
    }
  }
  io.emit("price_update", {
    currentPrice: auction.currentPrice,
    predictedPrice: auction.predictedPrice,
    sentimentIndex: auction.sentimentIndex,
  });
}, 10000);

app.get("/api/state", (_req, res) => {
  res.json({
    ...auction.getState(),
    bots: botManager.getStatusList(),
  });
});

app.post("/api/admin/bots", (req, res) => {
  const { count } = req.body || {};
  if (typeof count === "number" && count >= 0 && count <= 3) {
    botManager.setActiveCount(count);
    broadcastBotStatus();
    res.json({ ok: true, bots: botManager.getStatusList() });
  } else {
    res.status(400).json({ error: "count 必须是 0-3 之间的数字" });
  }
});

app.post("/api/admin/bots/:botId/toggle", (req, res) => {
  const { botId } = req.params;
  const { active } = req.body || {};
  botManager.setBotActive(botId, active);
  broadcastBotStatus();
  res.json({ ok: true, bots: botManager.getStatusList() });
});

botManager.startAll();

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`竞拍服务器运行在 http://localhost:${PORT}`);
  console.log(`机器人: ${botManager.getStatusList().filter(b => b.active).length} 个已激活`);
});
