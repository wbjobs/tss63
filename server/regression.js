function linearRegression(data) {
  if (!data || data.length < 2) {
    return null;
  }

  const n = data.length;
  let sumX = 0;
  let sumY = 0;
  let sumXY = 0;
  let sumXX = 0;

  for (let i = 0; i < n; i++) {
    const x = data[i].x;
    const y = data[i].y;
    sumX += x;
    sumY += y;
    sumXY += x * y;
    sumXX += x * x;
  }

  return computeRegression(n, sumX, sumY, sumXY, sumXX);
}

function computeRegression(n, sumX, sumY, sumXY, sumXX) {
  const denominator = n * sumXX - sumX * sumX;
  if (denominator === 0) {
    return { slope: 0, intercept: sumY / n };
  }

  const slope = (n * sumXY - sumX * sumY) / denominator;
  const intercept = (sumY - slope * sumX) / n;

  return { slope, intercept };
}

function linearRegressionFromStats(stats) {
  if (!stats || stats.n < 2) return null;
  return computeRegression(stats.n, stats.sumX, stats.sumY, stats.sumXY, stats.sumXX);
}

function predictPrice(bids, currentTime) {
  if (!bids || bids.length < 2) {
    return null;
  }

  const baseTime = bids[0].timestamp;
  const data = bids.map((bid) => ({
    x: (bid.timestamp - baseTime) / 1000,
    y: bid.price,
  }));

  const result = linearRegression(data);
  if (!result) {
    return null;
  }

  const x = (currentTime - baseTime) / 1000;
  const predicted = result.intercept + result.slope * x;

  return Math.round(predicted * 100) / 100;
}

function predictPriceFromStats(stats, currentTime) {
  if (!stats) return null;
  const result = linearRegressionFromStats(stats);
  if (!result) return null;
  const x = (currentTime - stats.baseTime) / 1000;
  const predicted = result.intercept + result.slope * x;
  return Math.round(predicted * 100) / 100;
}

function predictPriceAsync(stats, currentTime) {
  return new Promise((resolve) => {
    setImmediate(() => {
      resolve(predictPriceFromStats(stats, currentTime));
    });
  });
}

module.exports = {
  linearRegression,
  linearRegressionFromStats,
  predictPrice,
  predictPriceFromStats,
  predictPriceAsync,
};
