const auctionState = reactive({
  currentPrice: 100,
  predictedPrice: null as number | null,
  itemName: "稀有虚拟宝石",
  userCount: 0,
  recentBids: [] as any[],
  userName: "",
  chartActualPrices: [] as number[],
  chartPredictedPrices: [] as (number | null)[],
  chartLabels: [] as string[],
  initialized: false,
});

type AckHandler = (success: boolean, err?: string) => void;
const pendingAckHandlers = new Map<string, AckHandler>();

function generateRequestId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

export function useAuction() {
  const nuxtApp = useNuxtApp();
  const socket = (nuxtApp as any).$socket;

  function addChartPoint(price: number, predicted: number | null) {
    const now = new Date();
    const label = `${now.getHours().toString().padStart(2, "0")}:${now.getMinutes().toString().padStart(2, "0")}:${now.getSeconds().toString().padStart(2, "0")}`;

    auctionState.chartLabels.push(label);
    auctionState.chartActualPrices.push(price);
    auctionState.chartPredictedPrices.push(predicted);

    const maxPoints = 60;
    if (auctionState.chartLabels.length > maxPoints) {
      auctionState.chartLabels = auctionState.chartLabels.slice(-maxPoints);
      auctionState.chartActualPrices = auctionState.chartActualPrices.slice(-maxPoints);
      auctionState.chartPredictedPrices = auctionState.chartPredictedPrices.slice(-maxPoints);
    }
  }

  if (!auctionState.initialized && socket) {
    auctionState.initialized = true;

    socket.on("init", (data: any) => {
      auctionState.currentPrice = data.currentPrice;
      auctionState.predictedPrice = data.predictedPrice;
      auctionState.itemName = data.itemName;
      auctionState.userName = data.userName;
      auctionState.recentBids = data.recentBids || [];
      addChartPoint(data.currentPrice, data.predictedPrice);
    });

    socket.on("new_bid", (bid: any) => {
      auctionState.recentBids.push(bid);
    });

    socket.on("price_update", (data: any) => {
      auctionState.currentPrice = data.currentPrice;
      auctionState.predictedPrice = data.predictedPrice;
      addChartPoint(data.currentPrice, data.predictedPrice);
    });

    socket.on("user_count", (count: number) => {
      auctionState.userCount = count;
    });

    socket.on("bid_ack", (ack: any) => {
      const handler = pendingAckHandlers.get(ack.requestId);
      if (handler) {
        pendingAckHandlers.delete(ack.requestId);
        handler(true);
      }
    });

    socket.on("bid_error", (err: any) => {
      const handler = err.requestId ? pendingAckHandlers.get(err.requestId) : null;
      if (handler) {
        pendingAckHandlers.delete(err.requestId);
        handler(false, err.message);
      } else {
        alert(err.message);
      }
    });

    if (socket.connected) {
      socket.emit("request_state");
    } else {
      socket.once("connect", () => {
        socket.emit("request_state");
      });
    }
  }

  function submitBid(price: number, onResult?: AckHandler) {
    if (!socket) {
      if (onResult) onResult(false, "未连接到服务器");
      return;
    }
    const requestId = generateRequestId();
    if (onResult) {
      pendingAckHandlers.set(requestId, onResult);
      setTimeout(() => {
        if (pendingAckHandlers.has(requestId)) {
          pendingAckHandlers.delete(requestId);
          onResult(false, "请求超时，请重试");
        }
      }, 8000);
    }
    socket.emit("bid", { price, requestId });
  }

  return {
    state: auctionState,
    submitBid,
    socket,
  };
}
