const Neynar = require("@neynar/nodejs-sdk");

const client = new Neynar.NeynarAPIClient(process.env.NEYNAR_API_KEY);
const SIGNER_UUID = process.env.SIGNER_UUID;

const TOKENS = [
  { id: "ethereum", symbol: "ETH" },
  { id: "bitcoin", symbol: "BTC" },
  { id: "degen-base", symbol: "DEGEN" },
];

async function fetchPrices() {
  const ids = TOKENS.map((t) => t.id).join(",");
  const url = `https://api.coingecko.com/api/v3/simple/price?ids=${ids}&vs_currencies=usd&include_24hr_change=true`;
  const res = await fetch(url);
  const data = await res.json();
  return data;
}

function formatPrice(price) {
  if (price >= 1000) return `$${price.toLocaleString()}`;
  if (price >= 1) return `$${price.toFixed(2)}`;
  return `$${price.toFixed(6)}`;
}

function getEmoji(change) {
  if (change >= 5) return "🚀";
  if (change >= 2) return "📈";
  if (change <= -5) return "🔴";
  if (change <= -2) return "📉";
  return "➡️";
}

async function run() {
  try {
    console.log("💰 Price bot starting...");

    const prices = await fetchPrices();

    let message = "🔔 Crypto Price Update\n\n";
    let hasAlert = false;
    let alertMessage = "⚠️ PRICE ALERT!\n\n";

    for (const token of TOKENS) {
      const data = prices[token.id];
      if (!data) continue;

      const price = data.usd;
      const change = data.usd_24h_change?.toFixed(2);
      const emoji = getEmoji(parseFloat(change));

      message += `${emoji} ${token.symbol}: ${formatPrice(price)} (${change}% 24h)\n`;

      if (Math.abs(parseFloat(change)) >= 5) {
        hasAlert = true;
        alertMessage += `${emoji} ${token.symbol} moved ${change}% in 24h!\n`;
        alertMessage += `Current price: ${formatPrice(price)}\n\n`;
      }
    }

    message += "\n🔄 Swap tokens → https://my-swap-app-zeta.vercel.app";
    message += "\n#crypto #base #defi #farcaster";

    await client.publishCast(SIGNER_UUID, message);
    console.log("✅ Price update posted!");

    if (hasAlert) {
      alertMessage += "🔄 Swap now → https://my-swap-app-zeta.vercel.app";
      await new Promise((r) => setTimeout(r, 3000));
      await client.publishCast(SIGNER_UUID, alertMessage);
      console.log("🚨 Alert posted!");
    }

  } catch (error) {
    console.error("❌ Error:", error);
  }
}

run();
