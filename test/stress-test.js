const { io } = require("../client/node_modules/socket.io-client");

const SERVER_URL = "http://localhost:3001";
const NUM_USERS = 20;
const BIDS_PER_USER = 10;

async function runTest() {
  const clients = [];
  console.log(`连接 ${NUM_USERS} 个用户...`);

  for (let i = 0; i < NUM_USERS; i++) {
    const socket = io(SERVER_URL, { forceNew: true });
    await new Promise((r) => socket.once("connect", r));
    clients.push(socket);
  }

  console.log(`✅ ${clients.length} 个用户已连接`);

  const stateSocket = clients[0];
  let initState = null;
  stateSocket.once("init", (s) => (initState = s));
  stateSocket.emit("request_state");
  await new Promise((r) => setTimeout(r, 500));
  console.log(`初始价格: ¥${initState?.currentPrice}`);

  console.log("\n=== 测试 1: 单用户快速重复出价（幂等性） ===");
  const user1 = clients[0];
  let bidAcks = 0;
  let bidErrors = 0;
  user1.on("bid_ack", () => bidAcks++);
  user1.on("bid_error", (e) => {
    bidErrors++;
  });

  const price1 = (initState?.currentPrice || 100) + 10;
  const reqId = "test-dup-" + Date.now();
  console.log(`发送 5 次相同 requestId 的出价请求...`);
  for (let i = 0; i < 5; i++) {
    user1.emit("bid", { price: price1 + i * 10, requestId: reqId });
  }
  await new Promise((r) => setTimeout(r, 1000));
  console.log(`成功: ${bidAcks}, 错误: ${bidErrors}`);
  console.log(bidErrors > 0 ? "✅ 重复请求被拒绝（幂等生效）" : "❌ 未检测到重复");

  console.log("\n=== 测试 2: 同一用户短时间高频出价（频率限制） ===");
  bidAcks = 0;
  bidErrors = 0;
  const user2 = clients[1];
  user2.on("bid_ack", () => bidAcks++);
  user2.on("bid_error", () => bidErrors++);

  console.log(`100ms 内发送 10 次出价...`);
  let basePrice = price1 + 100;
  for (let i = 0; i < 10; i++) {
    user2.emit("bid", { price: basePrice + i * 10, requestId: `freq-${i}-${Date.now()}` });
  }
  await new Promise((r) => setTimeout(r, 1500));
  console.log(`成功: ${bidAcks}, 错误: ${bidErrors}`);
  console.log(bidErrors > 0 ? "✅ 频率限制生效" : "⚠️ 未触发频率限制");

  console.log("\n=== 测试 3: 20 用户并发出价 + 线性回归性能 ===");
  let totalBids = 0;
  let regCycles = 0;

  clients.forEach((c, idx) => {
    c.on("new_bid", () => totalBids++);
    c.on("price_update", () => regCycles++);
  });

  const promises = [];
  const start = Date.now();
  let currentPrice = basePrice + 200;

  for (let round = 0; round < BIDS_PER_USER; round++) {
    for (let i = 0; i < clients.length; i++) {
      currentPrice += 1;
      const socket = clients[i];
      const priceSnapshot = currentPrice;
      promises.push(
        new Promise((resolve) => {
          const rid = `bid-${i}-${round}-${Date.now()}-${Math.random()}`;
          const timeout = setTimeout(() => resolve("timeout"), 2000);
          socket.once("bid_ack", () => {
            clearTimeout(timeout);
            resolve("ok");
          });
          socket.once("bid_error", () => {
            clearTimeout(timeout);
            resolve("rejected");
          });
          socket.emit("bid", { price: priceSnapshot, requestId: rid });
        })
      );
    }
  }

  const results = await Promise.all(promises);
  const elapsed = Date.now() - start;
  const okCount = results.filter((r) => r === "ok").length;
  const rejCount = results.filter((r) => r === "rejected").length;
  const timeoutCount = results.filter((r) => r === "timeout").length;

  console.log(`共发送 ${promises.length} 次出价，耗时 ${elapsed}ms`);
  console.log(`成功: ${okCount}, 限流: ${rejCount}, 超时: ${timeoutCount}`);
  console.log(`吞吐量: ${Math.round((okCount / elapsed) * 1000)} bids/秒`);
  console.log(elapsed < promises.length * 10 ? "✅ 事件循环未被阻塞" : "⚠️ 事件循环可能被阻塞");

  await new Promise((r) => setTimeout(r, 12000));
  console.log(`\n12 秒内收到 ${regCycles} 次 price_update（含定时预测）`);

  console.log("\n=== 最终状态 ===");
  const finalState = await new Promise((resolve) => {
    const s = clients[0];
    s.once("init", resolve);
    s.emit("request_state");
    setTimeout(() => resolve(null), 2000);
  });
  if (finalState) {
    console.log(`当前价格: ¥${finalState.currentPrice}`);
    console.log(`预测价格: ¥${finalState.predictedPrice ?? "无"}`);
    console.log(`总出价数: ${finalState.totalBids}`);
  }

  clients.forEach((c) => c.disconnect());
  console.log("\n✅ 测试完成");
}

runTest().catch(console.error);
