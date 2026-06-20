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

  const denominator = n * sumXX - sumX * sumX;
  if (denominator === 0) {
    return { slope: 0, intercept: sumY / n };
  }

  const slope = (n * sumXY - sumX * sumY) / denominator;
  const intercept = (sumY - slope * sumX) / n;

  return { slope, intercept };
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

module.exports = { linearRegression, predictPrice };
